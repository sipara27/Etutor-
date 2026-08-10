from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'commons.authentication'
    label = 'authentication'  # Ensures AUTH_USER_MODEL 'authentication.CustomUser' and migrations match
