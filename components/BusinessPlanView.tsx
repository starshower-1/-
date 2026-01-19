
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BusinessPlanData } from '../types';

interface Props {
  data: BusinessPlanData | null;
  images: string[];
}

const BusinessPlanView: React.FC<Props> = ({ data, images }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (!data) {
    return (
      <div className="bg-white max-w-[210mm] mx-auto p-12 text-center shadow-xl rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-slate-100 rounded"></div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">대용량 데이터를 구성하고 있습니다. 약 1분 정도 소요될 수 있습니다...</p>
      </div>
    );
  }

  const { summary, problem, solution, scaleUp, team } = data;

  return (
    <div id="plan-container" className="bg-white max-w-[210mm] mx-auto p-[15mm] sm:p-[20mm] shadow-2xl mb-10 leading-relaxed text-slate-800 rounded-sm">
      <div className="border-b-4 border-slate-800 pb-4 mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 uppercase tracking-tight">초기창업패키지 사업계획서 (심층 리서치 버전)</h1>
        <p className="text-base sm:text-lg text-slate-600 font-bold italic">SS창업경영연구소 & (주)소셜위즈 Partnership</p>
      </div>

      {/* 1. Summary */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">1. 사업화 과제 개요(요약)</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">1.1 사업화 과제 소개</h3>
            <div className="whitespace-pre-wrap text-sm border p-4 bg-slate-50/50 rounded shadow-sm text-justify">{summary.introduction || '내용 없음'}</div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">1.2 사업화 과제 차별성</h3>
            <div className="whitespace-pre-wrap text-sm border p-4 bg-slate-50/50 rounded shadow-sm text-justify">{summary.differentiation || '내용 없음'}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-bold mb-2">1.3 목표 시장</h3>
              <div className="whitespace-pre-wrap text-sm border p-4 bg-slate-50/50 rounded h-full shadow-sm text-justify">{summary.targetMarket || '내용 없음'}</div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">1.4 달성 목표</h3>
              <div className="whitespace-pre-wrap text-sm border p-4 bg-slate-50/50 rounded h-full shadow-sm text-justify">{summary.goals || '내용 없음'}</div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">1.5 핵심 비주얼 (첨부파일 기반 AI 생성)</h3>
            <div className="grid grid-cols-2 gap-4">
              {images && images.length > 0 ? images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="overflow-hidden rounded-lg shadow-md border border-slate-200 h-40 sm:h-48">
                    <img src={img} alt={`Visual ${idx}`} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center font-bold tracking-wider uppercase">
                    {idx < 2 ? '기본구상도' : '활용예상도'} #{idx % 2 + 1}
                  </p>
                </div>
              )) : (
                <div className="col-span-2 border-2 border-dashed border-slate-200 rounded-lg h-40 flex flex-col items-center justify-center text-slate-400">
                  <p className="text-xs italic">이미지를 생성하지 못했습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">2. 문제인식(Problem)</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-3">2.1 제품 서비스 개발 동기 (PTSTI 딥 리서치 및 첨부파일 정밀 분석)</h3>
            <div className="whitespace-pre-wrap text-sm leading-7 text-justify border-b pb-6 text-slate-700">{problem.motivation || '데이터 생성 오류'}</div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">2.2 제품 및 서비스의 목적 및 필요성 (사회/경제적 파급효과 포함)</h3>
            <div className="whitespace-pre-wrap text-sm leading-7 text-justify border-b pb-6 text-slate-700">{problem.purpose || '데이터 생성 오류'}</div>
          </div>
        </div>
      </section>

      {/* 3. Solution */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">3. 실현가능성(Solution)</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-3">3.1 제품 서비스의 상세 개발 및 구현 방안</h3>
            <div className="whitespace-pre-wrap text-sm mb-6 leading-7 text-justify text-slate-700 border-b pb-6">{solution.devPlan || '내용 없음'}</div>
            
            <h4 className="font-bold mb-3 text-blue-700 text-base">3.1.1 연차별/단계별 개발 로드맵 및 협력 네트워크</h4>
            <div className="whitespace-pre-wrap text-sm mb-6 leading-7 text-justify text-slate-700 border-b pb-6">{solution.stepwisePlan || '내용 없음'}</div>
            
            <h4 className="font-bold mb-3 text-blue-700 text-base">3.1.2 금년도 추진 상세 계획 및 예산 집행 세부 전략</h4>
            <div className="overflow-x-auto shadow-sm rounded-lg border border-slate-200 mb-6">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-3 text-left">추진 핵심 항목</th>
                    <th className="p-3 text-center">수행 기간</th>
                    <th className="p-3 text-left">세부 수행 내용 및 기대 성과</th>
                  </tr>
                </thead>
                <tbody>
                  {(solution.budgetTable || []).map((row: any, i: number) => (
                    <tr key={i} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-700">{row.item}</td>
                      <td className="p-3 text-center whitespace-nowrap text-slate-600">{row.period}</td>
                      <td className="p-3 text-slate-600">{row.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">3.2 고객 요구사항 분석 및 글로벌 경쟁 우위 확보 방안</h3>
            <div className="whitespace-pre-wrap text-sm mb-6 leading-7 text-justify text-slate-700 border-b pb-6">{solution.customerResponse || '내용 없음'}</div>
            <h4 className="font-bold mb-3 text-blue-700 text-base">초격차 경쟁사 분석 및 비교 우위 전략</h4>
            <div className="whitespace-pre-wrap text-sm leading-7 text-justify text-slate-700">{solution.competitorAnalysis || '내용 없음'}</div>
          </div>
        </div>
      </section>

      {/* 4. Scale-up */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">4. 성장전략(Scale-up)</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-3">4.1 자금 소요 분석 및 후속 투자 유치 계획</h3>
            <div className="whitespace-pre-wrap text-sm mb-6 leading-7 text-justify text-slate-700 border-b pb-6">{scaleUp.fundingPlan || '내용 없음'}</div>
            <div className="overflow-x-auto shadow-sm rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-3 text-left">세부 비목 (정부지원금 활용)</th>
                    <th className="p-3 text-left">구체적 산출 근거</th>
                    <th className="p-3 text-right">집행 금액(만원)</th>
                  </tr>
                </thead>
                <tbody>
                  {(scaleUp.detailedBudget || []).map((row: any, i: number) => (
                    <tr key={i} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-700">{row.category}</td>
                      <td className="p-3 text-slate-600">{row.basis}</td>
                      <td className="p-3 text-right font-medium text-blue-600">{row.amount?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50/50 font-extrabold border-t border-blue-200">
                    <td colSpan={2} className="p-3 text-center text-slate-800">사업비 총계 (정부지원금 + 민간대응자금)</td>
                    <td className="p-3 text-right text-blue-800 text-sm">
                      {(scaleUp.detailedBudget || []).reduce((sum: number, b: any) => sum + (b.amount || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">4.2 글로벌 시장 심층 분석 및 공격적 진출 로드맵</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="h-64 p-4 border rounded-xl bg-slate-50/30">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scaleUp.marketResearchDomestic || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {(scaleUp.marketResearchDomestic || []).map((entry: any, index: number) => (
                        <Cell key={`cell-dom-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-center mt-2 font-extrabold text-slate-500 uppercase tracking-widest italic">내수 시장 성장 시뮬레이션 (단위: 억원)</p>
              </div>
              <div className="h-64 p-4 border rounded-xl bg-slate-50/30">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scaleUp.marketResearchGlobal || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {(scaleUp.marketResearchGlobal || []).map((entry: any, index: number) => (
                        <Cell key={`cell-glob-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-center mt-2 font-extrabold text-slate-500 uppercase tracking-widest italic">글로벌 시장 점유율 예측 (단위: 억원)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-extrabold mb-3 text-slate-800 flex items-center border-b pb-2">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                  국내 거점 확보 및 시장 안착 전략
                </h4>
                <div className="whitespace-pre-wrap text-xs leading-7 text-slate-600 text-justify">{scaleUp.marketApproachDomestic || '내용 없음'}</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-extrabold mb-3 text-slate-800 flex items-center border-b pb-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
                  글로벌 GTM(Go-To-Market) 추진 전략
                </h4>
                <div className="whitespace-pre-wrap text-xs leading-7 text-slate-600 text-justify">{scaleUp.marketApproachGlobal || '내용 없음'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Team */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-8 border-blue-600 pl-4 mb-6 bg-slate-50 py-2">5. 팀구성(Team)</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-3">5.1 대표자 및 핵심 인력 역량 (전문성 및 사업화 의지)</h3>
            <div className="whitespace-pre-wrap text-sm leading-7 text-justify border p-6 rounded-xl bg-slate-50/20 shadow-inner text-slate-700">{team.capability || '내용 없음'}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <h3 className="text-lg font-bold mb-3">5.2 현직 인력 현황 및 향후 고용 로드맵</h3>
              <div className="whitespace-pre-wrap text-sm leading-7 text-justify border p-6 rounded-xl bg-slate-50/20 shadow-inner text-slate-700">{team.hiringStatus || '내용 없음'}</div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">5.3 사회적 가치 실현 및 ESG 경영 추진 방안</h3>
              <div className="whitespace-pre-wrap text-sm leading-7 text-justify border p-6 rounded-xl bg-slate-50/20 shadow-inner text-slate-700">{team.socialValue || '내용 없음'}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-20 pt-10 border-t-2 border-slate-100 text-center">
        <div className="flex justify-center items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">SS</div>
          <span className="text-sm font-extrabold text-slate-500 tracking-tighter uppercase">SocialWiz Deep AI Analysis</span>
        </div>
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
          CONFIDENTIAL - SS창업경영연구소 & (주)소셜위즈 첨단 AI 생성 보고서
        </p>
      </div>
    </div>
  );
};

export default BusinessPlanView;
