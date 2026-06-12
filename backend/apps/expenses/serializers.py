from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Expense, ExpenseSplit
from apps.users.serializers import UserSerializer
from .split_calculator import (
    calculate_equal_splits, calculate_unequal_splits,
    calculate_percentage_splits, calculate_share_splits
)
from decimal import Decimal

User = get_user_model()


class ExpenseSplitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ExpenseSplit
        fields = ['id', 'user', 'amount_owed', 'share_value', 'percentage']


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    splits = ExpenseSplitSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'group', 'description', 'total_amount', 'currency',
            'paid_by', 'split_type', 'category', 'date', 'notes',
            'created_by', 'splits', 'created_at', 'updated_at'
        ]


class SplitInputSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    shares = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class CreateExpenseSerializer(serializers.Serializer):
    group_id = serializers.UUIDField(required=False, allow_null=True)
    description = serializers.CharField(max_length=300)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    paid_by_id = serializers.UUIDField()
    split_type = serializers.ChoiceField(choices=['equal', 'unequal', 'percentage', 'shares'])
    category = serializers.ChoiceField(choices=[
        'food', 'transport', 'accommodation', 'entertainment',
        'shopping', 'utilities', 'health', 'other'
    ], default='other')
    date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    splits = SplitInputSerializer(many=True)

    def validate(self, data):
        split_type = data['split_type']
        splits = data['splits']
        total = Decimal(str(data['total_amount']))

        if split_type == 'unequal':
            total_split = sum(Decimal(str(s.get('amount', 0))) for s in splits)
            if abs(total_split - total) > Decimal('0.02'):
                raise serializers.ValidationError(
                    f"Unequal split amounts (₹{total_split}) must sum to total (₹{total})."
                )

        if split_type == 'percentage':
            total_pct = sum(Decimal(str(s.get('percentage', 0))) for s in splits)
            if abs(total_pct - 100) > Decimal('0.5'):
                raise serializers.ValidationError(
                    f"Percentages must sum to 100 (got {total_pct})."
                )

        return data

    def create(self, validated_data):
        from apps.groups.models import Group
        request_user = self.context['request'].user
        splits_data = validated_data.pop('splits')
        group_id = validated_data.pop('group_id', None)
        paid_by_id = validated_data.pop('paid_by_id')
        split_type = validated_data['split_type']

        paid_by = User.objects.get(id=paid_by_id)
        group = Group.objects.get(id=group_id) if group_id else None

        expense = Expense.objects.create(
            group=group,
            paid_by=paid_by,
            created_by=request_user,
            **validated_data
        )

        # Calculate splits
        user_ids = [str(s['user_id']) for s in splits_data]

        if split_type == 'equal':
            calculated = calculate_equal_splits(validated_data['total_amount'], user_ids)
        elif split_type == 'unequal':
            calculated = calculate_unequal_splits({str(s['user_id']): s['amount'] for s in splits_data})
        elif split_type == 'percentage':
            user_pcts = {str(s['user_id']): s['percentage'] for s in splits_data}
            calculated = calculate_percentage_splits(validated_data['total_amount'], user_pcts)
        elif split_type == 'shares':
            user_shares = {str(s['user_id']): s['shares'] for s in splits_data}
            calculated = calculate_share_splits(validated_data['total_amount'], user_shares)

        for s in splits_data:
            uid = str(s['user_id'])
            user = User.objects.get(id=uid)
            ExpenseSplit.objects.create(
                expense=expense,
                user=user,
                amount_owed=calculated.get(uid, 0),
                share_value=s.get('shares'),
                percentage=s.get('percentage'),
            )

        return expense
