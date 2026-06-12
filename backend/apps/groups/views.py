from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Group, GroupMember
from .serializers import GroupSerializer, CreateGroupSerializer, InviteMemberSerializer

User = get_user_model()


class GroupListCreateView(APIView):
    def get(self, request):
        """List all groups the user belongs to."""
        group_ids = GroupMember.objects.filter(
            user=request.user
        ).values_list('group_id', flat=True)
        groups = Group.objects.filter(id__in=group_ids).prefetch_related('members__user')
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new group."""
        serializer = CreateGroupSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)


class GroupDetailView(APIView):
    def get_group(self, pk, user):
        group = get_object_or_404(Group, pk=pk)
        if not GroupMember.objects.filter(group=group, user=user).exists():
            return None
        return group

    def get(self, request, pk):
        group = self.get_group(pk, request.user)
        if not group:
            return Response({'detail': 'Not a member of this group.'}, status=403)
        return Response(GroupSerializer(group).data)

    def put(self, request, pk):
        group = self.get_group(pk, request.user)
        if not group:
            return Response({'detail': 'Not a member.'}, status=403)
        membership = GroupMember.objects.get(group=group, user=request.user)
        if membership.role != 'admin':
            return Response({'detail': 'Only admin can edit group.'}, status=403)
        serializer = CreateGroupSerializer(group, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(GroupSerializer(group).data)

    def delete(self, request, pk):
        group = self.get_group(pk, request.user)
        if not group:
            return Response({'detail': 'Not a member.'}, status=403)
        membership = GroupMember.objects.get(group=group, user=request.user)
        if membership.role != 'admin':
            return Response({'detail': 'Only admin can delete group.'}, status=403)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class InviteMemberView(APIView):
    def post(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'detail': 'Not a member.'}, status=403)
        serializer = InviteMemberSerializer(data=request.data, context={'group': group})
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        member = GroupMember.objects.create(group=group, user=user, role='member')
        from .serializers import GroupMemberSerializer
        return Response(GroupMemberSerializer(member).data, status=status.HTTP_201_CREATED)


class RemoveMemberView(APIView):
    def delete(self, request, pk, user_id):
        group = get_object_or_404(Group, pk=pk)
        membership = GroupMember.objects.filter(group=group, user=request.user).first()
        if not membership:
            return Response({'detail': 'Not a member.'}, status=403)
        if membership.role != 'admin' and str(request.user.id) != str(user_id):
            return Response({'detail': 'Only admin can remove others.'}, status=403)
        target = get_object_or_404(GroupMember, group=group, user__id=user_id)
        target.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
