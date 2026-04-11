from rest_framework import serializers
from .models import Pedido
from productos.models import Producto


class ProductoCantidadSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    cantidad = serializers.IntegerField()


class PedidoSerializer(serializers.ModelSerializer):

    lista_productos = ProductoCantidadSerializer(many=True)

    class Meta:
        model = Pedido
        fields = '__all__'
        # fields = [Pedido.pk, 'mesa', 'listo', 'fecha_pedido', 'lista_productos', 'total_precio', 'nombre_cliente']

    def create(self, validated_data):
        lista_productos = validated_data.get('lista_productos')
        total = 0
        for producto in lista_productos:
            total += Producto.objects.get(
                pk=producto['producto_id']).precio * producto['cantidad']
        validated_data['total_precio'] = total
        return super().create(validated_data)

    def update(self, instance, validated_data):
        lista_productos = validated_data.get('lista_productos')
        total = 0
        for producto in lista_productos:
            total += Producto.objects.get(
                pk=producto['producto_id']).precio * producto['cantidad']
        validated_data['total_precio'] = total
        return super().update(instance, validated_data)

    # def to_representation(self, instance):
    #     representation = super().to_representation(instance)
    #     representation['lista_productos'] = json.loads(representation['lista_productos'])
    #     return representation
