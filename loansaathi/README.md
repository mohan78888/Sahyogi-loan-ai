# Sahyogi Loan AI: Prototype Guide

A decision-support prototype. It is not a lender, credit bureau or approval authority.

## Run it

```bash
# Terminal 1: backend (Python 3.11+)
cd backend
pip install -r requirements.txt
python -m pytest -q            # 16 tests should pass
uvicorn main:app --port 8000

# Terminal 2: frontend (Node 18+)
cd frontend
npm install
npm run dev                    # http://localhost:5173 (proxies /api to :8000)
```

## What is built, and what is not

| Brief feature | Status | Notes |
|---|---|---|
| EMI and total-cost calculator | **Built** | Reducing-balance EMI, optional processing fee, optional moratorium. Hand-checked against independent calculations. |
| Financial Readiness Passport | **Built** | Goal, cost, stress test, schemes, checklist, lender questions, cautions, next steps, print/PDF. |
| Repayment stress test | **Built** | Income 0 / -20 / -40%. Farmer flow uses a 12-month seasonal cash chart with a 30% lower crop income case. |
| Conversational intake | **Partly** | One question at a time, in English, Hindi and Hinglish. It is rule-based, with no LLM and no voice. |
| Loan and scheme explorer | **Partly** | Six entries of **sample data**, each labelled "Sample data" and "not yet verified" with an official link. You must verify these before the demo. |
| Scam / hidden-charge red flags | **Partly** | Static checklist of warning signs. No analysis of a user's actual offer. |
| Document checklist | **Built** | Tickable checklist per category. No OCR. |
| Form-filling companion | Not built | |
| Document OCR assistant | Not built | |
| Agreement simplifier (stretch) | Not built | |
| Database / accounts | Not built | Nothing is stored. That is deliberate for privacy, so you can say so in the pitch. |

Other limits:

- Passport body text, scheme text and links are English only. Only the intake UI is translated.
- The pressure labels use heuristics I chose: **high** when income does not cover expenses plus EMI, **medium** when EMI is over 40% of income or less than 10% of income is left. These are not official thresholds. Say "illustrative" if asked.
- With a moratorium, interest is assumed to accrue and be added to principal before EMIs start. This is conservative and is stated in the assumptions.

## Verify these before the demo

1. Open every `source_url` in `backend/data.py`, confirm the page still exists, and confirm the scheme description is accurate and current. Then set `last_checked` (for example `"2026-11-02"`) and drop `"sample": True` only for entries you actually verified. The brief's success metric is "percentage of scheme claims with working official sources", so judges may test this.
2. Replace the sample rates with figures from the lender's or scheme's official page, or keep them labelled as samples.
3. Some entries (such as the education interest subsidy) are deliberately worded as "check current status" because scheme rules change.

## Demo numbers (computed by the engine, hand-checked)

**Student**: ₹6,00,000 for 84 months, 12-month moratorium, 9.5% sample rate.
- EMI **₹10,738**, total repayment **₹9,01,992**, total interest **₹3,01,992**.
- Expected salary ₹25,000, expenses ₹9,000. Left after EMI: **₹5,262** (medium), **₹262** with 20% lower salary (medium), **-₹4,738** with 40% lower salary (high).

**Farmer**: ₹2,50,000 for 48 months, 9% sample rate.
- EMI **₹6,221**, total repayment **₹2,98,621**, total interest **₹48,621**.
- Income ₹90,000 around April and ₹80,000 around October, expenses ₹7,000 a month. Lowest cumulative cash: **₹10,672** as expected, **-₹39,655** if crop income is 30% lower.

## 48-hour plan (assumes 2 to 3 people; adjust to your team)

