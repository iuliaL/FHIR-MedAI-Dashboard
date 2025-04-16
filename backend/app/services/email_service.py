import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@yourapp.com")

def send_password_reset_email(to_email: str, reset_link: str):
    """
    Sends a password reset email via Mailgun.
    """
    # Mailgun API endpoint for sending emails
    url = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"

    # Data to send in the POST request
    data = {
        "from": EMAIL_FROM,
        "to": to_email,
        "subject": "Reset your password",
        "html": f"""
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="{reset_link}">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        """
    }

    # Authentication for Mailgun (using API key)
    auth = ("api", MAILGUN_API_KEY)

    try:
        # Send the request to Mailgun API
        response = requests.post(url, auth=auth, data=data)
        if response.status_code == 200:
            print(f"Password reset email sent to {to_email}")
        else:
            print(f"Failed to send email: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending email: {e}")
