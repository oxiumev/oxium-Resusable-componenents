import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod/v3";

export const validate = (schema: AnyZodObject) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body, query, and params together
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      // Pass the Zod error to the Global Error Handler
      next(error); 
    }
  };