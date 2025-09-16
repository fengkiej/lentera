import React, { useState } from "react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useJwtApiClient } from "../services/apiClient";
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const apiClient = useJwtApiClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.login(email, password);
      if (response.success && response.data) {
        // Store token in localStorage
        localStorage.setItem("auth_token", response.data.token);
        navigate("/dashboard");
      } else {
        setError(response.error || "Login gagal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat login");
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
          <span className="text-2xl font-merriweather font-bold text-brand-deep-green-800">Lentera</span>
        </Link>
        <h1 className="text-3xl font-merriweather font-bold text-brand-deep-green-800 mb-2">{t('login.title')}</h1>
        <p className="text-gray-600">{t('login.subtitle')}</p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-deep-green-700 mb-2">
              {t('login.email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-brand-deep-green-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-deep-green-600 focus:border-brand-deep-green-600"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-deep-green-700 mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-brand-deep-green-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-deep-green-600 focus:border-brand-deep-green-600 pr-10"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-deep-green-700 hover:bg-brand-deep-green-800 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('login.loginButtonLoading') : t('login.loginButton')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('login.noAccount')}{" "}
            <Link to="/register" className="text-brand-deep-green-700 hover:text-brand-deep-green-800 font-medium">
              {t('login.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
