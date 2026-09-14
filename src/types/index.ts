export interface PersonalDetails {
  familyName: string;
  firstName: string;
  age: string;
  dateOfBirth: string;
  nationality: string;
  email: string;
}

export interface Section1Answers {
  physicalHealth: "healthy" | "limited" | "";
  physicalLimitationDetail: string;
  agreedToResponsibilities: boolean;
}

export interface Section2Answers {
  knowledgeOfFinland: string;
  reasonsForMoving: string;
  adaptationPlan: string;
  whyChooseYou: string;
  workExperience: string;
  lifeSituation: string;
  knowledgeOfCleaning: string;
  futurePlans: string;
  fiveYearPlan: string;
}

export interface Section3Answers {
  q1: string; q2: string; q3: string; q4: string;
  q5: string; q6: string; q7: string; q8: string;
  q9: string; q10: string; q11: string;
  score?: number;
}

export interface ExamSession {
  sessionId: string;
  status: "active" | "submitted" | "flagged" | "locked";
  startedAt: number;
  submittedAt: number | null;
  timeRemaining: number;
  currentSection: 1 | 2 | 3;
  tabSwitchCount: number;
  flags: Flag[];
  personalDetails: PersonalDetails;
}

export interface Flag {
  type: "tab_switch" | "fullscreen_exit";
  timestamp: number;
  section: number;
}