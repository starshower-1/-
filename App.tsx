
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

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async (info: CompanyInfo) => {
    if (!hasKey) {
      const confirm = window.confirm("고품질 이미지 및 딥 리서치 기능을 사용하려면 API 키 선택이 필요합니다. 진행하시겠습니까?");
      if (confirm) {
        await handleOpenKeyDialog();
      } else {
        return;
      }
    }

    setIsLoading(true);
    setPlanData(null); // Clear old data
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
      console.error("Failed to generate plan:", error);
      if (error.message?.includes("Requested entity was not found")) {
        alert("API 키 인증에 실패했습니다. 키를 다시 선택해주세요.");
        setHasKey(false);
      } else if (error.message?.includes("JSON")) {
        alert("데이터 생성량이 너무 많아 오류가 발생했습니다. 조금 더 간단한 핵심 내용으로 다시 시도해주세요.");
      } else {
        alert(`계획서 생성 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`);
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
            className="flex items-center text-white hover:text-blue-400 transition-colors font-bold"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">PSST Builder</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!hasKey && (
              <button 
                onClick={handleOpenKeyDialog}
                className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold hover:bg-amber-200 transition-all flex items-center border border-amber-200"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 012 0v2.586l.707-.707a1 1 0 011.414 1.414l-2.414 2.414a1 1 0 01-1.414 0L6.879 11.293a1 1 0 011.414-1.414l.707.707V7z" clipRule="evenodd" /></svg>
                API 키 선택 (필수)
              </button>
            )}
            <div className="text-sm font-bold text-slate-600 hidden sm:block">
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">개조식 딥 리서치</h3>
              <p className="text-slate-500 text-sm">전문적인 개조식 구성을 통해 사업계획서의 가독성과 설득력을 극대화합니다.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">시장 분석 데이터</h3>
              <p className="text-slate-500 text-sm">AI가 추론한 시장 성장 데이터를 시각적인 차트로 자동 렌더링하여 제시합니다.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">고품질 실사 비주얼</h3>
              <p className="text-slate-500 text-sm">기본구상도와 활용예상도를 전문적인 실사 그래픽으로 자동 생성하여 포함합니다.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 bg-white text-center border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-800 font-extrabold text-lg mb-1">SS창업경영연구소</p>
          <p className="text-slate-500 text-sm mb-4">(주)소셜위즈 - SocialWiz Inc. Partnership</p>
          <p className="text-slate-400 text-xs">© 2024 SS Builder. Powered by Google Gemini 3 Pro AI.</p>
          <div className="mt-6">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] font-medium">
              API 빌링 안내 및 관리 가이드
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
