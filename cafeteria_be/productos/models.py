from djongo import models

class Producto(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=100)
    precio = models.IntegerField(default=0) # Puede ser mas adecuado usar DecimalField