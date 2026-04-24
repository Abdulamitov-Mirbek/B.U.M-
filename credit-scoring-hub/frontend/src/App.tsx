import { CreditForm } from "./components/CreditForm";

export default function App() {
  return (
    <>
    <main className="min-h-screen px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full border border-cyan-400/40 px-4 py-1 text-sm text-cyan-300">
              Credit Scoring Hub
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
              One application flow for web, backend, ML, database, and Telegram.
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              This demo follows the hackathon architecture: React sends an application to Node,
              Node stores it in PostgreSQL with Prisma, FastAPI calculates the score, and the same
              API is reused by the Telegram bot.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Flow</p>
            <div className="mt-4 space-y-3 text-slate-200">
              <p>1. Collect 8 scoring fields plus `user_id`.</p>
              <p>2. Save application in PostgreSQL through Prisma.</p>
              <p>3. Request probability from FastAPI ML service.</p>
              <p>4. Return decision, risk level, and recommendation.</p>
              <p>5. Reuse the same endpoint in Telegram FSM.</p>
            </div>
          </div>
        </div>
        <CreditForm />
      </div>
    </main>
    </>
  );
}
