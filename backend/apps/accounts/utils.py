import random
from datetime import timedelta
import logging

from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from .models import EmailCode

logger = logging.getLogger("udensfiltri.accounts")


def create_email_code(email: str, purpose: str, ttl_minutes: int = 10) -> EmailCode:
    min_interval = int(getattr(settings, "EMAIL_CODE_MIN_INTERVAL_SECONDS", 60))
    last = EmailCode.objects.filter(email=email, purpose=purpose).order_by("-created_at").first()
    if last and (timezone.now() - last.created_at).total_seconds() < min_interval:
        logger.warning("email_code_rate_limited", extra={"email": email, "purpose": purpose})
        raise ValueError(_("Please wait before requesting a new code."))

    EmailCode.objects.filter(email=email, purpose=purpose, consumed_at__isnull=True).update(
        consumed_at=timezone.now()
    )

    code = f"{random.randint(0, 999999):06d}"
    code_record = EmailCode.objects.create(
        email=email,
        purpose=purpose,
        code=code,
        failed_attempts=0,
        locked_until=None,
        expires_at=timezone.now() + timedelta(minutes=ttl_minutes),
    )
    logger.info("email_code_created", extra={"email": email, "purpose": purpose, "code_id": code_record.id})
    return code_record

def send_verification_email(email, code, purpose="register"):
    subject = f"Your verification code for {purpose}"
    context = {'code': code}
    html_message = render_to_string('verification.html', context)
    plain_message = strip_tags(html_message)
    send_email(email, subject, html_message, plain_message)
    logger.info("verification_email_dispatched", extra={"email": email, "purpose": purpose})

def send_email(to_emails, subject, html_content, plain_text_content=None):
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=to_emails,
        subject=subject,
        html_content=html_content,
        plain_text_content=plain_text_content,
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info("sendgrid_email_sent", extra={"to_emails": to_emails, "status_code": response.status_code})
        return response.status_code
    except Exception as e:
        logger.exception("sendgrid_email_failed", extra={"to_emails": to_emails, "subject": subject})
        raise RuntimeError("Failed to send email via SendGrid.") from e

def handle_error_response(message, status_code, code=None):
    logger.warning("api_error_response", extra={"status_code": status_code, "error_code": code, "message": message})
    payload = {"message": message}
    if code:
        payload["code"] = code
    return Response(payload, status=status_code)


def issue_tokens(user):
    refresh = RefreshToken.for_user(user)
    logger.info("tokens_issued", extra={"user_id": user.id})
    return str(refresh.access_token), str(refresh)


def verify_and_consume_code(email, purpose, code):
    try:
        obj = EmailCode.objects.filter(
            email=email,
            purpose=purpose,
            consumed_at__isnull=True,
            expires_at__gt=timezone.now()
        ).latest('created_at')
    except EmailCode.DoesNotExist:
        logger.warning("email_code_not_found", extra={"email": email, "purpose": purpose})
        return False, "No valid code found. Please request a new one."

    if obj.is_locked:
        remaining = int((obj.locked_until - timezone.now()).total_seconds())
        minutes = remaining // 60
        seconds = remaining % 60
        if minutes > 0:
            lock_msg = f"Too many attempts. Please try again in {minutes} minute(s)."
        else:
            lock_msg = f"Too many attempts. Please try again in {seconds} second(s)."
        logger.warning("email_code_locked", extra={"email": email, "purpose": purpose, "locked_until": obj.locked_until})
        return False, lock_msg

    if obj.code != code:
        obj.failed_attempts += 1
        if obj.failed_attempts >= 5:
            obj.locked_until = timezone.now() + timedelta(minutes=15)
            obj.save(update_fields=['failed_attempts', 'locked_until'])
            logger.warning("email_code_lock_triggered", extra={"email": email, "purpose": purpose})
            return False, "Too many attempts. Your account is locked for 15 minutes."
        obj.save(update_fields=['failed_attempts'])
        logger.warning("email_code_mismatch", extra={"email": email, "purpose": purpose, "failed_attempts": obj.failed_attempts})
        return False, "Invalid code. Please check and try again."

    obj.consume()
    logger.info("email_code_consumed", extra={"email": email, "purpose": purpose, "code_id": obj.id})
    return True, None
