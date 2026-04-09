import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subjectsRouter from "./subjects";
import sessionsRouter from "./sessions";
import goalsRouter from "./goals";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subjectsRouter);
router.use(sessionsRouter);
router.use(goalsRouter);
router.use(statsRouter);

export default router;
