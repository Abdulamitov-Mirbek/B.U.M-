import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type Language = "ru" | "en";

type FormInputs = {
  user_id: string;
  age: string;
  monthly_income: string;
  loan_amount: string;
  loan_term_months: string;
  credit_history_years: string;
  current_debt: string;
  employment_years: string;
  dependents: string;
};

type NumericPayload = {
  user_id: string;
  age: number;
  monthly_income: number;
  loan_amount: number;
  loan_term_months: number;
  credit_history_years: number;
  current_debt: number;
  employment_years: number;
  dependents: number;
};

type ScoreResponse = {
  probability: number;
  result: string;
  score: number;
  riskLevel: string;
  recommendedAmount: number;
  applicationId: string;
};

type HistoryItem = {
  id: string;
  probability: number;
  result: string;
  riskLevel: string;
  recommendedAmount: number;
  createdAt: string;
};

const text = {
  ru: {
    section: "Заявка",
    analytics: "Аналитика",
    review: "Сводка",
    stepPersonal: "Персональные данные",
    stepFinancial: "Финансовые параметры",
    subtitlePersonal: "Заполните основные сведения о заемщике.",
    subtitleFinancial: "Укажите параметры кредита и долговую нагрузку.",
    continue: "Продолжить",
    back: "Назад",
    submit: "Отправить на скоринг",
    loading: "Отправка...",
    latestResult: "Результат оценки",
    emptyResult:
      "После отправки здесь появятся решение модели, уровень риска и рекомендуемая сумма.",
    result: "Решение",
    probability: "Вероятность",
    risk: "Уровень риска",
    recommendedAmount: "Рекомендуемая сумма",
    applicationId: "ID заявки",
    approvalRate: "Уровень одобрения",
    avgProbability: "Средняя вероятность",
    avgRecommendation: "Средняя рекомендация",
    totalRequests: "Всего заявок",
    profileChart: "Профиль заемщика и риск-бенчмарк",
    scoringDynamics: "Динамика вероятности",
    placeholders: {
      user_id: "Например: client-1024",
      age: "Например: 29",
      monthly_income: "Например: 12000",
      loan_amount: "Например: 25000",
      loan_term_months: "Например: 24",
      credit_history_years: "Например: 6",
      current_debt: "Например: 1800",
      employment_years: "Например: 4",
      dependents: "Например: 1"
    },
    labels: {
      user_id: "ID клиента",
      age: "Возраст",
      monthly_income: "Ежемесячный доход",
      loan_amount: "Сумма кредита",
      loan_term_months: "Срок кредита, мес.",
      credit_history_years: "Кредитная история, лет",
      current_debt: "Текущий долг",
      employment_years: "Стаж работы, лет",
      dependents: "Иждивенцы"
    },
    profileAxis: {
      stability: "Стабильность",
      affordability: "Платежеспособность",
      history: "Кредитная история",
      debtLoad: "Долговая нагрузка"
    },
    errors: {
      submit: "Не удалось обработать заявку.",
      invalid: "Заполните все поля корректными числами.",
      unexpected: "Произошла непредвиденная ошибка."
    }
  },
  en: {
    section: "Application",
    analytics: "Analytics",
    review: "Summary",
    stepPersonal: "Personal details",
    stepFinancial: "Financial details",
    subtitlePersonal: "Provide the applicant's main profile information.",
    subtitleFinancial: "Enter credit terms and current debt exposure.",
    continue: "Continue",
    back: "Back",
    submit: "Send to scoring",
    loading: "Submitting...",
    latestResult: "Scoring result",
    emptyResult:
      "The model decision, risk level, and recommended amount will appear here after submission.",
    result: "Result",
    probability: "Probability",
    risk: "Risk level",
    recommendedAmount: "Recommended amount",
    applicationId: "Application ID",
    approvalRate: "Approval rate",
    avgProbability: "Average probability",
    avgRecommendation: "Average recommendation",
    totalRequests: "Total requests",
    profileChart: "Borrower profile vs risk benchmark",
    scoringDynamics: "Probability trend",
    placeholders: {
      user_id: "Example: client-1024",
      age: "Example: 29",
      monthly_income: "Example: 12000",
      loan_amount: "Example: 25000",
      loan_term_months: "Example: 24",
      credit_history_years: "Example: 6",
      current_debt: "Example: 1800",
      employment_years: "Example: 4",
      dependents: "Example: 1"
    },
    labels: {
      user_id: "Client ID",
      age: "Age",
      monthly_income: "Monthly income",
      loan_amount: "Loan amount",
      loan_term_months: "Loan term, months",
      credit_history_years: "Credit history, years",
      current_debt: "Current debt",
      employment_years: "Employment years",
      dependents: "Dependents"
    },
    profileAxis: {
      stability: "Stability",
      affordability: "Affordability",
      history: "Credit history",
      debtLoad: "Debt load"
    },
    errors: {
      submit: "Unable to process the application.",
      invalid: "Please fill in all fields with valid numbers.",
      unexpected: "An unexpected error occurred."
    }
  }
} satisfies Record<
  Language,
  {
    section: string;
    analytics: string;
    review: string;
    stepPersonal: string;
    stepFinancial: string;
    subtitlePersonal: string;
    subtitleFinancial: string;
    continue: string;
    back: string;
    submit: string;
    loading: string;
    latestResult: string;
    emptyResult: string;
    result: string;
    probability: string;
    risk: string;
    recommendedAmount: string;
    applicationId: string;
    approvalRate: string;
    avgProbability: string;
    avgRecommendation: string;
    totalRequests: string;
    profileChart: string;
    scoringDynamics: string;
    placeholders: Record<keyof FormInputs, string>;
    labels: Record<keyof FormInputs, string>;
    profileAxis: Record<"stability" | "affordability" | "history" | "debtLoad", string>;
    errors: Record<"submit" | "invalid" | "unexpected", string>;
  }
