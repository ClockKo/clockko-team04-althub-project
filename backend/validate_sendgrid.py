#!/usr/bin/env python3
"""
SendGrid API Key Validation Test

This script tests if your SendGrid API key is valid and working.
"""

import os
import sys
import requests
import json
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def load_env_file():
    """Load environment variables from .env file"""
    env_path = backend_dir / '.env'
    if not env_path.exists():
        print("❌ .env file not found")
        return False
    
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
    return True

def test_api_key_format():
    """Test if API key has correct format"""
    api_key = os.getenv('SENDGRID_API_KEY', '')
    
    print(f"🔑 API Key: {api_key[:20]}..." if len(api_key) > 20 else f"🔑 API Key: {api_key}")
    
    if not api_key:
        print("❌ No SendGrid API key found")
        return False
    
    if not api_key.startswith('SG.'):
        print("❌ Invalid API key format (should start with 'SG.')")
        return False
    
    if len(api_key) < 50:
        print("❌ API key seems too short")
        return False
    
    print("✅ API key format looks correct")
    return True

def test_sendgrid_api():
    """Test SendGrid API connectivity using requests"""
    api_key = os.getenv('SENDGRID_API_KEY', '')
    
    if not api_key:
        print("❌ No API key available for testing")
        return False
    
    print("🌐 Testing SendGrid API connectivity...")
    
    try:
        # Test with a simple GET request to validate API key
        url = "https://api.sendgrid.com/v3/user/profile"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        print("📡 Making request to SendGrid API...")
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API key is valid!")
            print(f"👤 Account: {data.get('username', 'N/A')}")
            return True
        elif response.status_code == 401:
            print("❌ API key is invalid or expired")
            return False
        elif response.status_code == 403:
            print("❌ API key doesn't have required permissions")
            return False
        else:
            print(f"⚠️ Unexpected response: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectTimeout:
        print("❌ Connection timeout - check your internet connection")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        print("💡 This might be a network/DNS issue or firewall blocking")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_simple_email():
    """Test sending a simple email via SendGrid"""
    api_key = os.getenv('SENDGRID_API_KEY', '')
    from_email = os.getenv('SENDGRID_FROM_EMAIL', '')
    
    if not api_key or not from_email:
        print("❌ Missing API key or from email")
        return False
    
    print("📧 Testing email sending...")
    
    try:
        # Simple email data
        email_data = {
            "personalizations": [
                {
                    "to": [{"email": "jameseyiaro@gmail.com"}],
                    "subject": "SendGrid Test from ClockKo"
                }
            ],
            "from": {
                "email": from_email,
                "name": "ClockKo Team"
            },
            "content": [
                {
                    "type": "text/plain",
                    "value": "Hello! This is a test email from ClockKo to verify SendGrid integration."
                },
                {
                    "type": "text/html",
                    "value": "<h1>Hello!</h1><p>This is a test email from <strong>ClockKo</strong> to verify SendGrid integration.</p>"
                }
            ]
        }
        
        url = "https://api.sendgrid.com/v3/mail/send"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        print("📤 Sending test email...")
        response = requests.post(url, headers=headers, json=email_data, timeout=30)
        
        print(f"📊 Email Response Status: {response.status_code}")
        
        if response.status_code == 202:
            print("✅ Email sent successfully!")
            print("📬 Check your inbox at jameseyiaro@gmail.com")
            return True
        else:
            print(f"❌ Failed to send email: {response.status_code}")
            if response.text:
                print(f"Error details: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False

def main():
    """Main test function"""
    print("🔍 SendGrid API Key Validation Test")
    print("=" * 40)
    
    # Load environment
    if not load_env_file():
        return
    
    # Test 1: API key format
    print("\n1️⃣ Testing API Key Format...")
    format_ok = test_api_key_format()
    
    if not format_ok:
        print("💡 Make sure you have a valid SendGrid API key in your .env file")
        return
    
    # Test 2: API connectivity
    print("\n2️⃣ Testing API Connectivity...")
    api_ok = test_sendgrid_api()
    
    if not api_ok:
        print("💡 Check your internet connection and API key permissions")
        return
    
    # Test 3: Send test email
    print("\n3️⃣ Testing Email Sending...")
    email_ok = test_simple_email()
    
    # Summary
    print("\n📊 Test Results:")
    print("=" * 40)
    print(f"API Key Format: {'✅ PASS' if format_ok else '❌ FAIL'}")
    print(f"API Connectivity: {'✅ PASS' if api_ok else '❌ FAIL'}")
    print(f"Email Sending: {'✅ PASS' if email_ok else '❌ FAIL'}")
    
    if format_ok and api_ok and email_ok:
        print("\n🎉 SendGrid is working perfectly!")
    else:
        print("\n⚠️ SendGrid needs attention. Check the errors above.")

if __name__ == "__main__":
    main()