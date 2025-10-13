import os
import logging
from typing import Optional
import requests
import json
from app.core.config import settings

logger = logging.getLogger(__name__)

class SendGridEmailService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY", "")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", settings.SMTP_FROM)
        self.from_name = os.getenv("SENDGRID_FROM_NAME", settings.SMTP_FROM_NAME)
        self.base_url = "https://api.sendgrid.com/v3"
        
        if self.api_key:
            logger.info("📧 SendGrid email service initialized (requests-based)")
        else:
            logger.warning("SENDGRID_API_KEY not found - email service disabled")
    
    def is_available(self) -> bool:
        """Check if SendGrid is properly configured"""
        return bool(self.api_key and self.from_email)
    
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send email via SendGrid API using requests"""
        if not self.is_available():
            logger.error("SendGrid not available - email not sent")
            return False
        
        try:
            # Prepare email data
            email_data = {
                "personalizations": [
                    {
                        "to": [{"email": to_email}],
                        "subject": subject
                    }
                ],
                "from": {
                    "email": self.from_email,
                    "name": self.from_name
                },
                "content": []
            }
            
            # Add text content if provided
            if text_content:
                email_data["content"].append({
                    "type": "text/plain",
                    "value": text_content
                })
            
            # Add HTML content
            email_data["content"].append({
                "type": "text/html",
                "value": html_content
            })
            
            # Prepare headers
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Send email
            url = f"{self.base_url}/mail/send"
            response = requests.post(url, headers=headers, json=email_data, timeout=30)
            
            if response.status_code == 202:
                logger.info(f"✅ Email sent successfully to {to_email} via SendGrid")
                return True
            else:
                logger.error(f"❌ SendGrid API error: {response.status_code}")
                if response.text:
                    logger.error(f"Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to send email via SendGrid to {to_email}: {str(e)}")
            return False
    
    def send_otp_email(self, to_email: str, otp_code: str, user_name: str = "") -> bool:
        """Send OTP verification email"""
        subject = "Your ClockKo Verification Code"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .otp-code {{ font-size: 32px; font-weight: bold; text-align: center; background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; color: #2563eb; }}
                .footer {{ margin-top: 30px; text-align: center; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🕐 ClockKo</h1>
                    <h2>Email Verification</h2>
                </div>
                
                <p>Hello{' ' + user_name if user_name else ''},</p>
                
                <p>Your verification code for ClockKo is:</p>
                
                <div class="otp-code">{otp_code}</div>
                
                <p>This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.</p>
                
                <p>If you didn't request this code, please ignore this email.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The ClockKo Team</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        ClockKo Email Verification
        
        Hello{' ' + user_name if user_name else ''},
        
        Your verification code for ClockKo is: {otp_code}
        
        This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        The ClockKo Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_welcome_email(self, to_email: str, user_name: str, otp_code: str = "") -> bool:
        """Send welcome email with optional OTP"""
        subject = "Welcome to ClockKo! 🎉"
        
        otp_section = ""
        if otp_code:
            otp_section = f"""
            <div class="otp-section">
                <h3>Verify Your Email</h3>
                <p>To get started, please verify your email with this code:</p>
                <div class="otp-code">{otp_code}</div>
                <p>This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.</p>
            </div>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .otp-code {{ font-size: 32px; font-weight: bold; text-align: center; background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; color: #2563eb; }}
                .otp-section {{ background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .footer {{ margin-top: 30px; text-align: center; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🕐 Welcome to ClockKo!</h1>
                </div>
                
                <p>Hello {user_name},</p>
                
                <p>Welcome to ClockKo! We're excited to help you boost your productivity and achieve your goals.</p>
                
                {otp_section}
                
                <p>With ClockKo, you can:</p>
                <ul>
                    <li>⏰ Track your focus sessions</li>
                    <li>📝 Manage your tasks efficiently</li>
                    <li>👥 Join coworking spaces</li>
                    <li>📊 Monitor your productivity analytics</li>
                </ul>
                
                <p>Ready to get started? Log in to your account and explore all the features!</p>
                
                <div class="footer">
                    <p>Happy productivity!<br>The ClockKo Team</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content)

# Create global instance
sendgrid_service = SendGridEmailService()