from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

GROUP_TYPES = [
    ('trip', 'Trip'),
    ('home', 'Home'),
    ('couple', 'Couple'),
    ('other', 'Other'),
]


class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    group_type = models.CharField(max_length=10, choices=GROUP_TYPES, default='other')
    simplify_debts = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'groups'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'), ('member', 'Member')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_members'
        unique_together = ('group', 'user')

    def __str__(self):
        return f"{self.user.name} in {self.group.name}"
