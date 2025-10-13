import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from typing import List, Optional
import logging
import os
from contextlib import contextmanager
from app.core.config import settings

# Import Resend service
try:
    from app.services.resend_service import resend_service
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False
    resend_service = None

# Import SendGrid service
try:
    from app.services.sendgrid_service import sendgrid_service
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False
    sendgrid_service = None

logger = logging.getLogger(__name__)


class SMTPConnectionError(Exception):
    """Custom exception for SMTP connection errors"""
    pass


class SMTPAuthError(Exception):
    """Custom exception for SMTP authentication errors"""
    pass


class EmailSendError(Exception):
    """Custom exception for email sending errors"""
    pass


@contextmanager
def smtp_connection(host: str, port: int, username: str = None, password: str = None, use_tls: bool = True):
    """Context manager for SMTP connections"""
    server = None
    try:
        server = smtplib.SMTP(host, port)
        
        if use_tls and username and password:
            context = ssl.create_default_context()
            server.starttls(context=context)
            server.login(username, password)
        elif username and password:
            server.login(username, password)
            
        yield server
    finally:
        if server:
            try:
                server.quit()
            except Exception:
                # Ignore errors when closing connection
                pass


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_from = settings.SMTP_FROM
        self.smtp_from_name = settings.SMTP_FROM_NAME
        
        # Auto-detect email service type
        self.is_mailhog = self._is_mailhog_config()
        self.is_gmail = self._is_gmail_config()
        
        # Validate configuration
        config_errors = self._validate_config()
        if config_errors:
            for error in config_errors:
                logger.error(f"📧 Email Configuration Error: {error}")
        
        # Log which service we're using
        if self.is_mailhog:
            logger.info("📧 Email Service: MailHog (Development Mode)")
        elif self.is_gmail:
            logger.info("📧 Email Service: Gmail (Production Mode)")
        else:
            logger.warning("📧 Email Service: Unknown configuration")
    
    def _validate_config(self) -> List[str]:
        """Validate email configuration and return list of errors"""
        errors = []
        
        if not self.smtp_host:
            errors.append("SMTP_HOST is not set")
        
        if not self.smtp_port:
            errors.append("SMTP_PORT is not set")
        
        if not self.smtp_from:
            errors.append("SMTP_FROM is not set")
        
        # Check Gmail-specific requirements
        if self.smtp_host == "smtp.gmail.com":
            if not self.smtp_user:
                errors.append("Gmail requires SMTP_USER to be set")
            if not self.smtp_password:
                errors.append("Gmail requires SMTP_PASSWORD to be set (use App Password)")
            if self.smtp_port != 587:
                errors.append("Gmail typically uses port 587 for STARTTLS")
        
        # Check if from email matches smtp user for Gmail
        if self.is_gmail and self.smtp_from != self.smtp_user:
            errors.append("For Gmail, SMTP_FROM should match SMTP_USER")
        
        return errors
    
    def _is_mailhog_config(self) -> bool:
        """Check if current config is for MailHog"""
        return (
            self.smtp_host == "localhost" and 
            self.smtp_port == 1025 and
            not self.smtp_user and 
            not self.smtp_password
        )
    
    def _is_gmail_config(self) -> bool:
        """Check if current config is for Gmail"""
        return (
            self.smtp_host == "smtp.gmail.com" and
            self.smtp_port == 587 and
            self.smtp_user and
            self.smtp_password
        )
    
    def _create_connection(self):
        """Create SMTP connection based on service type"""
        try:
            logger.debug(f"🔧 Attempting to connect to {self.smtp_host}:{self.smtp_port}")
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            
            if self.is_mailhog:
                # MailHog doesn't need authentication or TLS
                logger.debug("🔧 Connected to MailHog")
                return server
            
            elif self.is_gmail:
                # Gmail requires TLS and authentication
                logger.debug("🔧 Starting TLS for Gmail...")
                context = ssl.create_default_context()
                server.starttls(context=context)
                
                logger.debug(f"🔧 Logging into Gmail with user: {self.smtp_user}")
                server.login(self.smtp_user, self.smtp_password)
                logger.debug("🔧 Connected to Gmail successfully")
                return server
            
            else:
                # Generic SMTP (try TLS if user/password provided)
                if self.smtp_user and self.smtp_password:
                    logger.debug("🔧 Starting TLS for generic SMTP...")
                    context = ssl.create_default_context()
                    server.starttls(context=context)
                    server.login(self.smtp_user, self.smtp_password)
                logger.debug("🔧 Connected to generic SMTP")
                return server
                
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP Authentication failed: {e}. Check SMTP_USER and SMTP_PASSWORD (use App Password for Gmail)"
            logger.error(error_msg)
            raise SMTPAuthError(error_msg) from e
        except smtplib.SMTPConnectError as e:
            error_msg = f"Failed to connect to SMTP server {self.smtp_host}:{self.smtp_port}: {e}"
            logger.error(error_msg)
            raise SMTPConnectionError(error_msg) from e
        except smtplib.SMTPException as e:
            error_msg = f"SMTP error: {e}"
            logger.error(error_msg)
            raise EmailSendError(error_msg) from e
        except Exception as e:
            error_msg = f"Failed to create SMTP connection: {e}"
            logger.error(error_msg)
            raise SMTPConnectionError(error_msg) from e
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email using SendGrid first, then Resend, finally fallback to SMTP"""
        
        # Try SendGrid first if available
        if SENDGRID_AVAILABLE and sendgrid_service and sendgrid_service.is_available():
            logger.info("📧 Attempting to send email via SendGrid")
            try:
                success = sendgrid_service.send_email(to_email, subject, html_content, text_content)
                if success:
                    logger.info(f"✅ Email sent successfully via SendGrid to {to_email}")
                    return True
                else:
                    logger.warning("⚠️ SendGrid failed, trying Resend")
            except Exception as e:
                logger.warning(f"⚠️ SendGrid error: {e}, trying Resend")
        
        # Try Resend as secondary option
        if RESEND_AVAILABLE and resend_service and resend_service.is_available():
            logger.info("📧 Attempting to send email via Resend")
            try:
                success = resend_service.send_email(to_email, subject, html_content, text_content)
                if success:
                    logger.info(f"✅ Email sent successfully via Resend to {to_email}")
                    return True
                else:
                    logger.warning("⚠️ Resend failed, falling back to SMTP")
            except Exception as e:
                logger.warning(f"⚠️ Resend error: {e}, falling back to SMTP")
        
        # Fallback to SMTP
        try:
            # Log service being used
            service_name = "MailHog" if self.is_mailhog else "Gmail" if self.is_gmail else "Generic SMTP"
            logger.info(f"📧 Sending email via {service_name} (SMTP fallback)")
            logger.debug(f"To: {to_email}, Subject: {subject}")
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = formataddr((self.smtp_from_name, self.smtp_from))
            message["To"] = to_email
            
            # Add text content if provided
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            server = None
            try:
                server = self._create_connection()
                server.send_message(message)
                logger.info(f"✅ Email sent successfully to {to_email}")
                
                # Log additional info for development
                if self.is_mailhog:
                    logger.info("🔍 Check MailHog web interface at http://localhost:8025 to view email")
                
                return True
            finally:
                if server:
                    try:
                        server.quit()
                    except Exception:
                        # Ignore errors when closing connection
                        pass
            
        except (SMTPConnectionError, SMTPAuthError, EmailSendError) as e:
            logger.error(f"❌ Failed to send email to {to_email}: {e}")
            if settings.DEBUG:
                print(f"Email sending failed: {e}")
                print(f"Would have sent to: {to_email}")
                print(f"Subject: {subject}")
                print(f"Content: {html_content}")
            return False
    
    def test_connection(self) -> dict:
        """Test email configuration and SMTP connection"""
        result = {
            "config_valid": True,
            "connection_successful": False,
            "errors": [],
            "warnings": [],
            "config_details": {
                "smtp_host": self.smtp_host,
                "smtp_port": self.smtp_port,
                "smtp_from": self.smtp_from,
                "service_type": "MailHog" if self.is_mailhog else "Gmail" if self.is_gmail else "Generic SMTP"
            }
        }
        
        # Validate configuration
        config_errors = self._validate_config()
        if config_errors:
            result["config_valid"] = False
            result["errors"].extend(config_errors)
        
        # Test connection if config is valid
        if result["config_valid"]:
            server = None
            try:
                server = self._create_connection()
                result["connection_successful"] = True
                logger.info("✅ Email configuration test successful")
            except (SMTPConnectionError, SMTPAuthError, EmailSendError) as e:
                result["errors"].append(f"Connection test failed: {str(e)}")
                logger.error(f"❌ Email configuration test failed: {e}")
            finally:
                if server:
                    try:
                        server.quit()
                    except Exception:
                        # Ignore errors when closing connection
                        pass
        
        return result
    
    def send_otp_email(self, to_email: str, otp: str, username: str = "") -> bool:
        """Send OTP verification email using SendGrid first, fallback to SMTP"""
        
        # Try Resend first if available
        if RESEND_AVAILABLE and resend_service and resend_service.is_available():
            logger.info("📧 Sending OTP email via Resend")
            try:
                success = resend_service.send_otp_email(to_email, otp, username)
                if success:
                    logger.info(f"✅ OTP email sent successfully via Resend to {to_email}")
                    return True
                else:
                    logger.warning("⚠️ Resend OTP failed, falling back to SMTP")
            except Exception as e:
                logger.warning(f"⚠️ Resend OTP error: {e}, falling back to SMTP")
        
        # Fallback to SMTP
        logger.info("📧 Sending OTP email via SMTP (fallback)")
        subject = f"Your {settings.APP_NAME} Verification Code"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #87CEEB;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .otp-code {{
                    background-color: #fff;
                    border: 2px solid #87CEEB;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    letter-spacing: 5px;
                    color: #87CEEB;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 15px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{settings.APP_NAME}</h1>
                <p>Email Verification</p>
            </div>
            <div class="content">
                <h2>Hello{' ' + username if username else ''}!</h2>
                <p>You've requested a verification code for your {settings.APP_NAME} account. Please use the code below to verify your email address:</p>
                
                <div class="otp-code">{otp}</div>
                
                <div class="warning">
                    <strong>Important:</strong>
                    <ul>
                        <li>This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes</li>
                        <li>Don't share this code with anyone</li>
                        <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                </div>
                
                <p>If you're having trouble, you can contact our support team.</p>
                
                <p>Thank you for using {settings.APP_NAME}!</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {settings.APP_NAME}. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hello{' ' + username if username else ''}!
        
        You've requested a verification code for your {settings.APP_NAME} account.
        
        Your verification code is: {otp}
        
        This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.
        Don't share this code with anyone.
        
        If you didn't request this code, please ignore this email.
        
        Thank you for using {settings.APP_NAME}!
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_otp_email_with_link(self, to_email: str, otp: str, username: str = "", verification_link: str = "") -> bool:
        """Send OTP verification email with verification link"""
        subject = f"Your {settings.APP_NAME} Verification Code"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #87CEEB;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .otp-code {{
                    background-color: #fff;
                    border: 2px solid #87CEEB;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    letter-spacing: 5px;
                    color: #87CEEB;
                }}
                .verify-button {{
                    background-color: #87CEEB;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .verify-button:hover {{
                    background-color: #5dade2;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 15px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                }}
                .divider {{
                    border-top: 1px solid #ddd;
                    margin: 30px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{settings.APP_NAME}</h1>
                <p>Email Verification</p>
            </div>
            <div class="content">
                <h2>Hello{' ' + username if username else ''}!</h2>
                <p>You've requested a verification code for your {settings.APP_NAME} account. Please use the code below to verify your email address:</p>
                
                <div class="otp-code">{otp}</div>
                
                <div class="divider"></div>
                
                <h3>Quick Verification Option:</h3>
                <p>For your convenience, you can also click the button below to go directly to the verification page:</p>
                
                <div style="text-align: center;">
                    <a href="{verification_link}" class="verify-button">Verify Email Address</a>
                </div>
                
                <p><small>Or copy and paste this link in your browser:<br>
                <a href="{verification_link}">{verification_link}</a></small></p>
                
                <div class="warning">
                    <strong>Important:</strong>
                    <ul>
                        <li>This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes</li>
                        <li>Don't share this code with anyone</li>
                        <li>If you didn't request this code, please ignore this email</li>
                        <li>You can use either the code above OR click the verification link</li>
                    </ul>
                </div>
                
                <p>If you're having trouble, you can contact our support team.</p>
                
                <p>Thank you for using {settings.APP_NAME}!</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {settings.APP_NAME}. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hello{' ' + username if username else ''}!
        
        You've requested a verification code for your {settings.APP_NAME} account.
        
        Your verification code is: {otp}
        
        QUICK VERIFICATION OPTION:
        You can also verify your email by clicking this link:
        {verification_link}
        
        This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.
        Don't share this code with anyone.
        
        If you didn't request this code, please ignore this email.
        
        Thank you for using {settings.APP_NAME}!
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_welcome_email(self, to_email: str, username: str, verification_link: str) -> bool:
        """Send welcome email with verification link"""
        subject = f"Welcome to {settings.APP_NAME}! Please verify your email"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to {settings.APP_NAME}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #87CEEB;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .verify-button {{
                    display: inline-block;
                    background-color: #87CEEB;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .verify-button:hover {{
                    background-color: #5dade2;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Welcome to {settings.APP_NAME}!</h1>
            </div>
            <div class="content">
                <h2>Hello {username}!</h2>
                <p>Thank you for joining {settings.APP_NAME}! We're excited to have you on board.</p>
                
                <p>To get started, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="{verification_link}" class="verify-button">Verify Email Address</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
                    {verification_link}
                </p>
                
                <p>If you didn't create an account with us, you can safely ignore this email.</p>
                
                <p>Welcome aboard!</p>
                <p>The {settings.APP_NAME} Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {settings.APP_NAME}. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to {settings.APP_NAME}!
        
        Hello {username}!
        
        Thank you for joining {settings.APP_NAME}! We're excited to have you on board.
        
        To get started, please verify your email address by visiting this link:
        {verification_link}
        
        If you didn't create an account with us, you can safely ignore this email.
        
        Welcome aboard!
        The {settings.APP_NAME} Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_welcome_email_with_otp(self, to_email: str, username: str, otp: str, verification_link: str) -> bool:
        """Send welcome email with OTP using SendGrid first, fallback to SMTP"""
        
        # Try Resend first if available
        if RESEND_AVAILABLE and resend_service and resend_service.is_available():
            logger.info("📧 Sending welcome email via Resend")
            try:
                success = resend_service.send_welcome_email(to_email, username, otp)
                if success:
                    logger.info(f"✅ Welcome email sent successfully via Resend to {to_email}")
                    return True
                else:
                    logger.warning("⚠️ Resend welcome email failed, falling back to SMTP")
            except Exception as e:
                logger.warning(f"⚠️ Resend welcome email error: {e}, falling back to SMTP")
        
        # Fallback to SMTP
        logger.info("📧 Sending welcome email via SMTP (fallback)")
        subject = f"Welcome to {settings.APP_NAME}! Please verify your email"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to {settings.APP_NAME}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #87CEEB;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .otp-code {{
                    background-color: #fff;
                    border: 2px solid #87CEEB;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    letter-spacing: 5px;
                    color: #87CEEB;
                }}
                .verify-button {{
                    background-color: #87CEEB;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .verify-button:hover {{
                    background-color: #5dade2;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 15px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                }}
                .divider {{
                    border-top: 1px solid #ddd;
                    margin: 30px 0;
                }}
                .welcome-section {{
                    background-color: #e8f4f8;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #87CEEB;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Welcome to {settings.APP_NAME}!</h1>
                <p>Your account has been created successfully</p>
            </div>
            <div class="content">
                <div class="welcome-section">
                    <h2>Hello {username}!</h2>
                    <p>🎉 <strong>Welcome to {settings.APP_NAME}!</strong> We're thrilled to have you join our community.</p>
                    <p>Your account has been created successfully, and you're just one step away from getting started.</p>
                </div>
                
                <h3>📧 Verify Your Email Address</h3>
                <p>To complete your registration and secure your account, please verify your email address using your verification code:</p>
                
                <div class="otp-code">{otp}</div>
                
                <div class="divider"></div>
                
                <h3>🚀 Quick Verification Option:</h3>
                <p>For your convenience, you can also click the button below to go directly to the verification page:</p>
                
                <div style="text-align: center;">
                    <a href="{verification_link}" class="verify-button">Verify Email Address</a>
                </div>
                
                <p><small>Or copy and paste this link in your browser:<br>
                <a href="{verification_link}">{verification_link}</a></small></p>
                
                <div class="warning">
                    <strong>Important:</strong>
                    <ul>
                        <li>This verification code will expire in {settings.OTP_EXPIRE_MINUTES} minutes</li>
                        <li>You can use either the code above OR click the verification button</li>
                        <li>Keep this code private and don't share it with anyone</li>
                        <li>If you didn't create this account, please ignore this email</li>
                    </ul>
                </div>
                
                <div class="divider"></div>
                
                <p>Once verified, you'll have full access to all {settings.APP_NAME} features!</p>
                
                <p>If you have any questions or need help, our support team is here to assist you.</p>
                
                <p><strong>Welcome aboard!</strong><br>
                The {settings.APP_NAME} Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {settings.APP_NAME}. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to {settings.APP_NAME}!
        
        Hello {username}!
        
        🎉 Welcome to {settings.APP_NAME}! We're thrilled to have you join our community.
        Your account has been created successfully, and you're just one step away from getting started.
        
        📧 VERIFY YOUR EMAIL ADDRESS
        To complete your registration, please verify your email address using this code:
        
        {otp}
        
        🚀 QUICK VERIFICATION OPTION:
        You can also verify your email by clicking this link:
        {verification_link}
        
        IMPORTANT:
        - This verification code will expire in {settings.OTP_EXPIRE_MINUTES} minutes
        - You can use either the code above OR click the verification link
        - Keep this code private and don't share it with anyone
        - If you didn't create this account, please ignore this email
        
        Once verified, you'll have full access to all {settings.APP_NAME} features!
        
        Welcome aboard!
        The {settings.APP_NAME} Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_password_reset_email(self, to_email: str, username: str, reset_link: str) -> bool:
        """Send password reset email"""
        subject = f"{settings.APP_NAME} - Password Reset Request"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #FF6B6B;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .reset-button {{
                    display: inline-block;
                    background-color: #FF6B6B;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .reset-button:hover {{
                    background-color: #ff5252;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 15px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Password Reset</h1>
                <p>{settings.APP_NAME}</p>
            </div>
            <div class="content">
                <h2>Hello {username}!</h2>
                <p>We received a request to reset your password for your {settings.APP_NAME} account.</p>
                
                <p>Click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="reset-button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
                    {reset_link}
                </p>
                
                <div class="warning">
                    <strong>Security Note:</strong>
                    <ul>
                        <li>This reset link will expire after 1 hour</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will remain unchanged unless you click the link above</li>
                    </ul>
                </div>
                
                <p>If you're having trouble, please contact our support team.</p>
                
                <p>Stay secure!</p>
                <p>The {settings.APP_NAME} Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {settings.APP_NAME}. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset - {settings.APP_NAME}
        
        Hello {username}!
        
        We received a request to reset your password for your {settings.APP_NAME} account.
        
        To reset your password, visit this link:
        {reset_link}
        
        This reset link will expire after 1 hour.
        
        If you didn't request this reset, please ignore this email.
        Your password will remain unchanged unless you visit the link above.
        
        Stay secure!
        The {settings.APP_NAME} Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)
    
    def send_password_reset_otp_email(self, to_email: str, username: str, otp: str, reset_link: str = "") -> bool:
        """Send password reset email with OTP"""
        subject = f"{settings.APP_NAME} - Password Reset Code"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background-color: #FF6B6B;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .otp-code {{
                    background-color: #fff;
                    border: 2px solid #FF6B6B;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    letter-spacing: 5px;
                    color: #FF6B6B;
                }}
                .reset-button {{
                    background-color: #FF6B6B;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .reset-button:hover {{
                    background-color: #ff5252;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 15px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                }}
                .divider {{
                    border-top: 1px solid #ddd;
                    margin: 30px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Password Reset</h1>
                <p>{settings.APP_NAME}</p>
            </div>
            <div class="content">
                <h2>Hello {username}!</h2>
                <p>We received a request to reset your password for your {settings.APP_NAME} account.</p>
                
                <p>Please use the code below to reset your password:</p>
                
                <div class="otp-code">{otp}</div>
                
                {f'''
                <div class="divider"></div>
                
                <h3>Quick Reset Option:</h3>
                <p>You can also click the button below to go directly to the password reset page:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="reset-button">Reset Password</a>
                </div>
                
                <p><small>Or copy and paste this link in your browser:<br>
                <a href="{reset_link}">{reset_link}</a></small></p>
                ''' if reset_link else ''}
                
                <div class="warning">
                    <strong>Security Note:</strong>
                    <ul>
                        <li>This reset code will expire in {settings.OTP_EXPIRE_MINUTES} minutes</li>
                        <li>Don't share this code with anyone</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password will remain unchanged until you complete the reset process</li>
                        {f'<li>You can use either the code above OR click the reset button</li>' if reset_link else ''}
                    </ul>
                </div>
                
                <p>If you're having trouble, please contact our support team.</p>
                
                <p>Stay secure!</p>
                <p>The {settings.APP_NAME} Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {settings.APP_NAME}. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset - {settings.APP_NAME}
        
        Hello {username}!
        
        We received a request to reset your password for your {settings.APP_NAME} account.
        
        Your password reset code is: {otp}
        
        {f'''
        QUICK RESET OPTION:
        You can also reset your password by visiting this link:
        {reset_link}
        ''' if reset_link else ''}
        
        SECURITY NOTE:
        - This reset code will expire in {settings.OTP_EXPIRE_MINUTES} minutes
        - Don't share this code with anyone
        - If you didn't request this reset, please ignore this email
        - Your password will remain unchanged until you complete the reset process
        {f'- You can use either the code above OR visit the reset link' if reset_link else ''}
        
        Stay secure!
        The {settings.APP_NAME} Team
        """
        
        return self.send_email(to_email, subject, html_content, text_content)


# Create a global instance
email_service = EmailService()
