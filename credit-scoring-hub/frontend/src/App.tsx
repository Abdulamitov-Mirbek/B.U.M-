import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Footer } from "./components/Footer";
import { AdminPanel } from "./pages/AdminPanel";
import { Categories } from "./pages/Categories";
import { CreditFormPage } from "./pages/CreditFormPage";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import type { Language } from "./context/LanguageContext";

const content = {
  en: {
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    categories: "Categories",
    admin: "Admin",
    logout: "Logout",
    welcome: "Welcome",
    badge: "Urban Digital Lending",
    title: "A modern city-style credit platform for real banking journeys",
    description:
      "A premium digital flow where the client enters through a strong landing page, registers, selects a lending product, and only then moves into scoring and credit decisioning.",
    primary: "Open Account",
    secondary: "View Products",
    productsTitle: "Products",
    products: [
      "Consumer credit for personal financial goals",
      "Auto lending with a dedicated product flow",
      "Business financing for entrepreneurs and SMEs",
      "Premium line for stronger borrower profiles",
    ],
    metricsTitle: "Platform Highlights",
    metrics: [
      "24/7 onboarding and product intake",
      "Scoring, API, and analytics in one platform",
      "Category-based lending experience",
    ],
    flowTitle: "Client Journey",
    flow: [
      "Landing page introduces the bank and products.",
      "Registration or login unlocks the digital client area.",
      "The client chooses a relevant credit category.",
      "The application is submitted into the scoring engine.",
    ],
  },
  ru: {
    login: "Войти",
    register: "Регистрация",
    dashboard: "Дашборд",
    categories: "Категории",
    admin: "Админ",
    logout: "Выйти",
    welcome: "Добро пожаловать",
    badge: "Urban Digital Lending",
    title: "Современная кредитная платформа в стиле digital city",
    description:
      "Премиальный цифровой сценарий, в котором клиент сначала видит сильный landing page, проходит регистрацию, выбирает продукт и только после этого переходит к скорингу и кредитному решению.",
    primary: "Открыть аккаунт",
    secondary: "Смотреть продукты",
    productsTitle: "Продукты",
    products: [
      "Потребительские кредиты для личных целей",
      "Автокредитование с отдельным продуктовым сценарием",
      "Финансирование бизнеса и предпринимателей",
      "Premium line для клиентов с сильным профилем",
    ],
    metricsTitle: "Преимущества платформы",
    metrics: [
      "24/7 цифровой онбординг и прием заявок",
      "Скоринг, API и аналитика в одной системе",
      "Выдача по категориям кредитных продуктов",
    ],
    flowTitle: "Путь клиента",
    flow: [
      "Landing page знакомит клиента с банком и продуктами.",
      "Регистрация или вход открывают цифровой кабинет.",
      "Клиент выбирает нужную кредитную категорию.",
      "Заявка уходит в скоринговый контур.",
    ],
  },
};

function TopNavigation({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (value: Language) => void;
}) {
  const t = content[language];
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-xl font-bold text-transparent"
          >
            CredoBank
          </Link>

          {isAuthenticated ? (
            <div className="hidden items-center gap-5 md:flex">
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
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {(["en", "ru"] as Language[]).map((item) => (
              <button
                key={item}
                onClick={() => setLanguage(item)}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  language === item
                    ? "bg-cyan-300 text-slate-950"
                    : "border border-white/15 bg-white/5 text-slate-200"
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-300 md:block">
                {t.welcome}, {user?.fullName || user?.username}
              </span>
              <button
                onClick={logout}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/30"
              >
                {t.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
              >
                {t.login}
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function LandingPage({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (value: Language) => void;
}) {
  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      <div className="flex-grow">
        <TopNavigation language={language} setLanguage={setLanguage} />

        <main className="city-grid px-4 py-10 md:px-8">
          <div className="mx-auto max-w-7xl">
            <section className="hero-panel city-glow overflow-hidden rounded-[2.25rem] border border-white/10 p-8 md:p-10">
              <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="max-w-3xl">
                  <p className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-1 text-sm text-cyan-200">
                    {t.badge}
                  </p>
                  <h1 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-6xl">
                    {t.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                    {t.description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/register"
                      className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-white transition hover:brightness-110"
                    >
                      {t.primary}
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      {t.secondary}
                    </Link>
                  </div>

                  <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    {t.metrics.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="city-stat-line mb-3" />
                        <p className="text-sm leading-6 text-slate-200">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5">
                  <div className="city-card rounded-[1.75rem] p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">
                      {t.productsTitle}
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                      {t.products.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>

                  <div className="city-card rounded-[1.75rem] p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
                      {t.flowTitle}
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                      {t.flow.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer language={language} />
    </div>
  );
}

function AppContent() {
  const { language, setLanguage } = useLanguage();

  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage language={language} setLanguage={setLanguage} />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/credit-form"
            element={
              <PrivateRoute>
                <CreditFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
