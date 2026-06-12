from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.expenses.models import Expense, ExpenseSplit
from .models import Message
from .serializers import MessageSerializer, CreateMessageSerializer


class MessageListCreateView(APIView):
    def get_expense(self, expense_id, user):
        expense = get_object_or_404(Expense, pk=expense_id)
        has_split = ExpenseSplit.objects.filter(expense=expense, user=user).exists()
        if not has_split and expense.paid_by != user and expense.created_by != user:
            return None
        return expense

    def get(self, request, expense_id):
        expense = self.get_expense(expense_id, request.user)
        if not expense:
            return Response({'detail': 'Not authorized.'}, status=403)
        messages = Message.objects.filter(expense=expense).select_related('user')
        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, expense_id):
        expense = self.get_expense(expense_id, request.user)
        if not expense:
            return Response({'detail': 'Not authorized.'}, status=403)
        serializer = CreateMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = Message.objects.create(
            expense=expense,
            user=request.user,
            content=serializer.validated_data['content']
        )
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
