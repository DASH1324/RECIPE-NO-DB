import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { Click } from '@/components/buttons/Click';
import { Enter as EnterButton } from '@/components/buttons/Enter';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/buttons/Form';
import {
  Box,
  BoxContent,
  BoxFooter,
  BoxHeader,
  BoxTitle,
} from '@/components/buttons/Box';

import './ResetPasswordForm.css';

// --- UPDATED ZOD SCHEMA ---
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter.' })
      .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter.' })
      .regex(/[0-9]/, { message: 'Must contain at least one number.' })
      .regex(/[^a-zA-Z0-9]/, { message: 'Must contain at least one special character.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], 
  });

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' }); 

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched', // Added for better UX, validates on blur
  });

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setStatus({
        type: 'error',
        message: 'No reset token found. The link is invalid or has expired.',
      });
    }
  }, [searchParams]);

  const handleSubmit = async (values) => {
    if (!token) return;

    setStatus({ type: 'loading', message: '' });

    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'https://recipe-no-db.onrender.com';
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'An unknown error occurred.');
      }

      setStatus({ type: 'success', message: data.message || 'Your password has been reset successfully.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to reset password. The link may be invalid or expired.',
      });
    }
  };

  const renderContent = () => {
    if (status.type === 'success') {
      return (
        <div className="status-container success">
          <svg xmlns="http://www.w3.org/2000/svg" className="status-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="status-text">{status.message}</p>
          <Click onClick={() => navigate('/auth')} className="return-btn">
            Go to Login
          </Click>
        </div>
      );
    }
    
    if (status.type === 'error' && !token) {
        return (
             <div className="status-container error">
                <svg xmlns="http://www.w3.org/2000/svg" className="status-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="status-text">{status.message}</p>
                <Click onClick={() => navigate('/forgot-password')} className="return-btn" variant="outline">
                    Request a New Link
                </Click>
            </div>
        )
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="form-content">
          <p className="instruction-text">
            Your new password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.
          </p>
          {status.type === 'error' && token && <p className="api-error-message">{status.message}</p>}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <EnterButton
                    placeholder="••••••••"
                    type="password"
                    disabled={status.type === 'loading'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <EnterButton
                    placeholder="••••••••"
                    type="password"
                    disabled={status.type === 'loading'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="submit-btn-container">
            <Click type="submit" className="submit-btn" disabled={status.type === 'loading'}>
              {status.type === 'loading' ? 'Resetting...' : 'Reset Password'}
            </Click>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="reset-password-container"
    >
      <Box className="reset-password-box">
        <BoxHeader>
          <BoxTitle className="reset-password-title">Set New Password</BoxTitle>
        </BoxHeader>
        <BoxContent>{renderContent()}</BoxContent>
        <BoxFooter className="footer" />
      </Box>
    </motion.div>
  );
};

export default ResetPasswordForm;