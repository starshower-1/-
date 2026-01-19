
import { GoogleGenAI, Type } from "@google/genai";
import { CompanyInfo, BusinessPlanData } from "../types";

export async function generateBusinessPlan(info: CompanyInfo): Promise<BusinessPlanData> {
  // Use named parameter for apiKey and obtain exclusively from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    당신은 한국의 정부지원사업(특히 초기창업패키지) 전문 컨설턴트이자 수석 심사위원입니다.
    사용자가 제공한 기업 정보와 첨부파일(이미지, PDF 등)을 정밀 분석하여 압도적인 전문성과 분량을 가진 PSST 사업계획서를 작성하세요.

    [핵심 작성 가이드]
    1. 분량 극대화: 현재의 표준적인 답변보다 약 3배 이상의 텍스트를 생성하세요. 각 섹션 설명은 최소 2,000자 이상의 풍성한 내용을 담아야 합니다.
    2. 전문 용어 사용: PTSTI 분석, TAM/SAM/SOM 시장 획정, 5-Forces 분석, SWOT 분석, 린 캔버스 모델링 등 경영 전문 프레임워크를 적극 활용하세요.
    3. 구체성: "열심히 하겠다"는 식의 표현 대신 "연차별 고용 창출 X명, 시장 점유율 Y%, 매출 목표 Z억원" 등 구체적인 수치와 로드맵을 제시하세요.
    4. 첨부파일 반영: 첨부된 이미지나 문서 내용을 분석하여, 그 안에 담긴 기술적 특이점이나 시장 데이터를 계획서 본문에 강력하게 인용하세요.
    5. 어조: 매우 전문적이고 설득력 있는 비즈니스 개조식 어조를 유지하세요.
    6. 예산 수립: 1억원 규모의 정부지원금 집행 계획을 사실적인 단가와 함께 세부 비목별로 수립하세요.
  `;

  const userPrompt = `
    [입력된 기업 정보]
    - 기업명: ${info.companyName}
    - 사업아이템: ${info.businessItem}
    - 현 개발상황: ${info.devStatus}
    - 주요 타켓: ${info.targetAudience}
    - 팀 전문성: ${info.teamInfo}
    - 추가 정보: ${info.additionalInfo}

    위 정보와 첨부된 시각 자료/문서 분석 결과를 바탕으로 '초기창업패키지' 표준 규격에 따른 대용량 사업계획서를 JSON 형태로 응답하세요.
    모든 텍스트는 개조식 기호(-, 1., 가. 등)를 사용하여 전문적으로 구조화하세요.
  `;

  const attachmentParts = (info.attachments || []).map(att => ({
    inlineData: {
      data: att.data,
      mimeType: att.mimeType
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: userPrompt }, ...attachmentParts] },
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 32768, // Max tokens for ultra-long content
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                introduction: { type: Type.STRING, description: "사업의 핵심 내용, 아이템의 가치 제안 (매우 상세)" },
                differentiation: { type: Type.STRING, description: "기존 솔루션 대비 기술적/비즈니스적 차별점 (매우 상세)" },
                targetMarket: { type: Type.STRING, description: "핵심 타겟팅 전략 및 시장 획정 (매우 상세)" },
                goals: { type: Type.STRING, description: "최종적인 비즈니스 목표 및 기대 성과 (매우 상세)" },
              },
              required: ["introduction", "differentiation", "targetMarket", "goals"]
            },
            problem: {
              type: Type.OBJECT,
              properties: {
                motivation: { type: Type.STRING, description: "아이템 개발 동기 (PTSTI 분석 및 딥 리서치 데이터 포함, 3배 분량)" },
                purpose: { type: Type.STRING, description: "사업의 필요성 및 해결하고자 하는 사회적/경제적 문제 (3배 분량)" },
              },
              required: ["motivation", "purpose"]
            },
            solution: {
              type: Type.OBJECT,
              properties: {
                devPlan: { type: Type.STRING, description: "상세 기술 구현 방안 및 핵심 아키텍처 (3배 분량)" },
                stepwisePlan: { type: Type.STRING, description: "단계별 구현 시나리오 및 산출물 정의 (3배 분량)" },
                budgetTable: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      item: { type: Type.STRING },
                      period: { type: Type.STRING },
                      content: { type: Type.STRING },
                    }
                  }
                },
                customerResponse: { type: Type.STRING, description: "고객 확보 방안 및 유입 시나리오 (3배 분량)" },
                competitorAnalysis: { type: Type.STRING, description: "글로벌 경쟁사 3곳 이상과의 정밀 비교 및 초격차 전략 (3배 분량)" },
              },
              required: ["devPlan", "stepwisePlan", "budgetTable", "customerResponse", "competitorAnalysis"]
            },
            scaleUp: {
              type: Type.OBJECT,
              properties: {
                fundingPlan: { type: Type.STRING, description: "자금 소요 내역 및 투자 유치 로드맵 (매우 상세)" },
                salesPlan: { type: Type.STRING, description: "연차별 매출 달성 계획 및 마케팅 전략 (매우 상세)" },
                policyFundPlan: { type: Type.STRING, description: "정부 지원금 외 후속 정책자금 연계 계획 (매우 상세)" },
                detailedBudget: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      basis: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                    }
                  }
                },
                marketResearchDomestic: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER },
                    }
                  }
                },
                marketResearchDomesticText: { type: Type.STRING, description: "내수 시장 분석 데이터 설명 (3배 분량)" },
                marketApproachDomestic: { type: Type.STRING, description: "국내 시장 점유 전략 (3배 분량)" },
                marketResearchGlobal: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER },
                    }
                  }
                },
                marketResearchGlobalText: { type: Type.STRING, description: "해외 시장 분석 데이터 설명 (3배 분량)" },
                marketApproachGlobal: { type: Type.STRING, description: "글로벌 진출 시나리오 및 파트너십 전략 (3배 분량)" },
              },
              required: ["fundingPlan", "detailedBudget", "marketResearchDomestic", "marketApproachDomestic", "marketResearchGlobal", "marketApproachGlobal"]
            },
            team: {
              type: Type.OBJECT,
              properties: {
                capability: { type: Type.STRING, description: "대표자 및 핵심 팀원의 이력 및 사업 수행 역량 (3배 분량)" },
                hiringStatus: { type: Type.STRING, description: "현 고용 인원 및 연도별 추가 채용 로드맵 (매우 상세)" },
                futureHiring: { type: Type.STRING },
                socialValue: { type: Type.STRING, description: "ESG 경영 실천 방안 및 사회적 가치 기여 (매우 상세)" },
              },
              required: ["capability", "hiringStatus", "socialValue"]
            }
          },
          required: ["summary", "problem", "solution", "scaleUp", "team"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 응답이 비어있습니다.");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error("대용량 데이터 생성 중 JSON 파싱 오류가 발생했습니다. 입력 정보를 요약하여 다시 시도하거나, 재시작해 주세요.");
    }
    throw error;
  }
}

export async function generateImages(info: CompanyInfo): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const images: string[] = [];
  
  // Create richer prompts including technical context
  const prompts = [
    `Hyper-realistic 3D isometric rendering of ${info.businessItem} product design. Clean laboratory setting, futuristic aesthetic, cinematic studio lighting, 8K, highly detailed.`,
    `Close-up macroscopic high-quality technical shot of the core mechanism for ${info.businessItem}. Professional materials, depth of field, sharp focus on engineering parts.`,
    `A realistic professional photo of a diverse business team brainstorming around ${info.businessItem} in a modern Seoul tech office. Natural lighting, candid but high-end look.`,
    `A wide visual simulation of ${info.businessItem} being applied in a large-scale industrial or smart city environment. Breathtaking details, photorealistic architectural visualization.`
  ];

  // Pass image attachments as visual reference if available
  const attachmentParts = (info.attachments || [])
    .filter(att => att.mimeType.startsWith('image/'))
    .slice(0, 3) 
    .map(att => ({
      inlineData: {
        data: att.data,
        mimeType: att.mimeType
      }
    }));

  for (const p of prompts) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: p }, ...attachmentParts] },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      }
    } catch (e) {
      console.error("Image generation failed:", e);
    }
  }

  return images;
}
