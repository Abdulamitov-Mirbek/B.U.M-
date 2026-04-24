import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { PageLayout } from "../components/PageLayout";

const categories = {
  en: [
    {
      id: "consumer",
      title: "Consumer Credit",
      subtitle: "Urban retail finance",
      description:
        "For clients who need flexible funding for personal goals, repairs, education, or travel.",
    },
    {
      id: "auto",
      title: "Auto Loan",
      subtitle: "Mobility financing",
      description:
        "A cleaner route for customers planning to finance a vehicle with a structured term profile.",
    },
    {
      id: "business",
      title: "Business Credit",
      subtitle: "Growth capital",
      description:
        "Built for entrepreneurs and small businesses looking to expand operations or stabilize cash flow.",
    },
    {
      id: "premium",
      title: "Premium Line",
      subtitle: "Priority banking product",
      description:
        "For stronger customer profiles that expect larger financing limits and a more premium experience.",
    },
  ],
  ru: [
    {
      id: "consumer",
      title: "Потребительский кредит",
      subtitle: "Розничное финансирование",
      description:
        "Для клиентов, которым нужно гибкое финансирование на личные цели, ремонт, обучение или поездки.",
    },
    {
      id: "auto",
      title: "Автокредит",
      subtitle: "Финансирование мобильности",
      description:
        "Отдельный маршрут для клиентов, которые планируют оформить покупку автомобиля в кредит.",
    },
    {
      id: "business",
      title: "Бизнес-кредит",
      subtitle: "Капитал для роста",
      description:
        "Для предпринимателей и малого бизнеса, которым нужно расширение, оборотные средства или развитие.",
    },
    {
      id: "premium",
      title: "Premium line",
      subtitle: "Приоритетный банковский продукт",
      description:
        "Для клиентов с более сильным профилем, которым нужен больший лимит и премиальный подход.",
    },
  ],
} as const;

const text = {
  en: {
    dashboard: "Dashboard",
    admin: "Admin Panel",
    logout: "Logout",
    title: "Select a modern banking product before the scoring flow",
    description:
      "The client chooses a financing category first. This makes the experience feel more like a real digital bank product journey instead of a single generic form.",
    products: "Credit Products",
    continue: "Continue",
    product: "Product",
  },
  ru: {
    dashboard: "Дашборд",
    admin: "Админ панель",
    logout: "Выйти",
    title: "Выберите банковский продукт перед скоринговой заявкой",
    description:
      "Сначала клиент выбирает кредитную категорию. Так пользовательский путь выглядит как реальный сценарий цифрового банка, а не как одна общая форма.",
    products: "Кредитные продукты",
    continue: "Продолжить",
    product: "Продукт",
  },
} as const;

export const Categories: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { language } = useLanguage();
  const t = text[language];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <nav className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-xl font-bold text-transparent"
              >
                CredoBank
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

        <main className="city-grid px-4 py-10 md:px-8">
          <div className="mx-auto max-w-7xl">
            <section className="city-card mb-8 rounded-[2rem] p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">
                {t.products}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {t.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                {t.description}
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              {categories[language].map((category) => (
                <article
                  key={category.id}
                  className="city-card rounded-[2rem] border border-white/10 p-6 transition duration-300 hover:-translate-y-1"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                    {category.subtitle}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    {category.title}
                  </h2>
                  <p className="mt-4 min-h-24 leading-7 text-slate-200">
                    {category.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                      {t.product}: {category.id}
                    </span>
                    <Link
                      to={`/credit-form?category=${category.id}`}
                      className="rounded-2xl bg-gradient-to-r from-white to-slate-100 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-105"
                    >
                      {t.continue}
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </main>
      </div>
    </PageLayout>
  );
};
