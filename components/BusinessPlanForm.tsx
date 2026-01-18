
import React, { useState } from 'react';
import { CompanyInfo } from '../types';

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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-200 mt-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">🚀 SS창업경영연구소의 PSST 사업계획서 생성기</h1>
        <p className="text-slate-500 text-lg">딥 리서치 엔진을 통해 1,000자 이상의 개조식 고품질 계획서를 생성합니다.</p>
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
              딥 리서치 및 보고서 작성 중...
            </span>
          ) : '사업계획서 생성하기'}
        </button>
      </form>
    </div>
  );
};

export default BusinessPlanForm;
