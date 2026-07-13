import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClass } from '@/application/useCases/useClass';
import { useCourseMaterial } from '@/application/useCases/useCourseMaterial';
import { axiosClient } from '@/infrastructure/api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Plus, 
  Loader2, 
  Calendar, 
  Trash2, 
  FileText, 
  AlertCircle,
} from 'lucide-react';

export const TeacherHomeworkPage: React.FC = () => {
  const { classes, loadingClasses } = useClass();
  const { useHomework, createHomework, isCreatingHomework, deleteHomework } = useCourseMaterial();

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form States
  const [formMatiereId, setFormMatiereId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');

  // Fetch the teacher's OWN subjects from their profile — independent of class selection
  const { data: teacherProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['teacher', 'me'],
    queryFn: async () => {
      const res = await axiosClient.get('/teacher/me');
      return res.data.data as { enseignant_id: number; specialite: string; matieres: { matiere_id: number; matiere_nom: string }[] };
    },
  });

  const mySubjects = teacherProfile?.matieres ?? [];

  // Fetch homework for class
  const { data: homeworkList = [], isLoading: loadingHomework, refetch } = useHomework(
    selectedClassId ?? 0
  );

  // Auto-set matiere id from teacher profile when dialog opens
  useEffect(() => {
    if (mySubjects.length > 0) {
      setFormMatiereId(mySubjects[0].matiere_id.toString());
    }
  }, [teacherProfile]);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !formMatiereId || !formTitle || !formDueDate) return;

    try {
      await createHomework({
        classe_id: selectedClassId,
        matiere_id: parseInt(formMatiereId),
        titre: formTitle,
        description: formDesc,
        date_echeance: formDueDate,
        fichier_url: formFileUrl || undefined,
      });

      // Clear states
      setIsCreateOpen(false);
      setFormMatiereId('');
      setFormTitle('');
      setFormDesc('');
      setFormDueDate('');
      setFormFileUrl('');
      refetch();
    } catch (err) {
      console.error('Failed to create homework', err);
    }
  };

  const handleDeleteHomework = async (id: number) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteHomework(id);
        refetch();
      } catch (err) {
        console.error('Failed to delete homework', err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
            Homework Manager
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Publish and manage homework assignments for your classes
          </p>
        </div>

        {selectedClassId && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-black hover:bg-neutral-850 text-white rounded-xl shadow-sm text-xs font-bold px-4 py-2 cursor-pointer border-none flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Homework
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class Selection Left Column */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3">
              Select Class Group
            </h3>
            {loadingClasses ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              </div>
            ) : (
              <div className="space-y-1">
                {classes.map((cls: any) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedClassId === cls.id
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {cls.nom}
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Homework List Column */}
        <div className="lg:col-span-3">
          {!selectedClassId ? (
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-12 text-center">
              <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                No Class Selected
              </h3>
              <p className="text-[11px] text-neutral-400 font-semibold max-w-xs mx-auto leading-relaxed mt-1">
                Select a class group from the left panel to manage homework.
              </p>
            </Card>
          ) : (
            <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl">
              <CardHeader className="pb-3 border-b border-neutral-50">
                <CardTitle className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Homework assignments for {classes.find(c => c.id === selectedClassId)?.nom}
                </CardTitle>
                <CardDescription>Assignments visible to students and parents</CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                {loadingHomework ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-450" />
                    <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">Loading assignments...</span>
                  </div>
                ) : homeworkList.length === 0 ? (
                  <div className="text-center py-12 space-y-2 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                    <BookOpen className="h-8 w-8 text-neutral-350 mx-auto" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      No Assignments Yet
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-semibold max-w-xs mx-auto mt-0.5">
                      Click the "Create Homework" button at the top right to assign work.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {homeworkList.map((hw: any) => (
                      <div 
                        key={hw.id}
                        className="border border-neutral-100 rounded-xl p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-white"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[9px] uppercase px-2 rounded-lg">
                              {hw.matiere_nom}
                            </Badge>
                            <span className="text-[10px] text-neutral-450 font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Due: {hw.date_limite}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                            {hw.titre}
                          </h4>
                          <p className="text-xs text-neutral-500 font-medium whitespace-pre-line leading-relaxed">
                            {hw.description}
                          </p>
                          {hw.fichier_url && (
                            <div className="pt-1.5">
                              <a 
                                href={hw.fichier_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-bold text-indigo-650 hover:underline flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" /> Attachment Resource
                              </a>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="text-neutral-400 hover:text-red-600 self-end md:self-start h-8 w-8 p-0 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Homework Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Assign New Homework
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateHomework} className="space-y-4 pt-2">
            {/* Subject — always shown as a locked read-only display box */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Subject</Label>
              {loadingProfile ? (
                <div className="h-10 flex items-center gap-1.5 px-3 text-xs text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : mySubjects.length > 0 ? (
                <div className="h-10 px-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  {mySubjects[0].matiere_nom}
                </div>
              ) : (
                <div className="h-10 px-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  No subject found for your profile
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Assignment Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Algebra Exercise 5"
                required
                className="rounded-xl border-neutral-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Instructions / Description</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Detail instructions for your students..."
                className="rounded-xl border-neutral-200 min-h-[90px]"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Due Date</Label>
              <Input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                required
                className="rounded-xl border-neutral-200"
              />
            </div>

            {/* Fichier URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Attachment Link (Optional)</Label>
              <Input
                value={formFileUrl}
                onChange={(e) => setFormFileUrl(e.target.value)}
                placeholder="e.g. Google Drive document link"
                className="rounded-xl border-neutral-200"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border-none cursor-pointer text-neutral-550"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingHomework}
                className="bg-black hover:bg-neutral-800 text-white rounded-xl font-bold cursor-pointer border-none"
              >
                {isCreatingHomework ? 'Assigning...' : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherHomeworkPage;
