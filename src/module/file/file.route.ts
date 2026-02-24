import express from "express";
import {
    generateUploadFileUrl,
    completeMultiPartUrl,
    getFileUrl,
    deleteFileById,
} from "./file.controller";

export const fileRoute = express.Router();

fileRoute.post("/upload-url", generateUploadFileUrl);
fileRoute.post("/complete-multipart", completeMultiPartUrl);
fileRoute.get("/view/:id", getFileUrl); // neutral, works for download or view
fileRoute.delete("/delete/:id", deleteFileById);

