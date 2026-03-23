import logging
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from apps.accounts.utils import send_email

logger = logging.getLogger(__name__)

def send_invoice_email(order):
    try:
        subject = f"Your Order Confirmation #{order.id}"

        # Transform stored items to template‑friendly format
        items_for_template = []
        for item in order.items:
            items_for_template.append({
                'title': item.get('name', ''),
                'qty': item.get('quantity', 0),
                'price': item.get('price_cents', 0) / 100,   # convert cents to euros
            })

        context = {
            'order': order,
            'items': items_for_template,
            'total': order.total_cents / 100,
        }

        html_message = render_to_string('invoice.html', context)
        plain_message = strip_tags(html_message)

        send_email(order.email, subject, html_message, plain_message)
        logger.info(f"Invoice email sent for order {order.id}")
    except Exception as e:
        logger.exception(f"Failed to send invoice email for order {order.id}: {e}")
        raise
