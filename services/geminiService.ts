import { GoogleGenAI, Type } from "@google/genai";
import { HireGeniusResponse, ComparisonResult } from "../types";

// Initialize the API client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    extractedName: { type: Type.STRING, description: "The full name of the candidate extracted from the resume." },
    recommendation: { type: Type.STRING, enum: ['Strong Hire', 'Hire', 'Maybe', 'Pass'] },
    confidenceScore: { type: Type.NUMBER, description: "0 to 100 confidence in the recommendation" },
    summary: { type: Type.STRING, description: "A comprehensive executive summary of the candidate." },
    skillsAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Technical', 'Soft'] },
          score: { type: Type.NUMBER, description: "0-100 verified proficiency score based on evidence." },
          evidence: { type: Type.STRING, description: "Evidence found in the resume. Explain discrepancies if any." },
          status: { 
            type: Type.STRING, 
            enum: ['Verified', 'Inflation Risk', 'Missing Evidence'],
            description: "Set to 'Inflation Risk' if the candidate claims expertise (e.g. 'Expert') but lacks deep evidence. Set to 'Missing Evidence' if listed but not used. 'Verified' if supported."
          }
        }
      }
    },
    cultureFit: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER, description: "0-100 fit score" },
        analysis: { type: Type.STRING },
        flags: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    predictiveModeling: {
      type: Type.OBJECT,
      properties: {
        performancePrediction: { type: Type.STRING },
        retentionRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        rampUpTime: { type: Type.STRING },
        trajectoryAnalysis: { type: Type.STRING },
        redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    interviewGuide: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          question: { type: Type.STRING },
          rubric: { type: Type.STRING, description: "What to look for in the answer" }
        }
      }
    }
  },
  required: ['extractedName', 'recommendation', 'confidenceScore', 'summary', 'skillsAnalysis', 'cultureFit', 'predictiveModeling', 'interviewGuide']
};

const COMPARISON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    winnerId: { type: Type.STRING, enum: ['candidateA', 'candidateB', 'tie'] },
    winnerName: { type: Type.STRING },
    reasoning: { type: Type.STRING },
    keyDifferentiators: { type: Type.ARRAY, items: { type: Type.STRING } },
    comparativeSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          candidateAStrength: { type: Type.STRING },
          candidateBStrength: { type: Type.STRING },
          winner: { type: Type.STRING, enum: ['A', 'B', 'Tie'] }
        }
      }
    }
  },
  required: ['winnerId', 'winnerName', 'reasoning', 'keyDifferentiators', 'comparativeSkills']
};

export const analyzeCandidate = async (resumeText: string, jobDescription: string): Promise<HireGeniusResponse> => {
  const ai = getAiClient();
  
  // Using gemini-3-pro-preview for high thinking capabilities as requested
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    You are HireGenius, an expert talent intelligence analyst with 15 years of experience.
    
    JOB DESCRIPTION:
    ${jobDescription}

    CANDIDATE RESUME:
    ${resumeText}

    Perform a holistic analysis to predict job success.
    1. EXTRACT NAME: Identify the candidate's full name from the top of the resume.
    2. SKILLS VERIFICATION: Extract key skills. Cross-reference claims with detailed work experience. Be strict: if a candidate claims 'Expert' or lists a skill prominently but shows little usage in Experience, flag as 'Inflation Risk'. If listed but not found in experience, flag as 'Missing Evidence'.
    3. CULTURE FIT: Analyze communication style and values.
    4. PREDICTIVE MODELING: Compare to successful profiles, predict retention and ramp-up.
    5. INTERVIEW RECOMMENDATIONS: Generate custom questions.

    Provide an objective, professional, and legally compliant assessment.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        // High thinking budget for deep analysis
        thinkingConfig: { thinkingBudget: 2048 } 
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini.");
    }

    return JSON.parse(text) as HireGeniusResponse;
  } catch (error) {
    console.error("Error analyzing candidate:", error);
    throw error;
  }
};

export const compareCandidates = async (
  resumeA: string, 
  nameA: string, 
  resumeB: string, 
  nameB: string, 
  jobDescription: string
): Promise<ComparisonResult> => {
  const ai = getAiClient();
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    You are a Hiring Manager. Compare two candidates for the following Job Description.

    JOB DESCRIPTION:
    ${jobDescription}

    CANDIDATE A (${nameA}):
    ${resumeA}

    CANDIDATE B (${nameB}):
    ${resumeB}

    Compare them strictly based on the JD. Identify the stronger candidate.
    - winnerId: 'candidateA' or 'candidateB' or 'tie'
    - comparativeSkills: specific skills relevant to JD, compare proficiency.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: COMPARISON_SCHEMA,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");
    return JSON.parse(text) as ComparisonResult;
  } catch (error) {
    console.error("Error comparing candidates:", error);
    throw error;
  }
};