
import { GoogleGenAI, Type } from "@google/genai";
import { CompanyInfo, BusinessPlanData } from "../types";

export async function generateBusinessPlan(info: CompanyInfo): Promise<BusinessPlanData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const textPart = {
    text: `
    다음 기업 정보와 첨부된 파일(이미지/PDF 분석 내용)을 바탕으로 한국의 '초기창업패키지' PSST 규격에 맞는 전문적인 사업계획서를 작성해줘.
    
    [기업 정보]
    1. 기업명: ${info.companyName}
    2. 사업아이템: ${info.businessItem}
    3. 현 개발상황: ${info.devStatus}
    4. 주요 타켓: ${info.targetAudience}
    5. 대표 및 조직: ${info.teamInfo}
    6. 기타 부연 설명: ${info.additionalInfo}

    [작성 핵심 요구사항 - 분량 대폭 확대]
    - 반드시 한국어로 작성할 것.
    - 반드시 전문적인 '개조식'(-, 1., 가. 등 기호 활용)으로 작성할 것.
    - **중요: 각 주요 섹션(문제인식, 실현가능성, 성장전략 등)의 설명 텍스트를 현재보다 약 3배 이상 풍부하게(각 항목당 2,500자 이상 목표) 작성할 것.**
    - 첨부된 파일이 있다면 그 내용을 깊이 있게 분석하여 계획서에 반영할 것.
    - PTSTI 분석, 5-Forces 분석, SWOT 분석 등 경영 전략 프레임워크를 개조식 내에 상세히 녹여낼 것.
    - 시장 규모 데이터(TAM/SAM/SOM), 기술적 구현 로드맵, 연차별 고용 및 매출 목표를 매우 구체적으로 제시할 것.
    - JSON 응답 형식을 엄격히 준수할 것.

    [구조 상세 요구]
    - summary: 과제 소개, 차별성, 목표 시장, 성과 달성 목표 (매우 상세히)
    - problem: 개발 동기, 목적 및 필요성 (사회적/기술적/경제적 측면에서 3배 분량으로 상세 기술)
    - solution: 개발 방안, 단계별 협력 계획, 예산 추진내용, 고객 대응, 경쟁사 분석 (실제 구현 시나리오를 포함하여 3배 분량 기술)
    - scaleUp: 자금조달, 집행 계획, 내수/해외 시장 조사, 진출 전략 (구체적인 수치와 5개년 로드맵 포함)
    - team: 대표자 및 팀원 역량, 고용 계획, ESG 경영 실천 방안 (상세 기술)
  `};

  const attachmentParts = (info.attachments || []).map(att => ({
    inlineData: {
      data: att.data,
      mimeType: att.mimeType
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [textPart, ...attachmentParts] },
      config: {
        maxOutputTokens: 32768, // Maximize for 3x content
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
    if (error instanceof SyntaxError) {
      throw new Error("보고서 분량이 너무 방대하여 처리 중 형식이 손상되었습니다. 다시 시도해 주세요.");
    }
    throw error;
  }
}

export async function generateImages(info: CompanyInfo): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const images: string[] = [];
  
  const prompts = [
    `Realistic 3D architectural rendering of ${info.businessItem}. Referencing the provided documents for technical details. Sharp detail, professional laboratory background, 8K photorealistic.`,
    `Close-up macroscopic photo of the core technology from ${info.businessItem}. Engineering assembly, realistic materials, studio lighting.`,
    `Realistic photo of ${info.targetAudience} using ${info.businessItem} in a real-world scenario. Sharp focus, natural lighting, professional photography.`,
    `Implementation scene of ${info.businessItem} at a corporate or industrial site. Highly detailed, high-end corporate style.`
  ];

  const attachmentParts = (info.attachments || [])
    .filter(att => att.mimeType.startsWith('image/'))
    .slice(0, 2) // Use first 2 images as visual reference
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
