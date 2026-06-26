from datetime import date, timedelta

from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand
from django.utils import timezone

from fidelizacion.models import (
    BolsaPuntos,
    ClienteFidelizacion,
    ConceptoUsoPuntos,
    ProcesoFidelizacion,
    ReglaAsignacionPuntos,
    UsoPuntos,
    VencimientoPuntos,
)


def parse_date(value):
    return date.fromisoformat(value)


def create_if_missing(model, item):
    if model.objects.filter(id=item['id']).first():
        return False

    model.objects.create(**item)
    return True


def add_user_to_group(user, group):
    through = User.groups.through
    if through.objects.filter(user_id=user.id, group_id=group.id).first():
        return
    through.objects.create(user_id=user.id, group_id=group.id)


class Command(BaseCommand):
    help = 'Carga datos iniciales del sistema de fidelizacion.'

    def handle(self, *args, **options):
        self.seed_demo_users()
        created_count = 0

        clientes = [
            {
                'id': 1,
                'nombre': 'Ana',
                'apellido': 'Gomez',
                'numero_documento': '1234567',
                'tipo_documento': 'CI',
                'nacionalidad': 'Paraguaya',
                'email': 'ana@example.com',
                'telefono': '0981000001',
                'fecha_nacimiento': parse_date('1998-04-05'),
            },
            {
                'id': 2,
                'nombre': 'Luis',
                'apellido': 'Benitez',
                'numero_documento': '2345678',
                'tipo_documento': 'CI',
                'nacionalidad': 'Paraguaya',
                'email': 'luis@example.com',
                'telefono': '0981000002',
                'fecha_nacimiento': parse_date('1994-11-11'),
            },
            {
                'id': 3,
                'nombre': 'Maria',
                'apellido': 'Fernandez',
                'numero_documento': '3456789',
                'tipo_documento': 'Pasaporte',
                'nacionalidad': 'Argentina',
                'email': 'maria@example.com',
                'telefono': '0981000003',
                'fecha_nacimiento': parse_date('2000-08-21'),
            },
        ]

        conceptos = [
            {'id': 1, 'descripcion': 'Vale de descuento', 'puntos_requeridos': 10},
            {'id': 2, 'descripcion': 'Vale de premio', 'puntos_requeridos': 20},
            {'id': 3, 'descripcion': 'Vale de consumicion', 'puntos_requeridos': 15},
        ]

        reglas = [
            {'id': 1, 'limite_inferior': 0, 'limite_superior': 199999, 'monto_equivalencia': 50000},
            {'id': 2, 'limite_inferior': 200000, 'limite_superior': 499999, 'monto_equivalencia': 30000},
            {'id': 3, 'limite_inferior': 500000, 'limite_superior': None, 'monto_equivalencia': 20000},
        ]

        vencimientos = [
            {'id': 1, 'fecha_inicio': parse_date('2026-01-01'), 'fecha_fin': parse_date('2026-12-31'), 'dias_duracion': 90},
            {'id': 2, 'fecha_inicio': parse_date('2026-06-01'), 'fecha_fin': parse_date('2026-12-31'), 'dias_duracion': 120},
        ]

        bolsas = [
            {
                'id': 1,
                'cliente_id': 1,
                'fecha_asignacion': parse_date('2026-05-01'),
                'fecha_caducidad': parse_date('2026-07-30'),
                'puntaje_asignado': 12,
                'puntaje_utilizado': 2,
                'saldo_puntos': 10,
                'monto_operacion': 600000,
                'vencido': False,
            },
            {
                'id': 2,
                'cliente_id': 2,
                'fecha_asignacion': parse_date('2026-05-10'),
                'fecha_caducidad': parse_date('2026-09-07'),
                'puntaje_asignado': 8,
                'puntaje_utilizado': 0,
                'saldo_puntos': 8,
                'monto_operacion': 250000,
                'vencido': False,
            },
        ]

        usos = [
            {
                'id': 1,
                'cliente_id': 1,
                'concepto_id': 1,
                'puntaje_utilizado': 2,
                'fecha': parse_date('2026-05-15'),
                'detalle': [{'id': 1, 'bolsa_id': 1, 'puntaje_utilizado': 2}],
            },
        ]

        for model, items in [
            (ClienteFidelizacion, clientes),
            (ConceptoUsoPuntos, conceptos),
            (ReglaAsignacionPuntos, reglas),
            (VencimientoPuntos, vencimientos),
            (BolsaPuntos, bolsas),
            (UsoPuntos, usos),
        ]:
            for item in items:
                created_count += 1 if create_if_missing(model, item) else 0

        if not ProcesoFidelizacion.objects.filter(id=1).first():
            ahora = timezone.now()
            ProcesoFidelizacion.objects.create(
                id=1,
                ultima_ejecucion=ahora,
                proxima_ejecucion=ahora + timedelta(hours=6),
                bolsas_vencidas=0,
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Datos de fidelizacion listos ({created_count} registros nuevos).'))

    def seed_demo_users(self):
        administrador_group, _ = Group.objects.get_or_create(name='administrador')
        recepcion_group, _ = Group.objects.get_or_create(name='recepcion')
        cocina_group, _ = Group.objects.get_or_create(name='cocina')

        recepcion, created = User.objects.get_or_create(
            username='recepcion',
            defaults={'email': 'recepcion@cafeteria.local', 'is_staff': False},
        )
        if created:
            recepcion.set_password('recepcion')
            recepcion.save()
        add_user_to_group(recepcion, recepcion_group)

        cocinero, created = User.objects.get_or_create(
            username='cocinero',
            defaults={'email': 'cocinero@cafeteria.local', 'is_staff': False},
        )
        if created:
            cocinero.set_password('cocinero')
            cocinero.save()
        add_user_to_group(cocinero, cocina_group)

        # El grupo queda disponible por si se crea un administrador no superusuario.
        administrador_group.save()
