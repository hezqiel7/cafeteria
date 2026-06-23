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


def usar_puntos(cliente_id, concepto_id):
    cliente = ClienteFidelizacion.objects.filter(id=cliente_id).first()
    concepto = ConceptoUsoPuntos.objects.filter(id=concepto_id).first()
    if not cliente or not concepto:
        raise FidelizacionError('No se encontro el cliente o concepto indicado.')

    puntos_requeridos = int(concepto.puntos_requeridos)
    saldo_disponible = get_cliente_saldo(cliente_id)
    if saldo_disponible < puntos_requeridos:
        raise FidelizacionError('El cliente no tiene saldo suficiente para usar ese concepto.')

    puntos_pendientes = puntos_requeridos
    detalle = []

    # Se consumen primero las bolsas mas antiguas para respetar FIFO.
    bolsas = sorted(
        [
            bolsa
            for bolsa in BolsaPuntos.objects.filter(cliente_id=cliente_id)
            if not bolsa.vencido and int(bolsa.saldo_puntos or 0) > 0
        ],
        key=lambda bolsa: (bolsa.fecha_asignacion, bolsa.id),
    )

    for bolsa in bolsas:
        if puntos_pendientes <= 0:
            break

        puntos_consumidos = min(int(bolsa.saldo_puntos), puntos_pendientes)
        bolsa.puntaje_utilizado = int(bolsa.puntaje_utilizado) + puntos_consumidos
        bolsa.saldo_puntos = int(bolsa.saldo_puntos) - puntos_consumidos
        bolsa.save()

        detalle.append({
            'id': len(detalle) + 1,
            'bolsa_id': bolsa.id,
            'puntaje_utilizado': puntos_consumidos,
        })
        puntos_pendientes -= puntos_consumidos

    return UsoPuntos.objects.create(
        id=get_next_id(UsoPuntos),
        cliente_id=int(cliente_id),
        concepto_id=int(concepto_id),
        puntaje_utilizado=puntos_requeridos,
        fecha=timezone.localdate(),
        detalle=detalle,
    )


def ejecutar_vencimientos(fecha_base=None):
    fecha = fecha_base or timezone.localdate()
    bolsas_vencidas = 0

    for bolsa in BolsaPuntos.objects.all():
        if bolsa.vencido or bolsa.fecha_caducidad >= fecha:
            continue

        saldo = int(bolsa.saldo_puntos or 0)
        if saldo > 0:
            bolsa.puntaje_utilizado = int(bolsa.puntaje_utilizado or 0) + saldo
            bolsa.saldo_puntos = 0
            bolsas_vencidas += 1
        bolsa.vencido = True
        bolsa.save()

    ahora = timezone.now()
    proceso, _ = ProcesoFidelizacion.objects.get_or_create(id=1)
    proceso.ultima_ejecucion = ahora
    proceso.proxima_ejecucion = ahora + timedelta(hours=6)
    proceso.bolsas_vencidas = bolsas_vencidas
    proceso.save()
    return proceso


def consultar(tipo, valor=''):
    valor = str(valor or '').strip()
    valor_lower = valor.lower()

    if tipo == 'uso_concepto':
        rows = []
        for uso in UsoPuntos.objects.all():
            descripcion = get_concepto_descripcion(uso.concepto_id)
            if valor_lower in descripcion.lower():
                rows.append({
                    'referencia': f'Uso #{uso.id}',
                    'detalle': descripcion,
                    'extra': get_cliente_nombre(uso.cliente_id),
                })
        return rows

    if tipo == 'uso_fecha':
        return [
            {
                'referencia': f'Uso #{uso.id}',
                'detalle': str(uso.fecha),
                'extra': f'{get_cliente_nombre(uso.cliente_id)} - {uso.puntaje_utilizado} pts',
            }
            for uso in UsoPuntos.objects.all()
            if valor in str(uso.fecha)
        ]

    if tipo == 'uso_cliente':
        rows = []
        for uso in UsoPuntos.objects.all():
            cliente = get_cliente_nombre(uso.cliente_id)
            if valor_lower in cliente.lower():
                rows.append({
                    'referencia': f'Uso #{uso.id}',
                    'detalle': cliente,
                    'extra': get_concepto_descripcion(uso.concepto_id),
                })
        return rows

    if tipo == 'bolsa_cliente':
        rows = []
        for bolsa in BolsaPuntos.objects.all():
            cliente = get_cliente_nombre(bolsa.cliente_id)
            if valor_lower in cliente.lower():
                rows.append({
                    'referencia': f'Bolsa #{bolsa.id}',
                    'detalle': cliente,
                    'extra': f'Saldo {bolsa.saldo_puntos}',
                })
        return rows

    if tipo == 'bolsa_rango':
        minimo = int(valor or 0)
        return [
            {
                'referencia': f'Bolsa #{bolsa.id}',
                'detalle': f'Saldo {bolsa.saldo_puntos}',
                'extra': get_cliente_nombre(bolsa.cliente_id),
            }
            for bolsa in BolsaPuntos.objects.all()
            if int(bolsa.saldo_puntos or 0) >= minimo
        ]

    if tipo == 'clientes_vencer':
        dias = int(valor or 0)
        fecha_base = timezone.localdate()
        fecha_limite = fecha_base + timedelta(days=dias)
        return [
            {
                'referencia': get_cliente_nombre(bolsa.cliente_id),
                'detalle': f'Vence {bolsa.fecha_caducidad}',
                'extra': f'Saldo {bolsa.saldo_puntos}',
            }
            for bolsa in BolsaPuntos.objects.all()
            if fecha_base <= bolsa.fecha_caducidad <= fecha_limite
            and not bolsa.vencido
        ]

    if tipo == 'clientes_busqueda':
        rows = []
        for cliente in ClienteFidelizacion.objects.all():
            nombre = f'{cliente.nombre} {cliente.apellido}'.lower()
            fecha_nacimiento = str(cliente.fecha_nacimiento or '')
            if valor_lower in nombre or valor_lower in cliente.apellido.lower() or valor in fecha_nacimiento:
                rows.append({
                    'referencia': f'{cliente.nombre} {cliente.apellido}',
                    'detalle': f'{cliente.tipo_documento} {cliente.numero_documento}',
                    'extra': f'Saldo actual {get_cliente_saldo(cliente.id)}',
                })
        return rows

    return []
