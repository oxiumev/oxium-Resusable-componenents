import express, { Router } from "express"
import { triggerTestJob } from "./test.service"
export const testRoute: Router = express.Router()


testRoute.get("/queue",triggerTestJob)