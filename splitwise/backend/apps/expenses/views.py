from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Expense, ExpenseSplit
from .serializers import ExpenseSerializer, CreateExpenseSerializer
from apps.groups.models import GroupMember


class ExpenseListCreateView(APIView):
    def get(self, request):
        group_id = request.query_params.get('group_id')
        friend_id = request.query_params.get('friend_id')

        if group_id:
            # Verify user is member of group
            if not GroupMember.objects.filter(group_id=group_id, user=request.user).exists():
                return Response({'detail': 'Not a member of this group.'}, status=403)
            expenses = Expense.objects.filter(group_id=group_id).prefetch_related(
                'splits__user', 'paid_by', 'created_by'
            )
        elif friend_id:
            # Get expenses shared between current user and friend
            user_expense_ids = ExpenseSplit.objects.filter(
                user=request.user
            ).values_list('expense_id', flat=True)
            friend_expense_ids = ExpenseSplit.objects.filter(
                user_id=friend_id
            ).values_list('expense_id', flat=True)
            shared_ids = set(user_expense_ids) & set(friend_expense_ids)
            expenses = Expense.objects.filter(id__in=shared_ids, group=None).prefetch_related(
                'splits__user', 'paid_by', 'created_by'
            )
        else:
            # All expenses user is part of
            user_expense_ids = ExpenseSplit.objects.filter(
                user=request.user
            ).values_list('expense_id', flat=True)
            expenses = Expense.objects.filter(
                Q(id__in=user_expense_ids) | Q(paid_by=request.user)
            ).prefetch_related('splits__user', 'paid_by', 'created_by').distinct()

        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreateExpenseSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        expense = serializer.save()
        return Response(ExpenseSerializer(expense).data, status=status.HTTP_201_CREATED)


class ExpenseDetailView(APIView):
    def get_expense(self, pk, user):
        expense = get_object_or_404(Expense, pk=pk)
        has_split = ExpenseSplit.objects.filter(expense=expense, user=user).exists()
        if not has_split and expense.paid_by != user and expense.created_by != user:
            return None
        return expense

    def get(self, request, pk):
        expense = self.get_expense(pk, request.user)
        if not expense:
            return Response({'detail': 'Not authorized.'}, status=403)
        return Response(ExpenseSerializer(expense).data)

    def put(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk)
        if expense.created_by != request.user:
            return Response({'detail': 'Only creator can edit.'}, status=403)
        # Delete old splits and recreate
        expense.splits.all().delete()
        serializer = CreateExpenseSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        new_expense = serializer.save()
        expense.delete()
        return Response(ExpenseSerializer(new_expense).data)

    def delete(self, request, pk):
        expense = get_object_or_404(Expense, pk=pk)
        if expense.created_by != request.user and expense.paid_by != request.user:
            return Response({'detail': 'Not authorized.'}, status=403)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
