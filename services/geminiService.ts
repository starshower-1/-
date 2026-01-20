
import { GoogleGenAI, Type } from "@google/genai";
import { CompanyInfo, BusinessPlanData } from "../types";

/**
 * 사업계획서 생성 함수
 */
export async function generateBusinessPlan(info: CompanyInfo, userKey?: string): Promise<BusinessPlanData> {
  // 1. 사용자 입력 키 -> 2. 환경 변수 -> 3. 오류
  const apiKey = userKey || process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
    throw new Error("API 키가 설정되지 않았습니다. 상단 설정 버튼을 통해 키를 입력해 주세요.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const systemInstruction = `
    당신은 한국의 정부지원사업(특히 초기창업패키지) 전문 컨설턴트이자 수석 심사위원입니다.
    사용자가 제공한 기업 정보와 첨부파일을 정밀 분석하여 압도적인 전문성과 분량을 가진 PSST 사업계획서를 작성하세요.
    섹션별로 매우 구체적인 수치와 전문 프레임워크를 활용해야 합니다.
  `;

  const userPrompt = `
    [기업 정보]
    - 기업명: ${info.companyName}
    - 사업아이템: ${info.businessItem}
    - 현 개발상황: ${info.devStatus}
    - 주요 타켓: ${info.targetAudience}
    - 팀 전문성: ${info.teamInfo}
    - 추가 정보: ${info.additionalInfo}

    '초기창업패키지' 표준 규격에 따른 대용량 사업계획서를 JSON 형태로 응답하세요.
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
                marketApproachDomestic: { type: Type.STRING },
                marketResearchGlobal: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }
                  }
                },
                marketApproachGlobal: { type: Type.STRING },
              },
              required: ["fundingPlan", "detailedBudget", "marketResearchDomestic", "marketApproachDomestic", "marketResearchGlobal", "marketApproachGlobal"]
            },
            team: {
              type: Type.OBJECT,
              properties: {
                capability: { type: Type.STRING },
                hiringStatus: { type: Type.STRING },
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
    if (!text) throw new Error("AI 응답을 생성하지 못했습니다.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

/**
 * 이미지 생성 함수
 */
export async function generateImages(info: CompanyInfo, userKey?: string): Promise<string[]> {
  const apiKey = userKey || process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") return [];

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const images: string[] = [];
  
  const prompts = [
    `Hyper-realistic 3D isometric rendering of ${info.businessItem} product design, futuristic aesthetic, cinematic studio lighting, 8K.`,
    `A realistic professional photo of a business team in a modern office working on ${info.businessItem}.`
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
