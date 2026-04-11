from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Pedido
from .serializers import PedidoSerializer
from productos.models import Producto
from productos.serializers import ProductoSerializer
from cafeteria_be.permissions import IsCocinero, IsRecepcionista
from rest_framework.permissions import IsAdminUser


class PedidosViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def get_permissions(self):
        permission_classes = []
        if self.action == 'retrieve' or self.action == 'list' \
                or self.action == 'update' or self.action == 'partial_update' \
                or self.action == 'productos':
            permission_classes = [IsAdminUser | IsRecepcionista
                                  | IsCocinero]
        elif self.action == 'create' or self.action == 'destroy':
            permission_classes = [IsAdminUser | IsRecepcionista]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def productos(self, request, pk=None):
        id_pedido = self.kwargs['pk']
        try:
            pedido = Pedido.objects.get(pk=id_pedido)
            lista_productos = []
            for producto in pedido.lista_productos:
                producto_detalle = Producto.objects.get(
                    pk=producto['producto_id'])
                cantidad = producto['cantidad']
                dict = {"producto": ProductoSerializer(
                    producto_detalle).data, "cantidad": cantidad}
                lista_productos.append(dict)
            return Response(data=lista_productos, status=200)
        except Exception as e:
            print(e)
            return Response(None, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
