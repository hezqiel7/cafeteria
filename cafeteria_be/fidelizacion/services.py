from datetime import timedelta

from django.utils import timezone

from .models import (
    BolsaPuntos,
    ClienteFidelizacion,
    ConceptoUsoPuntos,
    ProcesoFidelizacion,
    ReglaAsignacionPuntos,
    UsoPuntos,
    VencimientoPuntos,
)


class FidelizacionError(Exception):
    pass


def get_next_id(model):
    ultimo = model.objects.order_by('-id').first()
    return (ultimo.id if ultimo else 0) + 1


def get_cliente_nombre(cliente_id):
    cliente = ClienteFidelizacion.objects.filter(id=cliente_id).first()
    return f'{cliente.nombre} {cliente.apellido}' if cliente else 'Sin cliente'


def get_concepto_descripcion(concepto_id):
    concepto = ConceptoUsoPuntos.objects.filter(id=concepto_id).first()
    return concepto.descripcion if concepto else 'Sin concepto'


def get_cliente_saldo(cliente_id):
    bolsas = BolsaPuntos.objects.filter(cliente_id=cliente_id)
    return sum(
        int(bolsa.saldo_puntos or 0)
        for bolsa in bolsas
        if not bolsa.vencido
    )


def get_estado_proceso():
    proceso = ProcesoFidelizacion.objects.filter(id=1).first()
    if proceso:
        return proceso

    ahora = timezone.now()
    return ProcesoFidelizacion.objects.create(
        id=1,
        ultima_ejecucion=ahora,
        proxima_ejecucion=ahora + timedelta(hours=6),
        bolsas_vencidas=0,
    )


def calcular_equivalencia(monto_operacion):
    monto = int(monto_operacion or 0)
    if monto <= 0:
        return 0

    reglas = ReglaAsignacionPuntos.objects.order_by('limite_inferior', 'id')
    for regla in reglas:
        cumple_minimo = monto >= int(regla.limite_inferior or 0)
        cumple_maximo = regla.limite_superior is None or monto <= int(regla.limite_superior)
        if cumple_minimo and cumple_maximo:
            return monto // int(regla.monto_equivalencia or 1)

    return 0


def get_duracion_vigente(fecha_base):
    vencimiento = (
        VencimientoPuntos.objects
        .filter(fecha_inicio__lte=fecha_base, fecha_fin__gte=fecha_base)
        .order_by('-fecha_inicio', '-id')
        .first()
    )
    return int(vencimiento.dias_duracion) if vencimiento else 90


def cargar_puntos(cliente_id, monto_operacion):
    cliente = ClienteFidelizacion.objects.filter(id=cliente_id).first()
    if not cliente:
        raise FidelizacionError('El cliente indicado no existe.')

    puntos = calcular_equivalencia(monto_operacion)
    if puntos <= 0:
        raise FidelizacionError('No hay una regla aplicable para cargar puntos con ese monto.')

    fecha_asignacion = timezone.localdate()
    fecha_caducidad = fecha_asignacion + timedelta(days=get_duracion_vigente(fecha_asignacion))

    bolsa = BolsaPuntos.objects.create(
        id=get_next_id(BolsaPuntos),
        cliente_id=int(cliente_id),
        fecha_asignacion=fecha_asignacion,
        fecha_caducidad=fecha_caducidad,
        puntaje_asignado=puntos,
        puntaje_utilizado=0,
        saldo_puntos=puntos,
        monto_operacion=int(monto_operacion),
        vencido=False,
    )

    return bolsa

