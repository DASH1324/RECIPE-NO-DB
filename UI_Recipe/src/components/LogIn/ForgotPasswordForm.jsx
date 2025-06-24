import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Click } from "@/components/buttons/Click";
import { Enter as EnterButton } from "@/components/buttons/Enter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/buttons/Form";
import {
  Box,
  BoxContent,
  BoxFooter,
  BoxHeader,
  BoxTitle,
} from "@/components/buttons/Box";

import "./ForgotPasswordForm.css";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const ForgotPasswordForm = () => {
  const navigate = useNavigate(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
      
      await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

    } catch (error) {
      console.error("Forgot password request failed:", error);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="forgot-password-container"
    >
      <Box className="forgot-password-box">
        <BoxHeader>
          <BoxTitle className="forgot-password-title">
            Reset Password
          </BoxTitle>
        </BoxHeader>

        <BoxContent>
          {isSuccess ? (
            <div className="success-message">
              <div className="success-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="check-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="success-text">
                If an account exists with that email, we've sent instructions to reset your password. Please check your inbox.
              </p>
              <Click onClick={() => navigate('/auth')} className="return-btn" variant="outline">
                Return to Login
              </Click>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="form-content">
                <p className="instruction-text">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <EnterButton
                          placeholder="your.email@example.com"
                          type="email"
                          autoComplete="email"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="submit-btn-container">
                  <Click type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <svg
                          className="loading-spinner"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="spinner-circle"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="spinner-path"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </Click>
                </div>
              </form>
            </Form>
          )}
        </BoxContent>

        <BoxFooter className="footer">
          {!isSuccess && (
            <Click variant="ghost" onClick={() => navigate('/auth')}>
              Back to Login
            </Click>
          )}
        </BoxFooter>
      </Box>
    </motion.div>
  );
};

export default ForgotPasswordForm;