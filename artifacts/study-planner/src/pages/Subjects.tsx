import { useState } from "react";
import { Plus, BookOpen, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubjects, useAddSubject, useEditSubject, useRemoveSubject } from "@/hooks/use-subjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorPicker } from "@/components/ColorPicker";
import { useToast } from "@/hooks/use-toast";
import type { Subject } from "@workspace/api-client-react/src/generated/api.schemas";

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  description: z.string().optional(),
  weeklyGoalHours: z.coerce.number().optional().nullable(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function Subjects() {
  const { data: subjects, isLoading } = useSubjects();
  const addSubject = useAddSubject();
  const editSubject = useEditSubject();
  const removeSubject = useRemoveSubject();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { color: "#3b82f6" }
  });

  const currentColor = watch("color");

  const openDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      reset({
        name: subject.name,
        color: subject.color,
        description: subject.description || "",
        weeklyGoalHours: subject.weeklyGoalHours,
      });
    } else {
      setEditingSubject(null);
      reset({ name: "", color: "#3b82f6", description: "", weeklyGoalHours: null });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: SubjectFormData) => {
    if (editingSubject) {
      editSubject.mutate({ id: editingSubject.id, data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Subject updated successfully" });
        }
      });
    } else {
      addSubject.mutate({ data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Subject created successfully" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this subject? All associated sessions will be lost.")) {
      removeSubject.mutate({ id }, {
        onSuccess: () => toast({ title: "Subject deleted" })
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Subjects</h1>
          <p className="text-muted-foreground mt-1">Manage your courses and study areas.</p>
        </div>
        <Button onClick={() => openDialog()} className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all hover:-translate-y-0.5">
          <Plus className="w-5 h-5 mr-2" /> Add Subject
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : subjects?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-3xl border border-border border-dashed">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No subjects yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start by adding the subjects or courses you want to track your study time for.</p>
          <Button onClick={() => openDialog()}>Add Your First Subject</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects?.map((subject) => (
            <Card key={subject.id} className="rounded-2xl border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-3 w-full" style={{ backgroundColor: subject.color }} />
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{subject.name}</CardTitle>
                  {subject.weeklyGoalHours && (
                    <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1">
                      Target: {subject.weeklyGoalHours} hrs/week
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => openDialog(subject)} className="cursor-pointer">
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(subject.id)} className="cursor-pointer text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {subject.description || "No description provided."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingSubject ? "Edit Subject" : "New Subject"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input id="name" placeholder="e.g. Advanced Calculus" className="rounded-xl h-12" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker value={currentColor} onChange={(c) => setValue("color", c)} />
              {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyGoalHours">Weekly Goal (Hours) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input id="weeklyGoalHours" type="number" step="0.5" placeholder="e.g. 5" className="rounded-xl h-12" {...register("weeklyGoalHours")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Textarea id="description" placeholder="Notes about this subject..." className="rounded-xl resize-none h-24" {...register("description")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={addSubject.isPending || editSubject.isPending} className="rounded-xl">
                {(addSubject.isPending || editSubject.isPending) ? "Saving..." : "Save Subject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
