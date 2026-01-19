
import React, { useState, useRef } from 'react';
import { CompanyInfo, Attachment } from '../types';

interface Props {
  onSubmit: (info: CompanyInfo) => void;
  isLoading: boolean;
}

const BusinessPlanForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CompanyInfo>({
    companyName: '',
    businessItem: '',
    devStatus: '',
    targetAudience: '',
    teamInfo: '',
    additionalInfo: '',
    attachments: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await fileToBase64(file);
      newAttachments.push({
        data: base64.split(',')[1],
        mimeType: file.type
      });
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-200 mt-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">🚀 SS창업경영연구소의 PSST 사업계획서 생성기</h1>
        <p className="text-slate-500 text-lg">딥 리서치 및 첨부파일 분석을 통해 압도적 분량의 계획서를 생성합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">1. 기업명</label>
            <input
              type="text"
              name="companyName"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="예: (주)알파고테크"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">2. 사업아이템</label>
            <input
              type="text"
              name="businessItem"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="예: AI 기반 스마트 팩토리 솔루션"
              value={formData.businessItem}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">3. 현 개발상황</label>
          <textarea
            name="devStatus"
            required
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
            placeholder="현재까지의 진행 상황을 적어주세요. (예: MVP 개발 완료, 특허 출원 중)"
            value={formData.devStatus}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">4. 주요 타켓</label>
          <input
            type="text"
            name="targetAudience"
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            placeholder="누구를 위한 서비스인가요? (예: 30대 직장인, 중소 제조기업)"
            value={formData.targetAudience}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">5. 대표 및 조직 이야기</label>
          <textarea
            name="teamInfo"
            required
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
            placeholder="팀원들의 전문성이나 조직의 강점을 적어주세요."
            value={formData.teamInfo}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">6. 기타 부연 설명 (Optional)</label>
          <textarea
            name="additionalInfo"
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
            placeholder="추가로 전달하고 싶은 특징이나 비전이 있다면 적어주세요."
            value={formData.additionalInfo}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 border-t pt-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">7. 참고 파일 첨부 (이미지, PDF 등)</label>
          <div className="flex items-center space-x-4 mb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              파일 추가
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept="image/*,application/pdf"
            />
            <span className="text-xs text-slate-400">첨부된 파일은 AI가 분석하여 계획서와 이미지 생성에 활용합니다.</span>
          </div>

          {formData.attachments && formData.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.attachments.map((file, idx) => (
                <div key={idx} className="flex items-center bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                  <span className="truncate max-w-[150px]">파일 {idx + 1} ({file.mimeType.split('/')[1]})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="ml-2 text-blue-400 hover:text-blue-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transform transition-all active:scale-95 ${
            isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              첨부파일 분석 및 딥 리서치 수행 중...
            </span>
          ) : '초대형 사업계획서 생성하기'}
        </button>
      </form>
    </div>
  );
};

export default BusinessPlanForm;
