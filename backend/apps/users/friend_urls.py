from django.urls import path
from .views import FriendListView, AddFriendView, RemoveFriendView

urlpatterns = [
    path('', FriendListView.as_view(), name='friend_list'),
    path('add/', AddFriendView.as_view(), name='add_friend'),
    path('<uuid:pk>/remove/', RemoveFriendView.as_view(), name='remove_friend'),
]
