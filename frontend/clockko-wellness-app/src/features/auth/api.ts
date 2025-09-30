import axios from 'axios'
import { z } from 'zod'

// Define the shape of the login data
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})
export type LoginFormData = z.infer<typeof loginSchema>

// Define and export the shape of the registration data
const registrationSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})
export type RegistrationFormData = z.infer<typeof registrationSchema>

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

/**
 * Sends a login request to the backend.
 */
export const loginUser = async (data: LoginFormData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    // If the backend sends back a token, store it
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Login API call failed:', error);
    // Re-throw the error so the component can handle it (e.g., show an error message)
    throw error;
  }
};

/**
 * Sends a registration request to the backend.
 */
export const registerUser = async (data: RegistrationFormData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    // Add this block to store the token on successful registration
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration API call failed:', error);
    throw error;
  }
};


export const fetchUserData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // THIS IS THE FIX: Return null instead of throwing an error.
      return null;
    }

    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch user data failed:', error);
    localStorage.removeItem('authToken');
    // Also return null here to prevent crashes on API failure.
    return null;
  }
};

export const googleSignUp = async (googleToken: string) => {
  try {
    // This endpoint must exist on your backend
    const response = await axios.post(`${API_URL}/auth/google/verify`, {
      token: googleToken,
    });
    return response.data;
  } catch (error) {
    console.error('Google Sign-Up API call failed:', error);
    throw error;
  }
};

/**
 * Verify email with OTP token
 */
export const verifyEmail = async (email: string, otp: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-email`, {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/send-verification-email`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Resend verification email failed:', error);
    throw error;
  }
};

/**
 * Logs the user out by removing the token from storage.
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
};


// forget password api endpoint
export const sendPasswordResetEmail = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  }
  catch (error) {
    console.error('Send password reset email failed:', error);
    throw error;
  }
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { 
      email, 
      otp, 
      new_password: newPassword 
    });
    return response.data;
  }
  catch (error) {
    console.error('Reset password failed:', error);
    throw error;
  }
}