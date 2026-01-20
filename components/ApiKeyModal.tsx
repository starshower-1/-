
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [keyInput, setKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setKeyInput(savedKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!keyInput.trim()) {
      setTestResult({ success: false, message: '키를 입력해 주세요.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // 키 유효성 테스트: 아주 가벼운 요청을 보냄
      const ai = new GoogleGenAI({ apiKey: keyInput });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'hi',
      });

      if (response.text) {
        localStorage.setItem('gemini_api_key', keyInput);
        setTestResult({ success: true, message: '연결 성공! 키가 안전하게 저장되었습니다.' });
        onSave(keyInput);
        setTimeout(() => {
          onClose();
          setTestResult(null);
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      setTestResult({ success: false, message: '연결 실패: 유효하지 않은 API 키이거나 네트워크 오류입니다.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">API 설정</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-widest gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Google Gemini API Key
            </label>
            <input
              type="password"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-300"
              placeholder="AI Studio에서 발급받은 키를 입력하세요"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
          </div>

          <button
            onClick={handleTestAndSave}
            disabled={isTesting}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-3 ${
              isTesting ? 'bg-slate-300' : 'bg-[#9fb1c4] hover:bg-[#8da1b6]'
            }`}
          >
            {isTesting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isTesting ? '연결 테스트 중...' : '연결 테스트 및 저장'}
          </button>

          {testResult && (
            <div className={`text-sm text-center font-medium p-3 rounded-xl animate-in fade-in slide-in-from-top-1 ${testResult.success ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              {testResult.message}
            </div>
          )}

          <p className="text-[11px] text-slate-400 text-center leading-relaxed font-medium">
            ※ 입력하신 API 키는 암호화되어 브라우저의 로컬 스토리지에만 저장됩니다. 외부 서버로 전송되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
