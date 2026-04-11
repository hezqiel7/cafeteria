from rest_framework import routers
from .views import UsuariosViewSet

router = routers.DefaultRouter()
router.register(r'usuarios', UsuariosViewSet, basename='usuarios')

urlpatterns = router.urls