from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, ServiceViewSet, brand_list

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="categories")
router.register("products", ProductViewSet, basename="products")
router.register("services", ServiceViewSet, basename="services")

urlpatterns = [
    path('', include(router.urls)),
    path('brands/', brand_list)
]