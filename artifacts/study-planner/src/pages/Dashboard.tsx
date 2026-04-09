import { Link } from "wouter";
import { format, isToday, parseISO } from "date-fns";
import { Clock, Flame, BookOpen, Calendar, ChevronRight, PlayCircle, PlusCircle, CheckCircle2, Circle, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStats } from "@/hooks/use-stats";
import { useListSessions, useEditSession } from "@/hooks/use-sessions";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: sessions, isLoading: sessionsLoading } = useListSessions({ completed: false });
  const editSession = useEditSession();
  const { toast } = useToast();

  const todaySessions = sessions?.filter(s => isToday(parseISO(s.scheduledAt))) || [];

  const handleComplete = (id: number, currentCompleted: boolean) => {
    const session = sessions?.find(s => s.id === id);
    if (!session) return;
    
    editSession.mutate({
      id,
      data: {
        subjectId: session.subjectId,
        title: session.title,
        scheduledAt: session.scheduledAt,
        durationMinutes: session.durationMinutes,
        notes: session.notes,
        completed: !currentCompleted
      }
    }, {
      onSuccess: () => {
        toast({ title: "Session marked completed! 🎉" });
      }
    });
  };

  if (statsLoading || sessionsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 shadow-xl shadow-primary/20">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/academic-header.png`} 
            alt="Abstract header" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">Welcome back, Sunny!</h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-lg">
            You've completed {stats?.completedSessionsThisWeek || 0} sessions this week. Keep the momentum going!
          </p>
          <Link href="/sessions">
            <Button className="bg-white text-primary hover:bg-white/90 rounded-xl px-6 py-6 h-auto font-semibold text-md shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5">
              <PlusCircle className="w-5 h-5 mr-2" />
              Plan a Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="rounded-2xl border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50 dark:from-card dark:to-card/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hours This Week</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.totalHoursThisWeek.toFixed(1)}h</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50 dark:from-card dark:to-card/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Day Streak</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.streakDays}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50 dark:from-card dark:to-card/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.completedSessionsThisWeek} <span className="text-sm font-normal text-muted-foreground">this week</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-slate-50 dark:from-card dark:to-card/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
              <h3 className="text-2xl font-bold text-foreground">{stats?.totalHoursAllTime.toFixed(1)}h</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 rounded-2xl shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Today's Schedule</CardTitle>
              <CardDescription>You have {todaySessions.length} sessions planned for today.</CardDescription>
            </div>
            <Link href="/sessions">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todaySessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-foreground">No sessions today</h4>
                <p className="text-muted-foreground mt-1 max-w-sm">Take a well-deserved break, or get ahead by planning some study time.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {todaySessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleComplete(session.id, session.completed)}
                        className="text-muted-foreground hover:text-emerald-500 transition-colors"
                      >
                        {session.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: session.subjectColor }} 
                          />
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{session.subjectName}</p>
                        </div>
                        <h4 className={`font-semibold text-foreground ${session.completed ? 'line-through opacity-50' : ''}`}>
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(parseISO(session.scheduledAt), "h:mm a")}
                          </span>
                          <span>•</span>
                          <span>{session.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <PlayCircle className="w-5 h-5 text-primary" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Breakdown Chart */}
        <Card className="rounded-2xl shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Subject Breakdown</CardTitle>
            <CardDescription>Hours spent per subject</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {stats?.subjectBreakdown && stats.subjectBreakdown.length > 0 ? (
              <>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.subjectBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="totalHours"
                        nameKey="subjectName"
                      >
                        {stats.subjectBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.subjectColor} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value.toFixed(1)} hrs`, 'Total']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-4 space-y-2">
                  {stats.subjectBreakdown.map((subject) => (
                    <div key={subject.subjectId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: subject.subjectColor }} />
                        <span className="font-medium">{subject.subjectName}</span>
                      </div>
                      <span className="text-muted-foreground">{subject.totalHours.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                <PieChartIcon className="w-12 h-12 mb-2 opacity-20" />
                <p>No data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
