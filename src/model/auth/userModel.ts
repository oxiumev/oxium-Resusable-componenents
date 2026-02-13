import mongoose, { Schema, HydratedDocument } from "mongoose";

/* =========================
   Sub Interfaces
========================= */

export interface IEmail {
  value: string;
  isVerified: boolean;
}

export interface IPhone {
  code: string;
  number: string;
  isVerified: boolean;
}

export interface IPhoto {
  type: "github" | "google" | "custom";
  uri: string;
}

export interface ITokens {
  github?: {
    accessToken: string;
    refreshToken?: string;
  };
  google?: {
    accessToken: string;
    refreshToken?: string;
  };
}

/* =========================
   Main Interface
========================= */

export interface IUser {
  name: string;
  password?: string;

  githubId?: string;
  googleId?: string;

  // Array of email objects (no _id)
  emails: IEmail[];
  // Primary email is now the full object, not a reference ID
  primaryEmail?: IEmail;

  phones: IPhone[];
  primaryPhone?: IPhone;

  profilePic?: string;
  photos: IPhoto[];

  tokens?: ITokens;

  isActive: boolean;
  isBlocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type IUserDocument = HydratedDocument<IUser>;

/* =========================
   Sub Schemas
========================= */

const EmailSchema = new Schema<IEmail>(
  {
    value: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false } // No ID needed for sub-documents
);

const PhoneSchema = new Schema<IPhone>(
  {
    code: { type: String, required: true },
    number: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { _id: false } // No ID needed
);

const PhotoSchema = new Schema<IPhoto>(
  {
    type: {
      type: String,
      enum: ["github", "google", "custom"],
      required: true,
    },
    uri: { type: String, required: true },
  },
  { _id: false }
);

/* =========================
   User Schema
========================= */

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Store list of emails
    emails: {
      type: [EmailSchema],
      default: [],
    },

    // Store the main email object directly
    primaryEmail: {
      type: EmailSchema,
      default: null
    },

    phones: {
      type: [PhoneSchema],
      default: [],
    },

    primaryPhone: {
      type: PhoneSchema,
      default: null
    },

    profilePic: { type: String },

    photos: {
      type: [PhotoSchema],
      default: [],
    },

    tokens: {
      github: {
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false },
      },
      google: {
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false },
      },
    },

    isActive: { type: Boolean, default: true, index: true },
    isBlocked: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

/* =========================
   Indexes
========================= */
userSchema.index({ "emails.value": 1 });
userSchema.index({ "phones.number": 1 });

export const User = mongoose.model<IUser>("User", userSchema);