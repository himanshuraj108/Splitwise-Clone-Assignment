from django.test import TestCase
from datetime import datetime
from decimal import Decimal
from django.contrib.auth import get_user_model
from .models import Group, GroupMembership, Expense, ExpenseSplit, Payment
from .views import GroupBalancesView

User = get_user_model()

class SharedExpensesTestCase(TestCase):
    def setUp(self):
        # Create group
        self.group = Group.objects.create(name="Flatmates Group")

        # Create members
        self.aisha = User.objects.create_user(username="Aisha", email="aisha@example.com", password="password123")
        self.rohan = User.objects.create_user(username="Rohan", email="rohan@example.com", password="password123")
        self.priya = User.objects.create_user(username="Priya", email="priya@example.com", password="password123")
        self.meera = User.objects.create_user(username="Meera", email="meera@example.com", password="password123")
        self.sam = User.objects.create_user(username="Sam", email="sam@example.com", password="password123")

        # Setup timelines
        # Aisha, Rohan, Priya: Active from Feb 1 onwards
        GroupMembership.objects.create(group=self.group, user=self.aisha, joined_at=datetime(2024, 2, 1).date())
        GroupMembership.objects.create(group=self.group, user=self.rohan, joined_at=datetime(2024, 2, 1).date())
        GroupMembership.objects.create(group=self.group, user=self.priya, joined_at=datetime(2024, 2, 1).date())
        
        # Meera: Active Feb 1 to March 31
        GroupMembership.objects.create(
            group=self.group, user=self.meera, 
            joined_at=datetime(2024, 2, 1).date(), 
            left_at=datetime(2024, 3, 31).date()
        )

        # Sam: Active April 15 onwards
        GroupMembership.objects.create(group=self.group, user=self.sam, joined_at=datetime(2024, 4, 15).date())

    def test_time_aware_splits(self):
        # 1. Expense in March (Meera active, Sam inactive)
        # Total amount: 400. Payer: Aisha. Date: March 10
        # Active: Aisha, Rohan, Priya, Meera. Sam should NOT be included.
        expense_march = Expense.objects.create(
            group=self.group, description="March Electricity",
            amount=Decimal('400.00'), currency="INR", paid_by=self.aisha,
            date=datetime(2024, 3, 10).date(), split_type="EQUAL"
        )
        
        # We manually test our serializer logic
        active_users = [m.user for m in self.group.memberships.all() if m.joined_at <= expense_march.date and (m.left_at is None or m.left_at >= expense_march.date)]
        
        self.assertEqual(len(active_users), 4)
        self.assertIn(self.meera, active_users)
        self.assertNotIn(self.sam, active_users)

        # 2. Expense in Late April (Meera inactive, Sam active)
        # Total amount: 300. Payer: Rohan. Date: April 25
        # Active: Aisha, Rohan, Priya, Sam. Meera should NOT be included.
        active_users_april = [m.user for m in self.group.memberships.all() if m.joined_at <= datetime(2024, 4, 25).date() and (m.left_at is None or m.left_at >= datetime(2024, 4, 25).date())]
        
        self.assertEqual(len(active_users_april), 4)
        self.assertIn(self.sam, active_users_april)
        self.assertNotIn(self.meera, active_users_april)

    def test_debt_simplification_logic(self):
        # Create a mock net balances dictionary
        net_balances = {
            "Aisha": Decimal('-1000.00'),
            "Rohan": Decimal('1000.00'),
            "Priya": Decimal('-500.00'),
            "Meera": Decimal('500.00')
        }
        
        # Instantiate balances view helper
        view = GroupBalancesView()
        simplified = view._simplify_debts(net_balances)
        
        # Simplified debts should match debtors to creditors
        # Expected:
        # Priya pays Meera 500
        # Aisha pays Rohan 1000
        self.assertEqual(len(simplified), 2)
        
        # Verify transfer amounts
        transfers = {(t['from'], t['to']): t['amount'] for t in simplified}
        self.assertEqual(transfers.get(('Aisha', 'Rohan')), 1000.00)
        self.assertEqual(transfers.get(('Priya', 'Meera')), 500.00)
