from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Friendship
from .serializers import (
    RegisterSerializer, UserSerializer,
    CustomTokenObtainPairSerializer, FriendshipSerializer, AddFriendSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        password = request.data.get('password')
        if password:
            request.user.set_password(password)
            request.user.save()
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SearchUsersView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
        users = User.objects.filter(
            Q(email__icontains=query) | Q(name__icontains=query)
        ).exclude(id=request.user.id)[:10]
        return Response(UserSerializer(users, many=True).data)


# Friend Views
class FriendListView(APIView):
    def get(self, request):
        friendships = Friendship.objects.filter(
            Q(requester=request.user) | Q(addressee=request.user),
            status='accepted'
        ).select_related('requester', 'addressee')
        serializer = FriendshipSerializer(friendships, many=True, context={'request': request})
        return Response(serializer.data)


class AddFriendView(APIView):
    def post(self, request):
        serializer = AddFriendSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        friend = User.objects.get(email=email)
        friendship = Friendship.objects.create(
            requester=request.user,
            addressee=friend,
            status='accepted'
        )
        return Response(
            FriendshipSerializer(friendship, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class RemoveFriendView(APIView):
    def delete(self, request, pk):
        friendship = Friendship.objects.filter(
            Q(requester=request.user, addressee__id=pk) |
            Q(requester__id=pk, addressee=request.user)
        ).first()
        if not friendship:
            return Response({'detail': 'Friendship not found.'}, status=404)
        friendship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
