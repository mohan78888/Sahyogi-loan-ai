import { useState, useEffect, useRef } from "react";

/* ───────────────── SERVICE CARDS ───────────────── */
const SERVICES = [
  {
    id: "farmer",
    icon: "🌾",
    color: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    title: "Kisan Loan",
    subtitle: "For India's Farmers",
    desc: "Get AI-powered loan analysis tailored to your crop cycles, seasonal income, and farming needs. We help you understand KCC, PM-KISAN schemes & more.",
    features: ["Seasonal income mapping", "Crop cycle EMI planning", "Government scheme matching", "Stress-test for bad harvests"],
  },
  {
    id: "student",
    icon: "🎓",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    title: "Student Loan",
    subtitle: "For Future Leaders",
    desc: "Understand the true cost of education loans. Factor in moratorium periods, expected salary, and plan your post-graduation EMI confidently.",
    features: ["Moratorium period analysis", "Post-graduation EMI planning", "Scholarship alternatives", "Interest subsidy schemes"],
  },
  {
    id: "personal",
    icon: "🏠",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "Aam Aadmi Loan",
    subtitle: "For Every Indian Family",
    desc: "Personal and emergency loans made transparent. See the real cost, compare options, and build your financial readiness passport before visiting the bank.",
    features: ["True cost calculation", "EMI affordability check", "Emergency fund planning", "Lender comparison guide"],
  },
  {
    id: "business",
    icon: "🏪",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    title: "Business Loan",
    subtitle: "For Entrepreneurs",
    desc: "Shop, MSME or startup — get clear guidance on working capital loans, Mudra Yojana, and prepare all documents the bank will ask for.",
    features: ["MSME scheme matching", "Document checklist", "Cash flow analysis", "Repayment stress testing"],
  },
];

/* ───────────────── WHY CHOOSE US ───────────────── */
const WHY_US = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "100% Free & Safe",
    desc: "We're not a lender. We never ask for bank details. Your data stays on your device.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "AI-Powered Analysis",
    desc: "Smart algorithms analyze your income, expenses & seasonal patterns to give personalized advice.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
      </svg>
    ),
    title: "Government Schemes",
    desc: "We match you with PM-KISAN, Mudra, education subsidies & other schemes you may be eligible for.",
    color: "text-saffron-700",
    bg: "bg-saffron-100",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    title: "Multi-Language",
    desc: "Available in English, Hindi & Hinglish — because financial literacy should be in your language.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Readiness Passport",
    desc: "Get a printable PDF with your loan readiness score, document checklist & questions for the bank.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Zero Hidden Costs",
    desc: "We show you the FULL cost — EMI, interest, processing fees, and what-if scenarios included.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

/* ───────────────── HOW IT WORKS ───────────────── */
const STEPS = [
  {
    step: "01",
    title: "Choose Your Loan Type",
    desc: "Select from Kisan, Student, Business, or Personal loan categories.",
    icon: "🎯",
  },
  {
    step: "02",
    title: "Answer Simple Questions",
    desc: "Tell us your amount, income, and expenses. We ask one question at a time.",
    icon: "💬",
  },
  {
    step: "03",
    title: "AI Analyzes Your Data",
    desc: "Our AI calculates EMI, matches government schemes, and stress-tests your repayment plan.",
    icon: "🤖",
  },
  {
    step: "04",
    title: "Get Your Readiness Passport",
    desc: "Download a printable passport with everything you need before visiting the bank.",
    icon: "📋",
  },
];

/* ───────────────── TESTIMONIALS ───────────────── */
const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    role: "Wheat Farmer, Haryana",
    avatar: "🧑‍🌾",
    text: "Sahyogi Loan AI helped me understand my KCC loan options. The seasonal income mapping showed me which months would be tight. Now I plan my repayments around harvest time!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Engineering Student, Delhi",
    avatar: "👩‍🎓",
    text: "I was confused about moratorium periods. Sahyogi Loan AI showed me exactly what my EMI will be after graduation and connected me with education subsidy schemes I didn't know about.",
    rating: 5,
  },
  {
    name: "Mohammed Ansari",
    role: "Shop Owner, Lucknow",
    avatar: "👨‍💼",
    text: "The document checklist saved me three trips to the bank! I had everything prepared before my first visit. Got my Mudra loan approved in one go.",
    rating: 5,
  },
];

