export interface Skill {
  name: string;
  type: 'Technical' | 'Soft';
  score: number; // 0-100
  evidence: string;
  status: 'Verified' | 'Inflation Risk' | 'Missing Evidence';
}

export interface InterviewQuestion {
  topic: string;
  question: string;
  rubric: string;
}

export interface HireGeniusResponse {
  extractedName: string; // Extracted from resume text
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'Pass';
  confidenceScore: number; // 0-100
  summary: string;
  skillsAnalysis: Skill[];
  cultureFit: {
    score: number; // 0-100
    analysis: string;
    flags: string[];
  };
  predictiveModeling: {
    performancePrediction: string;
    retentionRisk: 'Low' | 'Medium' | 'High';
    rampUpTime: string;
    trajectoryAnalysis: string;
    redFlags: string[];
  };
  interviewGuide: InterviewQuestion[];
}

export interface CandidateProfile {
  name: string;
  resumeText: string;
  jobDescription: string;
}

export interface BatchCandidateResult {
  id: string;
  fileName: string;
  analysis: HireGeniusResponse | null;
  error?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface ComparisonResult {
  winnerId: 'candidateA' | 'candidateB' | 'tie';
  winnerName: string;
  reasoning: string;
  keyDifferentiators: string[];
  comparativeSkills: {
    skill: string;
    candidateAStrength: string;
    candidateBStrength: string;
    winner: 'A' | 'B' | 'Tie';
  }[];
}