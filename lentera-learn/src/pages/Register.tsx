import React, { useState } from "react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useJwtApiClient } from "../services/apiClient";
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation('auth');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const apiClient = useJwtApiClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.register(formData.name, formData.email, formData.password);
      if (response.success && response.data) {
        // Store token in localStorage
        localStorage.setItem("auth_token", response.data.token);
        navigate("/dashboard");
      } else {
        setError(response.error || "Registrasi gagal");
      }
    } catch (err) {
      setError(t('errors.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-beige to-white flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-brand-deep-green-700 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-merriweather font-bold text-brand-deep-green-800">Lentera AI</span>
        </Link>
        <h1 className="text-3xl font-merriweather font-bold text-brand-deep-green-800 mb-2">{t('register.title')}</h1>
        <p className="text-gray-600">{t('register.subtitle')}</p>
      </div>

      {/* Register Form */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-deep-green-700 mb-2">
              {t('register.fullName')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brand-deep-green-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-deep-green-600 focus:border-brand-deep-green-600"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-deep-green-700 mb-2">
              {t('register.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brand-deep-green-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-deep-green-600 focus:border-brand-deep-green-600"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-deep-green-700 mb-2">
              {t('register.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-deep-green-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-deep-green-600 focus:border-brand-deep-green-600 pr-10"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-deep-green-700 mb-2">
              {t('register.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-deep-green-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-deep-green-600 focus:border-brand-deep-green-600 pr-10"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('register.registerButtonLoading') : t('register.registerButton')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('register.hasAccount')}{" "}
            <Link to="/login" className="text-brand-deep-green-700 hover:text-brand-deep-green-800 font-medium">
              {t('register.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
