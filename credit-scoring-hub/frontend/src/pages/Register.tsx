import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { PageLayout } from "../components/PageLayout";

const text = {
  en: {
    title: "Open your digital banking access",
    fullName: "Full Name",
    username: "Username",
    email: "Email",
    phone: "Phone",
    password: "Password",
    confirmPassword: "Confirm Password",
    create: "Create Account",
    creating: "Creating Account...",
    accountExists: "Already have an account?",
    signIn: "Sign In",
    passwords: "Passwords do not match",
    passwordShort: "Password must be at least 6 characters",
  },
  ru: {
    title: "Откройте доступ в цифровой банк",
    fullName: "Полное имя",
    username: "Имя пользователя",
    email: "Email",
    phone: "Телефон",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    create: "Создать аккаунт",
    creating: "Создание аккаунта...",
    accountExists: "Уже есть аккаунт?",
    signIn: "Войти",
    passwords: "Пароли не совпадают",
    passwordShort: "Пароль должен содержать минимум 6 символов",
  },
  ky: {
    title: "Санариптик банкка кирүү мүмкүнчүлүгүн ачыңыз",
    fullName: "Толук аты-жөнү",
    username: "Колдонуучунун аты",
    email: "Email",
    phone: "Телефон",
    password: "Пароль",
    confirmPassword: "Паролду ырастаңыз",
    create: "Аккаунт түзүү",
    creating: "Аккаунт түзүлүүдө...",
    accountExists: "Аккаунтуңуз барбы?",
    signIn: "Кирүү",
    passwords: "Паролдор дал келбейт",
    passwordShort: "Пароль кеминде 6 белгиден турушу керек",
  },
} as const;

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = text[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t.passwords);
      return;
    }

    if (formData.password.length < 6) {
      setError(t.passwordShort);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
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
            <h1 className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-3xl font-bold text-transparent">
              CredoBank
            </h1>
            <p className="mt-2 text-slate-300">{t.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.fullName}
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.username}
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.email}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.phone}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.password}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                required
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
              {loading ? t.creating : t.create}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            {t.accountExists}{" "}
            <Link
              to="/login"
              className="font-semibold text-cyan-300 hover:text-cyan-200"
            >
              {t.signIn}
            </Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
};
