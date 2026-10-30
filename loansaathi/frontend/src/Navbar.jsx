import { useState, useEffect } from "react";

export default function Navbar({ lang, setLang, LANGS, t, onGetStarted, viewMode, setViewMode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || viewMode === "fintech"
          ? "bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group" onClick={(e) => { e.preventDefault(); setViewMode("fintech"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/30 group-hover:shadow-lg transition-all duration-300">
            <span className="text-lg font-bold text-slate-950">SL</span>
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse"></div>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              Sahyogi <span className="text-amber-400">Loan AI</span>
            </span>
            <span className="block text-[10px] font-medium tracking-widest uppercase text-slate-400">
              AI Fintech Intelligence
            </span>
          </div>
        </a>

        {/* Desktop View Switcher */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode("fintech")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === "fintech"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white"
            }`}
          >
            ⚡ AI Financial Readiness Center
          </button>
          <button
            onClick={() => setViewMode("landing")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === "landing"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Product Tour
          </button>
          <button
            onClick={() => setViewMode("intake")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === "intake"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Conversational Intake
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className={`hidden sm:flex gap-0.5 rounded-full p-0.5 transition-all duration-300 ${
            scrolled ? "bg-leaf-50" : "bg-white/15 backdrop-blur-md"
          }`}>
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                  lang === l.id
                    ? "bg-leaf-600 text-white shadow-md shadow-leaf-600/30"
                    : scrolled
                    ? "text-ink/60 hover:text-leaf-700"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={onGetStarted}
            className="relative overflow-hidden rounded-full bg-gradient-to-r from-saffron-500 to-saffron-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-saffron-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-saffron-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="relative z-10">{t("build")}</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? "text-ink/70 hover:bg-leaf-50" : "text-white/80 hover:bg-white/10"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } ${scrolled ? "bg-white" : "bg-black/40 backdrop-blur-xl"}`}
      >
        <div className="px-5 py-4 space-y-1">
          {[
            { label: "Home", href: "#" },
            { label: "Services", href: "#services" },
            { label: "Why Us", href: "#why-us" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Testimonials", href: "#testimonials" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                scrolled
                  ? "text-ink/70 hover:text-leaf-700 hover:bg-leaf-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </a>
          ))}
          {/* Mobile language switcher */}
          <div className="flex gap-1 px-4 pt-3">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  lang === l.id
                    ? "bg-leaf-600 text-white"
                    : scrolled
                    ? "text-ink/60 bg-leaf-50"
                    : "text-white/60 bg-white/10"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
