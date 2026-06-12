from django.shortcuts import render
from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from datetime import datetime
from decimal import Decimal
import io

from .models import Group, GroupMembership, Expense, ExpenseSplit, Payment, CSVImport, CSVAnomaly
from .serializers import (
    UserSerializer, RegisterSerializer, GroupSerializer, 
    GroupMembershipSerializer, ExpenseSerializer, PaymentSerializer, 
    CSVImportSerializer, CSVAnomalySerializer
)
from .importer import CSVImporter

User = get_user_model()

# --- Authentication Views ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

class CurrentUserView(views.APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# --- Group Views ---
class GroupListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupSerializer

    def get_queryset(self):
        # List all groups where the user is a member or has created
        return Group.objects.filter(memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        with transaction.atomic():
            group = serializer.save()
            # The creator becomes the first member, starting on group creation date
            GroupMembership.objects.create(
                group=group,
                user=self.request.user,
                joined_at=datetime.today().date()
            )

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

# --- Membership Views ---
class GroupMembershipListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupMembershipSerializer

    def get_queryset(self):
        return GroupMembership.objects.filter(group_id=self.kwargs['group_id'])

    def perform_create(self, serializer):
        serializer.save(group_id=self.kwargs['group_id'])

class GroupMembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GroupMembership.objects.all()
    serializer_class = GroupMembershipSerializer

# --- Expense Views ---
class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        queryset = Expense.objects.filter(status='ACTIVE')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def perform_destroy(self, instance):
        # Soft delete expense
        instance.status = 'DELETED'
        instance.save()

# --- Payment / Settlement Views ---
class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        queryset = Payment.objects.all()
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset

# --- CSV Upload & Resolution Views ---
class CSVUploadView(views.APIView):
    def post(self, request):
        group_id = request.data.get('group')
        csv_file = request.FILES.get('file')

        if not group_id or not csv_file:
            return Response(
                {"error": "Please provide both group ID and file."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        # Create import log entry
        import_log = CSVImport.objects.create(
            uploaded_by=request.user,
            filename=csv_file.name,
            status='PENDING'
        )

        # Parse CSV file wrapper
        file_data = csv_file.read().decode("utf-8")
        csv_wrapper = io.StringIO(file_data)

        importer = CSVImporter(import_log.id, group.id)
        importer.detect_anomalies(csv_wrapper)

        # Check if any anomalies were generated
        has_anomalies = import_log.anomalies.exists()
        if not has_anomalies:
            import_log.status = 'PROCESSED'
            import_log.save()

        serializer = CSVImportSerializer(import_log)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ResolveAnomalyView(views.APIView):
    def post(self, request, pk):
        try:
            anomaly = CSVAnomaly.objects.get(id=pk, status='PENDING')
        except CSVAnomaly.DoesNotExist:
            return Response({"error": "Pending anomaly not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # 'APPROVE', 'REJECT', 'EDIT'
        edited_data = request.data.get('edited_data', {}) # optional replacement data

        if action not in ['APPROVE', 'REJECT']:
            return Response({"error": "Invalid action. Choose APPROVE or REJECT."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            anomaly.status = 'APPROVED' if action == 'APPROVE' else 'REJECTED'
            anomaly.resolved_by = request.user
            anomaly.resolved_at = datetime.now()
            anomaly.save()

            import_log = anomaly.import_log
            group = import_log.expenses.first().group if import_log.expenses.exists() else Group.objects.filter(memberships__user=request.user).first()
            if not group:
                # Fallback to group attached to other anomalies or memberships
                # We can fetch the group ID from the importer configuration or use the first active group
                group = Group.objects.filter(memberships__user=request.user).first()

            if action == 'APPROVE':
                # Process the anomaly type based on the raw data
                raw = anomaly.raw_data
                parsed_date = datetime.strptime(raw['date'], "%Y-%m-%d").date() if '-' in raw['date'] else datetime.strptime(raw['date'], "%m/%d/%Y").date()
                raw_amount = Decimal(raw['amount'])
                
                # Retrieve or create payer
                payer_name = raw['paid_by']
                try:
                    payer = User.objects.get(username=payer_name)
                except User.DoesNotExist:
                    payer = User.objects.create_user(
                        username=payer_name,
                        email=f"{payer_name.lower()}@example.com",
                        password=User.objects.make_random_password()
                    )

                GroupMembership.objects.get_or_create(
                    group=group,
                    user=payer,
                    defaults={'joined_at': datetime(2024, 2, 1).date()}
                )

                if anomaly.anomaly_type == 'SETTLEMENT_DISGUISED_AS_EXPENSE':
                    # Parse payee candidate if described
                    payee_name = edited_data.get('payee', 'Aisha') # Default or user chosen
                    try:
                        payee = User.objects.get(username=payee_name)
                    except User.DoesNotExist:
                        payee = User.objects.create_user(
                            username=payee_name,
                            email=f"{payee_name.lower()}@example.com",
                            password=User.objects.make_random_password()
                        )
                    GroupMembership.objects.get_or_create(
                        group=group,
                        user=payee,
                        defaults={'joined_at': datetime(2024, 2, 1).date()}
                    )
                    Payment.objects.create(
                        group=group,
                        payer=payer,
                        payee=payee,
                        amount=raw_amount,
                        currency='INR',
                        exchange_rate=Decimal('1.0'),
                        date=parsed_date
                    )
                elif anomaly.anomaly_type == 'CURRENCY_MISMATCH':
                    # Convert USD to INR
                    conversion_rate = Decimal(edited_data.get('exchange_rate', '83.0'))
                    converted_amount = raw_amount * conversion_rate
                    
                    expense = Expense.objects.create(
                        group=group,
                        description=f"{raw['description']} (USD {raw_amount} converted)",
                        amount=converted_amount,
                        currency='INR',
                        exchange_rate=conversion_rate,
                        paid_by=payer,
                        date=parsed_date,
                        split_type='EQUAL'
                    )
                    self._create_equal_splits(expense, group, parsed_date, payer)
                elif anomaly.anomaly_type == 'MEMBERSHIP_OUT_OF_BOUNDS':
                    # Import but exclude inactive members
                    expense = Expense.objects.create(
                        group=group,
                        description=raw['description'],
                        amount=raw_amount,
                        currency='INR',
                        exchange_rate=Decimal('1.0'),
                        paid_by=payer,
                        date=parsed_date,
                        split_type='EQUAL'
                    )
                    self._create_equal_splits(expense, group, parsed_date, payer)
                elif anomaly.anomaly_type == 'NEGATIVE_AMOUNT':
                    # Treat negative amount as a refund (positive amount with reversed split logic)
                    positive_amount = abs(raw_amount)
                    expense = Expense.objects.create(
                        group=group,
                        description=f"{raw['description']} (Refund)",
                        amount=positive_amount,
                        currency='INR',
                        exchange_rate=Decimal('1.0'),
                        paid_by=payer,
                        date=parsed_date,
                        split_type='EQUAL'
                    )
                    self._create_equal_splits(expense, group, parsed_date, payer)
                else: # Generic import
                    expense = Expense.objects.create(
                        group=group,
                        description=raw['description'],
                        amount=raw_amount,
                        currency='INR',
                        exchange_rate=Decimal('1.0'),
                        paid_by=payer,
                        date=parsed_date,
                        split_type='EQUAL'
                    )
                    self._create_equal_splits(expense, group, parsed_date, payer)

            # Check if all anomalies are now resolved
            if not import_log.anomalies.filter(status='PENDING').exists():
                import_log.status = 'PROCESSED'
                import_log.save()

        return Response({"status": "Anomaly resolved successfully."})

    def _create_equal_splits(self, expense, group, date, payer):
        active_memberships = GroupMembership.objects.filter(
            group=group,
            joined_at__lte=date
        ).filter(
            Q(left_at__isnull=True) | Q(left_at__gte=date)
        )
        
        active_users = [m.user for m in active_memberships]
        if not active_users:
            active_users = [payer]

        split_amount = round(expense.amount / len(active_users), 2)
        split_amounts = [split_amount] * len(active_users)
        diff = expense.amount - sum(split_amounts)
        if diff != 0:
            split_amounts[-1] += diff

        for u, amt in zip(active_users, split_amounts):
            ExpenseSplit.objects.create(
                expense=expense,
                user=u,
                amount_owed=amt
            )

class CSVImportReportView(views.APIView):
    def get(self, request, import_id):
        try:
            import_log = CSVImport.objects.get(id=import_id)
        except CSVImport.DoesNotExist:
            return Response({"error": "Import log not found."}, status=status.HTTP_404_NOT_FOUND)

        anomalies = import_log.anomalies.all()
        report = {
            "import_id": import_log.id,
            "filename": import_log.filename,
            "uploaded_at": import_log.uploaded_at,
            "status": import_log.status,
            "total_anomalies": anomalies.count(),
            "pending_review": anomalies.filter(status='PENDING').count(),
            "resolved_anomalies": CSVAnomalySerializer(anomalies.exclude(status='PENDING'), many=True).data,
            "pending_anomalies": CSVAnomalySerializer(anomalies.filter(status='PENDING'), many=True).data,
        }
        return Response(report)

# --- Balance & Debt Simplification views ---
class GroupBalancesView(views.APIView):
    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Compute net balances for everyone
        net_balances = {}
        memberships = GroupMembership.objects.filter(group=group)
        for m in memberships:
            net_balances[m.user.username] = Decimal('0.0')

        # Add all expense credits/debits
        expenses = Expense.objects.filter(group=group, status='ACTIVE')
        for exp in expenses:
            payer_name = exp.paid_by.username
            net_balances[payer_name] = net_balances.get(payer_name, Decimal('0.0')) + exp.amount
            
            for split in exp.splits.all():
                user_name = split.user.username
                net_balances[user_name] = net_balances.get(user_name, Decimal('0.0')) - split.amount_owed

        # Add all payment credits/debits
        payments = Payment.objects.filter(group=group)
        for pay in payments:
            payer_name = pay.payer.username
            payee_name = pay.payee.username
            net_balances[payer_name] = net_balances.get(payer_name, Decimal('0.0')) + pay.amount
            net_balances[payee_name] = net_balances.get(payee_name, Decimal('0.0')) - pay.amount

        # Formatting user balances for summary view
        individual_balances = []
        for name, bal in net_balances.items():
            individual_balances.append({
                "username": name,
                "balance": float(bal)
            })

        # 2. Aisha's View: Debt Simplification
        simplified_debts = self._simplify_debts(net_balances)

        # 3. Rohan's View: Line-item breakdowns
        breakdowns = self._get_line_item_breakdowns(group, memberships)

        return Response({
            "individual_balances": individual_balances,
            "simplified_debts": simplified_debts,
            "detailed_breakdowns": breakdowns
        })

    def _simplify_debts(self, net_balances):
        debtors = []
        creditors = []
        for name, bal in net_balances.items():
            if bal < -0.01:
                debtors.append({"name": name, "balance": bal})
            elif bal > 0.01:
                creditors.append({"name": name, "balance": bal})

        # Greedy match debt simplification
        simplified = []
        debtors.sort(key=lambda x: x["balance"]) # most negative first
        creditors.sort(key=lambda x: x["balance"], reverse=True) # most positive first

        d_idx, c_idx = 0, 0
        while d_idx < len(debtors) and c_idx < len(creditors):
            debtor = debtors[d_idx]
            creditor = creditors[c_idx]

            debt_amt = -debtor["balance"]
            credit_amt = creditor["balance"]

            transfer_amt = min(debt_amt, credit_amt)
            if transfer_amt > 0.01:
                simplified.append({
                    "from": debtor["name"],
                    "to": creditor["name"],
                    "amount": round(float(transfer_amt), 2)
                })

            debtor["balance"] += transfer_amt
            creditor["balance"] -= transfer_amt

            if abs(debtor["balance"]) < 0.01:
                d_idx += 1
            if abs(creditor["balance"]) < 0.01:
                c_idx += 1

        return simplified

    def _get_line_item_breakdowns(self, group, memberships):
        # Rohan's line item breakdown: Group expenses/payments that sum to Rohan's balance
        breakdowns = {}
        user_names = [m.user.username for m in memberships]
        
        # Pre-populate breakdown maps
        for name in user_names:
            breakdowns[name] = {}
            for peer in user_names:
                if name != peer:
                    breakdowns[name][peer] = {
                        "net_relationship_balance": 0.0,
                        "line_items": []
                    }

        # Scan active expenses
        expenses = Expense.objects.filter(group=group, status='ACTIVE').order_by('date')
        for exp in expenses:
            payer = exp.paid_by.username
            for split in exp.splits.all():
                debtor = split.user.username
                if payer != debtor:
                    amt = float(split.amount_owed)
                    # debtor owes payer amt
                    breakdowns[debtor][payer]["net_relationship_balance"] -= amt
                    breakdowns[debtor][payer]["line_items"].append({
                        "type": "expense_split",
                        "description": exp.description,
                        "date": str(exp.date),
                        "total_amount": float(exp.amount),
                        "amount_owed": amt,
                        "payer": payer,
                        "detail": f"You owed {payer} for {exp.description}"
                    })

                    breakdowns[payer][debtor]["net_relationship_balance"] += amt
                    breakdowns[payer][debtor]["line_items"].append({
                        "type": "expense_split_received",
                        "description": exp.description,
                        "date": str(exp.date),
                        "total_amount": float(exp.amount),
                        "amount_owed": amt,
                        "payer": payer,
                        "detail": f"{debtor} owed you for {exp.description}"
                    })

        # Scan payments
        payments = Payment.objects.filter(group=group).order_by('date')
        for pay in payments:
            payer = pay.payer.username
            payee = pay.payee.username
            amt = float(pay.amount)
            
            # payer paid payee amt, reducing how much payer owes or increasing payee's debt to payer
            breakdowns[payer][payee]["net_relationship_balance"] += amt
            breakdowns[payer][payee]["line_items"].append({
                "type": "payment_made",
                "description": f"Settlement payment",
                "date": str(pay.date),
                "total_amount": amt,
                "amount_owed": amt,
                "payer": payer,
                "detail": f"You paid {payee} {amt}"
            })

            breakdowns[payee][payer]["net_relationship_balance"] -= amt
            breakdowns[payee][payer]["line_items"].append({
                "type": "payment_received",
                "description": f"Settlement payment",
                "date": str(pay.date),
                "total_amount": amt,
                "amount_owed": amt,
                "payer": payer,
                "detail": f"{payer} paid you {amt}"
            })

        # Clean decimal representation for JSON
        formatted_breakdowns = []
        for name, peers in breakdowns.items():
            peer_list = []
            for peer, data in peers.items():
                data["net_relationship_balance"] = round(data["net_relationship_balance"], 2)
                peer_list.append({
                    "peer_name": peer,
                    "net_balance": data["net_relationship_balance"],
                    "line_items": data["line_items"]
                })
            formatted_breakdowns.append({
                "username": name,
                "peers": peer_list
            })
            
        return formatted_breakdowns
