import React, { useState } from "react";
import { WebFinanceProvider, useWebFinance } from "./WebFinanceContext";
import WebSidebar from "./components/WebSidebar";
import ManualEntryModal from "./components/ManualEntryModal";
import LandingPageView from "./views/LandingPage";
import DocumentsView from "./views/DocumentsView";
import OverviewView from "./views/OverviewView";
import PredictionView from "./views/PredictionView";
import SimulatorView from "./views/SimulatorView";
import ReportView from "./views/ReportView";

function AppContent() {
  const { activeTab } = useWebFinance();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // If on Landing Page (Page 1)
  if (activeTab === "landing") {
    return (
      <>
        <LandingPageView onOpenManual={() => setIsManualModalOpen(true)} />
        <ManualEntryModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
        />
      </>
    );
  }

  // Dashboard with Sidebar Layout (Pages 2, 3, 4, 5)
  return (
    <div className="flex h-screen bg-[#F4F3ED] text-[#1E293B] overflow-hidden selection:bg-[#C2A44B]/20">
      {/* Left Sidebar */}
      <WebSidebar onOpenManual={() => setIsManualModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {activeTab === "overview" && (
          <OverviewView onOpenManual={() => setIsManualModalOpen(true)} />
        )}
        {activeTab === "documents" && <DocumentsView />}
        {activeTab === "prediction" && <PredictionView />}
        {activeTab === "simulator" && <SimulatorView />}
        {activeTab === "report" && <ReportView />}
      </main>

      {/* Manual Input Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <WebFinanceProvider>
      <AppContent />
    </WebFinanceProvider>
  );
}