>;

const initialForm: FormInputs = {
  user_id: "",
  age: "",
  monthly_income: "",
  loan_amount: "",
  loan_term_months: "",
  credit_history_years: "",
  current_debt: "",
  employment_years: "",
  dependents: ""
};

const profileBenchmark = {
  stability: 38,
  affordability: 30,
  history: 26,
  debtLoad: 72
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function parsePayload(form: FormInputs): NumericPayload | null {
  const payload: NumericPayload = {
    user_id: form.user_id.trim(),
    age: Number(form.age),
    monthly_income: Number(form.monthly_income),
    loan_amount: Number(form.loan_amount),
    loan_term_months: Number(form.loan_term_months),
    credit_history_years: Number(form.credit_history_years),
    current_debt: Number(form.current_debt),
    employment_years: Number(form.employment_years),
    dependents: Number(form.dependents)
  };

  if (!payload.user_id) {
    return null;
  }

  const numericValues = Object.entries(payload)
    .filter(([key]) => key !== "user_id")
    .map(([, value]) => value);

  return numericValues.every((value) => Number.isFinite(value)) ? payload : null;
}

function buildProfile(form: FormInputs) {
  const payload = parsePayload(form);
  if (!payload) {
    return {
      stability: 0,
      affordability: 0,
      history: 0,
      debtLoad: 0
    };
  }

  const yearlyIncome = Math.max(payload.monthly_income * 12, 1);

  return {
    stability: Math.min(100, Math.round((payload.employment_years / 10) * 100)),
    affordability: Math.min(100, Math.max(0, Math.round((1 - payload.loan_amount / yearlyIncome) * 100))),
    history: Math.min(100, Math.round((payload.credit_history_years / 12) * 100)),
    debtLoad: Math.min(100, Math.round((payload.current_debt / Math.max(payload.monthly_income, 1)) * 100))
  };
}

function getRiskBadge(risk: string) {
  if (risk === "low") {
    return "border-emerald-500/50 bg-emerald-500/20 text-emerald-400";
  }
  if (risk === "medium") {
    return "border-amber-500/50 bg-amber-500/20 text-amber-400";
  }
  return "border-rose-500/50 bg-rose-500/20 text-rose-400";
}

export function CreditForm({ language }: { language: Language }) {
  const t = text[language];
  const [form, setForm] = useState<FormInputs>(initialForm);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseJsonSafely = async <T,>(response: Response): Promise<T | null> => {
    const raw = await response.text();
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(`Request failed with status ${response.status}`);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await fetch("/api/history");
      const data = await parseJsonSafely<HistoryItem[]>(response);
      if (response.ok && data) {
        setHistory(data);
      }
    };

    void fetchHistory();
  }, []);

  const profileData = useMemo(() => {
    const profile = buildProfile(form);
    return [
      { name: t.profileAxis.stability, client: profile.stability, benchmark: profileBenchmark.stability },
      { name: t.profileAxis.affordability, client: profile.affordability, benchmark: profileBenchmark.affordability },
      { name: t.profileAxis.history, client: profile.history, benchmark: profileBenchmark.history },
      { name: t.profileAxis.debtLoad, client: profile.debtLoad, benchmark: profileBenchmark.debtLoad }
    ];
  }, [form, t.profileAxis]);

  const analytics = useMemo(() => {
    if (history.length === 0) {
      return {
        approvalRate: 0,
        avgProbability: 0,
        avgRecommendation: 0,
        totalRequests: 0
      };
    }

    const approved = history.filter((item) => item.result === "approved").length;
    const totalProbability = history.reduce((sum, item) => sum + item.probability, 0);
    const totalRecommendation = history.reduce((sum, item) => sum + item.recommendedAmount, 0);

    return {
      approvalRate: approved / history.length,
      avgProbability: totalProbability / history.length,
      avgRecommendation: totalRecommendation / history.length,
      totalRequests: history.length
    };
  }, [history]);

  const trendData = useMemo(
    () =>
      [...history]
        .slice(0, 7)
        .reverse()
        .map((item, index) => ({
          name: `${index + 1}`,
          probability: Number((item.probability * 100).toFixed(1))
        })),
    [history]
  );

  const fieldGroups: Array<Array<{ key: keyof FormInputs; type?: "text" | "number" }>> = [
    [
      { key: "user_id", type: "text" },
      { key: "age", type: "number" },
      { key: "employment_years", type: "number" },
      { key: "dependents", type: "number" }
    ],
    [
      { key: "monthly_income", type: "number" },
      { key: "loan_amount", type: "number" },
      { key: "loan_term_months", type: "number" },
      { key: "credit_history_years", type: "number" },
      { key: "current_debt", type: "number" }
    ]
  ];

  const currentFields = fieldGroups[step];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (step === 0) {
      setStep(1);
      return;
    }

    const payload = parsePayload(form);
    if (!payload) {
      setError(t.errors.invalid);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await parseJsonSafely<ScoreResponse & { message?: string }>(response)) as
        | (ScoreResponse & { message?: string })
        | null;

      if (!response.ok) {
        throw new Error(data?.message || t.errors.submit);
      }

      if (!data) {
        throw new Error(t.errors.submit);
      }

      setResult(data);

      const historyResponse = await fetch("/api/history");
      const historyData = await parseJsonSafely<HistoryItem[]>(historyResponse);
      if (historyResponse.ok && historyData) {
        setHistory(historyData);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.errors.unexpected);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 md:p-8">
      <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(145deg,rgba(15,23,42,0.94),rgba(17,24,39,0.88))] shadow-2xl shadow-black/40">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
            <div className="p-7 md:p-8">
              <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/85">
                    {t.section}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    {step === 0 ? t.stepPersonal : t.stepFinancial}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    {step === 0 ? t.subtitlePersonal : t.subtitleFinancial}
                  </p>
                </div>

                <div className="flex gap-3 text-sm">
                  {[t.stepPersonal, t.stepFinancial].map((label, index) => (
                    <div
                      key={label}
                      className={`rounded-full px-4 py-2 transition ${
                        step === index
                          ? "border border-cyan-300/30 bg-cyan-300/15 text-cyan-100"
                          : "border border-white/10 bg-white/[0.03] text-slate-400"
                      }`}
                    >
                      {index + 1}. {label}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  {currentFields.map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">
                        {t.labels[field.key]}
                      </span>
                      <input
                        type={field.type || "number"}
                        inputMode={field.type === "number" ? "decimal" : undefined}
                        value={form[field.key]}
                        placeholder={t.placeholders[field.key]}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [field.key]: event.target.value
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-300/10"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-8 flex gap-4">
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 font-semibold text-slate-200 transition hover:bg-white/[0.06]"
                    >
                      {t.back}
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-[linear-gradient(135deg,#22d3ee,#2563eb)] px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {step === 0 ? t.continue : loading ? t.loading : t.submit}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/55 p-6 shadow-xl backdrop-blur-sm">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/85">
                {t.analytics}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{t.profileChart}</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profileData}>
                  <CartesianGrid stroke="#243244" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#cbd5e1" }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px"
                    }}
                    labelStyle={{ color: "#f8fafc" }}
                  />
                  <Bar dataKey="client" radius={[10, 10, 0, 0]} fill="#38bdf8" />
                  <Bar dataKey="benchmark" radius={[10, 10, 0, 0]} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(30,41,59,0.96),rgba(49,46,129,0.45))] p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/85">
              {t.review}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{t.latestResult}</h3>

            {result ? (
              <div className="mt-6 space-y-4 text-slate-100">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-300">{t.result}</span>
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                      result.result === "approved"
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                        : "border-rose-500/50 bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {result.result}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{t.probability}</span>
                  <span className="text-xl font-semibold text-white">
                    {(result.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{t.risk}</span>
                  <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${getRiskBadge(result.riskLevel)}`}>
                    {result.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{t.recommendedAmount}</span>
                  <span className="font-semibold text-cyan-300">
                    {formatCurrency(result.recommendedAmount)}
                  </span>
                </div>
                <p className="pt-2 text-xs text-slate-400">
                  {t.applicationId}: {result.applicationId}
                </p>
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-slate-400">{t.emptyResult}</p>
            )}

            {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {[
              { label: t.approvalRate, value: `${(analytics.approvalRate * 100).toFixed(0)}%` },
              { label: t.avgProbability, value: `${(analytics.avgProbability * 100).toFixed(1)}%` },
              { label: t.avgRecommendation, value: formatCurrency(analytics.avgRecommendation) },
              { label: t.totalRequests, value: analytics.totalRequests.toString() }
            ].map((stat) => (
              <article
                key={stat.label}
                className="rounded-[24px] border border-white/10 bg-slate-900/50 p-5 shadow-lg backdrop-blur-sm"
              >
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/55 p-6 shadow-xl backdrop-blur-sm">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/85">
                {t.analytics}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">{t.scoringDynamics}</h3>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="probabilityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#243244" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="probability"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="url(#probabilityFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
