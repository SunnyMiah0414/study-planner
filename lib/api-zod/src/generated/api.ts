import * as zod from "zod";

// Health check
export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

// Subjects
export const ListSubjectsResponseItem = zod.object({
  id: zod.number(),
  name: zod.string(),
  color: zod.string(),
  description: zod.string().nullish(),
  weeklyGoalHours: zod.number().nullish(),
  createdAt: zod.date(),
});
export const ListSubjectsResponse = zod.array(ListSubjectsResponseItem);

export const CreateSubjectBody = zod.object({
  name: zod.string(),
  color: zod.string(),
  description: zod.string().nullish(),
  weeklyGoalHours: zod.number().nullish(),
});

export const UpdateSubjectParams = zod.object({
  id: zod.coerce.number(),
});

export const UpdateSubjectBody = zod.object({
  name: zod.string(),
  color: zod.string(),
  description: zod.string().nullish(),
  weeklyGoalHours: zod.number().nullish(),
});

export const UpdateSubjectResponse = zod.object({
  id: zod.number(),
  name: zod.string(),
  color: zod.string(),
  description: zod.string().nullish(),
  weeklyGoalHours: zod.number().nullish(),
  createdAt: zod.date(),
});

export const DeleteSubjectParams = zod.object({
  id: zod.coerce.number(),
});

// Sessions
export const ListSessionsQueryParams = zod.object({
  subjectId: zod.coerce.number().optional(),
  // coerce.boolean() treats "false" as true, so use enum transform instead
  completed: zod
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const ListSessionsResponseItem = zod.object({
  id: zod.number(),
  subjectId: zod.number(),
  subjectName: zod.string(),
  subjectColor: zod.string(),
  title: zod.string(),
  notes: zod.string().nullish(),
  scheduledAt: zod.date(),
  durationMinutes: zod.number(),
  completed: zod.boolean(),
  completedAt: zod.date().nullish(),
  createdAt: zod.date(),
});
export const ListSessionsResponse = zod.array(ListSessionsResponseItem);

export const CreateSessionBody = zod.object({
  subjectId: zod.number(),
  title: zod.string(),
  notes: zod.string().nullish(),
  scheduledAt: zod.coerce.date(), // coerce handles ISO strings from the frontend
  durationMinutes: zod.number(),
});

export const UpdateSessionParams = zod.object({
  id: zod.coerce.number(),
});

export const UpdateSessionBody = zod.object({
  subjectId: zod.number(),
  title: zod.string(),
  notes: zod.string().nullish(),
  scheduledAt: zod.coerce.date(), // coerce handles ISO strings from the frontend
  durationMinutes: zod.number(),
  completed: zod.boolean(),
});

export const UpdateSessionResponse = zod.object({
  id: zod.number(),
  subjectId: zod.number(),
  subjectName: zod.string(),
  subjectColor: zod.string(),
  title: zod.string(),
  notes: zod.string().nullish(),
  scheduledAt: zod.date(),
  durationMinutes: zod.number(),
  completed: zod.boolean(),
  completedAt: zod.date().nullish(),
  createdAt: zod.date(),
});

export const DeleteSessionParams = zod.object({
  id: zod.coerce.number(),
});

// Goals
export const ListGoalsResponseItem = zod.object({
  id: zod.number(),
  subjectId: zod.number().nullish(),
  subjectName: zod.string().nullish(),
  title: zod.string(),
  targetHours: zod.number(),
  completedHours: zod.number(),
  deadline: zod.date().nullish(),
  createdAt: zod.date(),
});
export const ListGoalsResponse = zod.array(ListGoalsResponseItem);

export const CreateGoalBody = zod.object({
  subjectId: zod.number().nullish(),
  title: zod.string(),
  targetHours: zod.number(),
  deadline: zod.coerce.date().nullish(),
});

export const UpdateGoalParams = zod.object({
  id: zod.coerce.number(),
});

export const UpdateGoalBody = zod.object({
  subjectId: zod.number().nullish(),
  title: zod.string(),
  targetHours: zod.number(),
  deadline: zod.coerce.date().nullish(),
});

export const UpdateGoalResponse = zod.object({
  id: zod.number(),
  subjectId: zod.number().nullish(),
  subjectName: zod.string().nullish(),
  title: zod.string(),
  targetHours: zod.number(),
  completedHours: zod.number(),
  deadline: zod.date().nullish(),
  createdAt: zod.date(),
});

export const DeleteGoalParams = zod.object({
  id: zod.coerce.number(),
});

// Stats
export const GetStatsResponse = zod.object({
  totalHoursThisWeek: zod.number(),
  totalHoursAllTime: zod.number(),
  completedSessionsThisWeek: zod.number(),
  upcomingSessionsCount: zod.number(),
  subjectBreakdown: zod.array(
    zod.object({
      subjectId: zod.number(),
      subjectName: zod.string(),
      subjectColor: zod.string(),
      totalHours: zod.number(),
    }),
  ),
  streakDays: zod.number(),
});