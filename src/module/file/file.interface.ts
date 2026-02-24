export interface IRequestSingleFileUrl {
  fileName: string;
  contentType: string;
  expiresIn?: number;
}

export interface IRequestMultiFileUrl {
  fileName: string;
  contentType: string;
  expiresIn?: number;
  totalParts: number;
}

export interface IRequestFileUrl {
  fileName: string;
  contentType: string;
  expiresIn?: number;
  fileSize: number;
}

export interface ICompleteMultipartUpload {
  key: string;
  uploadId: string;
  parts: {
    ETag: string;
    PartNumber: number;
  }[];
}
export interface ISaveFile {
  originalName: string;
  key: string;
  mimeType: string;
  size: number;
}