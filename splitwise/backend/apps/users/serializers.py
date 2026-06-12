from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Friendship
import random

User = get_user_model()

AVATAR_COLORS = [
    '#5BC5A7', '#EE6C4D', '#3D9BC1', '#F4A261', '#9B5DE5',
    '#F15BB5', '#00BBF9', '#00F5D4', '#FEE440', '#FB5607',
]


class UserSerializer(serializers.ModelSerializer):
    initials = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'avatar_color', 'initials', 'created_at',
                  'phone_number', 'default_currency', 'time_zone', 'language']
        read_only_fields = ['id', 'created_at']

    def get_initials(self, obj):
        return obj.get_initials()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'name', 'password']

    def create(self, validated_data):
        validated_data['avatar_color'] = random.choice(AVATAR_COLORS)
        return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ['id', 'friend', 'status', 'created_at']

    def get_friend(self, obj):
        request_user = self.context['request'].user
        if obj.requester == request_user:
            return UserSerializer(obj.addressee).data
        return UserSerializer(obj.requester).data


class AddFriendSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        request_user = self.context['request'].user
        try:
            friend = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")
        if friend == request_user:
            raise serializers.ValidationError("You cannot add yourself as a friend.")
        if Friendship.objects.filter(
            requester=request_user, addressee=friend
        ).exists() or Friendship.objects.filter(
            requester=friend, addressee=request_user
        ).exists():
            raise serializers.ValidationError("Already friends or request pending.")
        return value
