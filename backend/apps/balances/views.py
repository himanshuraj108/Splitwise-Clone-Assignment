from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from apps.users.models import Friendship
from apps.groups.models import Group, GroupMember
from apps.users.serializers import UserSerializer
from .calculator import (
    get_group_balances, simplify_debts, get_group_direct_debts,
    get_balances_between_users, get_user_overall_balances
)
from decimal import Decimal

User = get_user_model()


class GroupBalanceView(APIView):
    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'detail': 'Group not found.'}, status=404)

        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({'detail': 'Not a member.'}, status=403)

        balances = get_group_balances(group_id)
        
        if group.simplify_debts:
            transactions_data = simplify_debts(balances)
        else:
            transactions_data = get_group_direct_debts(group_id)

        # Enrich with user data
        all_user_ids = set(balances.keys())
        for t in transactions_data:
            all_user_ids.add(t['from_user'])
            all_user_ids.add(t['to_user'])

        users = {str(u.id): UserSerializer(u).data for u in User.objects.filter(id__in=all_user_ids)}

        balance_list = []
        for uid, amount in balances.items():
            balance_list.append({
                'user': users.get(uid, {'id': uid}),
                'net_balance': float(amount),
                'status': 'owed' if amount > 0 else ('owes' if amount < 0 else 'settled'),
            })

        transactions = [{
            'from_user': users.get(t['from_user'], {'id': t['from_user']}),
            'to_user': users.get(t['to_user'], {'id': t['to_user']}),
            'amount': float(t['amount']),
        } for t in transactions_data]

        return Response({
            'balances': balance_list,
            'simplified_transactions': transactions,
        })


class UserBalanceSummaryView(APIView):
    def get(self, request):
        # Get all friends
        friendships = Friendship.objects.filter(
            Q(requester=request.user) | Q(addressee=request.user),
            status='accepted'
        )
        friend_ids = []
        friends_data = {}
        for fs in friendships:
            friend = fs.addressee if fs.requester == request.user else fs.requester
            friend_ids.append(friend.id)
            friends_data[str(friend.id)] = UserSerializer(friend).data

        balances = get_user_overall_balances(request.user.id, friend_ids)

        result = []
        total_owed_to_you = Decimal('0')
        total_you_owe = Decimal('0')

        for fid, net in balances.items():
            if net > Decimal('0.01'):
                total_owed_to_you += net
            elif net < Decimal('-0.01'):
                total_you_owe += abs(net)

            result.append({
                'friend': friends_data.get(fid, {'id': fid}),
                'net_balance': float(net),
                'status': 'owes_you' if net > 0 else ('you_owe' if net < 0 else 'settled'),
            })

        return Response({
            'summary': result,
            'total_owed_to_you': float(total_owed_to_you),
            'total_you_owe': float(total_you_owe),
            'net': float(total_owed_to_you - total_you_owe),
        })


class FriendBalanceView(APIView):
    def get(self, request, friend_id):
        net = get_balances_between_users(request.user.id, friend_id)
        friend = User.objects.get(id=friend_id)
        return Response({
            'friend': UserSerializer(friend).data,
            'net_balance': float(net),
            'status': 'owes_you' if net > 0 else ('you_owe' if net < 0 else 'settled'),
        })
