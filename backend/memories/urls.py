from django.urls import path
from . import views

urlpatterns = [
    path('verify-pin/', views.verify_pin),
    path('memories/', views.memory_list),
    path('memories/<uuid:pk>/', views.memory_detail),
    path('memories/<uuid:pk>/photos/', views.memory_add_photos),
    path('photos/<uuid:pk>/', views.photo_delete),
]
