import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { PageLayout } from "../components/PageLayout";

const text = {
  en: {
    title: "Enter your digital banking workspace",
    email: "Email",
    password: "Password",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    noAccount: "Don't have an account?",
    create: "Create Account",
  },
  ru: {
    title: "Войдите в цифровое банковское пространство",
    email: "Email",
    password: "Пароль",
    emailPlaceholder: "Введите ваш email",
    passwordPlaceholder: "Введите ваш пароль",
    signIn: "Войти",
    signingIn: "Вход...",
    noAccount: "Нет аккаунта?",
    create: "Создать аккаунт",
  },
} as const;

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = text[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/categories");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="city-grid flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
        <div className="city-card w-full max-w-md rounded-[2rem] p-8">
          <div className="mb-8 text-center">
            <h1 className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-4xl font-bold text-transparent">
              CredoBank
            </h1>
            <p className="mt-2 text-slate-300">{t.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                required
                placeholder={t.emailPlaceholder}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                required
                placeholder={t.passwordPlaceholder}
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-900/30 transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? t.signingIn : t.signIn}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            {t.noAccount}{" "}
            <Link
              to="/register"
              className="font-semibold text-cyan-300 hover:text-cyan-200"
            >
              {t.create}
            </Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
};