| Hours | Frontend / UX | Backend / data | Pitch |
|---|---|---|---|
| 0-6 | Lock the two demo journeys. Run the starter app. | Run tests. Verify scheme links and fill `last_checked`. | Draft the 3-minute story. |
| 6-14 | Polish the passport layout on a phone. | Add a "compare two lender quotes" endpoint (see below). | Collect 2 real-looking, clearly fictional personas. |
| 14-24 | Add intake edge cases (invalid input, back button). | Add an LLM explanation layer only if permitted, with numbers passed in, never generated. | Record backup screen capture of both flows. |
| 24-34 | Hindi/Hinglish pass on passport headings. Test on a real phone. | Add 3+ scenario tests. | Write judge Q&A. |
| 34-42 | Fix spacing, accessibility, print layout. | Deploy (Vercel + Render/Railway), check HTTPS and CORS. | Rehearse twice with a timer. |
| 42-48 | Freeze. Bug fixes only. | Freeze. Check the deployed URL. | Final rehearsal, backup video ready. |

Before deploying, change `allow_origins` in `backend/main.py` from `http://localhost:5173` to your deployed frontend URL.

## 3-minute demo script

1. **Hook (20s):** "Most borrowers sign without knowing the total cost or what happens if income drops. Sahyogi Loan AI fixes that before they commit."
2. **Student (70s):** Choose "College / studies". Answer in Hinglish: ₹6 lakh, 84 months, 12-month moratorium. Show EMI ₹10,738 and total interest ₹3,01,992. Point at the stress test: "At 40% lower salary, this plan goes negative." Tick two documents and show the lender questions.
3. **Farmer (50s):** Show the seasonal chart: income arrives twice a year, EMI every month. "If the crop is 30% down, the cash position goes negative. A flat monthly view would hide this."
4. **Trust (25s):** "Every number comes from tested code, not the AI. Samples are labelled. We never promise approval and we store nothing."
5. **Close (15s):** the pitch line from the brief.

## Likely judge questions

- **Where do the numbers come from?** A deterministic engine with unit tests against hand calculations. An LLM, if used, only explains numbers it is given.
- **Are the scheme details real?** Entries marked "Sample data" are placeholders. Verified ones link to the official source with a check date. Do not claim more than you have verified.
- **Is this a credit score?** No. The pressure labels are an illustrative budget check, not creditworthiness.
- **What about privacy?** Nothing is stored. Inputs live in the browser and are sent only to calculate.
- **How is this different from a bank EMI calculator?** It adds income-shock testing, seasonal farm cash flow, a preparation plan and scam warnings in the borrower's language.
- **How would you make money?** The brief treats this as a hypothesis. Free for individuals, B2B for institutions, and only disclosed, unbiased referrals. Validate with colleges and farmer groups first.
- **What if the rate is wrong?** The user can enter the lender's rate and rerun it. The passport states the rate used and whether it is a sample.

## Review of the brief: gaps and risks

**Gaps**
- The brief promises voice input, OCR, form-filling and an agreement simplifier, but the 48-hour table only covers calculator, intake, one flow and stress test. Treat the rest as roadmap slides, not demo features.
- "Verified" scheme data is the hardest part and the easiest to get wrong. Budget real time for it.
- Success metrics (time to plan, comprehension before/after) need a tiny user test. Even 5 people in your college, before and after, is a credible data point.

**Risks**
- Stale or incorrect scheme information is the biggest trust risk. Prefer fewer, verified entries over many unverified ones.
- Showing an interest rate as if it were a quote. Keep the "SAMPLE" label visible.
- Over-claiming AI. The strongest story is "transparent calculations plus guidance", as the brief itself says.

**Ways to stand out (highest value first)**
1. **Compare two lender offers** side by side, including fees and effective total cost. This directly serves the hidden-charge idea with real user data.
2. **Break-even income:** show the minimum income at which the plan stays safe, rather than only fixed -20/-40% cases.
3. **Offer review for red flags:** let the user enter a quote's fees and flag unusual or unexplained ones, with evidence and no accusations.
4. **Low-bandwidth / WhatsApp-style channel** for farmers, if you can show even a mock.
