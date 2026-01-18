
import { GoogleGenAI, Type } from "@google/genai";
import { CompanyInfo, BusinessPlanData } from "../types";

export async function generateBusinessPlan(info: CompanyInfo): Promise<BusinessPlanData> {
  // Always create a fresh instance right before the call to ensure the latest API key is used.
  // Obtain apiKey exclusively from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    - 반드시 전문적인 '개조식'(-, 1., 가. 등 기호 활용)으로 작성하여 가독성을 극대화할 것.
    - 각 주요 섹션(문제인식, 실현가능성, 성장전략)은 딥 리서치를 수행하여 구체적인 시장 수치, 기술적 트렌드, 산업 현황을 포함할 것.
    - 각 섹션의 설명 텍스트는 최소 800자에서 1,200자 사이의 풍부한 분량으로 상세히 기술할 것.
    - JSON 응답 형식을 엄격히 준수하고, 절대 중간에 끊기지 않도록 논리적으로 완결할 것.
    - 전문적인 사업가 및 심사위원의 시각에서 설득력 있게 작성할 것.
    - 1억원 규모의 정부지원금 활용 계획(재료비, 외주비 등)을 사실적인 산출 근거와 함께 수립할 것.

    [구조 상세 요구]
    - summary: 과제 소개, 차별성, 목표 시장, 성과 달성 목표
    - problem: 개발 동기(PTSTI 분석: Policy, Technology, Social, Trend, Industry), 목적 및 필요성 (매우 상세히)
    - solution: 개발 방안, 단계별 협력 계획, 1억 예산 추진내용(표 데이터), 고객 대응, 경쟁사 분석 (매우 상세히)
    - scaleUp: 자금조달(투자/융자/정책), 1억 상세 집행 계획(정부70%, 자부담30% 비중 반영), 내수/해외 시장 조사(그래프용 숫자 데이터 포함), 진출 전략 (매우 상세히)
    - team: 대표자 역량, 인원 현황, 고용 계획, ESG 실현 방안 (상세 기술)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        // High maxOutputTokens to accommodate the requested 1,000 characters per section
        maxOutputTokens: 16384, 
        thinkingConfig: { thinkingBudget: 8000 },
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
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // If the error looks like it might be a truncation or format issue, throw a specific message
    if (error instanceof SyntaxError) {
      throw new Error("보고서 데이터가 너무 방대하여 생성 중 일부가 누락되었습니다. 조금 더 구체적인 핵심 정보를 입력하시거나 다시 시도해 주세요.");
    }
    throw error;
  }
}

export async function generateImages(info: CompanyInfo): Promise<string[]> {
  // Use named parameter for apiKey and obtain exclusively from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const images: string[] = [];
  
  // High quality prompts for realistic views as requested
  const prompts = [
    `Realistic 3D architectural rendering of ${info.businessItem} product concept. Sharp detail, cinematic high-tech laboratory background, professional studio lighting, 8K photorealistic.`,
    `Close-up macroscopic high-quality photo of ${info.businessItem} core technology components and engineering assembly. Realistic materials, depth of field, professional tech photography.`,
    `A high-resolution realistic photo showing ${info.targetAudience} using ${info.businessItem} in a modern, professional business environment. Natural light, sharp focus, authentic commercial style.`,
    `A wide-angle realistic corporate scene showing ${info.businessItem} being utilized in a daily workflow within a clean, high-tech office. Photorealistic, high quality.`
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
