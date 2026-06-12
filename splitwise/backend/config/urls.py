from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/friends/', include('apps.users.friend_urls')),
    path('api/groups/', include('apps.groups.urls')),
    path('api/expenses/', include('apps.expenses.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/balances/', include('apps.balances.urls')),
]
