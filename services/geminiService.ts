
import { GoogleGenAI, Type } from "@google/genai";
import { CompanyInfo, BusinessPlanData } from "../types";

export async function generateBusinessPlan(info: CompanyInfo): Promise<BusinessPlanData> {
  // Create a new instance to ensure we use the current API key from the environment
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
    - 모든 내용은 한국어로 작성할 것.
    - 반드시 '개조식'(-, 1., 가. 등 기호 활용)으로 작성하여 가독성을 높일 것.
    - 각 주요 섹션은 딥 리서치를 수행하여 구체적인 시장 데이터와 기술 트렌드를 포함할 것.
    - 섹션당 충분한 분량(핵심 내용 위주로 상세히)을 작성하되, 응답이 끊기지 않도록 논리적으로 구성할 것.
    - 전문적이고 신뢰감 있는 사업가의 어조를 유지할 것.
    - 예산 계획(1억원 규모)을 구체적인 산출 근거와 함께 수립할 것.

    [요구 구조]
    - summary: 과제 소개, 차별성, 목표 시장, 성과 달성 목표
    - problem: 개발 동기(PTSTI 분석 포함), 목적 및 필요성
    - solution: 개발 방안, 단계별 협력 계획, 1억 예산 추진내용(표 데이터 포함), 고객 요구 대응, 경쟁사 분석
    - scaleUp: 자금조달(투자/융자/정책), 1억 상세 집행 계획(표 데이터 포함), 내수/해외 시장 조사(그래프용 숫자 데이터 포함), 진출 전략
    - team: 대표자 역량, 인원 현황, 고용 계획, ESG 실현 방안
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      // Increase output tokens and thinking budget to support deep research and prevent truncation
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
    throw new Error("보고서 데이터 형식이 올바르지 않습니다. 다시 시도해주세요.");
  }
}

export async function generateImages(info: CompanyInfo): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const images: string[] = [];
  
  const prompts = [
    `Photorealistic architectural concept visualization for: ${info.businessItem}. Professional 3D rendering, clean tech aesthetic, cinematic lighting, 8k resolution.`,
    `Detailed product design schematic, photorealistic 3D render of ${info.businessItem} core technology. White studio background, professional engineering presentation.`,
    `Action shot: Realistic high-quality photo of ${info.targetAudience} using ${info.businessItem} in a real-world environment. Sharp focus, natural lighting, professional photography.`,
    `Implementation scene: A professional business environment showing ${info.businessItem} fully operational. Realistic, highly detailed, high-end corporate style.`
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
      console.error("Image generation failed for prompt:", p, e);
    }
  }

  return images;
}
