import { VIDEO_TYPES } from "@/constants/video";

export enum TL_TASK_STATUS_ENUM {
  SUCCESS = 'ready',
  FAILED = 'failed',
}

export interface VideoMetaData {
  width: number;
  height: number;
}

export interface IVideoResponse {
  _id: string;
  tl_task_id: string;
  user_id: string;
  type: VIDEO_TYPES;
  name: string;
  thumbnail: string;
  url: string; // video URL
  youtube_download_url: string; // S3 URL for the youtube video
  audio_url: string; // S3 URL for the audio
  metadata: VideoMetaData;
  tl_task_status: TL_TASK_STATUS_ENUM; // task status for TwelveLabs
  transcription: string;
  shorts: string[]; // array of VideoShort IDs
  dubbings: string[]; // array of Dubbing IDs
  audio_enhancments: string[]; // array of AudioEnhance IDs
  created_at: string;
  updated_at: string;
  tl_video_id: string;
}
