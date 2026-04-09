import { Router, type IRouter } from "express";
import { db, goalsTable, subjectsTable, sessionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateGoalBody,
  UpdateGoalBody,
  UpdateGoalParams,
  DeleteGoalParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// list all goals; progress is calculated live from completed sessions
router.get("/goals", async (req, res) => {
  try {
    // left join so goals without a linked subject still show up
    const rows = await db
      .select({
        id: goalsTable.id,
        subjectId: goalsTable.subjectId,
        subjectName: subjectsTable.name,
        title: goalsTable.title,
        targetHours: goalsTable.targetHours,
        deadline: goalsTable.deadline,
        createdAt: goalsTable.createdAt,
      })
      .from(goalsTable)
      .leftJoin(subjectsTable, eq(goalsTable.subjectId, subjectsTable.id))
      .orderBy(goalsTable.createdAt);

    // for each goal, sum up completed session minutes for the linked subject
    const goalsWithProgress = await Promise.all(
      rows.map(async (goal) => {
        let completedHours = 0;

        if (goal.subjectId) {
          const [result] = await db
            .select({ total: sql<number>`coalesce(sum(${sessionsTable.durationMinutes}), 0)` })
            .from(sessionsTable)
            .where(and(
              eq(sessionsTable.subjectId, goal.subjectId),
              eq(sessionsTable.completed, true),
            ));

          // convert minutes to hours; cap so we never go over 100%
          completedHours = (Number(result?.total) || 0) / 60;
        }

        return {
          ...goal,
          completedHours: Math.min(completedHours, goal.targetHours),
        };
      })
    );

    res.json(goalsWithProgress);
  } catch (err) {
    req.log.error({ err }, "Failed to list goals");
    res.status(500).json({ error: "Failed to list goals" });
  }
});

// create a new goal
router.post("/goals", async (req, res) => {
  try {
    const body = CreateGoalBody.parse(req.body);
    const [goal] = await db.insert(goalsTable).values({
      subjectId: body.subjectId ?? null,
      title: body.title,
      targetHours: body.targetHours,
      deadline: body.deadline ? new Date(body.deadline) : null,
    }).returning();

    // look up subject name to include in the response (may be null)
    const subject = goal.subjectId
      ? (await db.select().from(subjectsTable).where(eq(subjectsTable.id, goal.subjectId)))[0]
      : null;

    res.status(201).json({
      ...goal,
      subjectName: subject?.name ?? null,
      completedHours: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create goal");
    res.status(400).json({ error: "Failed to create goal" });
  }
});

// update an existing goal
router.put("/goals/:id", async (req, res) => {
  try {
    const { id } = UpdateGoalParams.parse(req.params);
    const body = UpdateGoalBody.parse(req.body);

    const [goal] = await db.update(goalsTable)
      .set({
        subjectId: body.subjectId ?? null,
        title: body.title,
        targetHours: body.targetHours,
        deadline: body.deadline ? new Date(body.deadline) : null,
      })
      .where(eq(goalsTable.id, id))
      .returning();

    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const subject = goal.subjectId
      ? (await db.select().from(subjectsTable).where(eq(subjectsTable.id, goal.subjectId)))[0]
      : null;

    res.json({
      ...goal,
      subjectName: subject?.name ?? null,
      completedHours: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update goal");
    res.status(400).json({ error: "Failed to update goal" });
  }
});

// delete a goal by id
router.delete("/goals/:id", async (req, res) => {
  try {
    const { id } = DeleteGoalParams.parse(req.params);
    await db.delete(goalsTable).where(eq(goalsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete goal");
    res.status(400).json({ error: "Failed to delete goal" });
  }
});

export default router;