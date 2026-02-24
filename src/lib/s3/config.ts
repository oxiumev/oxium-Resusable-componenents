import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "../../config/env";

export const s3 = new S3Client({
  region: ENV.AWS_S3_REGION!,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID!,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
  // logger: console
});