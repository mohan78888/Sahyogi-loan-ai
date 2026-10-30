import { useState } from "react";
import { inr } from "./api.js";

const BADGE = {
  low: "bg-leaf-100 text-leaf-700",
  medium: "bg-saffron-100 text-saffron-700",
  high: "bg-red-100 text-red-800",
};

const APPROVAL_BADGE = {
  high: { bg: "bg-gradient-to-r from-leaf-500 to-leaf-600", text: "text-white", label: "Strong" },
  medium: { bg: "bg-gradient-to-r from-saffron-400 to-saffron-500", text: "text-white", label: "Moderate" },
  low: { bg: "bg-gradient-to-r from-red-500 to-red-600", text: "text-white", label: "Weak" },
};

function Card({ title, icon, children, accent }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-sm ${accent ? 'ring-2 ring-leaf-200' : ''}`}>
      <h2 className="mb-3 text-lg font-semibold text-leaf-700 flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-leaf-50 p-3">
      <div className="text-xs text-ink/60">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function CashChart({ normal, reduced }) {
  const W = 560, H = 180, P = 28;
  const all = [...normal, ...reduced].map((r) => r.cash_position);
  const min = Math.min(0, ...all), max = Math.max(0, ...all);
  const span = max - min || 1;
  const x = (i) => P + (i * (W - 2 * P)) / (normal.length - 1);
  const y = (v) => H - P - ((v - min) / span) * (H - 2 * P);
  const line = (rows) => rows.map((r, i) => `${x(i)},${y(r.cash_position)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Cumulative cash position by month">
      <line x1={P} x2={W - P} y1={y(0)} y2={y(0)} stroke="#999" strokeDasharray="4 4" />
      <polyline fill="none" stroke="#2f855a" strokeWidth="2.5" points={line(normal)} />
      <polyline fill="none" stroke="#c53030" strokeWidth="2.5" points={line(reduced)} />
      {normal.map((r, i) => (
        <text key={r.month} x={x(i)} y={H - 6} fontSize="10" textAnchor="middle" fill="#555">
          {r.month}
        </text>
      ))}
    </svg>
  );
}

/* ─── Approval Gauge ─── */
function ApprovalGauge({ pct }) {
  const angle = (pct / 100) * 180 - 90; // -90 to 90 degrees
  const color = pct >= 70 ? "#2f855a" : pct >= 45 ? "#d69e2e" : "#c53030";
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-48 h-auto">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 251.2} 251.2`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Percentage text */}
        <text x="100" y="85" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>
          {pct}%
        </text>
        <text x="100" y="105" textAnchor="middle" fontSize="11" fill="#666">
          approval chance
        </text>
      </svg>
    </div>
  );
}

