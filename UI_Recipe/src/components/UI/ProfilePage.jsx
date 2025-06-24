
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';

const FeedbackMessage = ({ message, type }) => {
  if (!message) return null;
  return <div className={`feedback-message ${type}`}>{message}</div>;
};

function ProfilePage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [initialData, setInitialData] = useState(null); // To check for changes
  const [isLoading, setIsLoading] = useState(true);
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // --- Fetch initial profile data ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setErrorMessage('You are not logged in. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://recipe-no-db.onrender.com/auth/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = {
          username: response.data.username,
          email: response.data.email,
          fullName: response.data.full_name,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        };
        setFormData(profile);
        setInitialData(profile); // Save initial state
      } catch (error) {
        setErrorMessage('Failed to fetch profile data. Your session may have expired.');
        console.error('Profile fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Single handler for all updates ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const token = localStorage.getItem('access_token');
    if (!token) {
        setErrorMessage('Authentication error. Please log in again.');
        setIsLoading(false);
        return;
    }

    // --- Client-side validation for password ---
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setErrorMessage('New passwords do not match.');
        setIsLoading(false);
        return;
      }
      if (!formData.currentPassword) {
        setErrorMessage('Current password is required to set a new one.');
        setIsLoading(false);
        return;
      }
    }

    // --- Build the payload ---
    const payload = {
        username: formData.username,
        email: formData.email,
        full_name: formData.fullName,
    };
    if (formData.newPassword) {
        payload.current_password = formData.currentPassword;
        payload.new_password = formData.newPassword;
    }

    try {
      const response = await axios.put(
        'https://recipe-no-db.onrender.com/auth/users/me',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // --- IMPORTANT: Update localStorage with the new token and user details ---
      const { access_token, full_name, username } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("full_name", full_name);
      localStorage.setItem("username", username);

      setSuccessMessage('Profile updated successfully!');
      
      // Reset form state with new data and clear password fields
      const newProfileState = {
        username: username,
        email: formData.email,
        fullName: full_name,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      };
      setFormData(newProfileState);
      setInitialData(newProfileState); 
      
      clearMessages();
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Failed to update profile.');
      clearMessages();
    } finally {
        setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="profile-page"><h2>Loading Profile...</h2></div>
  }

  return (
    <div className="profile-page">
      <h2>Profile Settings</h2>
      
      <FeedbackMessage message={successMessage} type="success" />
      <FeedbackMessage message={errorMessage} type="error" />

      {/* --- A SINGLE UNIFIED FORM --- */}
      <form onSubmit={handleSubmit} className="profile-section">
        <h3>Account Details</h3>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Enter your username"
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
        />
        
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full name"
        />
        
        <h3 className="password-header">Change Password</h3>
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleInputChange}
          placeholder="Required to change password"
        />

        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleInputChange}
          placeholder="Leave blank to keep the same"
        />

        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          value={formData.confirmNewPassword}
          onChange={handleInputChange}
          placeholder="Confirm your new password"
        />

        <button type="submit" className="save-buttonProfilePages" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;