import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'clerk' | 'admin' | null;

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  created_at?: string;
  preferred_language?: string;
  voice_mode_enabled?: boolean;
  voice_agent_enabled?: boolean;
}

interface AppState {
  user: UserProfile | null;
  role: Role;
  sessionId: string | null;
  originalImageUrl: string | null;
  cleanedImageUrl: string | null;
  extractedFields: any[] | null;
  originalExtractedFields: any[] | null;
  templateSchema: any[] | null;
  templateName: string | null;
  templateConfidence: number | null;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: Role) => void;
  setSessionId: (id: string | null) => void;
  setPipelineData: (data: {
    originalImageUrl?: string;
    cleanedImageUrl?: string;
    extractedFields?: any[];
    originalExtractedFields?: any[];
    templateSchema?: any[];
    templateName?: string;
    templateConfidence?: number;
  }) => void;
  clearSession: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      sessionId: null,
      originalImageUrl: null,
      cleanedImageUrl: null,
      extractedFields: null,
      originalExtractedFields: null,
      templateSchema: null,
      templateName: null,
      templateConfidence: null,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setSessionId: (id) => set({ sessionId: id }),
      setPipelineData: (data) => set((state) => ({ ...state, ...data })),
      clearSession: () => set({
        sessionId: null,
        originalImageUrl: null,
        cleanedImageUrl: null,
        extractedFields: null,
        originalExtractedFields: null,
        templateSchema: null,
        templateName: null,
        templateConfidence: null,
      }),
      logout: () => set({
        user: null,
        role: null,
        sessionId: null,
        originalImageUrl: null,
        cleanedImageUrl: null,
        extractedFields: null,
        originalExtractedFields: null,
        templateSchema: null,
        templateName: null,
        templateConfidence: null,
      }),
    }),
    {
      name: 'pt-state',
      partialize: (state) => ({
        sessionId: state.sessionId,
        user: state.user,
        role: state.role,
        originalImageUrl: state.originalImageUrl,
        cleanedImageUrl: state.cleanedImageUrl,
        extractedFields: state.extractedFields,
        originalExtractedFields: state.originalExtractedFields,
        templateSchema: state.templateSchema,
        templateName: state.templateName,
        templateConfidence: state.templateConfidence,
      }),
    }
  )
);
