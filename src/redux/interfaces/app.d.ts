import { IResponse } from "../api/auth";

interface IFileUploadResponse extends IResponse {
  data: {
    key: string;
    url: string;
  };
}
