
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

  // 현재 환경이 AI Studio 샌드박스 내부인지 확인
  const isAiStudioEnv = typeof window !== 'undefined' && !!window.aistudio;

  const checkKeyStatus = useCallback(async () => {
    // 1. Vercel 등 시스템 환경 변수에 API_KEY가 이미 주입된 경우
    const envKey = process.env.API_KEY;
    if (envKey && envKey !== "undefined" && envKey.length > 5) {
      setHasKey(true);
      return;
    }

    // 2. AI Studio 환경인 경우 브릿지 객체로 체크
    if (isAiStudioEnv && window.aistudio.hasSelectedApiKey) {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        console.debug("Bridge check failed");
      }
    }
  }, [isAiStudioEnv]);

  useEffect(() => {
    checkKeyStatus();
    // 환경 변수나 브릿지 상태가 변할 수 있으므로 주기적 체크 (Vercel은 보통 고정임)
    const interval = setInterval(checkKeyStatus, 3000);
    return () => clearInterval(interval);
  }, [checkKeyStatus]);

  const handleOpenKeyDialog = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isAiStudioEnv && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (err) {
        console.error("Failed to open key dialog:", err);
      }
    } else {
      // Standalone 환경(Vercel 등)에서 키가 없는 경우에 대한 안내
      if (!hasKey) {
        alert("Vercel 환경 변수(API_KEY)가 설정되지 않았습니다. 관리자에게 문의하거나 AI Studio 환경에서 실행해 주세요.");
      }
    }
  };

  const handleGenerate = async (info: CompanyInfo) => {
    if (!hasKey) {
      if (isAiStudioEnv) {
        alert("상단 'AI 엔진 연결' 버튼을 눌러 API 키를 선택해 주세요.");
        handleOpenKeyDialog();
      } else {
        alert("API 키가 구성되지 않았습니다. Vercel Dashboard에서 API_KEY 환경 변수를 설정해 주세요.");
      }
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
      
      if (msg.includes("Requested entity was not found") || msg.includes("401") || msg.includes("403")) {
        setHasKey(false);
        alert("API 키 권한 오류가 발생했습니다. 키 설정을 다시 확인해 주세요.");
        if (isAiStudioEnv) handleOpenKeyDialog();
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
    // planData의 summary나 기업명을 파일명으로 사용
    const fileName = planData.summary.introduction.split(' ')[0] || 'BusinessPlan';
    const opt = {
      margin: 10,
      filename: `SS연구소_사업계획서_${fileName}.pdf`,
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
            type="button"
            onClick={() => setShowResult(false)} 
            className="flex items-center text-white hover:text-blue-400 font-bold group bg-transparent border-none cursor-pointer"
          >
            <svg className="w-6 h-6 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            수정하러 돌아가기
          </button>
          <button 
            type="button"
            onClick={handleDownloadPDF} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center active:scale-95 transition-all"
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
            {/* AI Studio 환경이거나, 혹은 Standalone에서 키가 아직 없는 경우에만 버튼 표시 */}
            {(isAiStudioEnv || !hasKey) && (
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
                    엔진 연결됨
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    AI 엔진 연결 필요
                  </>
                )}
              </button>
            )}
            {!isAiStudioEnv && hasKey && (
              <div className="flex items-center text-xs px-5 py-2.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                시스템 엔진 가동중
              </div>
            )}
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2.01 2.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
            {isAiStudioEnv && (
              <button type="button" onClick={handleOpenKeyDialog} className="hover:underline bg-transparent border-none cursor-pointer">API 엔진 재설정</button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
