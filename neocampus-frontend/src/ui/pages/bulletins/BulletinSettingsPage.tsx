import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBulletin from '@/application/useCases/useBulletin';
import useClass from '@/application/useCases/useClass';
import useTeacher from '@/application/useCases/useTeacher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, BarChart, Percent, LayoutGrid, ArrowLeft, Save, Plus, Trash2, Edit3, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const BulletinSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes } = useClass();
  const { subjects } = useTeacher();
  
  const {
    useGetSettings,
    updateSettings,
    updatingSettings,
    useGetCoefficients,
    saveCoefficient,
    savingCoefficient,
    deleteCoefficient,
    useGetEvaluationTypes,
    saveEvaluationType,
    savingEvaluationType,
    deleteEvaluationType,
    useGetSubjectGroups,
    saveSubjectGroup,
    savingSubjectGroup,
    deleteSubjectGroup,
  } = useBulletin();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'general' | 'coefficients' | 'evaluations' | 'groups'>('general');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clear messages automatically
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // ==========================================
  // TAB 1: General Settings State & Logic
  // ==========================================
  const { data: settings, isLoading: loadingSettings } = useGetSettings();
  const [formatPeriode, setFormatPeriode] = useState<'trimestre' | 'semestre'>('trimestre');
  const [seuilEncouragements, setSeuilEncouragements] = useState<number>(12.0);
  const [seuilTableauHonneur, setSeuilTableauHonneur] = useState<number>(14.0);
  const [seuilFelicitations, setSeuilFelicitations] = useState<number>(16.0);
  const [showMinMax, setShowMinMax] = useState<boolean>(true);
  const [showRangMatiere, setShowRangMatiere] = useState<boolean>(true);
  const [showDetailNotes, setShowDetailNotes] = useState<boolean>(false);
  const [showSousTotalGroupe, setShowSousTotalGroupe] = useState<boolean>(true);
  const [noteEliminatoire, setNoteEliminatoire] = useState<string>('');

  useEffect(() => {
    if (settings) {
      setFormatPeriode(settings.format_periode);
      setSeuilEncouragements(settings.seuil_encouragements);
      setSeuilTableauHonneur(settings.seuil_tableau_honneur);
      setSeuilFelicitations(settings.seuil_felicitations);
      setShowMinMax(settings.show_min_max);
      setShowRangMatiere(settings.show_rang_matiere);
      setShowDetailNotes(settings.show_detail_notes);
      setShowSousTotalGroupe(settings.show_sous_total_groupe);
      setNoteEliminatoire(settings.note_eliminatoire !== null && settings.note_eliminatoire !== undefined ? settings.note_eliminatoire.toString() : '');
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        format_periode: formatPeriode,
        seuil_encouragements: Number(seuilEncouragements),
        seuil_tableau_honneur: Number(seuilTableauHonneur),
        seuil_felicitations: Number(seuilFelicitations),
        show_min_max: showMinMax,
        show_rang_matiere: showRangMatiere,
        show_detail_notes: showDetailNotes,
        show_sous_total_groupe: showSousTotalGroupe,
        note_eliminatoire: noteEliminatoire ? Number(noteEliminatoire) : null,
      });
      setSuccessMsg('General settings saved successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings.');
    }
  };

  // ==========================================
  // TAB 2: Coefficients per Class State & Logic
  // ==========================================
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { data: classCoefs, isLoading: loadingCoefs, refetch: refetchCoefs } = useGetCoefficients(Number(selectedClassId));
  const [localCoefOverrides, setLocalCoefOverrides] = useState<Record<number, string>>({});
  const [applyToLevel, setApplyToLevel] = useState<boolean>(false);

  useEffect(() => {
    if (classCoefs) {
      const overrides: Record<number, string> = {};
      classCoefs.forEach((c: any) => {
        overrides[c.matiere_id] = c.coefficient_classe !== null && c.coefficient_classe !== undefined ? c.coefficient_classe.toString() : '';
      });
      setLocalCoefOverrides(overrides);
    }
  }, [classCoefs]);

  const handleCoefChange = (matiereId: number, val: string) => {
    setLocalCoefOverrides(prev => ({
      ...prev,
      [matiereId]: val,
    }));
  };

  const handleSaveCoefs = async () => {
    if (!selectedClassId) return;
    try {
      // Save all non-empty overrides
      const promises = Object.entries(localCoefOverrides).map(([matiereId, val]) => {
        if (val === '') {
          return deleteCoefficient({
            classeId: Number(selectedClassId),
            matiereId: Number(matiereId)
          });
        } else {
          return saveCoefficient({
            classeId: Number(selectedClassId),
            matiereId: Number(matiereId),
            coefficient: Number(val),
            applyToLevel
          });
        }
      });
      await Promise.all(promises);
      setSuccessMsg('Class coefficients saved successfully.');
      refetchCoefs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save coefficients.');
    }
  };

  // ==========================================
  // TAB 3: Evaluation Types State & Logic
  // ==========================================
  const { data: evalTypes, isLoading: loadingEvals, refetch: refetchEvals } = useGetEvaluationTypes();
  const [isOpenEvalDialog, setIsOpenEvalDialog] = useState<boolean>(false);
  const [editingEval, setEditingEval] = useState<{ id?: number; nom: string; code: string; poids_defaut: number } | null>(null);

  const handleSaveEvalType = async () => {
    if (!editingEval?.nom || !editingEval?.code) return;
    try {
      await saveEvaluationType({
        id: editingEval.id,
        nom: editingEval.nom,
        code: editingEval.code,
        poids_defaut: Number(editingEval.poids_defaut),
      });
      setSuccessMsg(`Evaluation type ${editingEval.id ? 'updated' : 'created'} successfully.`);
      setIsOpenEvalDialog(false);
      setEditingEval(null);
      refetchEvals();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save evaluation type.');
    }
  };

  const handleDeleteEvalType = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this evaluation type?')) return;
    try {
      await deleteEvaluationType(id);
      setSuccessMsg('Evaluation type deleted successfully.');
      refetchEvals();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete evaluation type.');
    }
  };

  // ==========================================
  // TAB 4: Subject Groups State & Logic
  // ==========================================
  const { data: subjectGroups, isLoading: loadingGroups, refetch: refetchGroups } = useGetSubjectGroups();
  const [isOpenGroupDialog, setIsOpenGroupDialog] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<{ id?: number; nom: string; ordre: number; matiere_ids: number[] } | null>(null);

  const handleSaveGroup = async () => {
    if (!editingGroup?.nom) return;
    try {
      await saveSubjectGroup({
        id: editingGroup.id,
        nom: editingGroup.nom,
        ordre: Number(editingGroup.ordre),
        matiere_ids: editingGroup.matiere_ids,
      });
      setSuccessMsg(`Subject group ${editingGroup.id ? 'updated' : 'created'} successfully.`);
      setIsOpenGroupDialog(false);
      setEditingGroup(null);
      refetchGroups();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save subject group.');
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subject group?')) return;
    try {
      await deleteSubjectGroup(id);
      setSuccessMsg('Subject group deleted successfully.');
      refetchGroups();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete subject group.');
    }
  };

  const toggleGroupSubject = (matiereId: number) => {
    if (!editingGroup) return;
    const ids = editingGroup.matiere_ids.includes(matiereId)
      ? editingGroup.matiere_ids.filter(id => id !== matiereId)
      : [...editingGroup.matiere_ids, matiereId];
    setEditingGroup({ ...editingGroup, matiere_ids: ids });
  };

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 w-full">
      {/* Header bar */}
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
              Bulletin Settings Configuration
              <Badge className="bg-[#d0f137] text-black hover:bg-[#d0f137] text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 border-none rounded">
                Admin
              </Badge>
            </h1>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
              Configure parameters, class subject coefficients, evaluation types, and print categories
            </p>
          </div>
        </div>
      </div>

      {/* Success / Error alerts */}
      {successMsg && (
        <Alert className="border-green-200 bg-green-50 text-green-800 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-xs font-black uppercase tracking-wider text-green-900 font-bold">Success</AlertTitle>
          <AlertDescription className="text-xs text-neutral-600 mt-0.5">{successMsg}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-red-650" />
          <AlertTitle className="text-xs font-black uppercase tracking-wider text-red-950 font-bold">Error</AlertTitle>
          <AlertDescription className="text-xs text-red-700 mt-0.5">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Horizontal Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-100 pb-px">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 pb-2.5 px-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all leading-none ${
            activeTab === 'general'
              ? 'border-black text-black font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>General Config</span>
        </button>
        <button
          onClick={() => setActiveTab('coefficients')}
          className={`flex items-center space-x-2 pb-2.5 px-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all leading-none ${
            activeTab === 'coefficients'
              ? 'border-black text-black font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Coefficients per Class</span>
        </button>
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`flex items-center space-x-2 pb-2.5 px-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all leading-none ${
            activeTab === 'evaluations'
              ? 'border-black text-black font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <BarChart className="h-4 w-4" />
          <span>Evaluation Types</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center space-x-2 pb-2.5 px-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all leading-none ${
            activeTab === 'groups'
              ? 'border-black text-black font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-neutral-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Subject Groups</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* GENERAL CONFIG TAB */}
      {/* ============================================================== */}
      {activeTab === 'general' && (
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-wider text-neutral-800">
              General Settings Parameters
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">Configure default periods, overall card layout displays, and automated mention boundaries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingSettings ? (
              <div className="space-y-4 py-4">
                <div className="h-8 bg-neutral-50 rounded-lg animate-pulse" />
                <div className="h-8 bg-neutral-50 rounded-lg animate-pulse" />
              </div>
            ) : (
              <>
                {/* Period Mode */}
                <div className="space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 block">Report Card Period Format</label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-neutral-700 hover:text-black transition-colors">
                      <input
                        type="radio"
                        name="period_format"
                        checked={formatPeriode === 'trimestre'}
                        onChange={() => setFormatPeriode('trimestre')}
                        className="accent-black h-4 w-4 bg-white border-neutral-300"
                      />
                      <span>Trimestres (T1, T2, T3)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-neutral-700 hover:text-black transition-colors">
                      <input
                        type="radio"
                        name="period_format"
                        checked={formatPeriode === 'semestre'}
                        onChange={() => setFormatPeriode('semestre')}
                        className="accent-black h-4 w-4 bg-white border-neutral-300"
                      />
                      <span>Semestres (S1, S2)</span>
                    </label>
                  </div>
                </div>

                <div className="border-b border-neutral-100" />

                {/* Display Toggles */}
                <div className="space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 block">Print View Display Controls</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
                      <Checkbox
                        id="showMinMax"
                        checked={showMinMax}
                        onCheckedChange={(checked) => setShowMinMax(!!checked)}
                      />
                      <label htmlFor="showMinMax" className="text-xs text-neutral-700 font-bold cursor-pointer select-none">
                        Show Subject Min / Max class grades
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
                      <Checkbox
                        id="showRangMatiere"
                        checked={showRangMatiere}
                        onCheckedChange={(checked) => setShowRangMatiere(!!checked)}
                      />
                      <label htmlFor="showRangMatiere" className="text-xs text-neutral-700 font-bold cursor-pointer select-none">
                        Show student subject-specific ranks
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
                      <Checkbox
                        id="showDetailNotes"
                        checked={showDetailNotes}
                        onCheckedChange={(checked) => setShowDetailNotes(!!checked)}
                      />
                      <label htmlFor="showDetailNotes" className="text-xs text-neutral-700 font-bold cursor-pointer select-none">
                        Show individual exam grades breakdown under subject averages
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
                      <Checkbox
                        id="showSousTotalGroupe"
                        checked={showSousTotalGroupe}
                        onCheckedChange={(checked) => setShowSousTotalGroupe(!!checked)}
                      />
                      <label htmlFor="showSousTotalGroupe" className="text-xs text-neutral-700 font-bold cursor-pointer select-none">
                        Show sub-totals and totals for each subject group
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-b border-neutral-100" />

                {/* Thresholds */}
                <div className="space-y-4">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 block">Performance Mention Boundaries & Constraints</label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="encourag" className="text-xs font-bold text-neutral-500">Encouragements Minimum</Label>
                      <Input
                        id="encourag"
                        type="number"
                        step="0.1"
                        value={seuilEncouragements}
                        onChange={(e) => setSeuilEncouragements(Number(e.target.value))}
                        className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tableau" className="text-xs font-bold text-neutral-500">Tableau d'Honneur Minimum</Label>
                      <Input
                        id="tableau"
                        type="number"
                        step="0.1"
                        value={seuilTableauHonneur}
                        onChange={(e) => setSeuilTableauHonneur(Number(e.target.value))}
                        className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="felic" className="text-xs font-bold text-neutral-500">Félicitations Minimum</Label>
                      <Input
                        id="felic"
                        type="number"
                        step="0.1"
                        value={seuilFelicitations}
                        onChange={(e) => setSeuilFelicitations(Number(e.target.value))}
                        className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="elimin" className="text-xs font-bold text-neutral-500">Eliminatory Grade Threshold (Optional)</Label>
                      <Input
                        id="elimin"
                        type="number"
                        step="0.1"
                        placeholder="e.g. 5.0"
                        value={noteEliminatoire}
                        onChange={(e) => setNoteEliminatoire(e.target.value)}
                        className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={updatingSettings}
                    className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    <span>Save Parameters</span>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* COEFFICIENTS PER CLASS TAB */}
      {/* ============================================================== */}
      {activeTab === 'coefficients' && (
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-wider text-neutral-800">
              Configure Coefficients per Class
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">Manage class-specific overrides for subject weight coefficients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="w-full md:w-1/3 space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500">Select Class</Label>
              <Select value={selectedClassId} onValueChange={(val) => setSelectedClassId(val || '')}>
                <SelectTrigger className="bg-white border-neutral-200 text-neutral-900 text-xs h-9">
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100 text-xs text-neutral-900">
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()} className="hover:bg-neutral-50 focus:bg-neutral-50 text-neutral-900">
                      {cls.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClassId && (
              <div className="space-y-4">
                {loadingCoefs ? (
                  <div className="space-y-2 py-4 animate-pulse">
                    <div className="h-8 bg-neutral-50 rounded" />
                    <div className="h-8 bg-neutral-50 rounded" />
                  </div>
                ) : !classCoefs || classCoefs.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-neutral-500 text-xs font-bold uppercase tracking-wider">
                    No subjects are assigned to this class yet. Please assign subjects in Class Details first.
                  </div>
                ) : (
                  <>
                    <div className="border border-neutral-100 rounded-xl overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader className="bg-neutral-50/50">
                          <TableRow className="border-b border-[#E5E7EB]">
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Subject</TableHead>
                            <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-1/4">Global Coef (Read-Only)</TableHead>
                            <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-1/4">Class-specific Coef Override</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classCoefs.map((row: any) => (
                            <TableRow key={row.matiere_id} className="border-b border-neutral-50 hover:bg-neutral-50/20">
                              <TableCell className="font-extrabold text-neutral-800 uppercase text-xs">{row.nom} ({row.code})</TableCell>
                              <TableCell className="text-center">
                                <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded text-[10px] font-black">
                                  {row.coefficient_global.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="p-2 flex justify-center">
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Use default"
                                  value={localCoefOverrides[row.matiere_id] ?? ''}
                                  onChange={(e) => handleCoefChange(row.matiere_id, e.target.value)}
                                  className="w-32 bg-white border-neutral-200 text-neutral-900 text-center h-8 text-xs focus:ring-black"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-neutral-50/55 rounded-xl border border-neutral-100">
                      <Checkbox
                        id="applyToLevel"
                        checked={applyToLevel}
                        onCheckedChange={(checked) => setApplyToLevel(!!checked)}
                      />
                      <label htmlFor="applyToLevel" className="text-xs text-neutral-700 font-bold cursor-pointer select-none">
                        Apply these coefficients to all classes of the same level (e.g. all CM1 classes)
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleSaveCoefs}
                        disabled={savingCoefficient}
                        className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 cursor-pointer"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        <span>Save Coefficients</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* EVALUATION TYPES TAB */}
      {/* ============================================================== */}
      {activeTab === 'evaluations' && (
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-neutral-800">
                Evaluation / Exam Types
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">Configure weighting values for different formats of classroom tests.</CardDescription>
            </div>
            <Dialog open={isOpenEvalDialog} onOpenChange={setIsOpenEvalDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingEval({ nom: '', code: '', poids_defaut: 1.0 })}
                  className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-8 px-3 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Type</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-neutral-100 text-neutral-900">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xs font-black uppercase tracking-wider">{editingEval?.id ? 'Edit Evaluation Type' : 'Create Evaluation Type'}</DialogTitle>
                  <DialogDescription className="text-xs text-neutral-400">Define evaluation weights that are auto-applied to exam grades.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 text-left">
                  <div className="space-y-1.5">
                    <Label htmlFor="evalName" className="text-neutral-500 font-bold text-xs">Name</Label>
                    <Input
                      id="evalName"
                      placeholder="e.g. Midterm Exam"
                      value={editingEval?.nom ?? ''}
                      onChange={(e) => setEditingEval(prev => prev ? { ...prev, nom: e.target.value } : null)}
                      className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="evalCode" className="text-neutral-500 font-bold text-xs">Code</Label>
                    <Input
                      id="evalCode"
                      placeholder="e.g. MID"
                      value={editingEval?.code ?? ''}
                      onChange={(e) => setEditingEval(prev => prev ? { ...prev, code: e.target.value.toUpperCase() } : null)}
                      className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="evalWeight" className="text-neutral-500 font-bold text-xs">Default Weight (Poids)</Label>
                    <Input
                      id="evalWeight"
                      type="number"
                      step="0.1"
                      value={editingEval?.poids_defaut ?? 1.0}
                      onChange={(e) => setEditingEval(prev => prev ? { ...prev, poids_defaut: Number(e.target.value) } : null)}
                      className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsOpenEvalDialog(false)} className="text-neutral-400 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider h-9">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEvalType}
                    disabled={savingEvaluationType}
                    className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 cursor-pointer"
                  >
                    Save Type
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingEvals ? (
              <div className="space-y-2 py-4 animate-pulse">
                <div className="h-8 bg-neutral-50 rounded" />
                <div className="h-8 bg-neutral-50 rounded" />
              </div>
            ) : !evalTypes || evalTypes.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-neutral-500 text-xs font-bold uppercase tracking-wider">
                No evaluation types registered. Click 'Add Type' to create one.
              </div>
            ) : (
              <div className="border border-neutral-100 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow className="border-b border-[#E5E7EB]">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Evaluation Name</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Short Code</TableHead>
                      <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-1/4">Default Weight</TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-1/4 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evalTypes.map((type) => (
                      <TableRow key={type.id} className="border-b border-neutral-50 hover:bg-neutral-50/20">
                        <TableCell className="font-extrabold text-neutral-800 uppercase text-xs">{type.nom}</TableCell>
                        <TableCell className="text-xs font-bold uppercase">
                          <span className="bg-[#d0f137] text-black text-[9px] font-black px-2 py-0.5 rounded">
                            {type.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-bold text-neutral-600 text-xs">{type.poids_defaut.toFixed(2)}</TableCell>
                        <TableCell className="text-right space-x-1.5 pr-6">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingEval(type);
                              setIsOpenEvalDialog(true);
                            }}
                            className="h-7 w-7 p-0 rounded-md hover:bg-neutral-50 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-neutral-400 hover:text-black" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEvalType(type.id)}
                            className="h-7 w-7 p-0 rounded-md hover:bg-neutral-50 cursor-pointer text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-neutral-400 hover:text-red-650" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* SUBJECT GROUPS TAB */}
      {/* ============================================================== */}
      {activeTab === 'groups' && (
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-neutral-800">
                Subject Categories & Groups
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">Classify subjects into structural groups (e.g. Science, Languages) for print grouping.</CardDescription>
            </div>
            <Dialog open={isOpenGroupDialog} onOpenChange={setIsOpenGroupDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingGroup({ nom: '', ordre: 0, matiere_ids: [] })}
                  className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-8 px-3 cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Group</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-lg">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xs font-black uppercase tracking-wider">{editingGroup?.id ? 'Edit Subject Group' : 'Create Subject Group'}</DialogTitle>
                  <DialogDescription className="text-xs text-neutral-400">Arrange displaying order and assign school courses to this group.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[450px] overflow-y-auto pr-1 text-left">
                  <div className="space-y-1.5">
                    <Label htmlFor="groupName" className="text-neutral-500 font-bold text-xs">Group Name</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g. Science & Tech"
                      value={editingGroup?.nom ?? ''}
                      onChange={(e) => setEditingGroup(prev => prev ? { ...prev, nom: e.target.value } : null)}
                      className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="groupOrder" className="text-neutral-500 font-bold text-xs">Display Order Index</Label>
                    <Input
                      id="groupOrder"
                      type="number"
                      value={editingGroup?.ordre ?? 0}
                      onChange={(e) => setEditingGroup(prev => prev ? { ...prev, ordre: Number(e.target.value) } : null)}
                      className="bg-white border-neutral-200 text-neutral-900 text-xs h-9"
                    />
                  </div>
                  
                  {/* Subject Assignment Checkbox List */}
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-neutral-500 font-bold text-xs block">Assign Subjects to Group</Label>
                    <div className="border border-neutral-100 bg-neutral-50/50 rounded-xl p-3 grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto">
                      {subjects.map((sub: any) => {
                        const isChecked = editingGroup?.matiere_ids.includes(sub.id) ?? false;
                        return (
                          <div key={sub.id} className="flex items-center space-x-3 hover:bg-neutral-100/50 p-1.5 rounded-lg transition-colors">
                            <Checkbox
                              id={`group_sub_${sub.id}`}
                              checked={isChecked}
                              onCheckedChange={() => toggleGroupSubject(sub.id)}
                            />
                            <label htmlFor={`group_sub_${sub.id}`} className="text-xs font-bold text-neutral-700 cursor-pointer select-none uppercase">
                              {sub.nom} ({sub.code})
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsOpenGroupDialog(false)} className="text-neutral-400 hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider h-9">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveGroup}
                    disabled={savingSubjectGroup}
                    className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-4 cursor-pointer"
                  >
                    Save Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingGroups ? (
              <div className="space-y-2 py-4 animate-pulse">
                <div className="h-8 bg-neutral-50 rounded" />
                <div className="h-8 bg-neutral-50 rounded" />
              </div>
            ) : !subjectGroups || subjectGroups.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-neutral-500 text-xs font-bold uppercase tracking-wider">
                No subject groups registered. Click 'Add Group' to create one.
              </div>
            ) : (
              <div className="border border-neutral-100 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow className="border-b border-[#E5E7EB]">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-12 text-center">Index</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Group Name</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Assigned Subjects</TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 w-1/4 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectGroups.map((group) => (
                      <TableRow key={group.id} className="border-b border-neutral-50 hover:bg-neutral-50/20">
                        <TableCell className="text-center font-bold text-neutral-800 text-xs">{group.ordre}</TableCell>
                        <TableCell className="font-extrabold text-neutral-850 uppercase text-xs">{group.nom}</TableCell>
                        <TableCell className="p-2">
                          <div className="flex flex-wrap gap-1.5">
                            {group.matieres && group.matieres.length > 0 ? (
                              group.matieres.map((sub: any) => (
                                <span key={sub.id} className="bg-neutral-100 border border-neutral-200 text-neutral-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                  {sub.nom}
                                </span>
                              ))
                            ) : (
                              <span className="text-neutral-400 text-xs font-bold uppercase italic">No subjects</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-1.5 pr-6">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingGroup({
                                id: group.id,
                                nom: group.nom,
                                ordre: group.ordre,
                                matiere_ids: group.matieres?.map((m: any) => m.id) ?? []
                              });
                              setIsOpenGroupDialog(true);
                            }}
                            className="h-7 w-7 p-0 rounded-md hover:bg-neutral-50 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-neutral-400 hover:text-black" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteGroup(group.id)}
                            className="h-7 w-7 p-0 rounded-md hover:bg-neutral-50 cursor-pointer text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-neutral-400 hover:text-red-650" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulletinSettingsPage;
