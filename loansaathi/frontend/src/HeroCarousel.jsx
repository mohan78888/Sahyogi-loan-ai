import { useState, useEffect, useCallback } from "react";

const SLIDES = [
  {
    id: "farmer",
    image: "/images/hero-farmer.jpg",
    badge: "🌾 Kisan Loan",
    title: "Empowering India's Farmers",
    subtitle: "Get the right loan for seeds, equipment & land — with AI-powered guidance tailored for your harvest cycles.",
    cta: "Check Farmer Loan Options",
    gradient: "from-emerald-900/80 via-emerald-900/50 to-transparent",
  },
  {
    id: "student",
    image: "/images/hero-student.jpg",
    badge: "🎓 Student Loan",
    title: "Fund Your Dreams, Not Your Worries",
    subtitle: "Education loans made simple. Understand your EMI, moratorium period & repayment plan before you sign anything.",
    cta: "Explore Student Loans",
    gradient: "from-blue-900/80 via-blue-900/50 to-transparent",
  },
  {
    id: "personal",
    image: "/images/hero-aam-admi.jpg",
    badge: "🏠 Aam Aadmi Loan",
    title: "Your Family's Financial Safety Net",
    subtitle: "Personal & emergency loans — compare options, see the real cost, and plan your EMIs with confidence.",
    cta: "Get Personal Loan Guidance",
    gradient: "from-amber-900/80 via-amber-900/50 to-transparent",
  },
  {
    id: "business",
    image: "/images/hero-business.jpg",
    badge: "🏪 Business Loan",
    title: "Grow Your Business Boldly",
    subtitle: "Shop loans, MSME funding & working capital — AI helps you find the best government schemes and prepare documents.",
    cta: "Discover Business Loans",
    gradient: "from-purple-900/80 via-purple-900/50 to-transparent",
  },
];

export default function HeroCarousel({ onSelectCategory }) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback(
    (idx) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setProgress(0);
      setCurrent(idx);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  // Auto-play timer with progress bar
  useEffect(() => {
    const DURATION = 6000;
    const TICK = 30;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += TICK;
      setProgress((elapsed / DURATION) * 100);
      if (elapsed >= DURATION) {
        next();
        elapsed = 0;
        setProgress(0);
      }
    }, TICK);
    return () => clearInterval(interval);
  }, [current, next]);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[100vh] min-h-[600px] overflow-hidden" id="hero">
      {/* Background Images */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-all duration-[800ms] ease-out ${
            i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <img
            src={s.image}
            alt={s.title}
            className="h-full w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        </div>
      ))}

      {/* Floating particles decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-float"
            style={{
              width: `${20 + Math.random() * 60}px`,
              height: `${20 + Math.random() * 60}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-5">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className={`mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/20 transition-all duration-700 ${
                isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
            >
              {slide.badge}
            </div>

            {/* Title */}
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight transition-all duration-700 delay-100 ${
                isTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
              }`}
            >
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p
              className={`mt-5 text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
                isTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
              }`}
            >
              {slide.subtitle}
            </p>

            {/* CTA Buttons */}
            <div
              className={`mt-8 flex flex-wrap items-center gap-4 transition-all duration-700 delay-300 ${
                isTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
              }`}
            >
              <button
                onClick={() => {
                  const catMap = { farmer: "farmer", student: "student", personal: "personal", business: "business" };
                  onSelectCategory(catMap[slide.id]);
                }}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-saffron-500 to-saffron-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-saffron-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-saffron-500/40 hover:-translate-y-0.5"
              >
                <span className="relative z-10">{slide.cta}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-saffron-500 to-saffron-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
                How It Works
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators with Progress */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="group relative flex items-center"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${
              i === current ? "w-12 bg-white/30" : "w-3 bg-white/30 hover:bg-white/50"
            }`}>
              {i === current && (
                <div
                  className="h-full rounded-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Side Navigation Arrows */}
      <button
        onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white ring-1 ring-white/20 transition-all duration-300 hover:bg-white/20 hover:ring-white/40 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white ring-1 ring-white/20 transition-all duration-300 hover:bg-white/20 hover:ring-white/40 hover:scale-110"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Scroll indicator */}
      <div className="absolute bottom-20 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-white/50 font-medium tracking-wider uppercase">Scroll Down</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white/50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  );
}
