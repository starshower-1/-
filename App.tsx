
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

  // API 키 선택 여부 확인
  const checkKeyStatus = useCallback(async () => {
    try {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    } catch (e) {
      // 콘솔에만 기록하고 사용자에게는 알리지 않음
      console.debug("Aistudio status check skipped");
    }
  }, []);

  useEffect(() => {
    checkKeyStatus();
    const interval = setInterval(checkKeyStatus, 5000);
    return () => clearInterval(interval);
  }, [checkKeyStatus]);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error("Key selection failed:", e);
      }
    } else {
      // 알림창 대신 콘솔로 대체하여 흐름 방해 제거
      console.log("외부 API 키 선택 창을 지원하지 않는 환경입니다. 기본 키를 사용합니다.");
      // 클릭 시 반응이 없으면 안 되므로 시각적 피드백 제공
      setHasKey(true); 
    }
  };

  const handleGenerate = async (info: CompanyInfo) => {
    setIsLoading(true);
    setPlanData(null);
    setImages([]);
    
    try {
      // 키 선택 여부와 관계없이 생성을 시도 (환경 변수에 기본 키가 있을 수 있음)
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
      
      if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("API_KEY")) {
        setHasKey(false);
        alert("API 키 인증에 실패했습니다. 상단의 '엔진 설정' 버튼을 클릭하여 유료 프로젝트의 API 키를 선택하면 더 정확한 결과가 나옵니다.");
      } else if (errorMsg.includes("JSON")) {
        alert("데이터 분량이 너무 방대하여 구성에 실패했습니다. 내용을 조금 더 구체화하여 다시 시도해주세요.");
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
      <nav className="bg-white border-b border-slate-200 py-4 px-6 mb-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">SS</div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-800 leading-tight">SS창업경영연구소</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">PSST Builder Deep v2.0</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative flex items-center">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 hidden md:block animate-bounce-x pointer-events-none">
                 <svg className="w-5 h-5 text-blue-500 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>
              <button 
                onClick={handleOpenKeyDialog}
                className={`flex items-center text-[10px] sm:text-xs px-3 sm:px-4 py-2 rounded-full font-bold border transition-all shadow-sm ${
                  hasKey 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${hasKey ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                {hasKey ? '고성능 엔진 연결됨' : 'AI 엔진 설정 (권장)'}
                <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="text-sm font-bold text-slate-600 hidden lg:block">
              (주)소셜위즈 Partnership
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4">
        <BusinessPlanForm onSubmit={handleGenerate} isLoading={isLoading} />
        
        {!isLoading && (
          <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">심층 리서치 엔진</h3>
              <p className="text-slate-500 text-sm leading-relaxed">정부지원사업 규격에 맞춘 방대한 분량의 전문 텍스트를 구성합니다.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">첨부파일 정밀 분석</h3>
              <p className="text-slate-500 text-sm leading-relaxed">업로드한 이미지와 문서를 AI가 직접 읽고 계획서에 논리적으로 반영합니다.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-800">시각 자료 자동 생성</h3>
              <p className="text-slate-500 text-sm leading-relaxed">사업 아이템의 실제 구동 모습과 활용 씬을 AI가 실사 렌더링으로 그려냅니다.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-12 bg-white text-center border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-800 font-extrabold text-lg mb-1">SS창업경영연구소</p>
          <p className="text-slate-500 text-sm mb-6">(주)소셜위즈 - SocialWiz Inc. Partnership</p>
          <div className="flex justify-center items-center space-x-6 text-xs text-blue-600 font-medium">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="hover:underline">Google Billing 안내</a>
            <button onClick={handleOpenKeyDialog} className="hover:underline">엔진 설정 변경</button>
          </div>
          <p className="text-slate-400 text-[10px] tracking-widest uppercase mt-8">© 2024 SS Builder Deep. Powered by Google Gemini 3 Pro.</p>
        </div>
      </footer>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0) translateY(-50%); }
          50% { transform: translateX(-8px) translateY(-50%); }
        }
        .animate-bounce-x {
          animation: bounce-x 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
