from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction, models
from django.db.models import Q
from .models import Group, GroupMembership, Expense, ExpenseSplit, Payment, CSVImport, CSVAnomaly

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar_color')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'avatar_color')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            avatar_color=validated_data.get('avatar_color', '#10B981')
        )
        return user

class GroupSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    latest_import = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ('id', 'name', 'created_at', 'members_count', 'latest_import')

    def get_members_count(self, obj):
        return obj.memberships.count()

    def get_latest_import(self, obj):
        latest = obj.imports.order_by('-uploaded_at').first()
        if latest:
            return {
                "id": latest.id,
                "status": latest.status,
                "filename": latest.filename,
                "uploaded_at": latest.uploaded_at
            }
        return None

class GroupMembershipSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = GroupMembership
        fields = ('id', 'group', 'user', 'user_detail', 'email', 'joined_at', 'left_at')
        read_only_fields = ('user',)

    def validate(self, attrs):
        joined_at = attrs.get('joined_at')
        left_at = attrs.get('left_at')
        if left_at and joined_at and left_at < joined_at:
            raise serializers.ValidationError({"left_at": "Leave date cannot be before join date."})
        return attrs

    def create(self, validated_data):
        email = validated_data.pop('email', None)
        if email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Fallback to username search if email is not found
                user = User.objects.filter(username__iexact=email.split('@')[0]).first()
                if not user:
                    # Create a placeholder user
                    username = email.split('@')[0]
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=User.objects.make_random_password()
                    )
            validated_data['user'] = user
        return super().create(validated_data)

class ExpenseSplitSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = ExpenseSplit
        fields = ('id', 'user', 'user_detail', 'amount_owed')

class ExpenseSerializer(serializers.ModelSerializer):
    splits = ExpenseSplitSerializer(many=True, required=False)
    paid_by_detail = UserSerializer(source='paid_by', read_only=True)

    class Meta:
        model = Expense
        fields = (
            'id', 'group', 'description', 'amount', 'currency', 'exchange_rate', 
            'paid_by', 'paid_by_detail', 'date', 'split_type', 'status', 'created_at', 'splits'
        )

    def validate(self, attrs):
        # 1. Validate that the payer is in the group at the time of expense
        group = attrs.get('group')
        paid_by = attrs.get('paid_by')
        date = attrs.get('date')

        payer_membership = GroupMembership.objects.filter(
            group=group, user=paid_by,
            joined_at__lte=date
        ).filter(
            Q(left_at__isnull=True) | Q(left_at__gte=date)
        ).first()

        if not payer_membership:
            raise serializers.ValidationError({
                "paid_by": f"{paid_by.username} was not a member of this group on {date}."
            })

        return attrs

    def create(self, validated_data):
        splits_data = validated_data.pop('splits', [])
        group = validated_data['group']
        date = validated_data['date']
        
        with transaction.atomic():
            expense = Expense.objects.create(**validated_data)
            
            # If splits are provided, save them, validating user active ranges
            if splits_data:
                total_split_amount = sum(split['amount_owed'] for split in splits_data)
                
                # Check for floating point discrepancies
                if abs(total_split_amount - validated_data['amount']) > 0.05:
                    raise serializers.ValidationError({
                        "amount": f"Sum of splits ({total_split_amount}) must equal expense amount ({validated_data['amount']})."
                    })

                for split in splits_data:
                    user = split['user']
                    # Verify user membership on expense date
                    member = GroupMembership.objects.filter(
                        group=group, user=user,
                        joined_at__lte=date
                    ).filter(
                        Q(left_at__isnull=True) | Q(left_at__gte=date)
                    ).first()
                    
                    if not member:
                        raise serializers.ValidationError({
                            "splits": f"{user.username} was not a member of the group on {date}."
                        })
                    
                    ExpenseSplit.objects.create(
                        expense=expense,
                        user=user,
                        amount_owed=split['amount_owed']
                    )
            else:
                # Default to equal split among all group members active on that date
                active_members = User.objects.filter(
                    group_memberships__group=group,
                    group_memberships__joined_at__lte=date
                ).filter(
                    Q(group_memberships__left_at__isnull=True) | 
                    Q(group_memberships__left_at__gte=date)
                ).distinct()

                if not active_members.exists():
                    raise serializers.ValidationError({
                        "date": "No active group members on this date to split with."
                    })

                split_amount = round(validated_data['amount'] / active_members.count(), 2)
                # Adjust for any rounding error on the last member
                split_amounts = [split_amount] * active_members.count()
                diff = validated_data['amount'] - sum(split_amounts)
                if diff != 0:
                    split_amounts[-1] += diff

                for user, amt in zip(active_members, split_amounts):
                    ExpenseSplit.objects.create(
                        expense=expense,
                        user=user,
                        amount_owed=amt
                    )
            return expense

class PaymentSerializer(serializers.ModelSerializer):
    payer_detail = UserSerializer(source='payer', read_only=True)
    payee_detail = UserSerializer(source='payee', read_only=True)

    class Meta:
        model = Payment
        fields = (
            'id', 'group', 'payer', 'payer_detail', 'payee', 'payee_detail',
            'amount', 'currency', 'exchange_rate', 'date', 'created_at'
        )

    def validate(self, attrs):
        group = attrs.get('group')
        payer = attrs.get('payer')
        payee = attrs.get('payee')
        date = attrs.get('date')

        if payer == payee:
            raise serializers.ValidationError("Payer and payee cannot be the same person.")

        # Verify payer and payee are active in the group on that date
        for user, role in [(payer, "payer"), (payee, "payee")]:
            membership = GroupMembership.objects.filter(
                group=group, user=user,
                joined_at__lte=date
            ).filter(
                Q(left_at__isnull=True) | Q(left_at__gte=date)
            ).first()

            if not membership:
                raise serializers.ValidationError({
                    role: f"{user.username} was not a member of the group on {date}."
                })
        return attrs

class CSVAnomalySerializer(serializers.ModelSerializer):
    class Meta:
        model = CSVAnomaly
        fields = '__all__'

class CSVImportSerializer(serializers.ModelSerializer):
    anomalies = CSVAnomalySerializer(many=True, read_only=True)

    class Meta:
        model = CSVImport
        fields = ('id', 'uploaded_at', 'uploaded_by', 'status', 'filename', 'anomalies')
