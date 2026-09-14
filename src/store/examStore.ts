import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersonalDetails, Section1Answers, Section2Answers, Section3Answers } from "@/types";

interface ExamStore {
  sessionId: string | null;
  currentSection: 0 | 1 | 2 | 3;
  timeRemaining: number;
  personalDetails: PersonalDetails;
  section1: Section1Answers;
  section2: Section2Answers;
  section3: Section3Answers;

  setSessionId: (id: string) => void;
  setCurrentSection: (section: 0 | 1 | 2 | 3) => void;
  setTimeRemaining: (time: number) => void;
  setPersonalDetails: (details: PersonalDetails) => void;
  updateSection1: (data: Partial<Section1Answers>) => void;
  updateSection2: (data: Partial<Section2Answers>) => void;
  updateSection3: (data: Partial<Section3Answers>) => void;
  reset: () => void;
}

const defaultSection1: Section1Answers = {
  physicalHealth: "",
  physicalLimitationDetail: "",
  agreedToResponsibilities: false,
};

const defaultSection2: Section2Answers = {
  knowledgeOfFinland: "", reasonsForMoving: "", adaptationPlan: "",
  whyChooseYou: "", workExperience: "", lifeSituation: "",
  knowledgeOfCleaning: "", futurePlans: "", fiveYearPlan: "",
};

const defaultSection3: Section3Answers = {
  q1: "", q2: "", q3: "", q4: "", q5: "", q6: "",
  q7: "", q8: "", q9: "", q10: "", q11: "",
};

const defaultPersonalDetails: PersonalDetails = {
  familyName: "", firstName: "", age: "",
  dateOfBirth: "", nationality: "", email: "",
};

export const useExamStore = create<ExamStore>()(
  persist(
    (set) => ({
      sessionId: null,
      currentSection: 0,
      timeRemaining: 3600,
      personalDetails: defaultPersonalDetails,
      section1: defaultSection1,
      section2: defaultSection2,
      section3: defaultSection3,

      setSessionId: (id) => set({ sessionId: id }),
      setCurrentSection: (section) => set({ currentSection: section }),
      setTimeRemaining: (time) => set({ timeRemaining: time }),
      setPersonalDetails: (details) => set({ personalDetails: details }),
      updateSection1: (data) => set((s) => ({ section1: { ...s.section1, ...data } })),
      updateSection2: (data) => set((s) => ({ section2: { ...s.section2, ...data } })),
      updateSection3: (data) => set((s) => ({ section3: { ...s.section3, ...data } })),
      reset: () => set({
        sessionId: null, currentSection: 0, timeRemaining: 3600,
        personalDetails: defaultPersonalDetails,
        section1: defaultSection1, section2: defaultSection2, section3: defaultSection3,
      }),
    }),
    { name: "pave-takk-exam" }
  )
);