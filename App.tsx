
import React, { useState, useCallback, useEffect } from 'react';
import { CompanyInfo, BusinessPlanData } from './types';
import { generateBusinessPlan, generateImages } from './services/geminiService';
import BusinessPlanForm from './components/BusinessPlanForm';
import BusinessPlanView from './components/BusinessPlanView';

declare const html2pdf: any;
declare const window: any;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [planData, setPlanData] = useState<BusinessPlanData | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // API 키 유효성 체크 (환경 변수 또는 브릿지 객체)
  const checkKeyStatus = useCallback(async () => {
    // 1. 우선적으로 process.env.API_KEY가 존재하는지 확인
    const envKey = process.env.API_KEY;
    if (envKey && envKey !== "undefined" && envKey.length > 5) {
      setHasKey(true);
      return;
    }

    // 2. 환경 변수가 없다면 aistudio 브릿지 객체 확인
    try {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    } catch (e) {
      console.debug("Aistudio bridge not found in this environment");
    }
  }, []);

  useEffect(() => {
    checkKeyStatus();
    // Vercel 환경 등에서 상태가 바뀔 수 있으므로 주기적으로 체크
    const interval = setInterval(checkKeyStatus, 2000);
    return () => clearInterval(interval);
  }, [checkKeyStatus]);

  // API 키 선택 창 열기
  const handleOpenKeyDialog = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // aistudio 브릿지가 있는 경우 (Google AI Studio 환경 등)
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (err) {
        console.error("Failed to open key dialog:", err);
      }
    } else {
      // Vercel 직접 접속 등 브릿지가 없는 환경
      const envKey = process.env.API_KEY;
      if (envKey && envKey !== "undefined") {
        setHasKey(true);
        alert("이미 시스템에 AI 엔진이 연결되어 있습니다. 바로 이용하실 수 있습니다.");
      } else {
        alert("이 앱은 Google AI Studio 환경에서 실행되거나 API_KEY 환경변수가 설정되어야 합니다. 현재 환경에서는 엔진 연결 기능을 지원하지 않습니다.");
      }
    }
  };

  const handleGenerate = async (info: CompanyInfo) => {
    // 생성 전 키 체크
    const envKey = process.env.API_KEY;
    if (!hasKey && (!envKey || envKey === "undefined")) {
      alert("AI 엔진 연결이 필요합니다. 상단 버튼을 눌러주세요.");
      handleOpenKeyDialog();
      return;
    }

    setIsLoading(true);
    setPlanData(null);
    setImages([]);
    
    try {
      const [data, imgs] = await Promise.all([
        generateBusinessPlan(info),
        generateImages(info)
      ]);
      
      if (data) {
        setPlanData(data);
        setImages(imgs);
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      const msg = error.message || "";
      
      if (msg.includes("Requested entity was not found") || msg.includes("API_KEY_MISSING")) {
        setHasKey(false);
        alert("연결된 AI 엔진에 권한이 없거나 설정이 만료되었습니다. 다시 연결해 주세요.");
        handleOpenKeyDialog();
      } else {
        alert(`생성 중 오류 발생: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = useCallback(() => {
    if (!planData) return;
    const element = document.getElementById('plan-container');
    const opt = {
      margin: 10,
      filename: `SS연구소_사업계획서_${info.companyName || 'AI'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }, [planData]);

  if (showResult && planData) {
    return (
      <div className="min-h-screen bg-slate-900 py-10">
        <div className="max-w-[210mm] mx-auto mb-6 px-4 flex justify-between items-center no-print">
          <button 
            onClick={() => setShowResult(false)} 
            className="flex items-center text-white hover:text-blue-400 font-bold group bg-transparent border-none cursor-pointer"
          >
            <svg className="w-6 h-6 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            수정하러 돌아가기
          </button>
          <button 
            onClick={handleDownloadPDF} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center active:scale-95"
          >
            PDF 다운로드
          </button>
        </div>
        <BusinessPlanView data={planData} images={images} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <nav className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">SS</div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-800 leading-tight">SS창업경영연구소</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">PSST Builder Deep v2.0</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              type="button"
              onClick={handleOpenKeyDialog}
              className={`relative z-[110] flex items-center text-xs px-5 py-2.5 rounded-full font-bold border transition-all shadow-md active:scale-95 cursor-pointer hover:shadow-lg ${
                hasKey 
                ? 'bg-green-600 text-white border-green-700' 
                : 'bg-white text-blue-600 border-blue-200 ring-2 ring-blue-50 hover:bg-blue-50'
              }`}
            >
              {hasKey ? (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  AI 엔진 연결됨
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  AI 엔진 연결 필수
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4">
        <BusinessPlanForm onSubmit={handleGenerate} isLoading={isLoading} />
        
        {!isLoading && (
          <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">심층 리서치 엔진</h3>
              <p className="text-slate-500 text-sm">최신 데이터를 기반으로 대용량 계획서를 구성합니다.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">첨부파일 분석</h3>
              <p className="text-slate-500 text-sm">업로드된 파일을 AI가 분석하여 내용에 반영합니다.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">시각 자료 생성</h3>
              <p className="text-slate-500 text-sm">사업 아이템을 실사 수준의 이미지로 렌더링합니다.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-16 bg-white text-center border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-800 font-extrabold text-xl mb-1">SS창업경영연구소</p>
          <p className="text-slate-500 text-sm mb-10 font-medium">(주)소셜위즈 - SocialWiz Inc. Partnership</p>
          <div className="flex justify-center items-center gap-6 text-xs text-blue-600 font-semibold">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="hover:underline">Billing 안내</a>
            <button type="button" onClick={handleOpenKeyDialog} className="hover:underline">API 엔진 재설정</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
