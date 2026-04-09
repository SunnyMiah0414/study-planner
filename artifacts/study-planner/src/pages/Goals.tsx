import { useState } from "react";
import { Plus, Target, Trophy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListGoals, useAddGoal, useEditGoal, useRemoveGoal } from "@/hooks/use-goals";
import { useSubjects } from "@/hooks/use-subjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { StudyGoal } from "@workspace/api-client-react/src/generated/api.schemas";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subjectId: z.coerce.number().optional().nullable(),
  targetHours: z.coerce.number().min(1, "Target hours must be at least 1"),
  deadline: z.string().optional().nullable(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export default function Goals() {
  const { data: goals, isLoading } = useListGoals();
  const { data: subjects } = useSubjects();
  
  const addGoal = useAddGoal();
  const editGoal = useEditGoal();
  const removeGoal = useRemoveGoal();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  const openDialog = (goal?: StudyGoal) => {
    if (goal) {
      setEditingGoal(goal);
      reset({
        title: goal.title,
        subjectId: goal.subjectId,
        targetHours: goal.targetHours,
        deadline: goal.deadline ? goal.deadline.split('T')[0] : "", // Convert to YYYY-MM-DD for date input
      });
    } else {
      setEditingGoal(null);
      reset({ title: "", subjectId: null, targetHours: 10, deadline: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: GoalFormData) => {
    const formattedData = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      subjectId: data.subjectId || null
    };

    if (editingGoal) {
      editGoal.mutate({ id: editingGoal.id, data: formattedData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Goal updated" });
        }
      });
    } else {
      addGoal.mutate({ data: formattedData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Goal created successfully" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this goal?")) {
      removeGoal.mutate({ id }, {
        onSuccess: () => toast({ title: "Goal deleted" })
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" /> Goals
          </h1>
          <p className="text-muted-foreground mt-1">Set targets and watch your progress grow.</p>
        </div>
        <Button onClick={() => openDialog()} className="rounded-xl shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-transform">
          <Plus className="w-5 h-5 mr-2" /> New Goal
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)}
        </div>
      ) : goals?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-3xl border border-border border-dashed">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No goals set</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Goals help you stay motivated. Try setting a weekly target for a difficult subject.</p>
          <Button onClick={() => openDialog()}>Create a Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals?.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.completedHours / goal.targetHours) * 100));
            const isCompleted = percentage >= 100;
            
            return (
              <Card key={goal.id} className={`rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-all ${isCompleted ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      {goal.subjectName && (
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                          {goal.subjectName}
                        </p>
                      )}
                      <CardTitle className="text-xl">{goal.title}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openDialog(goal)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(goal.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-display font-bold text-foreground">
                      {goal.completedHours.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ {goal.targetHours}h</span>
                    </span>
                    <span className={`text-sm font-semibold ${isCompleted ? 'text-emerald-500' : 'text-primary'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <Progress value={percentage} className={`h-3 rounded-full ${isCompleted ? '[&>div]:bg-emerald-500' : '[&>div]:bg-primary'}`} />
                </CardContent>
                {goal.deadline && (
                  <CardFooter className="pt-2 text-xs text-muted-foreground">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">{editingGoal ? "Edit Goal" : "New Goal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input id="title" placeholder="e.g. Master Calculus Integration" className="h-12 rounded-xl" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Subject Link <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Select onValueChange={(v) => setValue("subjectId", v === "none" ? null : parseInt(v))} defaultValue={editingGoal?.subjectId?.toString() || "none"}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">General / No Subject</SelectItem>
                  {subjects?.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetHours">Target Hours</Label>
                <Input id="targetHours" type="number" step="1" min="1" className="h-12 rounded-xl" {...register("targetHours")} />
                {errors.targetHours && <p className="text-sm text-destructive">{errors.targetHours.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline <span className="text-muted-foreground font-normal">(Opt)</span></Label>
                <Input id="deadline" type="date" className="h-12 rounded-xl" {...register("deadline")} />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={addGoal.isPending || editGoal.isPending} className="rounded-xl">
                {(addGoal.isPending || editGoal.isPending) ? "Saving..." : "Save Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
