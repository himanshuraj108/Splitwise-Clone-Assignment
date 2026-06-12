from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentSerializer


class PaymentListCreateView(APIView):
    def get(self, request):
        group_id = request.query_params.get('group_id')
        friend_id = request.query_params.get('friend_id')

        payments = Payment.objects.filter(
            Q(payer=request.user) | Q(payee=request.user)
        ).select_related('payer', 'payee')

        if group_id:
            payments = payments.filter(group_id=group_id)
        if friend_id:
            payments = payments.filter(
                Q(payer_id=friend_id) | Q(payee_id=friend_id)
            )

        return Response(PaymentSerializer(payments, many=True).data)

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentDetailView(APIView):
    def delete(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk)
        if payment.payer != request.user and payment.created_by != request.user:
            return Response({'detail': 'Not authorized.'}, status=403)
        payment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
