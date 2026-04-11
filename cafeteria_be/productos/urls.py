from rest_framework import routers
from .views import ProductosViewSet

router = routers.DefaultRouter()
router.register(r'productos', ProductosViewSet, basename='productos')


urlpatterns = router.urls