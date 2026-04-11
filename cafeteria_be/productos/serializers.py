from rest_framework import serializers
from .models import Producto

# Producto Serializer
class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio']