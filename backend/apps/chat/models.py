from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense = models.ForeignKey(
        'expenses.Expense', on_delete=models.CASCADE, related_name='messages'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.name}: {self.content[:50]}"
