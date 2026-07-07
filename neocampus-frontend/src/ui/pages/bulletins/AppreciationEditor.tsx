import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '@/application/useCases/useAuth';
import useBulletin from '@/application/useCases/useBulletin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Edit, Award, User, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AppreciationEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useGetBulletin, updateAppreciations, updatingAppreciations } = useBulletin();

  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch bulletin
  const { data: bulletin, isLoading, refetch } = useGetBulletin(id ?? '');

  // Local state for changed comments: key = matiereId, value = comment string
  const [comments, setComments] = useState<Record<number, string>>({});

  // Initialize comments from fetched bulletin details
  useEffect(() => {
    if (bulletin && bulletin.details) {
      const initialComments: Record<number, string> = {};
      bulletin.details.forEach((detail) => {
        initialComments[detail.matiere_id] = detail.appreciation_prof ?? '';
      });
      setComments(initialComments);
    }
  }, [bulletin]);

  // Automatically clear banners
  useEffect(() => {
    if (successBanner) {
      const timer = setTimeout(() => setSuccessBanner(null), 5500);
      return () => clearTimeout(timer);
    }
  }, [successBanner]);

  const handleCommentChange = (matiereId: number, value: string) => {
    setComments((prev) => ({
      ...prev,
      [matiereId]: value,
    }));
  };

  const handleSave = async () => {
    if (!id || !bulletin || !bulletin.details) return;
    setErrorMsg(null);
    setSuccessBanner(null);
    
    try {
      // Filter out only changed comments to avoid redundant API hits
      const promises = bulletin.details
        .filter((detail) => {
          const canEdit =
            user?.role === 'admin' ||
            (user?.role === 'enseignant' && detail.prof?.user?.nom === user?.nom);
          const hasChanged = comments[detail.matiere_id] !== (detail.appreciation_prof ?? '');
          return canEdit && hasChanged;
        })
        .map((detail) =>
          updateAppreciations({
            bulletinId: id,
            matiereId: detail.matiere_id,
            appreciation: comments[detail.matiere_id],
          })
        );

      if (promises.length === 0) {
        setSuccessBanner("No modifications detected to save.");
        return;
      }

      await Promise.all(promises);
      setSuccessBanner("Comments and appreciations saved successfully.");
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "An error occurred during save.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-500 text-xs font-bold uppercase tracking-widest">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mb-4" />
        Loading editor...
      </div>
    );
  }

  if (!bulletin) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 p-8 w-full">
        <p className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Report Card Not Found</p>
        <Button onClick={() => navigate(-1)} className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4">
          Back
        </Button>
      </div>
    );
  }

  const isTeacher = user?.role === 'enseignant';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 w-full">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 border border-[#E5E7EB] hover:bg-neutral-50 rounded-lg flex items-center justify-center text-neutral-500 hover:text-black p-0 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900 flex items-center gap-2">
              Teacher Feedback & Comments
              <Badge className="bg-[#d0f137] text-black hover:bg-[#d0f137] text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 border-none rounded">
                Editor
              </Badge>
            </h1>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
              Record subject-specific teacher reviews for {bulletin.eleve?.prenom} {bulletin.eleve?.nom}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updatingAppreciations}
          className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 cursor-pointer"
        >
          <Save className="h-4 w-4 mr-2" />
          <span>Save Comments</span>
        </Button>
      </div>

      {/* Notifications */}
      {successBanner && (
        <Alert className="border-green-200 bg-green-50 text-green-800 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-xs font-black uppercase tracking-wider text-green-900 font-bold">Success</AlertTitle>
          <AlertDescription className="text-xs text-neutral-600 mt-0.5">{successBanner}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-red-650" />
          <AlertTitle className="text-xs font-black uppercase tracking-wider text-red-950 font-bold">Error</AlertTitle>
          <AlertDescription className="text-xs text-red-700 mt-0.5">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Roster & Student Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-white border border-[#E5E7EB] rounded-xl shadow-sm border-l-4 border-l-black">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <User className="h-4 w-4 text-neutral-500" />
              <span>Student Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="font-extrabold text-neutral-400 block uppercase tracking-wider text-[9px] mb-0.5">Full Name</span>
              <span className="text-neutral-800 font-extrabold uppercase text-sm">{bulletin.eleve?.prenom} {bulletin.eleve?.nom}</span>
            </div>
            <div>
              <span className="font-extrabold text-neutral-400 block uppercase tracking-wider text-[9px] mb-0.5">Class & Period</span>
              <span className="text-neutral-700 font-bold uppercase">{bulletin.classe?.nom} • {bulletin.periode}</span>
            </div>
            <div>
              <span className="font-extrabold text-neutral-400 block uppercase tracking-wider text-[9px] mb-0.5">Academic Year</span>
              <span className="text-neutral-700 font-bold uppercase">{bulletin.annee_scolaire}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white border border-[#E5E7EB] rounded-xl shadow-sm border-l-4 border-l-[#d0f137]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-neutral-500" />
              <span>Academic Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-extrabold text-neutral-400 block uppercase tracking-wider text-[9px] mb-0.5">General Average</span>
              <span className="text-neutral-900 font-black text-2xl">
                {bulletin.moyenne_generale !== null ? bulletin.moyenne_generale.toFixed(2) : '--'}
              </span>
            </div>
            <div>
              <span className="font-extrabold text-neutral-400 block uppercase tracking-wider text-[9px] mb-0.5">Class Rank</span>
              <span className="text-neutral-900 font-black text-2xl">
                {bulletin.rang_classe !== null ? `${bulletin.rang_classe}e` : '--'}
              </span>
            </div>
            <div>
              <span className="font-extrabold text-neutral-400 block uppercase tracking-wider text-[9px] mb-0.5">Total Absences</span>
              <span className="text-neutral-800 font-bold text-sm uppercase">{bulletin.total_absences} Hours</span>
            </div>
            <div>
              <span className="font-extrabold text-neutral-400 block uppercase tracking-wider text-[9px] mb-0.5">Report Card Status</span>
              <span className="text-neutral-800 font-bold uppercase">{bulletin.status}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor Table */}
      <Card className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        <CardHeader className="bg-neutral-50/50 border-b border-[#E5E7EB]">
          <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-800">Comments & Teacher feedback Editor</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow className="border-b border-[#E5E7EB]">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-1/4">Subject & Teacher</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-[80px]">Coef</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-[120px]">Average</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-1/2">Comments & Appreciations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bulletin.details?.map((detail) => {
                  const canEdit =
                    isAdmin ||
                    (isTeacher &&
                      (detail.prof?.user?.nom === user?.nom ||
                        detail.prof?.id === user?.id));

                  return (
                    <TableRow key={detail.id} className="border-b border-neutral-50 hover:bg-neutral-50/20 transition-colors">
                      <TableCell className="align-top py-3 font-semibold text-neutral-800">
                        <div className="font-extrabold uppercase text-xs">{detail.matiere?.nom}</div>
                        <div className="text-[10px] text-neutral-400 font-bold uppercase mt-1">
                          Prof. {detail.prof?.prenom} {detail.prof?.nom}
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-top py-3">
                        <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded text-[10px] font-black">
                          {detail.coefficient}
                        </span>
                      </TableCell>
                      <TableCell className="text-center align-top py-3 font-bold text-neutral-900 text-sm">
                        {detail.moyenne_eleve !== null ? detail.moyenne_eleve.toFixed(2) : '--'}
                      </TableCell>
                      <TableCell className="pr-6 pb-4 pt-3">
                        {canEdit ? (
                          <div className="space-y-1">
                            <Textarea
                              value={comments[detail.matiere_id] ?? ''}
                              onChange={(e) => handleCommentChange(detail.matiere_id, e.target.value)}
                              placeholder="Write a comment on the student's academic performance..."
                              rows={3}
                              className="bg-white border-neutral-200 text-neutral-900 rounded-lg shadow-sm focus:ring-black text-xs"
                            />
                            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                              <Edit className="h-3 w-3" />
                              <span>You are authorized to edit comments for this subject.</span>
                            </span>
                          </div>
                        ) : (
                          <div className="bg-neutral-50 text-neutral-500 rounded-lg p-3 border border-neutral-100 italic text-xs">
                            {detail.appreciation_prof || "No comment recorded."}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppreciationEditor;
