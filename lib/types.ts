export interface ChatMessage {
  id: string;
  author: string;
  color: string;
  text: string;
  timestamp: number;
}

export interface VersionSnapshot {
  id: string;
  label: string;
  author: string;
  timestamp: number;
  files: Record<string, string>;
}

export interface VoiceSignal {
  id: string;
  from: number;
  to: number;
  type: "offer" | "answer" | "ice";
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface ProjectFile {
  name: string;
  language: string;
}
