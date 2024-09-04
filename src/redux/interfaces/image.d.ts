import { IResponse } from "../api/auth";
import {
  IMAGE_ASPECT_RATIO,
  IMAGE_GENERATION_MODEL,
  IMAGE_OUTPUT_FORMAT,
  IMAGE_QUALITY,
  IMAGE_SIZE,
  IMAGE_STYLE,
} from "./enum";

// interface GenerateTextToImage {
//   prompt: string;
//   negative_prompt?: string;
//   stability_aspect_ratio?: IMAGE_ASPECT_RATIO;
//   size?: IMAGE_SIZE;
//   model: IMAGE_GENERATION_MODEL;
//   output_format?: IMAGE_OUTPUT_FORMAT;
//   number_of_images?: number;
//   style?: IMAGE_STYLE;
//   quality?: IMAGE_QUALITY;
// }

interface BaseGenerateImage {
  prompt: string;
  negative_prompt?: string;
  number_of_images?: number;
}

interface DalleGenerateImage extends BaseGenerateImage {
  model: IMAGE_GENERATION_MODEL.DALLE;
  size: IMAGE_SIZE;
  style: IMAGE_STYLE;
  quality: IMAGE_QUALITY;
}

interface StableDiffusionGenerateImage extends BaseGenerateImage {
  model:
    | IMAGE_GENERATION_MODEL.STABLE_DIFFUSION
    | IMAGE_GENERATION_MODEL.STABLE_DIFFUSION_D3;
  stability_aspect_ratio: IMAGE_ASPECT_RATIO;
  output_format: IMAGE_OUTPUT_FORMAT;
}

export type GenerateTextToImage =
  | DalleGenerateImage
  | StableDiffusionGenerateImage;

interface IGenerateTextToImageResponse extends IResponse {
  data: IGeneratedImage[];
}

interface IGeneratedImage {
  _id: string;
  engine: string;
  name: string;
  prompt: string;
  type: string;
  negative_prompt: string;
  output_format: IMAGE_OUTPUT_FORMAT;
  aspect: string;
  size: IMAGE_SIZE;
  style: string;
  url: string;
  quality: string;
  user_id: string;
  enable_prompt_optimization: boolean;
  edits: { url: string }[];
}

interface ImageEditRequest {
  image_id: string;
  editData: {
    prompt: string;
    negative_prompt?: string;
    model: IMAGE_GENERATION_MODEL;
    output_format: IMAGE_OUTPUT_FORMAT;
    mask_url: string;
    image_url: string;
    enable_prompt_optimization: boolean;
  };
}

interface IImageEdit {
  _id: string;
  image_id: string;
  prompt: string;
  optimized_prompt: string;
  output_format: IMAGE_OUTPUT_FORMAT;
  mask_url: string;
  url: string;
  engine: string;
  deleted: boolean;
}

interface IGetImageByIdResponse extends IResponse {
  data: IGeneratedImage;
}

interface IImageEditsResponse extends IResponse {
  data: IImageEdit[];
}

interface IGeneratedImageResponse extends IResponse {
  data: {
    images: IGeneratedImage[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalImages: number;
      imagesPerPage: number;
    };
  };
}
