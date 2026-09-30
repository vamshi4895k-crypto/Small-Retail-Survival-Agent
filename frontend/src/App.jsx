import React, { useState, useEffect } from 'react';
import { Package, Store, BarChart3, Sparkles, Upload, Play, Bot, RefreshCw, Volume2, VolumeX, Layers, ShieldCheck, ArrowRight, FileText } from 'lucide-react';
import LandingPageView from './components/LandingPageView';
import AgentExecutionStream from './components/AgentExecutionStream';
import WeeklyReportView from './components/WeeklyReportView';
import SkuDetailModal from './components/SkuDetailModal';
import OrchestratorChat from './components/OrchestratorChat';
import CsvUploadModal from './components/CsvUploadModal';
import GraphicLoadingPage from './components/GraphicLoadingPage';
import ThreeSceneCanvas from './components/ThreeSceneCanvas';
import { fetchLatestReport, generateSyntheticData, runAnalysis } from './services/api';
import { toggleMute, playButtonClick, playTransition, playNotification, initAmbience } from './utils/soundEffects';

export default function App() {
  const [currentView, setCurrentView] = useState('LANDING'); // 'LANDING' | 'REPORT'
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);
  
  // Modals & Selection
  const [selectedSku, setSelectedSku] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Initial loading sequence
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 20;
      });
    }, 150);

    loadReport().then(() => {
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        playTransition();
      }, 500);
    });

    return () => clearInterval(interval);
  }, []);

  const loadReport = async () => {
    try {
      const data = await fetchLatestReport();
      if (data) {
        setReport(data);
      } else {
        await handleLoadDemo();
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  const handleSoundToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
    if (!muted) {
      playButtonClick();
      initAmbience();
    }
  };

  const switchView = (newView) => {
    playTransition();
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadDemo = async () => {
    playButtonClick();
    setIsGenerating(true);
    setIsAnalyzing(true);
    setAgentLogs([
      { agent: 'System', stage: 'SEEDING', message: 'Generating 12-month synthetic Kirana sales dataset with engineered showcase scenarios...' }
    ]);
    setActiveNode('sales_analyst');

    try {
      const res = await generateSyntheticData(365);
      if (res.report) {
        setReport(res.report);
      }
      playNotification();
      setAgentLogs((prev) => [
        ...prev,
        { agent: 'Orchestrator', stage: 'DONE', message: '12-Month Kirana dataset synthesized and 5-Agent pipeline completed successfully.' }
      ]);
      setActiveNode('orchestrator');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
      setIsAnalyzing(false);
    }
  };

  const handleReRunPipeline = async () => {
    playButtonClick();
    setIsAnalyzing(true);
    setActiveNode('sales_analyst');
    setAgentLogs([
      { agent: 'Sales Analyst', stage: 'START', message: 'Re-evaluating transaction velocity and sales records...' }
    ]);

    try {
      setTimeout(() => setActiveNode('demand_forecaster'), 500);
      setTimeout(() => setActiveNode('inventory_strategist'), 1000);
      setTimeout(() => setActiveNode('marketing_advisor'), 1500);
      setTimeout(() => setActiveNode('orchestrator'), 2000);

      const updatedReport = await runAnalysis();
      setReport(updatedReport);
      playNotification();
      setAgentLogs((prev) => [
        ...prev,
        { agent: 'Orchestrator', stage: 'DONE', message: 'Multi-agent pipeline re-run completed.' }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadSuccess = () => {
    handleReRunPipeline();
    switchView('REPORT');
  };

  return (
    <div className="min-h-screen bg-background text-[#f0f6f3] flex flex-col font-body relative overflow-x-hidden">
      {/* 3D WebGL Background Scene */}
      <ThreeSceneCanvas onProgress={(p) => setLoadingProgress((prev) => Math.max(prev, p))} />

      {/* Graphic Loading Screen with Animated SVG Mask and Wave Transitions */}
      <GraphicLoadingPage
        isLoading={loading}
        progress={loadingProgress}
        onComplete={() => console.log('Graphic loading complete')}
      />

      {/* Top Navbar with View Switcher */}
      <header className="sticky top-0 z-40 bg-[#12211c]/90 backdrop-blur-md border-b border-panel-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => switchView('LANDING')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber/20 border border-amber/40 flex items-center justify-center text-amber shadow-glow-amber group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 animate-crate-bounce" />
            </div>
            <div>
              <div className="text-base font-headline font-bold text-[#f0f6f3] flex items-center gap-2">
                <span>Small Retail Survival Agent</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber/20 text-amber font-semibold border border-amber/30">
                  3D Kirana
                </span>
              </div>
              <div className="text-[11px] text-sage">AI Analyst for Kirana, Boutiques & Cafes</div>
            </div>
          </div>

          {/* Center Navigation Switcher */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-panel border border-panel-border">
            <button
              onClick={() => switchView('LANDING')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'LANDING'
                  ? 'bg-amber text-[#12211c] shadow-glow-amber font-bold'
                  : 'text-sage hover:text-[#f0f6f3]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>3D Retail Shop</span>
            </button>

            <button
              onClick={() => switchView('REPORT')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'REPORT'
                  ? 'bg-amber text-[#12211c] shadow-glow-amber font-bold'
                  : 'text-sage hover:text-[#f0f6f3]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Weekly Action Report</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* 3D Audio Toggle */}
            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-xl transition-all border ${
                isMuted
                  ? 'bg-panel text-sage border-panel-border'
                  : 'bg-amber/15 text-amber border-amber/40 shadow-glow-amber'
              }`}
              title={isMuted ? 'Unmute 3D audio' : 'Mute 3D audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                playButtonClick();
                setIsUploadOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-panel hover:bg-panel-light text-[#f0f6f3] border border-panel-border text-xs font-semibold transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-sage" />
              <span className="hidden sm:inline">Upload Sales CSV</span>
            </button>

            <button
              onClick={handleLoadDemo}
              disabled={isGenerating || isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber hover:bg-amber-light text-[#12211c] text-xs font-bold transition-all shadow-glow-amber disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isGenerating ? 'Generating...' : 'Reset Demo'}</span>
            </button>

            <button
              onClick={() => {
                playButtonClick();
                setIsChatOpen(true);
              }}
              className="p-2 rounded-xl bg-panel hover:bg-panel-light text-amber border border-panel-border transition-colors"
              title="Open Orchestrator Copilot"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Views */}
      <main className="flex-1 relative z-10">
        {currentView === 'LANDING' ? (
          <LandingPageView
            onEnterDashboard={() => switchView('REPORT')}
            onLoadDemo={handleLoadDemo}
            onOpenUpload={() => {
              playButtonClick();
              setIsUploadOpen(true);
            }}
            onSelectSku={(sku) => {
              playButtonClick();
              setSelectedSku(sku);
            }}
            isGenerating={isGenerating}
          />
        ) : (
          <div className="py-6">
            {/* Live Multi-Agent Workflow Tracker */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
              <AgentExecutionStream
                activeNode={activeNode}
                logs={agentLogs}
                isRunning={isAnalyzing || isGenerating}
              />
            </div>

            {/* Weekly Report View */}
            {report && (
              <WeeklyReportView
                report={report}
                onReRunAnalysis={handleReRunPipeline}
                onOpenChat={() => {
                  playButtonClick();
                  setIsChatOpen(true);
                }}
                onSelectSku={(sku) => {
                  playButtonClick();
                  setSelectedSku(sku);
                }}
                selectedSku={selectedSku}
                isAnalyzing={isAnalyzing}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-panel-border/60 bg-[#0e1b16] py-8 text-center text-xs text-sage relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <div className="font-headline font-bold text-[#f0f6f3]">
            Small Retail Survival Agent — 3D Multi-Agent GenAI Architecture
          </div>
          <p className="text-[11px] text-sage/70 max-w-xl mx-auto">
            LangGraph State Handoff • Three.js 3D Kirana Shelf Simulation • Graphic SVG Mask & Wave Transitions • Statsmodels Time-Series & Sparse Fallback • Groq Llama 3 • FastAPI & SQLite
          </p>
        </div>
      </footer>

      {/* SKU Detail & Explainability Modal */}
      {selectedSku && (
        <SkuDetailModal
          sku={selectedSku}
          report={report}
          onClose={() => setSelectedSku(null)}
        />
      )}

      {/* Orchestrator Chat Copilot Modal */}
      <OrchestratorChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        report={report}
      />

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
