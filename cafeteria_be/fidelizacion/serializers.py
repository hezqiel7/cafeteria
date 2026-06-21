from rest_framework import serializers

from .models import (
    BolsaPuntos,
    ClienteFidelizacion,
    ConceptoUsoPuntos,
    ProcesoFidelizacion,
    ReglaAsignacionPuntos,
    UsoPuntos,
    VencimientoPuntos,
)


def get_next_id(model):
    ultimo = model.objects.order_by('-id').first()
    return (ultimo.id if ultimo else 0) + 1


class NullableDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value in ('', None):
            return None
        return super().to_internal_value(value)


class NullableIntegerField(serializers.IntegerField):
    def to_internal_value(self, value):
        if value in ('', None):
            return None
        return super().to_internal_value(value)


class AutoIdModelSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    def create(self, validated_data):
        if not validated_data.get('id'):
            validated_data['id'] = get_next_id(self.Meta.model)
        return super().create(validated_data)


class ClienteFidelizacionSerializer(AutoIdModelSerializer):
    fecha_nacimiento = NullableDateField(required=False, allow_null=True)

    class Meta:
        model = ClienteFidelizacion
        fields = '__all__'

    def validate(self, attrs):
        for field_name in ('nombre', 'apellido', 'numero_documento'):
            if not attrs.get(field_name):
                raise serializers.ValidationError({field_name: 'Este campo es obligatorio.'})
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['fecha_nacimiento'] = data['fecha_nacimiento'] or ''
        return data


class ConceptoUsoPuntosSerializer(AutoIdModelSerializer):
    puntos_requeridos = serializers.IntegerField(min_value=1)

    class Meta:
        model = ConceptoUsoPuntos
        fields = '__all__'


class ReglaAsignacionPuntosSerializer(AutoIdModelSerializer):
    limite_inferior = serializers.IntegerField(min_value=0)
    limite_superior = NullableIntegerField(required=False, allow_null=True, min_value=0)
    monto_equivalencia = serializers.IntegerField(min_value=1)

    class Meta:
        model = ReglaAsignacionPuntos
        fields = '__all__'

    def validate(self, attrs):
        limite_inferior = attrs.get('limite_inferior')
        limite_superior = attrs.get('limite_superior')

        if limite_superior is not None and limite_superior < limite_inferior:
            raise serializers.ValidationError({
                'limite_superior': 'Debe ser mayor o igual al limite inferior.'
            })
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['limite_superior'] = '' if data['limite_superior'] is None else data['limite_superior']
        return data


class VencimientoPuntosSerializer(AutoIdModelSerializer):
    dias_duracion = serializers.IntegerField(min_value=1)

    class Meta:
        model = VencimientoPuntos
        fields = '__all__'

    def validate(self, attrs):
        if attrs.get('fecha_fin') < attrs.get('fecha_inicio'):
            raise serializers.ValidationError({
                'fecha_fin': 'La fecha fin debe ser mayor o igual a la fecha de inicio.'
            })
        return attrs