/* ─── ML Insights Section ─── */
function MLInsights({ ml }) {
  if (!ml) return null;

  return (
    <>
      {/* 1. Approval Prediction */}
      {ml.approval && (
        <Card title="AI Approval Prediction" icon="🤖" accent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ApprovalGauge pct={ml.approval.approval_pct} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${APPROVAL_BADGE[ml.approval.label].bg} ${APPROVAL_BADGE[ml.approval.label].text}`}>
                  {APPROVAL_BADGE[ml.approval.label].label} Chance
                </span>
              </div>
              <p className="text-sm text-ink/80">{ml.approval.message}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-leaf-50 p-2">
                  <span className="text-ink/50">EMI-to-Income</span>
                  <div className="font-bold">{ml.approval.emi_to_income_pct}%</div>
                </div>
                <div className="rounded-lg bg-leaf-50 p-2">
                  <span className="text-ink/50">Loan-to-Income</span>
                  <div className="font-bold">{ml.approval.loan_to_income_ratio}×</div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk & Positive Factors */}
          {ml.approval.risk_factors.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-red-700 mb-1">⚠ Risk Factors</div>
              <ul className="space-y-1">
                {ml.approval.risk_factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs">
                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${f.severity === "high" ? "bg-red-500" : "bg-saffron-500"}`} />
                    <span><b>{f.factor}:</b> {f.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ml.approval.positive_factors.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-semibold text-leaf-700 mb-1">✓ Positive Factors</div>
              <ul className="space-y-1">
                {ml.approval.positive_factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-leaf-50 px-3 py-2 text-xs">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-leaf-500" />
                    <span><b>{f.factor}:</b> {f.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-[10px] text-ink/40 italic">{ml.approval.disclaimer}</p>
        </Card>
      )}

      {/* 2. Tenure Optimization */}
      {ml.tenure_optimization && ml.tenure_optimization.optimal && (
        <Card title="Smart Tenure Advisor" icon="📊">
          <div className="rounded-xl bg-gradient-to-r from-leaf-50 to-leaf-100/50 p-4 mb-3">
            <p className="text-sm font-medium text-leaf-800">{ml.tenure_optimization.analysis}</p>
          </div>
          {ml.tenure_optimization.sample_options && ml.tenure_optimization.sample_options.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-ink/60">
                    <th className="py-2 pr-2">Tenure</th>
                    <th className="pr-2">EMI</th>
                    <th className="pr-2">Total Interest</th>
                    <th className="pr-2">Surplus</th>
                    <th>Pressure</th>
                  </tr>
                </thead>
                <tbody>
                  {ml.tenure_optimization.sample_options.map((o) => (
                    <tr
                      key={o.tenure_months}
                      className={`border-b last:border-0 ${
                        ml.tenure_optimization.optimal &&
                        o.tenure_months === ml.tenure_optimization.optimal.tenure_months
                          ? "bg-leaf-50 font-medium"
                          : ""
                      }`}
                    >
                      <td className="py-2 pr-2">
                        {o.tenure_months} mo
                        {ml.tenure_optimization.optimal &&
                          o.tenure_months === ml.tenure_optimization.optimal.tenure_months && (
                            <span className="ml-1 rounded-full bg-leaf-600 px-2 py-0.5 text-[10px] text-white">
                              Best
                            </span>
                          )}
                      </td>
                      <td className="pr-2">{inr(o.monthly_emi)}</td>
                      <td className="pr-2">{inr(o.total_interest)}</td>
                      <td className="pr-2">{inr(o.surplus_after_emi)}</td>
                      <td>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[o.pressure]}`}>
                          {o.pressure}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-2 text-[10px] text-ink/40 italic">{ml.tenure_optimization.disclaimer}</p>
        </Card>
      )}

      {/* 3. Break-Even Income */}
      {ml.break_even && (
        <Card title="Minimum Safe Income" icon="💰">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl bg-gradient-to-br from-saffron-50 to-saffron-100/50 p-4 text-center">
              <div className="text-xs text-saffron-600 font-medium">Minimum Income Needed</div>
              <div className="text-2xl font-bold text-saffron-700 mt-1">{inr(ml.break_even.minimum_income)}</div>
              <div className="text-[10px] text-saffron-600/70 mt-0.5">per month</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-leaf-50 to-leaf-100/50 p-4 text-center">
              <div className="text-xs text-leaf-600 font-medium">Recommended (with buffer)</div>
              <div className="text-2xl font-bold text-leaf-700 mt-1">{inr(ml.break_even.safe_income)}</div>
              <div className="text-[10px] text-leaf-600/70 mt-0.5">per month (10% buffer)</div>
            </div>
          </div>
          <p className="text-sm text-ink/70">{ml.break_even.explanation}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-ink/60">
                  <th className="py-2 pr-2">Scenario</th>
                  <th className="pr-2">Income</th>
                  <th className="pr-2">Surplus</th>
                  <th>Pressure</th>
                </tr>
              </thead>
              <tbody>
                {ml.break_even.scenarios.map((s) => (
                  <tr key={s.label} className="border-b last:border-0">
                    <td className="py-2 pr-2">{s.label}</td>
                    <td className="pr-2">{inr(s.income)}</td>
                    <td className="pr-2">{inr(s.surplus)}</td>
                    <td>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[s.pressure]}`}>
                        {s.pressure}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-ink/40 italic">{ml.break_even.disclaimer}</p>
        </Card>
      )}
    </>
  );
}

export default function Passport({ data, t, onReset }) {
  const [ready, setReady] = useState(() => new Set(data.checklist.filter((c) => c.ready).map((c) => c.document)));
  const toggle = (d) => {
    const n = new Set(ready);
    n.has(d) ? n.delete(d) : n.add(d);
    setReady(n);
  };
  const missing = data.checklist.filter((c) => !ready.has(c.document)).length;
  const c = data.cost;
  const ml = data.ml_insights;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-leaf-700 p-5 text-white shadow-sm">
        <div className="text-xs uppercase tracking-wide opacity-80">Financial Readiness Passport</div>
        <div className="mt-1 text-xl font-bold">{data.goal}</div>
        <div className="mt-1 text-xs opacity-80">Generated {data.generated_on}</div>
        {ml && (
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">✨ AI-Enhanced</span>
            <span className="text-[10px] opacity-70">Includes ML-powered insights</span>
          </div>
        )}
        <p className="mt-3 rounded-lg bg-white/10 p-3 text-xs">{data.disclaimer}</p>
      </div>

      <Card title="Estimated cost" icon="🧮">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Monthly EMI" value={inr(c.monthly_emi)} />
          <Stat label="Total repayment" value={inr(c.total_repayment)} />
          <Stat label="Total interest" value={inr(c.total_interest)} />
          <Stat label="Rate used" value={`${c.annual_rate_pct}%`} />
        </div>
        {c.processing_fee !== null && (
          <p className="mt-2 text-sm">Processing fee: {inr(c.processing_fee)} · Total with fee: {inr(c.total_cost_with_fee)}</p>
        )}
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-ink/70">
          {c.assumptions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </Card>

      {/* ─── ML Insights (right after cost, before stress test) ─── */}
      <MLInsights ml={ml} />

      {data.stress_test && (
        <Card title="Repayment stress test" icon="📉">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-ink/60">
                  <th className="py-2 pr-2">Scenario</th>
                  <th className="pr-2">Income</th>
                  <th className="pr-2">Left after EMI</th>
                  <th>Pressure</th>
                </tr>
              </thead>
              <tbody>
                {data.stress_test.map((s) => (
                  <tr key={s.name} className="border-b last:border-0">
                    <td className="py-2 pr-2">{s.name}</td>
                    <td className="pr-2">{inr(s.monthly_income)}</td>
                    <td className="pr-2">{inr(s.surplus_after_loan)}</td>
                    <td>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[s.pressure]}`}>{s.pressure}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-ink/60">{data.stress_test[data.stress_test.length - 1].note}</p>
        </Card>
      )}

      {data.seasonal_stress_test && (
        <Card title="Seasonal cash position (12 months)" icon="🌾">
          <CashChart normal={data.seasonal_stress_test.normal} reduced={data.seasonal_stress_test.reduced} />
          <div className="mt-2 flex gap-4 text-xs">
            <span><span className="font-bold text-leaf-600">━</span> Expected income</span>
            <span><span className="font-bold text-red-600">━</span> Crop income {data.seasonal_stress_test.crop_income_drop_pct}% lower</span>
          </div>
          <p className="mt-2 text-sm">
            Lowest point: {inr(data.seasonal_stress_test.lowest_cash_normal)} expected,{" "}
            {inr(data.seasonal_stress_test.lowest_cash_reduced)} if income is lower.
          </p>
          <p className="mt-1 text-xs text-ink/60">{data.seasonal_stress_test.note}</p>
        </Card>
      )}

      {/* Schemes — now with match scores from ML */}
      <Card title="Options to explore" icon="🎯">
        <div className="space-y-3">
          {data.schemes.map((s) => (
            <div key={s.id} className="rounded-xl border border-leaf-100 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{s.name}</span>
                {s.match_score !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    s.match_score >= 75 ? "bg-leaf-100 text-leaf-700" :
                    s.match_score >= 50 ? "bg-saffron-100 text-saffron-700" :
                    "bg-red-50 text-red-700"
                  }`}>
                    {s.match_score}% match
                  </span>
                )}
                {s.match_label && (
                  <span className="text-xs text-ink/50">{s.match_label}</span>
                )}
                {s.sample && <span className="rounded-full bg-saffron-100 px-2 py-0.5 text-xs text-saffron-700">Sample data</span>}
              </div>
              <p className="mt-1 text-sm text-ink/80">{s.summary}</p>
              {s.match_reasons && s.match_reasons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.match_reasons.map((r, i) => (
                    <span key={i} className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] text-leaf-700">
                      {r}
                    </span>
                  ))}
                </div>
              )}
              <ul className="mt-2 list-disc pl-5 text-xs text-ink/70">
                {s.eligibility.map((e) => <li key={e}>{e}</li>)}
              </ul>
              <a href={s.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-leaf-600 underline">
                {s.source_name} (official)
              </a>
              <span className="ml-2 text-xs text-ink/50">{s.last_checked ? `checked ${s.last_checked}` : "not yet verified"}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title={`Document checklist (${missing} to gather)`} icon="📋">
        <ul className="space-y-2">
          {data.checklist.map((d) => (
            <li key={d.document}>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={ready.has(d.document)} onChange={() => toggle(d.document)} className="mt-1" />
                <span className={ready.has(d.document) ? "text-ink/50 line-through" : ""}>{d.document}</span>
              </label>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Questions to ask the lender" icon="❓">
        <ul className="list-disc space-y-1 pl-5 text-sm">{data.lender_questions.map((x) => <li key={x}>{x}</li>)}</ul>
      </Card>

      <Card title="Watch out for" icon="🚩">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {[...data.cautions, ...data.red_flags].map((x) => <li key={x}>{x}</li>)}
        </ul>
      </Card>

      <Card title="Next steps" icon="🚀">
        <ol className="list-decimal space-y-1 pl-5 text-sm">{data.next_steps.map((x) => <li key={x}>{x}</li>)}</ol>
      </Card>

      <div className="no-print flex gap-2">
        <button onClick={() => window.print()} className="rounded-lg bg-leaf-600 px-5 py-2 text-sm font-medium text-white hover:bg-leaf-700">{t("print")}</button>
        <button onClick={onReset} className="rounded-lg border border-leaf-100 bg-white px-5 py-2 text-sm hover:bg-leaf-50">{t("startOver")}</button>
      </div>
    </div>
  );
}

