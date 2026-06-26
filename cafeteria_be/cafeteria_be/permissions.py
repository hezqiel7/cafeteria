from django.contrib.auth.models import Group, User
from rest_framework import permissions


def user_has_group(user, group_name):
    if not user or not user.is_authenticated:
        return False

    group = Group.objects.filter(name=group_name).first()
    if not group:
        return False

    return User.groups.through.objects.filter(user_id=user.id, group_id=group.id).first() is not None


class IsRecepcionista(permissions.BasePermission):
    def has_permission(self, request, view):
        return user_has_group(request.user, 'recepcion')


class IsCocinero(permissions.BasePermission):
    def has_permission(self, request, view):
        return user_has_group(request.user, 'cocina')
