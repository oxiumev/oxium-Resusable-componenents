import { ZodError } from "zod";

export interface ValidationErrorDetail {
  field: string;
  message: string;
  details?: string;
}

export interface ValidationErrorResponse {
  message: string;              
  errors: ValidationErrorDetail[]; 
}

export const formatZodError = (error: ZodError): ValidationErrorResponse => {
  const errors: ValidationErrorDetail[] = []; 
  const errorMessages: string[] = [];

  error.issues.forEach((issue) => {
    const field = issue.path[issue.path.length - 1]?.toString() || "root";

    errors.push({
      field: field,
      message: issue.message,
      details: issue.code 
    });

    const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
    errorMessages.push(`${formattedField}: ${issue.message}`);
  });
  const message = errorMessages.join(". ");

  return {
    message,
    errors
  };
};