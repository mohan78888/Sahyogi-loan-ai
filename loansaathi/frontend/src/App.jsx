import { useState, useRef, useEffect } from "react";
import { post } from "./api.js";
import { LANGS, T, Q, FLOWS } from "./i18n.js";
import Passport from "./Passport.jsx";
import Navbar from "./Navbar.jsx";
import HeroCarousel from "./HeroCarousel.jsx";
import LandingPage from "./LandingPage.jsx";
import FintechDashboard from "./FintechDashboard.jsx";

const CATEGORIES = ["student", "farmer", "business", "personal"];
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function buildPayload(category, goal, a) {
  const payload = {
    category,
    goal,
    amount: a.amount,
    tenure_months: a.tenure_months,
    monthly_expenses: a.monthly_expenses ?? 0,
    existing_emis: a.existing_emis ?? 0,
    crop_income_drop_pct: 30,
  };
  if (a.annual_rate_pct !== undefined) payload.annual_rate_pct = a.annual_rate_pct;
  if (a.moratorium_months !== undefined) payload.moratorium_months = a.moratorium_months;
  if (a.monthly_income !== undefined) payload.monthly_income = a.monthly_income;
  if (category === "farmer") {
    payload.seasonal_income = Object.fromEntries(
      MONTHS.map((m) => [m, m === "Apr" ? a.rabi ?? 0 : m === "Oct" ? a.kharif ?? 0 : 0]),
    );
  }
  return payload;
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [category, setCategory] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [passport, setPassport] = useState(null);
  const [showApp, setShowApp] = useState(false); // controls landing vs questionnaire view
  const [viewMode, setViewMode] = useState("fintech"); // "fintech" | "landing" | "intake"

  const appRef = useRef(null);

  const t = (k) => T[k][lang];
  const flow = category ? FLOWS[category] : [];
  const qid = flow[step];
  const q = qid ? Q[qid] : null;
  const done = category && step >= flow.length;

  function reset() {
    setCategory(null);
    setStep(0);
    setAnswers({});
    setHistory([]);
    setValue("");
    setPassport(null);
    setError(false);
    setShowApp(false);
    setViewMode("fintech");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectCategory(cat) {
    if (cat) {
      setCategory(cat);
    }
    setShowApp(true);
    // Scroll to top of app section
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }

  function submit(skip = false) {
    const key = q.key ?? qid;
    let shown = "—";
    const next = { ...answers };
    if (!skip) {
      const n = Number(value);
      if (value === "" || Number.isNaN(n) || n < 0) return;
      if (!q.optional && n === 0 && (key === "amount" || key === "tenure_months")) return;
      next[key] = n;
      shown = `${q.prefix ?? ""}${n}${q.suffix ? " " + q.suffix : ""}`;
    }
    setHistory([...history, { q: q.q[lang], a: shown }]);
    setAnswers(next);
    setValue("");
    setStep(step + 1);
  }

  function back() {
    if (step === 0) {
      setCategory(null);
      return;
    }
    const prev = history[history.length - 1];
    const prevId = flow[step - 1];
    const prevKey = Q[prevId].key ?? prevId;
    const next = { ...answers };
    delete next[prevKey];
    setAnswers(next);
    setHistory(history.slice(0, -1));
    setStep(step - 1);
    setValue(prev && prev.a !== "—" ? String(answers[prevKey] ?? "") : "");
  }

  async function build() {
    setLoading(true);
    setError(false);
    try {
      const goal = T[category].en;
      setPassport(await post("/passport", buildPayload(category, goal, answers)));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // ─── If viewMode is fintech, show complete modern fintech dashboard ───
  if (viewMode === "fintech") {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar
          lang={lang}
          setLang={setLang}
          LANGS={LANGS}
          t={t}
          onGetStarted={() => setViewMode("intake")}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <FintechDashboard lang={lang} t={t} />
      </div>
    );
  }

  // ─── If viewMode is landing page ───
  if (viewMode === "landing") {
    return (
      <div className="min-h-screen">
        <Navbar
          lang={lang}
          setLang={setLang}
          LANGS={LANGS}
          t={t}
          onGetStarted={() => setViewMode("intake")}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <HeroCarousel onSelectCategory={(cat) => { setCategory(cat); setViewMode("intake"); }} />
        <LandingPage onSelectCategory={(cat) => { setCategory(cat); setViewMode("intake"); }} />
      </div>
    );
  }

  // ─── Questionnaire / Passport view ───
  return (
    <div className="min-h-screen bg-gradient-to-b from-leaf-50 to-white">
      {/* Simplified top navbar for questionnaire */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <button
            onClick={reset}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-leaf-500 to-leaf-700 shadow-md shadow-leaf-600/20">
              <span className="text-sm font-bold text-white">SL</span>
            </div>
            <span className="text-lg font-bold text-leaf-700">
              Sahyogi <span className="text-saffron-500">Loan AI</span>
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex gap-0.5 rounded-full bg-leaf-50 p-0.5">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    lang === l.id
                      ? "bg-leaf-600 text-white shadow-sm"
                      : "text-ink/60 hover:text-leaf-700"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              onClick={reset}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink/50 hover:text-ink/70 hover:bg-leaf-50 transition-all"
            >
              ← Home
            </button>
          </div>
        </div>
      </nav>

      <div ref={appRef} className="mx-auto min-h-[calc(100vh-60px)] max-w-3xl px-4 py-6">
        <p className="no-print mb-4 rounded-xl bg-saffron-100/70 backdrop-blur-sm px-4 py-2.5 text-xs text-saffron-700 ring-1 ring-saffron-200/50">
          {t("notLender")}
        </p>

        {passport ? (
          <Passport data={passport} t={t} onReset={reset} />
        ) : (
          <main className="space-y-3">
            {!category && (
              <section className="animate-fade-in rounded-2xl bg-white p-6 shadow-sm ring-1 ring-leaf-100/50">
                <h2 className="mb-4 text-lg font-semibold text-ink">{t("pickGoal")}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className="group relative overflow-hidden rounded-xl border border-leaf-100 bg-gradient-to-br from-white to-leaf-50/50 px-5 py-5 text-left font-medium transition-all duration-300 hover:border-leaf-400 hover:shadow-md hover:shadow-leaf-600/5 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <span className="text-xl">
                          {c === "student" ? "🎓" : c === "farmer" ? "🌾" : c === "business" ? "🏪" : "🏠"}
                        </span>
                        <span>{t(c)}</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-leaf-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {category && (
              <section className="space-y-3">
                {/* Progress bar */}
                <div className="rounded-full bg-leaf-100 h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-leaf-500 to-leaf-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(step / flow.length) * 100}%` }}
                  />
                </div>

                {history.map((h, i) => (
                  <div key={i} className="space-y-1 animate-fade-in">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm shadow-sm ring-1 ring-leaf-100/30">{h.q}</div>
                    <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-leaf-600 to-leaf-700 px-4 py-2.5 text-sm text-white shadow-sm">
                      {h.a}
                    </div>
                  </div>
                ))}

                {!done && q && (
                  <div className="animate-slide-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-leaf-100/30">
                    <label htmlFor="answer" className="mb-3 block font-medium text-ink">
                      {q.q[lang]}
                    </label>
                    <div className="flex items-center gap-2">
                      {q.prefix && <span className="text-ink/50 font-medium">{q.prefix}</span>}
                      <input
                        id="answer"
                        type="number"
                        min="0"
                        inputMode="decimal"
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submit()}
                        className="w-full rounded-xl border border-leaf-100 bg-leaf-50/30 px-4 py-3 outline-none transition-all focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/20 focus:bg-white"
                      />
                      {q.suffix && <span className="whitespace-nowrap text-sm text-ink/50">{q.suffix}</span>}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={back} className="rounded-xl px-4 py-2.5 text-sm text-ink/60 hover:bg-leaf-50 transition-all">
                        {t("back")}
                      </button>
                      <button onClick={() => submit()} className="rounded-xl bg-gradient-to-r from-leaf-600 to-leaf-700 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-leaf-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
                        {t("next")}
                      </button>
                      {q.optional && (
                        <button onClick={() => submit(true)} className="rounded-xl border border-leaf-100 px-4 py-2.5 text-sm hover:bg-leaf-50 transition-all">
                          {t("skip")}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {done && (
                  <div className="animate-slide-up rounded-2xl bg-white p-6 shadow-sm ring-1 ring-leaf-100/30">
                    <button
                      onClick={build}
                      disabled={loading}
                      className="w-full rounded-xl bg-gradient-to-r from-leaf-600 to-leaf-700 px-5 py-4 font-semibold text-white shadow-lg shadow-leaf-600/20 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t("working")}
                        </span>
                      ) : t("build")}
                    </button>
                    {error && <p role="alert" className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{t("error")}</p>}
                    <button onClick={back} className="mt-3 text-sm text-ink/50 underline hover:text-ink/70 transition-colors">{t("back")}</button>
                  </div>
                )}
              </section>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
