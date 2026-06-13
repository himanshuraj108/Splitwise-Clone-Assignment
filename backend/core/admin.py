from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Group, GroupMembership, Expense, ExpenseSplit, Payment, CSVImport, CSVAnomaly

admin.site.register(User, UserAdmin)
admin.site.register(Group)
admin.site.register(GroupMembership)
admin.site.register(Expense)
admin.site.register(ExpenseSplit)
admin.site.register(Payment)
admin.site.register(CSVImport)
admin.site.register(CSVAnomaly)
