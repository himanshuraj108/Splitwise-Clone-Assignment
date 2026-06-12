import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    avatar_color = models.CharField(max_length=7, default='#10B981')
    
    def __str__(self):
        return self.username

class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class GroupMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    joined_at = models.DateField()
    left_at = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ('group', 'user', 'joined_at')

    def __str__(self):
        return f"{self.user.username} in {self.group.name} ({self.joined_at} to {self.left_at or 'present'})"

class Expense(models.Model):
    SPLIT_TYPES = (
        ('EQUAL', 'Equal'),
        ('UNEQUAL', 'Unequal'),
        ('PERCENTAGE', 'Percentage'),
        ('SHARE', 'Share'),
    )
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('DELETED', 'Deleted'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='expenses')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=6, default=1.0)
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses_paid')
    date = models.DateField()
    split_type = models.CharField(max_length=15, choices=SPLIT_TYPES, default='EQUAL')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} ({self.currency} {self.amount}) on {self.date}"

class ExpenseSplit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_splits')
    amount_owed = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ('expense', 'user')

    def __str__(self):
        return f"{self.user.username} owes {self.amount_owed} for {self.expense.description}"

class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='payments')
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made')
    payee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_received')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=6, default=1.0)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payer.username} paid {self.payee.username} {self.currency} {self.amount} on {self.date}"

class CSVImport(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Resolution'),
        ('PROCESSED', 'Fully Processed'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    filename = models.CharField(max_length=255)

    def __str__(self):
        return f"Import of {self.filename} at {self.uploaded_at}"

class CSVAnomaly(models.Model):
    ANOMALY_TYPES = (
        ('DUPLICATE', 'Duplicate Row'),
        ('NEGATIVE_AMOUNT', 'Negative Amount (Refund/Error)'),
        ('MEMBERSHIP_OUT_OF_BOUNDS', 'Member Active Date Out of Bounds'),
        ('SETTLEMENT_DISGUISED_AS_EXPENSE', 'Settlement Logged as Expense'),
        ('CURRENCY_MISMATCH', 'Potential Dollar/Rupee Mismatch'),
        ('INVALID_DATE', 'Invalid Date Format'),
        ('MISSING_DATA', 'Missing Required Columns'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Imported/Approved'),
        ('REJECTED', 'Discarded/Rejected'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    import_log = models.ForeignKey(CSVImport, on_delete=models.CASCADE, related_name='anomalies')
    row_index = models.IntegerField()
    raw_data = models.JSONField()
    anomaly_type = models.CharField(max_length=40, choices=ANOMALY_TYPES)
    description = models.TextField()
    suggested_action = models.CharField(max_length=255)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Row {self.row_index} Anomaly: {self.get_anomaly_type_display()} ({self.status})"
