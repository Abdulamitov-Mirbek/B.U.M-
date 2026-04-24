import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type FormState = {
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
  userId: string;
  probability: number;
  result: string;
  riskLevel: string;
  recommendedAmount: number;
  createdAt: string;
};

type TextField = {
  key: "user_id";
  label: string;
  kind: "text";
};

type NumberField = {
  key: Exclude<keyof FormState, "user_id">;
  label: string;
  kind: "number";
  min?: number;
  step?: number;
};

const initialForm: FormState = {
  user_id: "demo-user-001",
  age: 30,
  monthly_income: 8000,
  loan_amount: 20000,
  loan_term_months: 24,
  credit_history_years: 5,
  current_debt: 1500,
  employment_years: 4,
  dependents: 1
};

const personalFields: Array<TextField | NumberField> = [
  { key: "user_id", label: "User ID", kind: "text" },
  { key: "age", label: "Age", kind: "number", min: 18 },
  { key: "employment_years", label: "Employment years", kind: "number", min: 0, step: 0.5 },
  { key: "dependents", label: "Dependents", kind: "number", min: 0 }
];

const financialFields: NumberField[] = [
  { key: "monthly_income", label: "Monthly income", kind: "number", min: 0, step: 100 },
  { key: "loan_amount", label: "Loan amount", kind: "number", min: 0, step: 100 },
  { key: "loan_term_months", label: "Loan term (months)", kind: "number", min: 1 },
  { key: "credit_history_years", label: "Credit history (years)", kind: "number", min: 0, step: 0.5 },
  { key: "current_debt", label: "Current debt", kind: "number", min: 0, step: 100 }
];

const riskyBenchmark = {
  stability: 32,
  affordability: 28,
  creditDepth: 22,
  debtLoad: 76
};

function normalizeProfile(form: FormState) {
  const affordabilityBase = Math.max(form.monthly_income * 12, 1);
  return {
    stability: Math.min(100, Math.round((form.employment_years / 10) * 100)),
    affordability: Math.min(100, Math.round((1 - form.loan_amount / affordabilityBase) * 100)),
    creditDepth: Math.min(100, Math.round((form.credit_history_years / 12) * 100)),
    debtLoad: Math.min(100, Math.round((form.current_debt / Math.max(form.monthly_income, 1)) * 100))
  };
}

export function CreditForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    const response = await fetch("/api/history");
    if (!response.ok) {
      throw new Error("Unable to load history");
    }
    const data = await response.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory().catch(() => {
      setError("History is temporarily unavailable.");
    });
  }, []);

  const chartData = useMemo(() => {
    const profile = normalizeProfile(form);
    return [
      { name: "Stability", profile: profile.stability, risky: riskyBenchmark.stability },
      { name: "Affordability", profile: profile.affordability, risky: riskyBenchmark.affordability },
      { name: "Credit Depth", profile: profile.creditDepth, risky: riskyBenchmark.creditDepth },
      { name: "Debt Load", profile: profile.debtLoad, risky: riskyBenchmark.debtLoad }
    ];
  }, [form]);

  const currentFields = step === 0 ? personalFields : financialFields;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (step === 0) {
      setStep(1);
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
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Scoring failed");
      }

      setResult(data);
      await fetchHistory();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Stepper</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {step === 0 ? "Personal profile" : "Financial profile"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {["Personal", "Financial"].map((label, index) => (
                <div
                  key={label}
                  className={`rounded-full px-4 py-2 ${
                    step === index
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 text-slate-300"
                  }`}
                >
                  {index + 1}. {label}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              {currentFields.map((field) => (
                <label key={field.key} className="text-sm text-slate-200">
                  <span className="mb-2 block">{field.label}</span>
                  {field.kind === "text" ? (
                    <input
                      type="text"
                      value={form.user_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          user_id: event.target.value
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    />
                  ) : (
                    <input
                      type="number"
                      min={field.min}
                      step={field.step}
                      value={form[field.key]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [field.key]: Number(event.target.value)
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-slate-200"
                >
                  Back
                </button>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {step === 0 ? "Continue" : loading ? "Scoring..." : "Check application"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <div className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Insight</p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Profile vs typical default-risk customer
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="profile" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`profile-${entry.name}`}
                      fill={entry.name === "Debt Load" ? "#fb7185" : "#22d3ee"}
                    />
                  ))}
                </Bar>
                <Bar dataKey="risky" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/80">Decision</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Latest scoring result</h3>
          {result ? (
            <div className="mt-5 space-y-3 text-slate-100">
              <p>Result: {result.result}</p>
              <p>Probability: {(result.probability * 100).toFixed(1)}%</p>
              <p>Risk level: {result.riskLevel}</p>
              <p>Recommended amount: ${result.recommendedAmount.toFixed(2)}</p>
              <p className="text-xs text-slate-300">Application ID: {result.applicationId}</p>
            </div>
          ) : (
            <p className="mt-5 text-slate-200">
              Finish both steps to get a model decision and a recommendation.
            </p>
          )}
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">History</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Recent applications</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                fetchHistory().catch(() => {
                  setError("History is temporarily unavailable.");
                });
              }}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-slate-400">No applications yet.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-900/70 p-4 text-sm text-slate-200">
                  <p>User: {item.userId}</p>
                  <p>Result: {item.result}</p>
                  <p>Probability: {(item.probability * 100).toFixed(1)}%</p>
                  <p>Risk: {item.riskLevel}</p>
                  <p>Recommended: ${item.recommendedAmount.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
