import { Router, type IRouter } from "express";
import { db, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateSubjectBody, UpdateSubjectBody, UpdateSubjectParams, DeleteSubjectParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/subjects", async (req, res) => {
  try {
    const subjects = await db.select().from(subjectsTable).orderBy(subjectsTable.name);
    res.json(subjects);
  } catch (err) {
    req.log.error({ err }, "Failed to list subjects");
    res.status(500).json({ error: "Failed to list subjects" });
  }
});

router.post("/subjects", async (req, res) => {
  try {
    const body = CreateSubjectBody.parse(req.body);
    const [subject] = await db.insert(subjectsTable).values({
      name: body.name,
      color: body.color,
      description: body.description ?? null,
      weeklyGoalHours: body.weeklyGoalHours ?? null,
    }).returning();
    res.status(201).json(subject);
  } catch (err) {
    req.log.error({ err }, "Failed to create subject");
    res.status(400).json({ error: "Failed to create subject" });
  }
});

router.put("/subjects/:id", async (req, res) => {
  try {
    const { id } = UpdateSubjectParams.parse(req.params);
    const body = UpdateSubjectBody.parse(req.body);
    const [subject] = await db.update(subjectsTable)
      .set({
        name: body.name,
        color: body.color,
        description: body.description ?? null,
        weeklyGoalHours: body.weeklyGoalHours ?? null,
      })
      .where(eq(subjectsTable.id, id))
      .returning();
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json(subject);
  } catch (err) {
    req.log.error({ err }, "Failed to update subject");
    res.status(400).json({ error: "Failed to update subject" });
  }
});

router.delete("/subjects/:id", async (req, res) => {
  try {
    const { id } = DeleteSubjectParams.parse(req.params);
    await db.delete(subjectsTable).where(eq(subjectsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete subject");
    res.status(400).json({ error: "Failed to delete subject" });
  }
});

export default router;
