
import { GoogleGenAI, Type } from "@google/genai";
import { CompanyInfo, BusinessPlanData } from "../types";

export async function generateBusinessPlan(info: CompanyInfo): Promise<BusinessPlanData> {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
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
        maxOutputTokens: 32768,
        thinkingConfig: { thinkingBudget: 16000 },
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
                    properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }
                  }
                },
                marketResearchDomesticText: { type: Type.STRING },
                marketApproachDomestic: { type: Type.STRING },
                marketResearchGlobal: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }
                  }
                },
                marketResearchGlobalText: { type: Type.STRING },
                marketApproachGlobal: { type: Type.STRING },
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
    if (error.message === "API_KEY_MISSING") throw error;
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateImages(info: CompanyInfo): Promise<string[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return [];

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const images: string[] = [];
  
  const prompts = [
    `Hyper-realistic 3D isometric rendering of ${info.businessItem} product design. Clean laboratory setting, futuristic aesthetic, cinematic studio lighting, 8K, highly detailed.`,
    `A realistic professional photo of a diverse business team brainstorming around ${info.businessItem} in a modern Seoul tech office. Natural lighting, candid but high-end look.`
  ];

  for (const p of prompts) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: p }] },
        config: {
          imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
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
