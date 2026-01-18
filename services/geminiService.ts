
import { GoogleGenAI, Type } from "@google/genai";
import { CompanyInfo, BusinessPlanData } from "../types";

export async function generateBusinessPlan(info: CompanyInfo): Promise<BusinessPlanData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `
    다음 기업 정보를 바탕으로 한국의 '초기창업패키지' PSST 규격에 맞는 전문적인 사업계획서를 작성해줘.
    
    [기업 정보]
    1. 기업명: ${info.companyName}
    2. 사업아이템: ${info.businessItem}
    3. 현 개발상황: ${info.devStatus}
    4. 주요 타켓: ${info.targetAudience}
    5. 대표 및 조직: ${info.teamInfo}
    6. 기타 부연 설명: ${info.additionalInfo}

    [작성 가이드라인]
    - 반드시 한국어로 작성할 것.
    - 반드시 '개조식'(-, 1., 가. 등 기호 활용)으로 작성할 것.
    - 각 주요 섹션(문제인식, 실현가능성, 성장전략 등)은 딥 리서치를 통해 구체적인 시장 데이터와 기술 트렌드를 포함할 것.
    - 응답이 끊기지 않도록 JSON 형식을 엄격히 준수하고, 전체 길이를 8,000 토큰 내외로 조절할 것.
    - 전문적인 사업가 어조를 유지하며, 예산 계획(1억원 규모)을 구체적으로 수립할 것.

    [구조 상세 요구]
    - summary: 과제 소개, 차별성, 목표 시장, 성과 달성 목표
    - problem: 개발 동기(PTSTI 분석 포함), 목적 및 필요성 (핵심 내용 위주 800-1000자 상세 기술)
    - solution: 개발 방안, 단계별 협력 계획, 1억 예산 추진내용(표 데이터), 고객 대응, 경쟁사 분석 (핵심 내용 위주 800-1000자 상세 기술)
    - scaleUp: 자금조달(투자/융자/정책), 1억 상세 집행 계획(표 데이터), 내수/해외 시장 조사(그래프 데이터 포함), 진출 전략 (핵심 내용 위주 800-1000자 상세 기술)
    - team: 대표자 역량, 인원 현황, 고용 계획, ESG 실현 방안 (상세 기술)
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingBudget: 4000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.OBJECT,
            properties: {
              introduction: { type: Type.STRING },
              differentiation: { type: Type.STRING },
              targetMarket: { type: Type.STRING },
              goals: { type: Type.STRING },
            },
            required: ["introduction", "differentiation", "targetMarket", "goals"]
          },
          problem: {
            type: Type.OBJECT,
            properties: {
              motivation: { type: Type.STRING },
              purpose: { type: Type.STRING },
            },
            required: ["motivation", "purpose"]
          },
          solution: {
            type: Type.OBJECT,
            properties: {
              devPlan: { type: Type.STRING },
              stepwisePlan: { type: Type.STRING },
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
              customerResponse: { type: Type.STRING },
              competitorAnalysis: { type: Type.STRING },
            },
            required: ["devPlan", "stepwisePlan", "budgetTable", "customerResponse", "competitorAnalysis"]
          },
          scaleUp: {
            type: Type.OBJECT,
            properties: {
              fundingPlan: { type: Type.STRING },
              salesPlan: { type: Type.STRING },
              policyFundPlan: { type: Type.STRING },
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
              marketResearchDomesticText: { type: Type.STRING },
              marketApproachDomestic: { type: Type.STRING },
              marketPerformanceDomestic: { type: Type.STRING },
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
              marketResearchGlobalText: { type: Type.STRING },
              marketApproachGlobal: { type: Type.STRING },
              marketPerformanceGlobal: { type: Type.STRING },
            },
            required: ["fundingPlan", "detailedBudget", "marketResearchDomestic", "marketApproachDomestic", "marketResearchGlobal", "marketApproachGlobal"]
          },
          team: {
            type: Type.OBJECT,
            properties: {
              capability: { type: Type.STRING },
              hiringStatus: { type: Type.STRING },
              futureHiring: { type: Type.STRING },
              socialValue: { type: Type.STRING },
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
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON 파싱 에러. 원본 텍스트:", text);
    // Attempt basic fix for truncated JSON if possible (though responseSchema usually prevents this unless tokens run out)
    if (text.trim().endsWith('"}') || text.trim().endsWith(']')) {
       // It might be slightly truncated at the very end
       try { return JSON.parse(text + '}'); } catch (e2) {}
    }
    throw new Error("보고서 데이터 생성량이 너무 많아 형식이 손상되었습니다. 내용을 조금 더 구체화하여 다시 시도해 주세요.");
  }
}

export async function generateImages(info: CompanyInfo): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const images: string[] = [];
  
  const prompts = [
    `High-quality 3D architectural or tech concept visualization for: ${info.businessItem}. Professional rendering, cinematic lighting, photorealistic.`,
    `Close-up photorealistic 3D render of ${info.businessItem} core technology components. Studio lighting, white background.`,
    `Realistic photo of ${info.targetAudience} actively using ${info.businessItem} in a bright, modern setting. Professional photography.`,
    `A wide professional shot of ${info.businessItem} being implemented in a corporate or industrial site. Realistic, highly detailed.`
  ];

  for (const p of prompts) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: p }] },
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
