import { Request, Response, NextFunction } from "express";
import { addTestJob } from "../../lib/redis/queue/test/testQueue";

export const triggerTestJob = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const type = (req.query.type as string) || "all";

    if (!["v1", "v2", "all"].includes(type)) {
      res.status(400).json({ 
        success: false, 
        message: "Invalid type. Use 'v1', 'v2', or 'all'." 
      });
      return; 
    }

    await addTestJob(type);
    res.status(200).json({
      success: true,
      message: `Test job(s) of type '${type}' added to the queue.`
    });

  } catch (error) {
    next(error);
  }
};