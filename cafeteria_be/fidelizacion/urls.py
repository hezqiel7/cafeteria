from django.urls import path
from rest_framework import routers

from .views import (
    BolsaPuntosViewSet,
    CargarPuntosView,
    ClienteFidelizacionViewSet,
    ConceptoUsoPuntosViewSet,
    ConsultasFidelizacionView,
    EquivalenciaPuntosView,
    ProcesoVencimientosView,
    ReglaAsignacionPuntosViewSet,
    ResumenFidelizacionView,
    UsoPuntosViewSet,
    UsarPuntosView,
    VencimientoPuntosViewSet,
)


router = routers.DefaultRouter()
router.register(r'fidelizacion/clientes', ClienteFidelizacionViewSet, basename='fidelizacion-clientes')
router.register(r'fidelizacion/conceptos', ConceptoUsoPuntosViewSet, basename='fidelizacion-conceptos')
router.register(r'fidelizacion/reglas', ReglaAsignacionPuntosViewSet, basename='fidelizacion-reglas')
router.register(r'fidelizacion/vencimientos', VencimientoPuntosViewSet, basename='fidelizacion-vencimientos')
router.register(r'fidelizacion/bolsas', BolsaPuntosViewSet, basename='fidelizacion-bolsas')
router.register(r'fidelizacion/usos', UsoPuntosViewSet, basename='fidelizacion-usos')

urlpatterns = router.urls + [
    path('fidelizacion/resumen/', ResumenFidelizacionView.as_view(), name='fidelizacion-resumen'),
    path('fidelizacion/servicios/cargar-puntos/', CargarPuntosView.as_view(), name='fidelizacion-cargar-puntos'),
    path('fidelizacion/servicios/usar-puntos/', UsarPuntosView.as_view(), name='fidelizacion-usar-puntos'),
    path('fidelizacion/servicios/equivalencia/', EquivalenciaPuntosView.as_view(), name='fidelizacion-equivalencia'),
    path('fidelizacion/consultas/', ConsultasFidelizacionView.as_view(), name='fidelizacion-consultas'),
    path('fidelizacion/procesos/vencimientos/ejecutar/', ProcesoVencimientosView.as_view(), name='fidelizacion-proceso-vencimientos'),
]
