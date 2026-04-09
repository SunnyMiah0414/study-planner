import { Router, type IRouter } from "express";
import { db, sessionsTable, subjectsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateSessionBody,
  UpdateSessionBody,
  UpdateSessionParams,
  DeleteSessionParams,
  ListSessionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// list sessions, with optional filtering by subject or completion status
router.get("/sessions", async (req, res) => {
  try {
    const query = ListSessionsQueryParams.parse(req.query);

    // build up conditions array first so we can spread into and() safely
    const conditions = [];
    if (query.subjectId !== undefined) conditions.push(eq(sessionsTable.subjectId, query.subjectId));
    if (query.completed !== undefined) conditions.push(eq(sessionsTable.completed, query.completed));

    // join subjects so each row includes the subject name and colour
    const rows = await db
      .select({
        id: sessionsTable.id,
        subjectId: sessionsTable.subjectId,
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        title: sessionsTable.title,
        notes: sessionsTable.notes,
        scheduledAt: sessionsTable.scheduledAt,
        durationMinutes: sessionsTable.durationMinutes,
        completed: sessionsTable.completed,
        completedAt: sessionsTable.completedAt,
        createdAt: sessionsTable.createdAt,
      })
      .from(sessionsTable)
      .innerJoin(subjectsTable, eq(sessionsTable.subjectId, subjectsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sessionsTable.scheduledAt);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list sessions");
    res.status(500).json({ error: "Failed to list sessions" });
  }
});

// create a new session; completed defaults to false on insert
router.post("/sessions", async (req, res) => {
  try {
    const body = CreateSessionBody.parse(req.body);
    const [session] = await db.insert(sessionsTable).values({
      subjectId: body.subjectId,
      title: body.title,
      notes: body.notes ?? null,
      scheduledAt: new Date(body.scheduledAt),
      durationMinutes: body.durationMinutes,
      completed: false,
    }).returning();

    // grab subject so we can return its name/colour in one response
    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, session.subjectId));
    res.status(201).json({
      ...session,
      subjectName: subject?.name ?? "",
      subjectColor: subject?.color ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create session");
    res.status(400).json({ error: "Failed to create session" });
  }
});

// update a session; stamp completedAt when marking done, clear it when marking incomplete
router.put("/sessions/:id", async (req, res) => {
  try {
    const { id } = UpdateSessionParams.parse(req.params);
    const body = UpdateSessionBody.parse(req.body);

    const updateData: Record<string, unknown> = {
      subjectId: body.subjectId,
      title: body.title,
      notes: body.notes ?? null,
      scheduledAt: new Date(body.scheduledAt),
      durationMinutes: body.durationMinutes,
      completed: body.completed,
    };

    if (body.completed) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const [session] = await db.update(sessionsTable)
      .set(updateData)
      .where(eq(sessionsTable.id, id))
      .returning();

    if (!session) return res.status(404).json({ error: "Session not found" });

    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, session.subjectId));
    res.json({
      ...session,
      subjectName: subject?.name ?? "",
      subjectColor: subject?.color ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update session");
    res.status(400).json({ error: "Failed to update session" });
  }
});

// delete a session by id
router.delete("/sessions/:id", async (req, res) => {
  try {
    const { id } = DeleteSessionParams.parse(req.params);
    await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete session");
    res.status(400).json({ error: "Failed to delete session" });
  }
});

export default router;