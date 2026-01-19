
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

  // API 키 선택 상태 동기화
  const checkKeyStatus = useCallback(async () => {
    try {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    } catch (e) {
      console.debug("API Status check failed:", e);
    }
  }, []);

  useEffect(() => {
    checkKeyStatus();
    const interval = setInterval(checkKeyStatus, 2000);
    return () => clearInterval(interval);
  }, [checkKeyStatus]);

  // API 키 선택 창 열기
  const handleOpenKeyDialog = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // 가이드라인: 키 선택 트리거 후 즉시 성공으로 가정
        setHasKey(true);
      } catch (e) {
        console.error("Key selection failed:", e);
      }
    } else {
      console.warn("window.aistudio.openSelectKey is not available.");
      // 테스트 환경 배려: 실제 aistudio가 없는 환경에서도 버튼 작동 확인을 위해 시각적 변화만 유도
      setHasKey(true);
    }
  };

  const handleGenerate = async (info: CompanyInfo) => {
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
      
      if (msg.includes("API_KEY_MISSING") || msg.includes("API Key must be set")) {
        setHasKey(false);
        alert("AI 엔진 연결이 해제되었거나 키가 설정되지 않았습니다. 상단 버튼을 통해 다시 연결해 주세요.");
        handleOpenKeyDialog();
      } else if (msg.includes("Requested entity was not found")) {
        setHasKey(false);
        alert("유효하지 않은 API 키입니다. 유료 프로젝트가 포함된 API 키를 다시 선택해 주세요.");
        handleOpenKeyDialog();
      } else {
        alert(`계획서 생성 중 오류가 발생했습니다: ${msg}`);
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
      filename: `SS연구소_사업계획서_${planData.summary.introduction.split(' ')[0] || 'AI'}.pdf`,
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
          <button onClick={() => setShowResult(false)} className="flex items-center text-white hover:text-blue-400 font-bold group">
            <svg className="w-6 h-6 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            수정하러 돌아가기
          </button>
          <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center active:scale-95">
            PDF 다운로드
          </button>
        </div>
        <BusinessPlanView data={planData} images={images} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <nav className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner cursor-pointer" onClick={() => window.location.reload()}>SS</div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-800 leading-tight">SS창업경영연구소</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PSST Builder Deep v2.0</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center">
              {/* 연결 안내 화살표 - 연결되지 않았을 때만 표시 */}
              {!hasKey && (
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden lg:block animate-bounce-x pointer-events-none z-0">
                  <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              
              <button 
                id="api-key-selector"
                onClick={handleOpenKeyDialog}
                className={`relative z-20 flex items-center text-xs px-5 py-2.5 rounded-full font-bold border transition-all shadow-md active:scale-95 cursor-pointer hover:shadow-lg ${
                  hasKey 
                  ? 'bg-green-600 text-white border-green-700' 
                  : 'bg-white text-amber-600 border-amber-300 ring-2 ring-amber-100 hover:bg-amber-50 animate-soft-pulse'
                }`}
              >
                {hasKey ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    고성능 AI 엔진 연결됨
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2 animate-ping"></span>
                    AI 엔진 연결 필수 (클릭)
                  </>
                )}
                <svg className={`w-4 h-4 ml-2 transition-transform duration-300 ${hasKey ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-2"></div>
            <div className="text-sm font-bold text-slate-500 hidden xl:block">
              (주)소셜위즈 Partnership
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4">
        <BusinessPlanForm onSubmit={handleGenerate} isLoading={isLoading} />
        
        {!isLoading && (
          <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">심층 리서치 엔진</h3>
              <p className="text-slate-500 text-sm leading-relaxed">정부지원사업 규격에 맞춘 방대한 분량의 전문 텍스트를 구성합니다.</p>
            </div>
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 hover:border-green-200 transition-colors group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">첨부파일 정밀 분석</h3>
              <p className="text-slate-500 text-sm leading-relaxed">업로드한 이미지와 문서를 AI가 직접 읽고 계획서에 논리적으로 반영합니다.</p>
            </div>
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-200 transition-colors group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">시각 자료 자동 생성</h3>
              <p className="text-slate-500 text-sm leading-relaxed">사업 아이템의 실제 구동 모습을 AI가 실사 렌더링으로 그려냅니다.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-16 bg-white text-center border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-800 font-extrabold text-xl mb-1">SS창업경영연구소</p>
          <p className="text-slate-500 text-sm mb-8 font-medium">(주)소셜위즈 - SocialWiz Inc. Partnership</p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-blue-600 font-semibold mb-10">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">Google Billing 안내</a>
            <button onClick={handleOpenKeyDialog} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">AI 엔진 설정 재설정</button>
          </div>
          <p className="text-slate-400 text-[10px] tracking-[0.2em] uppercase font-bold">© 2024 SS Builder Deep. Powered by Google Gemini 3 Pro.</p>
        </div>
      </footer>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0) translateY(-50%); opacity: 0.8; }
          50% { transform: translateX(-15px) translateY(-50%); opacity: 0.4; }
        }
        @keyframes soft-pulse {
          0%, 100% { border-color: rgba(245, 158, 11, 0.3); }
          50% { border-color: rgba(245, 158, 11, 0.8); }
        }
        .animate-bounce-x {
          animation: bounce-x 1.2s infinite ease-in-out;
        }
        .animate-soft-pulse {
          animation: soft-pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
