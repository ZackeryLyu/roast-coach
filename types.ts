
export interface RoastResponse {
  score: number;
  comment: string;
  nickName: string;
  tags: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT'
}

export interface CapturedMedia {
  dataUrl: string;
  type: 'image' | 'video';
  mimeType: string;
}
