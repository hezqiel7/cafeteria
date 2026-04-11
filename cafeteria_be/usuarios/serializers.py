from rest_framework import serializers
from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password, check_password


class UsuarioSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        # Encriptamos la contraseña antes de guardarla en la base de datos
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si la contraseña se modificó
        if instance.password != validated_data.get('password'):
            # Encriptar la nueva contraseña
            validated_data['password'] = make_password(
                validated_data['password'])
        return super().update(instance, validated_data)

    class Meta:
        model = User
        fields = ['id',
                  'username',
                  'password',
                  'first_name',
                  'last_name',
                  'email',
                  'is_staff'
                  ]


class GrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']
