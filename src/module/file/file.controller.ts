import { Request, Response, NextFunction } from "express";
import {
  generateUploadUrl,
  completeMultipartUpload,
  getUrlFromPublicId,
  deleteFile,
} from "./file.service";

export const generateUploadFileUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, fileName, fileSize } = req.body;

    if (!contentType || !fileName || !fileSize) {
      return res.status(400).json({ message: "fileName, contentType and fileSize are required" });
    }

    const uploadData = await generateUploadUrl({ contentType, fileName, fileSize });
    res.json(uploadData);
  } catch (error) {
    next(error);
  }
};

export const completeMultiPartUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, mimeType, originalName, parts, size, uploadId } = req.body;

    if (!key || !mimeType || !originalName || !parts?.length || !size || !uploadId) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const file = await completeMultipartUpload({ key, mimeType, originalName, parts, size, uploadId });
    res.json(file);
  } catch (error) {
    next(error);
  }
};
export const getFileUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;

    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({ message: "File publicId is required and must be a string" });
    }

    const file = await getUrlFromPublicId(idParam);

    res.redirect(file.publicUrl);
  } catch (error) {
    next(error);
  }
};

export const deleteFileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;

    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({ message: "File publicId is required and must be a string" });
    }

    const result = await deleteFile(idParam);
    res.json(result);
  } catch (error) {
    next(error);
  }
};