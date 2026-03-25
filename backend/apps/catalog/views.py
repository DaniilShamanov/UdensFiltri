from rest_framework import permissions, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q

from .models import Category, Product, Service
from .serializers import CategorySerializer, ProductSerializer, ServiceSerializer


class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).order_by("name")
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "pk"
    pagination_class = ProductPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        params = self.request.query_params

        category = params.get("category")
        if category:
            queryset = queryset.filter(category_id=category)

        search = params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(brand__icontains=search)
            )

        brands = params.get("brand")
        if brands:
            brand_list = [brand.strip() for brand in brands.split(",") if brand.strip()]
            if brand_list:
                brand_filter = Q()
                for brand in brand_list:
                    brand_filter |= Q(brand__iexact=brand)
                queryset = queryset.filter(brand_filter)

        min_price = params.get("min_price")
        if min_price and min_price.isdigit():
            queryset = queryset.filter(price_cents__gte=int(min_price) * 100)

        max_price = params.get("max_price")
        if max_price and max_price.isdigit():
            queryset = queryset.filter(price_cents__lte=int(max_price) * 100)

        in_stock = params.get("in_stock")
        if in_stock is not None:
            value = in_stock.lower() in {"1", "true", "yes"}
            model_fields = {field.name for field in Product._meta.fields}
            if "in_stock" in model_fields:
                queryset = queryset.filter(in_stock=value)
            elif "stock" in model_fields:
                queryset = queryset.filter(stock__gt=0) if value else queryset.filter(stock__lte=0)

        ordering = params.get("ordering")
        allowed_orderings = {"price", "-price", "name", "-name"}
        if ordering in allowed_orderings:
            if "price" in ordering:
                queryset = queryset.order_by(ordering.replace("price", "price_cents"), "name")
            else:
                queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("name")

        return queryset


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.filter(is_active=True).order_by("name")
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "pk"

@api_view(['GET'])
@permission_classes([AllowAny])
def brand_list(request):
    brands = Product.objects.filter(is_active=True).values_list('brand', flat=True).distinct().order_by('brand')
    return Response(brands)
