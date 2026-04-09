import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, MoreVertical, CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListSessions, useAddSession, useEditSession, useRemoveSession } from "@/hooks/use-sessions";
import { useSubjects } from "@/hooks/use-subjects";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { StudySession } from "@workspace/api-client-react/src/generated/api.schemas";

const sessionSchema = z.object({
  subjectId: z.coerce.number().min(1, "Subject is required"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  scheduledAt: z.string().min(1, "Date and time are required"),
  durationMinutes: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
});

type SessionFormData = z.infer<typeof sessionSchema>;

export default function Sessions() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
  const { data: upcomingSessions, isLoading: loadingUpcoming } = useListSessions({ completed: false });
  const { data: completedSessions, isLoading: loadingCompleted } = useListSessions({ completed: true });
  const { data: subjects } = useSubjects();
  
  const addSession = useAddSession();
  const editSession = useEditSession();
  const removeSession = useRemoveSession();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { durationMinutes: 60 }
  });

  const openDialog = (session?: StudySession) => {
    if (session) {
      setEditingSession(session);
      // Convert ISO to datetime-local format (YYYY-MM-DDThh:mm)
      const formattedDate = format(parseISO(session.scheduledAt), "yyyy-MM-dd'T'HH:mm");
      reset({
        subjectId: session.subjectId,
        title: session.title,
        notes: session.notes || "",
        scheduledAt: formattedDate,
        durationMinutes: session.durationMinutes,
      });
    } else {
      setEditingSession(null);
      reset({ 
        subjectId: subjects?.[0]?.id || 0, 
        title: "", 
        notes: "", 
        scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:00"), 
        durationMinutes: 60 
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: SessionFormData) => {
    // API expects ISO string, input provides "YYYY-MM-DDThh:mm"
    const formattedData = {
      ...data,
      scheduledAt: new Date(data.scheduledAt).toISOString()
    };

    if (editingSession) {
      editSession.mutate({ 
        id: editingSession.id, 
        data: { ...formattedData, completed: editingSession.completed } 
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Session updated" });
        }
      });
    } else {
      addSession.mutate({ data: formattedData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Session scheduled successfully" });
        }
      });
    }
  };

  const handleToggleComplete = (session: StudySession) => {
    editSession.mutate({
      id: session.id,
      data: {
        subjectId: session.subjectId,
        title: session.title,
        notes: session.notes,
        scheduledAt: session.scheduledAt,
        durationMinutes: session.durationMinutes,
        completed: !session.completed
      }
    }, {
      onSuccess: () => toast({ title: session.completed ? "Session marked pending" : "Session completed! 🎉" })
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this session?")) {
      removeSession.mutate({ id }, {
        onSuccess: () => toast({ title: "Session deleted" })
      });
    }
  };

  const renderSessionList = (sessions: StudySession[] | undefined, isLoading: boolean, emptyMessage: string) => {
    if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading sessions...</div>;
    if (!sessions || sessions.length === 0) return (
      <div className="py-24 text-center border border-dashed rounded-3xl bg-card">
        <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium">{emptyMessage}</h3>
      </div>
    );

    // Sort by date (ascending for upcoming, descending for completed)
    const sorted = [...sessions].sort((a, b) => {
      const timeA = new Date(a.scheduledAt).getTime();
      const timeB = new Date(b.scheduledAt).getTime();
      return activeTab === "upcoming" ? timeA - timeB : timeB - timeA;
    });

    return (
      <div className="space-y-4 mt-6">
        {sorted.map((session) => (
          <div 
            key={session.id} 
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <button 
                onClick={() => handleToggleComplete(session)}
                className="mt-1 text-muted-foreground hover:text-emerald-500 transition-colors focus:outline-none"
              >
                {session.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: session.subjectColor }} />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{session.subjectName}</span>
                </div>
                <h4 className={`text-lg font-semibold text-foreground ${session.completed ? 'line-through opacity-60' : ''}`}>
                  {session.title}
                </h4>
                {session.notes && (
                  <p className="text-sm text-muted-foreground mt-1 mb-2 line-clamp-1">{session.notes}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 bg-secondary/50 inline-flex px-3 py-1 rounded-lg">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    {format(parseISO(session.scheduledAt), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {format(parseISO(session.scheduledAt), "h:mm a")} ({session.durationMinutes}m)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center justify-end sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => openDialog(session)} className="cursor-pointer">
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(session.id)} className="cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Study Sessions</h1>
          <p className="text-muted-foreground mt-1">Plan and track your focused study blocks.</p>
        </div>
        <Button onClick={() => openDialog()} disabled={!subjects || subjects.length === 0} className="rounded-xl shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-transform">
          <Plus className="w-5 h-5 mr-2" /> Schedule Session
        </Button>
      </div>

      {!subjects || subjects.length === 0 ? (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
          <p className="text-orange-700">You need to create a subject first before scheduling sessions. <Link href="/subjects" className="font-bold underline">Go to Subjects</Link></p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 p-1 rounded-xl bg-secondary mb-6">
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Completed
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {renderSessionList(upcomingSessions, loadingUpcoming, "No upcoming sessions. Time to plan ahead!")}
          </TabsContent>
          <TabsContent value="completed">
            {renderSessionList(completedSessions, loadingCompleted, "No completed sessions yet. Get to work!")}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-display">{editingSession ? "Edit Session" : "Schedule Session"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select onValueChange={(v) => setValue("subjectId", parseInt(v))} defaultValue={editingSession?.subjectId.toString() || subjects?.[0]?.id.toString()}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {subjects?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className="text-sm text-destructive">{errors.subjectId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Topic / Title</Label>
              <Input id="title" placeholder="e.g. Chapter 4 Practice Problems" className="h-12 rounded-xl" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Date & Time</Label>
                <Input id="scheduledAt" type="datetime-local" className="h-12 rounded-xl" {...register("scheduledAt")} />
                {errors.scheduledAt && <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input id="durationMinutes" type="number" step="5" min="5" className="h-12 rounded-xl" {...register("durationMinutes")} />
                {errors.durationMinutes && <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Textarea id="notes" placeholder="What exactly do you plan to achieve?" className="h-24 rounded-xl resize-none" {...register("notes")} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={addSession.isPending || editSession.isPending} className="rounded-xl px-8">
                {(addSession.isPending || editSession.isPending) ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
