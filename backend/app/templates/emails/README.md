# Email Templates

This directory contains HTML email templates for the notification system.

## Available Templates

1. **task_assigned.html** - Sent when a user is assigned to a new task or subtask
2. **deadline_approaching.html** - Sent 24-48 hours before a task deadline
3. **expense_status_changed.html** - Sent when an expense is approved or rejected

## Template Variables

### task_assigned.html
- `assignee_name`: Name of the user assigned to the task
- `task_title`: Title of the task
- `task_description`: Description of the task (optional)
- `project_name`: Name of the project
- `priority`: Task priority (Low, Medium, High, Urgent, Critical)
- `deadline`: Task deadline (optional, formatted string)
- `assigned_by_name`: Name of the user who created/assigned the task
- `task_url`: URL to view task details

### deadline_approaching.html
- `assignee_name`: Name of the user assigned to the task
- `task_title`: Title of the task
- `task_description`: Description of the task (optional)
- `project_name`: Name of the project
- `priority`: Task priority
- `status`: Current task status (ToDo, InProgress, Review, Done)
- `progress`: Task progress percentage (0-100, optional)
- `deadline`: Task deadline (formatted string)
- `task_url`: URL to view task details

### expense_status_changed.html
- `submitter_name`: Name of the user who submitted the expense
- `category`: Expense category
- `amount`: Expense amount (formatted as decimal)
- `description`: Expense description (optional)
- `project_name`: Name of the project
- `expense_date`: Date of the expense
- `reviewer_name`: Name of the finance user who approved/rejected
- `status`: Approval status (Approved or Rejected)
- `expense_url`: URL to view expense details

## SMTP Configuration

To enable email notifications, configure the following environment variables in your `.env` file:

### Required Variables

```env
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com              # SMTP server hostname
SMTP_PORT=587                         # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com        # SMTP username/email
SMTP_PASSWORD=your-app-password       # SMTP password or app-specific password
SMTP_FROM_EMAIL=noreply@yourapp.com   # From address for sent emails
SMTP_FROM_NAME=Project Management     # From name for sent emails

# Optional: TLS/SSL Settings
SMTP_USE_TLS=true                     # Use TLS (recommended for port 587)
SMTP_USE_SSL=false                    # Use SSL (for port 465)
```

### Provider-Specific Configuration

#### Gmail
1. Enable 2-factor authentication on your Google account
2. Generate an app-specific password: https://myaccount.google.com/apppasswords
3. Configuration:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_USE_TLS=true
   ```

#### SendGrid
1. Create a SendGrid account and generate an API key
2. Configuration:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   SMTP_USE_TLS=true
   ```

#### AWS SES
1. Verify your sending domain in AWS SES
2. Create SMTP credentials in SES console
3. Configuration:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-ses-smtp-username
   SMTP_PASSWORD=your-ses-smtp-password
   SMTP_USE_TLS=true
   ```

#### Mailgun
1. Add and verify your domain in Mailgun
2. Get SMTP credentials from domain settings
3. Configuration:
   ```env
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@your-domain.com
   SMTP_PASSWORD=your-mailgun-smtp-password
   SMTP_USE_TLS=true
   ```

## Email Service Implementation

To implement the email service, create `backend/app/services/email_service.py`:

```python
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

class EmailService:
    """Service for sending email notifications using SMTP"""

    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_user = os.getenv('SMTP_USER')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('SMTP_FROM_EMAIL', self.smtp_user)
        self.from_name = os.getenv('SMTP_FROM_NAME', 'Project Management')
        self.use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'

        # Setup Jinja2 for email templates
        template_dir = Path(__file__).parent.parent / 'templates' / 'emails'
        self.jinja_env = Environment(loader=FileSystemLoader(str(template_dir)))

    def send_email(self, to_email: str, subject: str, template_name: str, **context):
        """Send an email using the specified template"""
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

            return True

        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
```

## Usage Example

```python
from app.services.email_service import EmailService

email_service = EmailService()

# Send task assignment email
email_service.send_email(
    to_email="user@example.com",
    subject="New Task Assignment",
    template_name="task_assigned.html",
    assignee_name="John Doe",
    task_title="Implement user authentication",
    task_description="Add JWT-based auth to the API",
    project_name="MVP Development",
    priority="High",
    deadline="2025-12-20",
    assigned_by_name="Jane Smith",
    task_url="https://app.example.com/tasks/123"
)
```

## Testing Email Templates

You can test email rendering locally without sending by rendering templates directly:

```python
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader('backend/app/templates/emails'))
template = env.get_template('task_assigned.html')
html = template.render(
    assignee_name="Test User",
    task_title="Test Task",
    project_name="Test Project",
    priority="Medium",
    assigned_by_name="Admin",
    task_url="http://localhost:3000/tasks/1"
)

# Save to file for viewing
with open('test_email.html', 'w') as f:
    f.write(html)
```

## Security Notes

1. **Never commit SMTP credentials** to version control
2. **Use app-specific passwords** instead of your actual email password
3. **Enable TLS** for secure transmission
4. **Validate email addresses** before sending to prevent abuse
5. **Rate limit** email sending to prevent spam
6. **Consider using a dedicated email service** (SendGrid, Mailgun, AWS SES) for production

## Future Enhancements

- [ ] Add plain text versions of emails (for compatibility)
- [ ] Implement email queuing with background workers (Celery/Redis)
- [ ] Add email analytics and tracking
- [ ] Support for internationalization (i18n)
- [ ] Add email preferences for users (opt-in/opt-out)
- [ ] Implement digest emails (daily/weekly summaries)
