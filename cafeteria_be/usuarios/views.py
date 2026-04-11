from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .serializers import UsuarioSerializer, GrupoSerializer
from cafeteria_be.permissions import IsRecepcionista, IsCocinero


class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        permission_classes = []
        if self.action == 'retrieve' or self.action == 'list':
            permission_classes = [IsAdminUser]
        elif self.action == 'create' or self.action == 'update' or self.action == 'partial_update' or self.action == 'destroy':
            permission_classes = [IsAdminUser]
        elif self.action == 'grupos':  # Endpoint custom
            permission_classes = [IsAdminUser | IsRecepcionista | IsCocinero]
        return [permission() for permission in permission_classes]

    class Meta:
        model = User

    @action(detail=True, methods=['get'])
    def grupos(self, request, pk=None):
        id_usuario = self.kwargs['pk']
        try:
            usuario = User.objects.get(pk=id_usuario)
            grupos = usuario.groups.all()
            return Response(data=GrupoSerializer(grupos[0]).data, status=200)
        except Exception as e:
            print(e)
            return Response(None, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
