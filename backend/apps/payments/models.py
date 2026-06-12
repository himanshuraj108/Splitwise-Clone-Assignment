from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made')
    payee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_received')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    group = models.ForeignKey(
        'groups.Group', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments'
    )
    note = models.CharField(max_length=300, blank=True)
    date = models.DateField()
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='created_payments'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.payer.name} paid ₹{self.amount} to {self.payee.name}"
