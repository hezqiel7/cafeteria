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


def build_resumen():
    return {
        'clientes': ClienteFidelizacionSerializer(ClienteFidelizacion.objects.all(), many=True).data,
        'conceptos': ConceptoUsoPuntosSerializer(ConceptoUsoPuntos.objects.all(), many=True).data,
        'reglas': ReglaAsignacionPuntosSerializer(ReglaAsignacionPuntos.objects.all(), many=True).data,
        'vencimientos': VencimientoPuntosSerializer(VencimientoPuntos.objects.all(), many=True).data,
        'bolsas': BolsaPuntosSerializer(BolsaPuntos.objects.all(), many=True).data,
        'usos': UsoPuntosSerializer(UsoPuntos.objects.all(), many=True).data,
        'procesos': ProcesoFidelizacionSerializer(get_estado_proceso()).data,
    }


class ResumenFidelizacionView(FidelizacionPermissionMixin, APIView):
    def get(self, request):
        return Response(build_resumen())


class CargarPuntosView(FidelizacionPermissionMixin, APIView):
    def post(self, request):
        try:
            bolsa = cargar_puntos(
                int(request.data.get('cliente_id')),
                int(request.data.get('monto_operacion')),
            )
            return Response({
                'bolsa': BolsaPuntosSerializer(bolsa).data,
                'resumen': build_resumen(),
            }, status=status.HTTP_201_CREATED)
        except (TypeError, ValueError, FidelizacionError) as error:
            return Response({'detail': str(error)}, status=status.HTTP_400_BAD_REQUEST)


class UsarPuntosView(FidelizacionPermissionMixin, APIView):
    def post(self, request):
        try:
            uso = usar_puntos(
                int(request.data.get('cliente_id')),
                int(request.data.get('concepto_id')),
            )
            return Response({
                'uso': UsoPuntosSerializer(uso).data,
                'resumen': build_resumen(),
            }, status=status.HTTP_201_CREATED)
        except (TypeError, ValueError, FidelizacionError) as error:
            return Response({'detail': str(error)}, status=status.HTTP_400_BAD_REQUEST)


class EquivalenciaPuntosView(FidelizacionPermissionMixin, APIView):
    def get(self, request):
        try:
            monto = int(request.query_params.get('monto', 0))
        except (TypeError, ValueError):
            monto = 0
        return Response({'puntos': calcular_equivalencia(monto)})


class ConsultasFidelizacionView(FidelizacionPermissionMixin, APIView):
    def get(self, request):
        tipo = request.query_params.get('tipo', '')
        valor = request.query_params.get('valor', '')
        try:
            return Response({'rows': consultar(tipo, valor)})
        except ValueError as error:
            return Response({'detail': str(error)}, status=status.HTTP_400_BAD_REQUEST)


class ProcesoVencimientosView(FidelizacionPermissionMixin, APIView):
    def post(self, request):
        proceso = ejecutar_vencimientos()
        return Response({
            'proceso': ProcesoFidelizacionSerializer(proceso).data,
            'resumen': build_resumen(),
        })
