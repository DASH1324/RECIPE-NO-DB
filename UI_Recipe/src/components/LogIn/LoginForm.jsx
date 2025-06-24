// LoginForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

import { Enter } from "@/components/buttons/Enter";
import { Click } from "@/components/buttons/Click";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/buttons/Form";

import "./LoginForm.css";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Please enter your username" }).transform(val => val.toLowerCase()),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const LoginForm = ({ onForgotPassword = () => {} }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append('username', values.username);
    formData.append('password', values.password);

    try {
     
      const response = await axios.post("https://recipe-no-db.onrender.com/auth/token", formData);
      
      
      const { access_token, full_name, username } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("full_name", full_name);
      localStorage.setItem("username", username);

      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back, ${full_name || username}!`,
        timer: 2000,
        showConfirmButton: false,
        willClose: () => {
          navigate("/dashboard");
        }
      });

    } catch (error) {
      const apiErrorMessage = error.response?.data?.detail || "Invalid username or password. Please try again.";
      
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: apiErrorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Enter your credentials to sign in</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="login-form">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <div className="input-container">
                  <User className="input-icon" />
                  <FormControl>
                    <Enter placeholder="johndoe" className="input-field" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="input-container">
                  <Lock className="input-icon" />
                  <FormControl>
                    <Enter
                      type={showPassword ? "text" : "password"}
                      className="input-field"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <Click
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                  </Click>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Click type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Click>
        </form>
      </Form>
      <div className="forgot-password-outer-container">
        <Click
          variant="link"
          className="forgot-password-btn"
          type="button"
          onClick={onForgotPassword}
          disabled={isLoading}
        >
          Forgot password?
        </Click>
      </div>
    </div>
  );
};

export default LoginForm;