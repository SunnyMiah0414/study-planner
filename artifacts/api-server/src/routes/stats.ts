import { Router, type IRouter } from "express";
import { db, sessionsTable, subjectsTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [allTimeResult] = await db
      .select({ total: sql<number>`coalesce(sum(${sessionsTable.durationMinutes}), 0)` })
      .from(sessionsTable)
      .where(eq(sessionsTable.completed, true));

    const [weekResult] = await db
      .select({ total: sql<number>`coalesce(sum(${sessionsTable.durationMinutes}), 0)` })
      .from(sessionsTable)
      .where(and(
        eq(sessionsTable.completed, true),
        gte(sessionsTable.completedAt, startOfWeek),
      ));

    const [weekCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessionsTable)
      .where(and(
        eq(sessionsTable.completed, true),
        gte(sessionsTable.completedAt, startOfWeek),
      ));

    const [upcomingCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessionsTable)
      .where(and(
        eq(sessionsTable.completed, false),
        gte(sessionsTable.scheduledAt, now),
      ));

    const subjectBreakdownRows = await db
      .select({
        subjectId: subjectsTable.id,
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        totalMinutes: sql<number>`coalesce(sum(${sessionsTable.durationMinutes}), 0)`,
      })
      .from(subjectsTable)
      .leftJoin(
        sessionsTable,
        and(eq(sessionsTable.subjectId, subjectsTable.id), eq(sessionsTable.completed, true))
      )
      .groupBy(subjectsTable.id, subjectsTable.name, subjectsTable.color);

    const streakDays = await calculateStreak();

    res.json({
      totalHoursThisWeek: (Number(weekResult?.total) || 0) / 60,
      totalHoursAllTime: (Number(allTimeResult?.total) || 0) / 60,
      completedSessionsThisWeek: Number(weekCountResult?.count) || 0,
      upcomingSessionsCount: Number(upcomingCountResult?.count) || 0,
      subjectBreakdown: subjectBreakdownRows.map((row) => ({
        subjectId: row.subjectId,
        subjectName: row.subjectName,
        subjectColor: row.subjectColor,
        totalHours: (Number(row.totalMinutes) || 0) / 60,
      })),
      streakDays,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

async function calculateStreak(): Promise<number> {
  const completedDays = await db
    .select({
      day: sql<string>`date_trunc('day', ${sessionsTable.completedAt})::date::text`,
    })
    .from(sessionsTable)
    .where(eq(sessionsTable.completed, true))
    .groupBy(sql`date_trunc('day', ${sessionsTable.completedAt})`);

  if (completedDays.length === 0) return 0;

  const daySet = new Set(completedDays.map((d) => d.day));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (daySet.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default router;
