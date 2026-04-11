from djongo import models
from django.utils import timezone


class Pedido(models.Model):
    id = models.IntegerField(primary_key=True)
    mesa = models.IntegerField("Nro de mesa")
    listo = models.BooleanField("Listo para servir", default=False)
    fecha_pedido = models.DateTimeField(
        "Fecha del pedido", default=timezone.now)
    lista_productos = models.JSONField("Lista de productos")
    total_precio = models.IntegerField("Precio total", null=True)
    nombre_cliente = models.TextField("Nombre del cliente")
