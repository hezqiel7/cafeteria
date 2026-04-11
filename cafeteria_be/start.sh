#!/bin/sh
set -e

python manage.py migrate

if [ -n "${ADMIN_USERNAME}" ] && [ -n "${ADMIN_PASSWORD}" ]; then
  python manage.py shell -c "import os; from django.contrib.auth import get_user_model; User = get_user_model(); username = os.environ['ADMIN_USERNAME']; password = os.environ['ADMIN_PASSWORD']; email = os.environ.get('ADMIN_EMAIL', 'admin@local.dev'); user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'is_staff': True, 'is_superuser': True}); user.email = email or user.email; user.is_staff = True; user.is_superuser = True; user.set_password(password); user.save(); print(f'Admin listo: {username}')"
fi

if [ "${APP_ENV:-development}" = "production" ]; then
  gunicorn cafeteria_be.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
else
  python manage.py runserver "0.0.0.0:${PORT:-8000}"
fi
