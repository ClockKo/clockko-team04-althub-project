"""
Two-Factor Authentication Service

Handles TOTP (Time-based One-Time Password) operations including:
- Secret generation and encryption
- QR code generation  
- TOTP verification
- Backup code management
"""

import secrets
import pyotp
import qrcode
import io
import base64
import json
import hashlib
from typing import List, Tuple, Optional
from cryptography.fernet import Fernet
from app.core.config import settings


class TwoFactorAuthService:
    """Service for handling Two-Factor Authentication operations"""
    
    def __init__(self):
        # Generate or load encryption key for secrets
        # In production, this should come from secure environment variables
        self.encryption_key = self._get_encryption_key()
        self.cipher_suite = Fernet(self.encryption_key)
    
    def _get_encryption_key(self) -> bytes:
        """Get or generate encryption key for 2FA secrets"""
        # In production, store this securely in environment variables
        key = getattr(settings, 'TWO_FACTOR_ENCRYPTION_KEY', None)
        if not key:
            # Generate a new key (should be stored securely)
            key = Fernet.generate_key()
        elif isinstance(key, str):
            key = key.encode()
        return key
    
    def generate_secret(self) -> str:
        """Generate a new TOTP secret"""
        return pyotp.random_base32()
    
    def encrypt_secret(self, secret: str) -> str:
        """Encrypt a TOTP secret for database storage"""
        encrypted_secret = self.cipher_suite.encrypt(secret.encode())
        return base64.b64encode(encrypted_secret).decode()
    
    def decrypt_secret(self, encrypted_secret: str) -> str:
        """Decrypt a TOTP secret from database"""
        encrypted_data = base64.b64decode(encrypted_secret.encode())
        decrypted_secret = self.cipher_suite.decrypt(encrypted_data)
        return decrypted_secret.decode()
    
    def generate_qr_code(self, secret: str, user_email: str, issuer: str = "ClockKo") -> str:
        """Generate QR code for TOTP setup"""
        # Create TOTP URI
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name=issuer
        )
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        # Create QR code image
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64 string
        buffer = io.BytesIO()
        qr_image.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{qr_code_base64}"
    
    def verify_totp(self, secret: str, token: str, window: int = 1) -> bool:
        """Verify a TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=window)
    
    def generate_backup_codes(self, count: int = 8) -> List[str]:
        """Generate backup codes for account recovery"""
        backup_codes = []
        for _ in range(count):
            # Generate 8-digit backup code
            code = ''.join([str(secrets.randbelow(10)) for _ in range(8)])
            backup_codes.append(code)
        return backup_codes
    
    def hash_backup_codes(self, backup_codes: List[str]) -> List[str]:
        """Hash backup codes for secure storage"""
        hashed_codes = []
        for code in backup_codes:
            # Add salt and hash
            salt = secrets.token_hex(16)
            hashed = hashlib.pbkdf2_hmac('sha256', code.encode(), salt.encode(), 100000)
            hashed_with_salt = salt + hashed.hex()
            hashed_codes.append(hashed_with_salt)
        return hashed_codes
    
    def verify_backup_code(self, code: str, hashed_codes_json: str) -> Tuple[bool, str]:
        """
        Verify a backup code and return updated list
        Returns: (is_valid, updated_hashed_codes_json)
        """
        try:
            hashed_codes = json.loads(hashed_codes_json)
        except (json.JSONDecodeError, TypeError):
            return False, hashed_codes_json
        
        for i, hashed_code in enumerate(hashed_codes):
            if len(hashed_code) < 32:  # Invalid format
                continue
                
            salt = hashed_code[:32]  # First 32 chars are salt
            stored_hash = hashed_code[32:]  # Rest is hash
            
            # Hash the provided code with the same salt
            test_hash = hashlib.pbkdf2_hmac('sha256', code.encode(), salt.encode(), 100000)
            
            if test_hash.hex() == stored_hash:
                # Code is valid, remove it from the list (one-time use)
                hashed_codes.pop(i)
                return True, json.dumps(hashed_codes)
        
        return False, hashed_codes_json
    
    def format_secret_for_manual_entry(self, secret: str) -> str:
        """Format secret for manual entry in authenticator apps"""
        # Split into groups of 4 characters for readability
        return ' '.join([secret[i:i+4] for i in range(0, len(secret), 4)])


# Global service instance
two_factor_service = TwoFactorAuthService()