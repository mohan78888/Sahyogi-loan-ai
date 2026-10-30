import React from "react";
import {
  LayoutDashboard,
  FileText,
  Activity,
  Sliders,
  FileCheck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Edit3,
} from "lucide-react";
import { useWebFinance } from "../WebFinanceContext";

export default function WebSidebar({ onOpenManual }) {
  const {
    activeTab,
    setActiveTab,
    source,
    hasData,
    loadDemo,
    resetToFresh,
  } = useWebFinance();

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "prediction", label: "Prediction", icon: Activity },
    { id: "simulator", label: "What-if simulator", icon: Sliders },
    { id: "report", label: "AI report", icon: FileCheck },
  ];

  return (
    <aside className="w-64 bg-[#0D332A] text-white flex flex-col justify-between p-6 shrink-0 border-r border-[#15463A]">
      {/* Top: Brand Header & Navigation */}
      <div>
        {/* Brand Logo matching PDF */}
        <div className="mb-10 pt-1">
          <button
            onClick={() => setActiveTab("landing")}
            className="text-left group"
          >
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#E8DCC4] group-hover:text-white transition-colors">
              Sahyogi <span className="text-[#C2A44B] italic">Loan AI</span>
            </h1>
            <p className="text-xs text-white/50 tracking-wider uppercase mt-1">
              Decision Support
            </p>
          </button>
        </div>

        {/* Navigation Items matching PDF Sidebar */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#184E41] text-[#F4F3ED] shadow-sm font-semibold border-l-4 border-[#C2A44B]"
                    : "text-white/70 hover:bg-[#133F34] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#C2A44B]" : "text-white/60"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Evaluation & Demo Controls */}
      <div className="pt-6 border-t border-[#184E41] space-y-3">
        {/* Current State Badge */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-white/50">Status</span>
          <span
            className={`px-2 py-0.5 rounded-full font-semibold ${
              source === "demo"
                ? "bg-[#C2A44B]/20 text-[#E8DCC4] border border-[#C2A44B]/40"
                : hasData
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-white/10 text-white/60"
            }`}
          >
            {source === "demo" ? "Demo data" : hasData ? "Your data" : "Fresh state"}
          </span>
        </div>

        {/* 1-Click Demo vs Reset Action */}
        {source === "demo" ? (
          <button
            onClick={resetToFresh}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-red-950/40 text-red-200 border border-red-800/40 hover:bg-red-900/50 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to fresh
          </button>
        ) : (
          <button
            onClick={loadDemo}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-[#C2A44B] text-[#0D332A] hover:bg-[#D4AF37] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load demo profile
          </button>
        )}

        {/* Quick Manual Entry Trigger */}
        <button
          onClick={onOpenManual}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-[#133F34] text-white/80 hover:text-white hover:bg-[#184E41] transition-all border border-white/10"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Enter numbers manually
        </button>

        {/* Back to Landing Page Link */}
        <button
          onClick={() => setActiveTab("landing")}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Home landing page</span>
        </button>
      </div>
    </aside>
  );
}

