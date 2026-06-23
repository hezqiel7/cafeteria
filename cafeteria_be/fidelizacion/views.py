from rest_framework import status, viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from cafeteria_be.permissions import IsRecepcionista

from .models import (
    BolsaPuntos,
    ClienteFidelizacion,
    ConceptoUsoPuntos,
    ReglaAsignacionPuntos,
    UsoPuntos,
    VencimientoPuntos,
)
from .serializers import (
    BolsaPuntosSerializer,
    ClienteFidelizacionSerializer,
    ConceptoUsoPuntosSerializer,
    ProcesoFidelizacionSerializer,
    ReglaAsignacionPuntosSerializer,
    UsoPuntosSerializer,
    VencimientoPuntosSerializer,
)
from .services import (
    FidelizacionError,
    calcular_equivalencia,
    cargar_puntos,
    consultar,
    ejecutar_vencimientos,
    get_estado_proceso,
    usar_puntos,
)


class FidelizacionPermissionMixin:
    permission_classes = [IsAdminUser | IsRecepcionista]


class ClienteFidelizacionViewSet(FidelizacionPermissionMixin, viewsets.ModelViewSet):
    queryset = ClienteFidelizacion.objects.all()
    serializer_class = ClienteFidelizacionSerializer


class ConceptoUsoPuntosViewSet(FidelizacionPermissionMixin, viewsets.ModelViewSet):
    queryset = ConceptoUsoPuntos.objects.all()
    serializer_class = ConceptoUsoPuntosSerializer


class ReglaAsignacionPuntosViewSet(FidelizacionPermissionMixin, viewsets.ModelViewSet):
    queryset = ReglaAsignacionPuntos.objects.all()
    serializer_class = ReglaAsignacionPuntosSerializer


class VencimientoPuntosViewSet(FidelizacionPermissionMixin, viewsets.ModelViewSet):
    queryset = VencimientoPuntos.objects.all()
    serializer_class = VencimientoPuntosSerializer


class BolsaPuntosViewSet(FidelizacionPermissionMixin, viewsets.ReadOnlyModelViewSet):
    queryset = BolsaPuntos.objects.all()
    serializer_class = BolsaPuntosSerializer


class UsoPuntosViewSet(FidelizacionPermissionMixin, viewsets.ReadOnlyModelViewSet):
    queryset = UsoPuntos.objects.all()
    serializer_class = UsoPuntosSerializer

