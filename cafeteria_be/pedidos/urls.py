from rest_framework import routers
from .views import PedidosViewSet

router = routers.DefaultRouter()
router.register(r'pedidos', PedidosViewSet, basename='pedidos')

urlpatterns = router.urls
