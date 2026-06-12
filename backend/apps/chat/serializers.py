from rest_framework import serializers
from .models import Message
from apps.users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'expense', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class CreateMessageSerializer(serializers.Serializer):
    content = serializers.CharField(min_length=1, max_length=2000)
