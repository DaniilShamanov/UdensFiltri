import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

def env(name, default=None):
    return os.environ.get(name, default)

# Security settings
SECRET_KEY = env("DJANGO_SECRET_KEY", "dev")
DEBUG = env("DJANGO_DEBUG", "0") == "1"

if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "dev-secret-key"
    else:
        raise RuntimeError("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG=0")

# Allowed hosts – include Docker service name for internal health checks
ALLOWED_HOSTS = [
    h.strip() for h in env("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,web").split(",") if h.strip()
]

# Security headers – adjust for local HTTP testing
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env("DJANGO_SECURE_SSL_REDIRECT", "0") == "1"   # set to 0 for local HTTP
SESSION_COOKIE_SECURE = env("DJANGO_SESSION_COOKIE_SECURE", "1") == "1" # set to 0 for local HTTP
CSRF_COOKIE_SECURE = env("DJANGO_CSRF_COOKIE_SECURE", "1") == "1"       # set to 0 for local HTTP
SECURE_HSTS_SECONDS = int(env("DJANGO_SECURE_HSTS_SECONDS", "31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = env("DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", "0") == "1"
SECURE_HSTS_PRELOAD = env("DJANGO_SECURE_HSTS_PRELOAD", "0") == "1"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "apps.accounts",
    "apps.catalog",
    "apps.cases",
    "apps.orders",
    "apps.blog",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "config.utils.logging.RequestLoggingMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "templates"],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]

WSGI_APPLICATION = "config.wsgi.application"

# Database
DATABASES = {
    "default": {
        "ENGINE": env("DB_ENGINE", "django.db.backends.postgresql"),
        "NAME": env("DB_NAME", "UdensFiltri"),
        "USER": env("DB_USER", "postgres"),
        "PASSWORD": env("DB_PASSWORD", ""),
        "HOST": env("DB_HOST", "localhost"),
        "PORT": env("DB_PORT", "5433"),
    }
}

AUTH_USER_MODEL = "accounts.User"

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "lv"
LANGUAGES = (("lv", "Latviešu"), ("en", "English"))
LOCALE_PATHS = [BASE_DIR / "locale"]
TIME_ZONE = "Europe/Riga"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS
FRONTEND_ORIGIN = env("FRONTEND_ORIGIN", "http://localhost:3000")
FRONTEND_ORIGINS = [o.strip() for o in env("FRONTEND_ORIGINS", FRONTEND_ORIGIN).split(",") if o.strip()]
CORS_ALLOWED_ORIGINS = FRONTEND_ORIGINS
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [o for o in FRONTEND_ORIGINS if o.startswith("https://") or o.startswith("http://")]

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ("apps.accounts.auth.CookieJWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticatedOrReadOnly",),
    'EXCEPTION_HANDLER': 'config.utils.exceptions.custom_exception_handler',
    "DEFAULT_THROTTLE_RATES": {
        "code_ip": env("CODE_THROTTLE_IP", "10/min"),
        "code_email": env("CODE_THROTTLE_EMAIL", "3/min"),
    },
}

# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),
    "REFRESH_TOKEN_LIFETIME": timedelta(minutes=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Auth cookies
AUTH_COOKIE_DOMAIN = env("AUTH_COOKIE_DOMAIN", "") or None
AUTH_COOKIE_SECURE = env("AUTH_COOKIE_SECURE", "1") == "1"   # set to 0 for local HTTP
AUTH_COOKIE_SAMESITE = env("AUTH_COOKIE_SAMESITE", "Lax")
AUTH_COOKIE_ACCESS_NAME = "access"
AUTH_COOKIE_REFRESH_NAME = "refresh"

# Stripe
STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_BASE_URL = env("FRONTEND_BASE_URL", "http://localhost:3000")

# Email (SendGrid)
SENDGRID_API_KEY = env("SENDGRID_API_KEY", "")
if SENDGRID_API_KEY:
    EMAIL_BACKEND = env("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
    EMAIL_HOST = 'smtp.sendgrid.net'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = 'apikey'
    EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
else:
    EMAIL_BACKEND = env("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")

DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "no-reply@example.com")
ADMIN_NOTIFICATION_EMAILS = [e.strip() for e in env("ADMIN_NOTIFICATION_EMAILS", "").split(",") if e.strip()]

EMAIL_CODE_MIN_INTERVAL_SECONDS = int(env("EMAIL_CODE_MIN_INTERVAL_SECONDS", "60"))

# Logging
LOG_LEVEL = env("LOG_LEVEL", "INFO")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": (
                "%(asctime)s level=%(levelname)s logger=%(name)s "
                "msg=%(message)s request_id=%(request_id)s method=%(method)s "
                "path=%(path)s status=%(status_code)s duration_ms=%(duration_ms)s "
                "user_id=%(user_id)s"
            ),
        },
        "simple": {"format": "%(asctime)s %(levelname)s %(name)s %(message)s"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "request_console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
        "udensfiltri": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "udensfiltri.request": {
            "handlers": ["request_console"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console"],
        "level": LOG_LEVEL,
    },
}
