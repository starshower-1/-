
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

  // API 키 선택 여부 확인 (window.aistudio 존재 여부 체크 포함)
  const checkKeyStatus = useCallback(async () => {
    try {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    } catch (e) {
      console.debug("Aistudio interface not fully ready:", e);
    }
  }, []);

  useEffect(() => {
    checkKeyStatus();
    const interval = setInterval(checkKeyStatus, 3000);
    return () => clearInterval(interval);
  }, [checkKeyStatus]);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // 가이드라인: 키 선택 트리거 후 성공으로 가정하여 즉시 진행
        setHasKey(true);
      } catch (e) {
        console.error("Key selection failed:", e);
      }
    } else {
      // 윈도우 객체가 없을 경우 콘솔 로그만 남기고 알림은 띄우지 않음 (사용자 차단 방지)
      console.warn("window.aistudio.openSelectKey is not available in this context.");
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
      
      if (data && data.summary && data.problem) {
        setPlanData(data);
        setImages(imgs);
        setShowResult(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error("생성된 데이터 형식이 올바르지 않습니다.");
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      const errorMsg = error.message || "";
      
      // 가이드라인: "Requested entity was not found." 에러 시 키 선택창 다시 열기
      if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("API_KEY")) {
        setHasKey(false);
        if (window.aistudio?.openSelectKey) {
          alert("API 키 인증에 실패했거나 권한이 없습니다. 유료 프로젝트의 API 키를 다시 선택해 주세요.");
          handleOpenKeyDialog();
        } else {
          alert("API 키가 유효하지 않습니다. 환경 변수 혹은 API 키 설정을 확인해 주세요.");
        }
      } else if (errorMsg.includes("JSON")) {
        alert("데이터 생성량이 너무 많아 오류가 발생했습니다. 내용을 조금 더 구체화하여 다시 시도해주세요.");
      } else {
        alert(`계획서 생성 중 오류가 발생했습니다: ${errorMsg || "알 수 없는 오류"}`);
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
          <button 
            onClick={() => setShowResult(false)}
            className="flex items-center text-white hover:text-blue-400 transition-colors font-bold group"
          >
            <svg className="w-6 h-6 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            수정하러 돌아가기
          </button>
          <div className="space-x-4">
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center transition-all active:scale-95"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              PDF 다운로드
            </button>
          </div>
        </div>
        <BusinessPlanView data={planData} images={images} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">SS</div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-800 leading-tight">SS창업경영연구소</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">PSST Builder Deep v2.0</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {/* API 키 연결 배지 - 화살표 안내 추가 */}
            <div className="relative group">
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 hidden md:block animate-bounce-x pointer-events-none">
                 <svg className="w-6 h-6 text-blue-600 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>
              <button 
                onClick={handleOpenKeyDialog}
                className={`flex items-center text-xs px-4 py-2 rounded-full font-bold border transition-all transform hover:scale-105 active:scale-95 shadow-sm ${
                  hasKey 
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 ring-2 ring-amber-200 animate-pulse'
                }`}
                title="클릭하여 고품질 생성을 위한 API 키를 선택하세요"
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${hasKey ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                {hasKey ? 'API 키 연결됨' : 'API 연결 필요 (클릭)'}
                <svg className="w-3 h-3 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </button>
            </div>
            <div className="text-sm font-bold text-slate-600 hidden lg:block">
              (주)소셜위즈 파트너십
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4">
        <BusinessPlanForm onSubmit={handleGenerate} isLoading={isLoading} />
        
        {/* Features Preview */}
        {!isLoading && (
          <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">초대형 3배 분량 리포트</h3>
              <p className="text-slate-500 text-sm leading-relaxed">단순 요약을 넘어 실제 공공기관 제출이 가능한 수준의 풍부한 세부 텍스트를 자동 생성합니다.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">멀티모달 첨부 분석</h3>
              <p className="text-slate-500 text-sm leading-relaxed">이미지와 PDF 문서를 AI가 직접 읽고 분석하여 사업계획서의 논리적 근거로 활용합니다.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">AI 실사 렌더링</h3>
              <p className="text-slate-500 text-sm leading-relaxed">사업 아이템을 시각화한 고해상도 3D 및 실사 이미지를 보고서에 자동으로 포함합니다.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 bg-white text-center border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-800 font-extrabold text-lg mb-1">SS창업경영연구소</p>
          <p className="text-slate-500 text-sm mb-4">(주)소셜위즈 - SocialWiz Inc. Partnership</p>
          <div className="flex justify-center items-center space-x-4 text-xs text-blue-600 mb-4">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="hover:underline">Google Billing 가이드</a>
            <span className="text-slate-300">|</span>
            <button onClick={handleOpenKeyDialog} className="hover:underline font-bold">API 키 재선정</button>
          </div>
          <p className="text-slate-400 text-[10px] tracking-widest uppercase">© 2024 SS Builder Deep. Powered by Google Gemini 3 Pro.</p>
        </div>
      </footer>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0) translateY(-50%); }
          50% { transform: translateX(-10px) translateY(-50%); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
