
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BusinessPlanData } from '../types';

interface Props {
  data: BusinessPlanData;
  images: string[];
}

const BusinessPlanView: React.FC<Props> = ({ data, images }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (!data || !data.summary) {
    return (
      <div className="bg-white max-w-[210mm] mx-auto p-10 text-center shadow-xl rounded-xl">
        <p className="text-slate-500">데이터를 불러오는 중 오류가 발생했거나 데이터가 부족합니다.</p>
      </div>
    );
  }

  return (
    <div id="plan-container" className="bg-white max-w-[210mm] mx-auto p-[15mm] sm:p-[20mm] shadow-2xl mb-10 overflow-hidden leading-relaxed text-slate-800 rounded-sm">
      <div className="border-b-4 border-slate-800 pb-4 mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 uppercase tracking-tight">초기창업패키지 사업계획서</h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium italic">SS창업경영연구소 & (주)소셜위즈</p>
      </div>

      {/* 1. Summary */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">1. 사업화 과제 개요(요약)</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">1.1 사업화 과제 소개</h3>
            <div className="whitespace-pre-wrap text-sm border p-3 bg-slate-50/50 rounded">{data.summary?.introduction || '내용 없음'}</div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">1.2 사업화 과제 차별성</h3>
            <div className="whitespace-pre-wrap text-sm border p-3 bg-slate-50/50 rounded">{data.summary?.differentiation || '내용 없음'}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-bold mb-2">1.3 목표 시장</h3>
              <div className="whitespace-pre-wrap text-sm border p-3 bg-slate-50/50 rounded h-full">{data.summary?.targetMarket || '내용 없음'}</div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">1.4 달성 목표</h3>
              <div className="whitespace-pre-wrap text-sm border p-3 bg-slate-50/50 rounded h-full">{data.summary?.goals || '내용 없음'}</div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">1.5 핵심 비주얼 (AI 기반 실사 4컷)</h3>
            <div className="grid grid-cols-2 gap-4">
              {images.length > 0 ? images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="space-y-1">
                  <img src={img} alt={`Visual ${idx}`} className="rounded-lg shadow-md border object-cover w-full h-40 sm:h-48" />
                  <p className="text-[10px] text-slate-400 text-center">
                    {idx < 2 ? '기본구상도' : '활용예상도'} #{idx % 2 + 1}
                  </p>
                </div>
              )) : (
                <div className="col-span-2 border-2 border-dashed border-slate-200 rounded-lg h-40 flex items-center justify-center text-slate-400 italic">
                  이미지 생성 중 오류가 발생했거나 생성되지 않았습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="mb-12 page-break">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">2. 문제인식(Problem)</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">2.1 제품 서비스 개발 동기 (PTSTI 분석)</h3>
            <div className="whitespace-pre-wrap text-sm leading-6 text-justify">{data.problem?.motivation || '내용 없음'}</div>
          </div>
          <div className="pt-4">
            <h3 className="text-lg font-bold mb-2">2.2 제품 및 서비스의 목적 및 필요성</h3>
            <div className="whitespace-pre-wrap text-sm leading-6 text-justify">{data.problem?.purpose || '내용 없음'}</div>
          </div>
        </div>
      </section>

      {/* 3. Solution */}
      <section className="mb-12 page-break">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">3. 실현가능성(Solution)</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">3.1 제품 서비스의 개발 방안</h3>
            <div className="whitespace-pre-wrap text-sm mb-4 leading-6">{data.solution?.devPlan || '내용 없음'}</div>
            <h4 className="font-semibold mb-2">3.1.1 단계별 개발 및 협력체 구성</h4>
            <div className="whitespace-pre-wrap text-sm mb-4 leading-6">{data.solution?.stepwisePlan || '내용 없음'}</div>
            
            <h4 className="font-semibold mb-2">3.1.2 금년도 추진 계획 및 예산 활용</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2">항목</th>
                    <th className="border border-slate-300 p-2">기간</th>
                    <th className="border border-slate-300 p-2">세부 내용</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.solution?.budgetTable || []).map((row, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 p-2 font-medium">{row.item}</td>
                      <td className="border border-slate-300 p-2 text-center whitespace-nowrap">{row.period}</td>
                      <td className="border border-slate-300 p-2">{row.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-bold mb-2">3.2 고객 요구사항 및 경쟁사 분석</h3>
            <div className="whitespace-pre-wrap text-sm mb-4 leading-6">{data.solution?.customerResponse || '내용 없음'}</div>
            <h4 className="font-semibold mb-2">경쟁사 및 시장 환경 분석</h4>
            <div className="whitespace-pre-wrap text-sm leading-6">{data.solution?.competitorAnalysis || '내용 없음'}</div>
          </div>
        </div>
      </section>

      {/* 4. Scale-up */}
      <section className="mb-12 page-break">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">4. 성장전략(Scale-up)</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">4.1 자금 소요 및 조달 계획</h3>
            <div className="whitespace-pre-wrap text-sm mb-4 leading-6">{data.scaleUp?.fundingPlan || '내용 없음'}</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2">비목</th>
                    <th className="border border-slate-300 p-2">산출 근거</th>
                    <th className="border border-slate-300 p-2">금액(만원)</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.scaleUp?.detailedBudget || []).map((row, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 p-2">{row.category}</td>
                      <td className="border border-slate-300 p-2">{row.basis}</td>
                      <td className="border border-slate-300 p-2 text-right">{row.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-bold">
                    <td colSpan={2} className="border border-slate-300 p-2 text-center">합계</td>
                    <td className="border border-slate-300 p-2 text-right">
                      {(data.scaleUp?.detailedBudget || []).reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-bold mb-4">4.2 시장 조사 및 진출 전략</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.scaleUp?.marketResearchDomestic || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value">
                      {(data.scaleUp?.marketResearchDomestic || []).map((entry, index) => (
                        <Cell key={`cell-dom-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-center mt-1">내수 시장 규모 전망</p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.scaleUp?.marketResearchGlobal || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value">
                      {(data.scaleUp?.marketResearchGlobal || []).map((entry, index) => (
                        <Cell key={`cell-glob-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-center mt-1">글로벌 시장 성장 지표</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-8">
              <div className="bg-slate-50 p-4 rounded-lg border">
                <h4 className="font-bold mb-2">내수 진출 전략</h4>
                <div className="whitespace-pre-wrap text-xs leading-5">{data.scaleUp?.marketApproachDomestic || '내용 없음'}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border">
                <h4 className="font-bold mb-2">글로벌 진출 전략</h4>
                <div className="whitespace-pre-wrap text-xs leading-5">{data.scaleUp?.marketApproachGlobal || '내용 없음'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Team */}
      <section className="page-break">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">5. 팀구성(Team)</h2>
        <div className="space-y-6">
          <div className="pt-2">
            <h3 className="text-lg font-bold mb-2">5.1 대표자 및 조직 역량</h3>
            <div className="whitespace-pre-wrap text-sm leading-6">{data.team?.capability || '내용 없음'}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <h3 className="text-lg font-bold mb-2">5.2 현 재직 및 고용 계획</h3>
              <div className="whitespace-pre-wrap text-sm leading-6">{data.team?.hiringStatus || '내용 없음'}</div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">5.3 사회적 가치 실현 (ESG)</h3>
              <div className="whitespace-pre-wrap text-sm leading-6">{data.team?.socialValue || '내용 없음'}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
        본 사업계획서는 SS창업경영연구소 & (주)소셜위즈의 AI 기술을 통해 생성되었습니다. 무단 복제 및 배포를 금합니다.
      </div>
    </div>
  );
};

export default BusinessPlanView;
