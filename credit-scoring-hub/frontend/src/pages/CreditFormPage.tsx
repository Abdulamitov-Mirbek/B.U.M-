import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CreditForm } from "../components/CreditForm";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { PageLayout } from "../components/PageLayout";

const categoryMeta = {
  en: {
    consumer: {
      title: "Consumer Credit Application",
      description: "Personal financing with a balanced scoring workflow.",
    },
    auto: {
      title: "Auto Loan Application",
      description:
        "Vehicle-oriented lending with standard affordability checks.",
    },
    business: {
      title: "Business Credit Application",
      description:
        "Application flow for business growth and liquidity requests.",
    },
    premium: {
      title: "Premium Credit Line Application",
      description:
        "Priority handling for stronger, higher-value borrower profiles.",
    },
    selected: "Selected category",
    categories: "Categories",
    dashboard: "Dashboard",
    admin: "Admin Panel",
    logout: "Logout",
  },
  ru: {
    consumer: {
      title: "Заявка на потребительский кредит",
      description:
        "Персональное финансирование со сбалансированным скоринговым сценарием.",
    },
    auto: {
      title: "Заявка на автокредит",
      description:
        "Продукт для финансирования автомобиля со стандартной проверкой платежеспособности.",
    },
    business: {
      title: "Заявка на бизнес-кредит",
      description:
        "Сценарий для роста бизнеса, оборотных средств и расширения.",
    },
    premium: {
      title: "Заявка на premium credit line",
      description:
        "Приоритетный продукт для клиентов с более сильным профилем.",
    },
    selected: "Выбранная категория",
    categories: "Категории",
    dashboard: "Дашборд",
    admin: "Админ панель",
    logout: "Выйти",
  },
} as const;

export const CreditFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, logout, isAdmin } = useAuth();
  const { language } = useLanguage();

  const category = (searchParams.get("category") ||
    "consumer") as keyof typeof categoryMeta.en;
  const t = categoryMeta[language];
  const meta = (t[category] as typeof t.consumer) || t.consumer;

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-xl font-bold text-transparent"
              >
                CredoBank
              </Link>
              <Link
                to="/categories"
                className="text-slate-300 transition hover:text-white"
              >
                {t.categories}
              </Link>
              <Link
                to="/dashboard"
                className="text-slate-300 transition hover:text-white"
              >
                {t.dashboard}
              </Link>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="text-slate-300 transition hover:text-white"
                >
                  {t.admin}
                </Link>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">
                {user?.fullName || user?.username}
              </span>
              <button
                onClick={logout}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/30"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </nav>

        <main className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-7xl">
            <section className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
                {t.selected}
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">
                {meta.title}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-300">
                {meta.description}
              </p>
            </section>

            <CreditForm language={language} />
          </div>
        </main>
      </div>
    </PageLayout>
  );
};
