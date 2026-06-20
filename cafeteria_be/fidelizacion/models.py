from djongo import models


class ClienteFidelizacion(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    numero_documento = models.CharField(max_length=30)
    tipo_documento = models.CharField(max_length=30, default='CI')
    nacionalidad = models.CharField(max_length=80, blank=True, default='')
    email = models.CharField(max_length=120, blank=True, default='')
    telefono = models.CharField(max_length=40, blank=True, default='')
    fecha_nacimiento = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.nombre} {self.apellido}'


class ConceptoUsoPuntos(models.Model):
    id = models.IntegerField(primary_key=True)
    descripcion = models.CharField(max_length=120)
    puntos_requeridos = models.IntegerField()

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.descripcion


class ReglaAsignacionPuntos(models.Model):
    id = models.IntegerField(primary_key=True)
    limite_inferior = models.IntegerField(default=0)
    limite_superior = models.IntegerField(null=True, blank=True)
    monto_equivalencia = models.IntegerField()

    class Meta:
        ordering = ['limite_inferior', 'id']

    def __str__(self):
        limite = self.limite_superior if self.limite_superior is not None else 'sin limite'
        return f'{self.limite_inferior} - {limite}'


class VencimientoPuntos(models.Model):
    id = models.IntegerField(primary_key=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    dias_duracion = models.IntegerField()

    class Meta:
        ordering = ['fecha_inicio', 'id']

    def __str__(self):
        return f'{self.fecha_inicio} - {self.fecha_fin}'


class BolsaPuntos(models.Model):
    id = models.IntegerField(primary_key=True)
    cliente_id = models.IntegerField()
    fecha_asignacion = models.DateField()
    fecha_caducidad = models.DateField()
    puntaje_asignado = models.IntegerField(default=0)
    puntaje_utilizado = models.IntegerField(default=0)
    saldo_puntos = models.IntegerField(default=0)
    monto_operacion = models.IntegerField(default=0)
    vencido = models.BooleanField(default=False)

    class Meta:
        ordering = ['fecha_asignacion', 'id']

    def __str__(self):
        return f'Bolsa {self.id} - Cliente {self.cliente_id}'


class UsoPuntos(models.Model):
    id = models.IntegerField(primary_key=True)
    cliente_id = models.IntegerField()
    concepto_id = models.IntegerField()
    puntaje_utilizado = models.IntegerField(default=0)
    fecha = models.DateField()
    detalle = models.JSONField(default=list)

    class Meta:
        ordering = ['-fecha', '-id']

    def __str__(self):
        return f'Uso {self.id} - Cliente {self.cliente_id}'


class ProcesoFidelizacion(models.Model):
    id = models.IntegerField(primary_key=True)
    ultima_ejecucion = models.DateTimeField(null=True, blank=True)
    proxima_ejecucion = models.DateTimeField(null=True, blank=True)
    bolsas_vencidas = models.IntegerField(default=0)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return 'Proceso de fidelizacion'
