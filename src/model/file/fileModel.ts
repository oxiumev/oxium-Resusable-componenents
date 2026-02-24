import { randomUUID } from "crypto";
import { Schema, model, Document } from "mongoose";

export interface IFile extends Document {
  originalName: string;
  key: string;
  mimeType: string;
  size: number;
  publicId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

   

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
      min: 1,
    },

    publicId: {
      type: String,
      default: () => `p-${randomUUID()}`,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export const FileModel = model<IFile>("File", fileSchema);