/* ───────────────── STATS ───────────────── */
const STATS = [
  { value: "50K+", label: "Families Helped" },
  { value: "₹200Cr+", label: "Loan Guidance Given" },
  { value: "15+", label: "Government Schemes" },
  { value: "3", label: "Languages Supported" },
];

/* ───────────────── ANIMATED COUNTER ───────────────── */
function AnimatedStat({ value, label }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className={`text-3xl sm:text-4xl font-bold text-white transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {value}
      </div>
      <div className={`mt-1 text-sm text-white/70 transition-all duration-700 delay-200 ${visible ? "opacity-100" : "opacity-0"}`}>
        {label}
      </div>
    </div>
  );
}

/* ───────────────── SCROLL ANIMATION HOOK ───────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/* ═══════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function LandingPage({ onSelectCategory }) {
  const [servicesRef, servicesVisible] = useScrollReveal();
  const [whyRef, whyVisible] = useScrollReveal();
  const [stepsRef, stepsVisible] = useScrollReveal();
  const [testimonialsRef, testimonialsVisible] = useScrollReveal();

  return (
    <>
      {/* ─── SERVICES SECTION ─── */}
      <section id="services" className="relative py-20 sm:py-28 bg-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-leaf-50 blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-saffron-100 blur-3xl opacity-40 translate-x-1/3 translate-y-1/3" />

        <div ref={servicesRef} className="relative mx-auto max-w-7xl px-5">
          {/* Section Header */}
          <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${servicesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-leaf-50 px-4 py-1.5 text-xs font-semibold text-leaf-700 ring-1 ring-leaf-100 mb-4">
              ✨ Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">
              Loan Guidance for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-600 to-saffron-500">Every Indian</span>
            </h2>
            <p className="mt-4 text-ink/60 text-lg leading-relaxed">
              Whether you're a farmer, student, business owner, or common citizen — we help you understand your loan options before you step into a bank.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                className={`group relative rounded-2xl border ${s.border} bg-white p-6 transition-all duration-500 hover:shadow-xl hover:shadow-leaf-600/5 hover:-translate-y-2 cursor-pointer ${
                  servicesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: servicesVisible ? `${i * 100}ms` : "0ms" }}
                onClick={() => onSelectCategory(s.id)}
              >
                {/* Icon */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${s.bg} text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  {s.icon}
                </div>

                <h3 className="text-lg font-bold text-ink">{s.title}</h3>
                <p className="text-xs text-ink/50 font-medium mt-0.5">{s.subtitle}</p>
                <p className="mt-3 text-sm text-ink/60 leading-relaxed">{s.desc}</p>

                {/* Features */}
                <ul className="mt-4 space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-ink/60">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-leaf-500 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Bottom CTA */}
                <div className="mt-5 flex items-center gap-1 text-sm font-medium text-leaf-600 group-hover:gap-2 transition-all duration-300">
                  Get Started
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>

                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="relative py-16 bg-gradient-to-r from-leaf-700 via-leaf-600 to-leaf-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-5xl px-5 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section id="why-us" className="relative py-20 sm:py-28 bg-leaf-50/50 overflow-hidden">
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-leaf-100 blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />

        <div ref={whyRef} className="relative mx-auto max-w-7xl px-5">
          <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${whyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-leaf-700 ring-1 ring-leaf-100 mb-4 shadow-sm">
              🛡️ Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">
              Why Sahyogi Loan AI is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-600 to-leaf-500">Important</span>
            </h2>
            <p className="mt-4 text-ink/60 text-lg leading-relaxed">
              In India, millions take loans without fully understanding the costs. We're changing that — one family at a time.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item, i) => (
              <div
                key={item.title}
                className={`group rounded-2xl bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  whyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: whyVisible ? `${i * 80}ms` : "0ms" }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ${item.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="relative py-20 sm:py-28 bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 w-80 h-80 rounded-full bg-saffron-100 blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />

        <div ref={stepsRef} className="relative mx-auto max-w-5xl px-5">
          <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-leaf-50 px-4 py-1.5 text-xs font-semibold text-leaf-700 ring-1 ring-leaf-100 mb-4">
              🚀 How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">
              Simple Steps to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 to-saffron-700">Financial Clarity</span>
            </h2>
            <p className="mt-4 text-ink/60 text-lg leading-relaxed">
              Get from confusion to confidence in just 4 easy steps.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-leaf-200 via-leaf-300 to-leaf-200 hidden md:block -translate-x-1/2" />

            <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-16 md:gap-y-12">
              {STEPS.map((s, i) => (
                <div
                  key={s.step}
                  className={`relative flex items-start gap-5 transition-all duration-700 ${
                    stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                  } ${i % 2 === 1 ? "md:translate-y-20" : ""}`}
                  style={{ transitionDelay: stepsVisible ? `${i * 150}ms` : "0ms" }}
                >
                  {/* Step Number Circle */}
                  <div className="flex-shrink-0 relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-leaf-700 text-2xl shadow-lg shadow-leaf-600/20">
                      {s.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-saffron-500 text-[10px] font-bold text-white shadow-md">
                      {s.step}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-ink">{s.title}</h3>
                    <p className="mt-1 text-sm text-ink/60 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="relative py-20 sm:py-28 bg-gradient-to-b from-leaf-50/50 to-white overflow-hidden">
        <div ref={testimonialsRef} className="relative mx-auto max-w-7xl px-5">
          <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${testimonialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-leaf-700 ring-1 ring-leaf-100 mb-4 shadow-sm">
              💬 Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink">
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-600 to-saffron-500">Real People</span>
            </h2>
            <p className="mt-4 text-ink/60 text-lg leading-relaxed">
              Hear from farmers, students, and families who used Sahyogi Loan AI to make smarter decisions.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-leaf-100/50 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                  testimonialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: testimonialsVisible ? `${i * 120}ms` : "0ms" }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <svg key={j} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-saffron-500">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-ink/70 leading-relaxed italic">"{t.text}"</p>

                {/* Author */}
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-leaf-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-50 text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{t.name}</div>
                    <div className="text-xs text-ink/50">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative py-20 bg-gradient-to-br from-leaf-700 via-leaf-600 to-leaf-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-saffron-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-leaf-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Make a Smarter Loan Decision?
          </h2>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            Join thousands of families across India who prepared before stepping into the bank. It's free, private, and takes just 5 minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onSelectCategory(null)}
              className="rounded-full bg-white px-8 py-4 text-base font-semibold text-leaf-700 shadow-xl shadow-black/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
            >
              Start Free Assessment →
            </button>
            <a
              href="#services"
              className="rounded-full border border-white/30 px-8 py-4 text-base font-medium text-white transition-all duration-300 hover:bg-white/10"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-ink py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-leaf-500 to-leaf-700">
                  <span className="text-sm font-bold text-white">LS</span>
                </div>
                <span className="text-lg font-bold text-white">
                  Loan<span className="text-saffron-500">Saathi</span> AI
                </span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-white/40 leading-relaxed">
                A decision-support tool that helps every Indian — farmer, student, or aam aadmi — understand loan options and prepare with confidence. Not a lender, credit bureau, or approval authority.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Services</h4>
              <ul className="mt-4 space-y-3">
                {["Kisan Loan", "Student Loan", "Business Loan", "Personal Loan"].map((l) => (
                  <li key={l}>
                    <a href="#services" className="text-sm text-white/40 hover:text-white/70 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Resources</h4>
              <ul className="mt-4 space-y-3">
                {["How It Works", "Government Schemes", "FAQs", "Contact Us"].map((l) => (
                  <li key={l}>
                    <a href="#how-it-works" className="text-sm text-white/40 hover:text-white/70 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
            <p className="text-xs text-white/30">© 2026 Sahyogi Loan AI. A decision-support tool — not a lender.</p>
            <div className="flex gap-4">
              <span className="text-xs text-white/30">Made with 🇮🇳 for India</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
