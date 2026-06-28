#!/bin/sh
set -e

python manage.py migrate
python manage.py seed_fidelizacion

ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
python manage.py shell -c "import os; from django.contrib.auth import get_user_model; User = get_user_model(); username = os.environ['ADMIN_USERNAME']; password = os.environ['ADMIN_PASSWORD']; email = os.environ.get('ADMIN_EMAIL', 'admin@local.dev'); user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'is_staff': True, 'is_superuser': True}); user.email = email or user.email; user.is_staff = True; user.is_superuser = True; user.set_password(password); user.save(); print(f'Admin listo: {username}')"

if [ "${APP_ENV:-development}" = "production" ]; then
  python manage.py collectstatic --noinput
  gunicorn cafeteria_be.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
else
  python manage.py runserver "0.0.0.0:${PORT:-8000}"
fi
