import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from 'sweetalert2';
import "./SignupForm.css";

const signupSchema = z.object({
  name: z.string()
    .min(2, { message: "Full name must be at least 2 characters long." })
    .max(100, { message: "Full name must be no more than 100 characters." })
    .regex(/^[a-zA-Z\s'-]+$/, { message: "Full name can only contain letters, spaces, hyphens, and apostrophes." }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(30, { message: "Username must be 30 characters or less." })
    .regex(/^[a-zA-Z0-9_.-]+$/, { message: "Username can only contain letters, numbers, dots, underscores, or hyphens." })
    .transform(str => str.toLowerCase()),
  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .max(254, { message: "Email address is too long."}),
  // --- UPDATED PASSWORD VALIDATION ---
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(128, { message: "Password is too long (max 128 characters)." })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Must contain at least one special character." }),
  confirmPassword: z.string()
    .min(1, { message: "Please confirm your password." }),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});


// --- Signup Component ---
const SignupForm = ({ onSubmitSuccess = () => {}, onAcknowledgeSuccess = () => {} }) => {
  // State to manage which step we are on: 'form' or 'otp'
  const [signupStep, setSignupStep] = useState('form');
  // State to hold data between steps (especially the email)
  const [pendingData, setPendingData] = useState(null);
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  // --- Step 1: Submit form data and request OTP ---
  const handleInitialSubmit = async (data) => {
    setIsLoading(true);
    try {
      // API call to the new endpoint that sends the OTP
      await axios.post("https://recipe-no-db.onrender.com/auth/request-verification", {
        full_name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      });

      // On success, store the data and move to the OTP step
      setPendingData(data);
      setSignupStep('otp');

    } catch (error) {
      // Handle errors like "username already exists"
      let errorMessageText = "An error occurred. Please try again.";
      if (error.response?.data?.detail) {
        errorMessageText = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : JSON.stringify(error.response.data.detail);
      }
      console.error("OTP Request error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: errorMessageText,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Submit OTP and finalize registration ---
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
        Swal.fire({ icon: 'warning', title: 'Invalid OTP', text: 'Please enter a valid 6-digit OTP.' });
        return;
    }
    setIsLoading(true);

    try {
      // API call to verify OTP and create the user
      const response = await axios.post("https://recipe-no-db.onrender.com/auth/verify-and-register", {
        email: pendingData.email,
        otp: otp,
      });

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Successfully registered. You can now log in.',
        confirmButtonText: 'OK',
      }).then(() => {
        // Reset everything to initial state
        reset();
        setSignupStep('form');
        setPendingData(null);
        setOtp("");
        onSubmitSuccess(response.data);
        onAcknowledgeSuccess();
      });

    } catch (error) {
      let errorMessageText = "An error occurred during verification.";
      if (error.response?.data?.detail) {
        errorMessageText = error.response.data.detail;
      }
      console.error("OTP Verification error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: errorMessageText,
      });
    } finally {
      setIsLoading(false);
    }
  };


  // --- Render OTP Verification Form ---
  if (signupStep === 'otp') {
    return (
      <div className="signup-container">
        <form onSubmit={handleOtpSubmit} className="signup-form otp-form">
          <div className="otp-header">
            <MailCheck size={48} strokeWidth={1.5} />
            <h2>Check your email</h2>
            <p>We've sent a 6-digit verification code to <strong>{pendingData?.email}</strong>. The code is valid for 10 minutes.</p>
          </div>
          <div className="form-item">
            <label htmlFor="otp-input">Verification Code</label>
            <input
              id="otp-input"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              disabled={isLoading}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify & Create Account"}
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => {
                setSignupStep('form');
                setPendingData(null);
            }}
            disabled={isLoading}
          >
            Go back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit(handleInitialSubmit)} className="signup-form">
        <div className="form-item">
          <label htmlFor="signup-modal-v3-name">Full Name</label>
          <input
            id="signup-modal-v3-name"
            type="text"
            placeholder="John Doe"
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
          {errors.name && <p className="error" role="alert">{errors.name.message}</p>}
        </div>

        <div className="form-item">
          <label htmlFor="signup-modal-v3-username">Username</label>
          <input
            id="signup-modal-v3-username"
            type="text"
            placeholder="johndoe"
            {...register("username")}
            aria-invalid={errors.username ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
          {errors.username && <p className="error" role="alert">{errors.username.message}</p>}
        </div>

        <div className="form-item">
          <label htmlFor="signup-modal-v3-email">Email</label>
          <input
            id="signup-modal-v3-email"
            type="email"
            placeholder="john.doe@example.com"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
          {errors.email && <p className="error" role="alert">{errors.email.message}</p>}
        </div>

        <div className="form-item">
          <label htmlFor="signup-modal-v3-password">Password</label>
          <div className="password-wrapper">
            <input
              id="signup-modal-v3-password"
              type={showPassword ? "text" : "password"}
              // --- UPDATED PLACEHOLDER ---
              placeholder="Enter at least 8 characters"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
              disabled={isLoading || isSubmitting}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading || isSubmitting}
            >
              {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
            </button>
          </div>
          {errors.password && <p className="error" role="alert">{errors.password.message}</p>}
        </div>

        <div className="form-item">
          <label htmlFor="signup-modal-v3-confirmPassword">Confirm Password</label>
          <div className="password-wrapper">
            <input
              id="signup-modal-v3-confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              {...register("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              disabled={isLoading || isSubmitting}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              disabled={isLoading || isSubmitting}
            >
              {showConfirmPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="error" role="alert">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" className="submit-button" disabled={isLoading || isSubmitting}>
          {isLoading || isSubmitting ? "Sending code..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;