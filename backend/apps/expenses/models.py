from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

SPLIT_TYPE_CHOICES = [
    ('equal', 'Equal'),
    ('unequal', 'Unequal'),
    ('percentage', 'Percentage'),
    ('shares', 'Shares'),
]

CATEGORY_CHOICES = [
    ('food', 'Food & Drink'),
    ('transport', 'Transport'),
    ('accommodation', 'Accommodation'),
    ('entertainment', 'Entertainment'),
    ('shopping', 'Shopping'),
    ('utilities', 'Utilities'),
    ('health', 'Health'),
    ('other', 'Other'),
]


class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        'groups.Group', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='expenses'
    )
    description = models.CharField(max_length=300)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='paid_expenses')
    split_type = models.CharField(max_length=12, choices=SPLIT_TYPE_CHOICES, default='equal')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    date = models.DateField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='created_expenses'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expenses'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - ₹{self.total_amount}"


class ExpenseSplit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_splits')
    amount_owed = models.DecimalField(max_digits=12, decimal_places=2)
    # For tracking raw input per split type
    share_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'expense_splits'
        unique_together = ('expense', 'user')

    def __str__(self):
        return f"{self.user.name} owes ₹{self.amount_owed} for {self.expense.description}"
