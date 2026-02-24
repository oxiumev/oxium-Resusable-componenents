import crypto from "crypto";
import {
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../lib/s3/config";
import {
  MAX_EXPIRY,
  MAX_PARTS,
  MIN_PART_SIZE,
  MULTIPART_THRESHOLD,
  ALLOWED_CONTENT_TYPES,
} from "./file.constants";
import {
  IRequestSingleFileUrl,
  IRequestMultiFileUrl,
  IRequestFileUrl,
  ICompleteMultipartUpload,
  ISaveFile,
} from "./file.interface";
import { ENV } from "../../config/env";
import { FileModel } from "../../model/file/fileModel";
import { BadRequestError, NotFoundError, InternalServerError, UnprocessableEntityError } from "../../lib/error";

const BUCKET = ENV.AWS_S3_BUCKET_NAME!;


const validateExpiry = (expiresIn?: number) => {
  if (expiresIn === undefined) return 60;
  if (typeof expiresIn !== "number" || expiresIn <= 0) throw new BadRequestError("expiresIn must be positive");
  if (expiresIn > MAX_EXPIRY) throw new BadRequestError(`expiresIn cannot exceed ${MAX_EXPIRY} seconds`);
  return expiresIn;
};

const validateContentType = (contentType: string) => {
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new UnprocessableEntityError("Unsupported file type");
  }
};

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9.\-_]/g, "").slice(0, 100);

const generateKey = (fileName: string) => `uploads/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;


export const generateSingleUploadUrl = async ({
  fileName,
  contentType,
  expiresIn,
}: IRequestSingleFileUrl) => {
  if (!fileName || !contentType) throw new BadRequestError("fileName and contentType are required");

  validateContentType(contentType);
  const finalExpiry = validateExpiry(expiresIn);
  const key = generateKey(fileName);

  // Remove ContentType to avoid signature mismatch
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: finalExpiry });

  return { type: "single" as const, uploadUrl, key, expiresIn: finalExpiry };
};

export const generateMultiPartUploadUrl = async ({
  fileName,
  contentType,
  expiresIn,
  totalParts,
}: IRequestMultiFileUrl) => {
  if (!fileName || !contentType) throw new BadRequestError("fileName and contentType are required");
  if (!totalParts || totalParts <= 0) throw new BadRequestError("Invalid totalParts");
  if (totalParts > MAX_PARTS) throw new BadRequestError("File exceeds S3 max parts (10000)");

  validateContentType(contentType);
  const finalExpiry = validateExpiry(expiresIn);
  const key = generateKey(fileName);

  // Initialize multipart upload without ContentType for safety
  const createCommand = new CreateMultipartUploadCommand({ Bucket: BUCKET, Key: key, ContentType: contentType});
  const response = await s3.send(createCommand);
  if (!response.UploadId) throw new InternalServerError("Failed to initialize multipart upload");

  const uploadId = response.UploadId;

  // Generate presigned URLs for each part
  const parts = await Promise.all(
    Array.from({ length: totalParts }).map(async (_, index) => {
      const partNumber = index + 1;
      const command = new UploadPartCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId, PartNumber: partNumber });
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: finalExpiry });
      return { partNumber, signedUrl };
    })
  );

  return { type: "multi" as const, uploadId, key, expiresIn: finalExpiry, parts };
};


export const completeMultipartUpload = async ({
  key,
  uploadId,
  parts,
  originalName,
  mimeType,
  size,
}: ICompleteMultipartUpload & { originalName: string; mimeType: string; size: number }) => {
  if (!key || !uploadId || !parts?.length) throw new BadRequestError("Invalid completion payload");

  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber) },
  });

  const response = await s3.send(command);

  // Save metadata in DB
  const file = await saveFile({ originalName, key, mimeType, size });

  return { message: "Upload completed successfully", location: response.Location, file };
};

export const generateUploadUrl = async ({
  fileName,
  contentType,
  expiresIn,
  fileSize,
}: IRequestFileUrl) => {
  if (!fileSize || fileSize <= 0) throw new BadRequestError("fileSize must be positive");

  // Single upload
  if (fileSize <= MULTIPART_THRESHOLD) {
    return generateSingleUploadUrl({ fileName, contentType, expiresIn });
  }

  // Multipart upload
  const totalParts = Math.ceil(fileSize / MIN_PART_SIZE);
  if (totalParts > MAX_PARTS) throw new BadRequestError("File too large (exceeds 5TB S3 limit)");

  return generateMultiPartUploadUrl({ fileName, contentType, expiresIn, totalParts });
};

export const saveFile = async ({ originalName, key, mimeType, size }: ISaveFile) => {
  const file = await FileModel.create({ originalName, key, mimeType, size });
  return file;
};

export const getUrlFromPublicId = async (publicId: string, expiresIn?: number) => {
  if (!publicId) throw new BadRequestError("publicId is required");
  const finalExpiry = validateExpiry(expiresIn);

  const file = await FileModel.findOne({ publicId, isDeleted: false }).lean();
  if (!file) throw new NotFoundError("File not found");

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: file.key,
    ResponseContentDisposition: `attachment; filename="${file.originalName}"`,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: finalExpiry });

  return {
    publicId: file.publicId,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    publicUrl: signedUrl,
    expiresIn: finalExpiry,
  };
};


export const deleteFile = async (publicId: string) => {
  if (!publicId) throw new BadRequestError("publicId is required");

  const file = await FileModel.findOne({ publicId, isDeleted: false });
  if (!file) throw new NotFoundError("File not found");

  // Delete from S3
  const deleteCommand = new DeleteObjectCommand({ Bucket: BUCKET, Key: file.key });
  await s3.send(deleteCommand);

  // Soft delete in DB
  file.isDeleted = true;
  await file.save();

  return { message: "File deleted successfully", publicId: file.publicId };
};
