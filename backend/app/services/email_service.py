import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

from app.core.config import settings


class EmailService:
    """Service for sending email notifications using SMTP"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM
        self.from_name = settings.SMTP_FROM_NAME
        self.use_tls = settings.SMTP_TLS

        # Setup Jinja2 for email templates
        template_dir = Path(__file__).parent.parent / 'templates' / 'emails'
        self.jinja_env = Environment(loader=FileSystemLoader(str(template_dir)))

    def send_email(self, to_email: str, subject: str, template_name: str, **context):
        """Send an email using the specified template"""
        # Check if email is enabled
        email_enabled = settings.EMAIL_ENABLED
        if not email_enabled:
            print("Emails are disabled, skipping email send")
            return False

        if not all([self.smtp_host, self.smtp_user, self.smtp_password]):
            print("SMTP not configured, skipping email send")
            return False

        try:
            # Render HTML template
            template = self.jinja_env.get_template(template_name)
            html_body = template.render(**context)

            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email

            # Attach HTML part
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)

            # Send via SMTP
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            print(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            print(f"Failed to send email: {e}")
            return False