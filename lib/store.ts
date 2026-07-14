import { create } from "zustand";
import type { UserIdentity } from "./user-identity";
import type { ChatMessage, VersionSnapshot } from "./types";
import { DEFAULT_ACTIVE_FILE } from "./constants";

export interface OnlineUser extends UserIdentity {
  clientId: number;
  voiceActive?: boolean;
}

interface AppState {
  currentUser: UserIdentity | null;
  localClientId: number | null;
  onlineUsers: OnlineUser[];
  activeFile: string;
  fileNames: string[];
  isReadOnly: boolean;
  chatMessages: ChatMessage[];
  versions: VersionSnapshot[];
  voiceActive: boolean;
  setCurrentUser: (user: UserIdentity) => void;
  setLocalClientId: (id: number) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  setActiveFile: (file: string) => void;
  setFileNames: (files: string[]) => void;
  setIsReadOnly: (readOnly: boolean) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setVersions: (versions: VersionSnapshot[]) => void;
  setVoiceActive: (active: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  localClientId: null,
  onlineUsers: [],
  activeFile: DEFAULT_ACTIVE_FILE,
  fileNames: [],
  isReadOnly: false,
  chatMessages: [],
  versions: [],
  voiceActive: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  setLocalClientId: (id) => set({ localClientId: id }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setActiveFile: (file) => set({ activeFile: file }),
  setFileNames: (files) => set({ fileNames: files }),
  setIsReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setVersions: (versions) => set({ versions: versions }),
  setVoiceActive: (active) => set({ voiceActive: active }),
}));
