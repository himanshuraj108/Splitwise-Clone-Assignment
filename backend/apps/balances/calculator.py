from decimal import Decimal
from collections import defaultdict
from apps.expenses.models import ExpenseSplit, Expense
from apps.payments.models import Payment
from django.db.models import Q


def get_balances_between_users(user_a_id, user_b_id):
    """
    Returns net balance: positive = user_a is owed by user_b, negative = user_a owes user_b.
    """
    ua = str(user_a_id)
    ub = str(user_b_id)

    # What A owes B: A has a split in expenses paid by B
    a_owes_b = Decimal('0')
    splits_where_a_owes = ExpenseSplit.objects.filter(
        user_id=ua,
        expense__paid_by_id=ub
    ).exclude(user_id=ub)  # exclude self-paid
    for split in splits_where_a_owes:
        a_owes_b += split.amount_owed

    # What B owes A: B has a split in expenses paid by A
    b_owes_a = Decimal('0')
    splits_where_b_owes = ExpenseSplit.objects.filter(
        user_id=ub,
        expense__paid_by_id=ua
    ).exclude(user_id=ua)
    for split in splits_where_b_owes:
        b_owes_a += split.amount_owed

    # Payments A → B
    a_paid_b = Decimal('0')
    payments_a_to_b = Payment.objects.filter(payer_id=ua, payee_id=ub)
    for p in payments_a_to_b:
        a_paid_b += p.amount

    # Payments B → A
    b_paid_a = Decimal('0')
    payments_b_to_a = Payment.objects.filter(payer_id=ub, payee_id=ua)
    for p in payments_b_to_a:
        b_paid_a += p.amount

    # Net: positive = A is owed money from B
    net = (a_owes_b - b_owes_a - a_paid_b + b_paid_a) * -1
    return net


def get_group_balances(group_id):
    """
    Returns a dict of {user_id: net_balance} for a group.
    Positive = user is owed money. Negative = user owes money.
    """
    # Get all expenses in this group
    expenses = Expense.objects.filter(group_id=group_id).prefetch_related('splits')
    payments = Payment.objects.filter(group_id=group_id)

    balances = defaultdict(Decimal)

    for expense in expenses:
        paid_by = str(expense.paid_by_id)
        total = expense.total_amount
        for split in expense.splits.all():
            user = str(split.user_id)
            if user != paid_by:
                balances[paid_by] += split.amount_owed  # payer is owed this
                balances[user] -= split.amount_owed     # user owes this

    for payment in payments:
        payer = str(payment.payer_id)
        payee = str(payment.payee_id)
        balances[payer] += payment.amount   # payer reduced debt
        balances[payee] -= payment.amount   # payee received

    return dict(balances)


def simplify_debts(balances):
    """
    Greedy debt simplification algorithm.
    Input: {user_id: net_balance} (positive = owed, negative = owes)
    Returns: list of {from: user_id, to: user_id, amount: Decimal}
    """
    creditors = []  # (balance, user_id) - positive
    debtors = []    # (balance, user_id) - negative

    for uid, bal in balances.items():
        if bal > Decimal('0.01'):
            creditors.append([bal, uid])
        elif bal < Decimal('-0.01'):
            debtors.append([abs(bal), uid])

    creditors.sort(reverse=True)
    debtors.sort(reverse=True)

    transactions = []
    i, j = 0, 0
    while i < len(creditors) and j < len(debtors):
        credit_amt, creditor = creditors[i]
        debt_amt, debtor = debtors[j]
        settle = min(credit_amt, debt_amt)
        transactions.append({
            'from_user': debtor,
            'to_user': creditor,
            'amount': settle.quantize(Decimal('0.01'))
        })
        creditors[i][0] -= settle
        debtors[j][0] -= settle
        if creditors[i][0] < Decimal('0.01'):
            i += 1
        if debtors[j][0] < Decimal('0.01'):
            j += 1

    return transactions


def get_user_overall_balances(user_id, friend_ids):
    """
    Returns per-friend balance summary for dashboard.
    {friend_id: net_balance} — positive = friend owes you, negative = you owe friend.
    """
    result = {}
    for fid in friend_ids:
        net = get_balances_between_users(user_id, fid)
        result[str(fid)] = net
    return result


def get_group_direct_debts(group_id):
    """
    Returns non-simplified transactions between group members.
    Returns: list of {from_user: user_id, to_user: user_id, amount: Decimal}
    """
    # Get all expenses in this group
    expenses = Expense.objects.filter(group_id=group_id).prefetch_related('splits')
    payments = Payment.objects.filter(group_id=group_id)

    debts = defaultdict(Decimal)

    for expense in expenses:
        paid_by = str(expense.paid_by_id)
        for split in expense.splits.all():
            user = str(split.user_id)
            if user != paid_by:
                # user owes split.amount_owed to paid_by
                debts[(user, paid_by)] += split.amount_owed

    for payment in payments:
        payer = str(payment.payer_id)
        payee = str(payment.payee_id)
        # payer paid payment.amount to payee, which reduces payer's debt to payee
        debts[(payee, payer)] += payment.amount

    net_transactions = []
    pairs = set(debts.keys())
    visited = set()

    for u1, u2 in pairs:
        if (u1, u2) in visited:
            continue
        u1_owes_u2 = debts[(u1, u2)]
        u2_owes_u1 = debts[(u2, u1)]
        net = u1_owes_u2 - u2_owes_u1
        if net > Decimal('0.01'):
            net_transactions.append({
                'from_user': u1,
                'to_user': u2,
                'amount': net.quantize(Decimal('0.01'))
            })
        elif net < Decimal('-0.01'):
            net_transactions.append({
                'from_user': u2,
                'to_user': u1,
                'amount': abs(net).quantize(Decimal('0.01'))
            })
        visited.add((u1, u2))
        visited.add((u2, u1))

    return net_transactions
