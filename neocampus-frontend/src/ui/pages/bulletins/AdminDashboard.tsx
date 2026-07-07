import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useClass from '@/application/useCases/useClass';
import useBulletin from '@/application/useCases/useBulletin';
import useAuth from '@/application/useCases/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, TrendingUp, CheckCircle2, AlertTriangle, Calendar, Users, Edit3, Eye, Check, Lock, Send } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const { classes, years } = useClass();
  const {
    useGetBulletinsByClasse,
    useGetMyBulletins,
    generateBulk,
    generatingBulk,
    generateSingle,
    generatingSingle,
    publish,
    publishing,
    updateDecision,
    validate,
    validating
  } = useBulletin();

  // Filters state
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Trimestre 1');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set defaults when years or classes load
  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[0].libelle);
    }
  }, [years, selectedYear]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id.toString());
    }
  }, [classes, selectedClassId]);

  // Fetch bulletins list
  const {
    data: bulletins,
    isLoading: loadingBulletins,
    refetch
  } = useGetBulletinsByClasse(
    Number(selectedClassId),
    selectedPeriod,
    selectedYear
  );

  const isStudentOrParent = user?.role === 'eleve' || user?.role === 'parent';
  const {
    data: myBulletins,
    isLoading: loadingMyBulletins
  } = useGetMyBulletins();

  // Automatically clear success banners
  useEffect(() => {
    if (successBanner) {
      const timer = setTimeout(() => setSuccessBanner(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successBanner]);

  const handleGenerateBulk = async () => {
    if (!selectedClassId || !selectedPeriod || !selectedYear) return;
    setErrorMsg(null);
    setSuccessBanner(null);
    try {
      await generateBulk({
        classeId: Number(selectedClassId),
        periode: selectedPeriod,
        anneeScolaire: selectedYear
      });
      setSuccessBanner('Bulletins generated successfully.');
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "An error occurred during generation.");
    }
  };

  const handleGenerateSingle = async (eleveId: number) => {
    setErrorMsg(null);
    setSuccessBanner(null);
    try {
      await generateSingle({
        eleveId,
        periode: selectedPeriod,
        anneeScolaire: selectedYear
      });
      setSuccessBanner("Individual bulletin updated.");
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to regenerate bulletin.");
    }
  };

  const handlePublish = async (bulletinId: string) => {
    setSuccessBanner(null);
    try {
      await publish(bulletinId);
      setSuccessBanner('Bulletin published successfully.');
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error during publication.");
    }
  };

  const handleValidate = async (bulletinId: string) => {
    setSuccessBanner(null);
    try {
      await validate(bulletinId);
      setSuccessBanner('Bulletin validated and locked successfully.');
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error during validation.");
    }
  };

  const handlePublishAll = async () => {
    const validated = bulletins?.filter(b => b.status === 'VALIDATED') || [];
    if (validated.length === 0) return;
    setSuccessBanner(null);
    setErrorMsg(null);
    try {
      await Promise.all(validated.map(b => publish(b.id)));
      setSuccessBanner("All validated bulletins have been published.");
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to publish all validated bulletins.");
    }
  };

  const handleDecisionChange = async (bulletinId: string, decision: string) => {
    const b = bulletins?.find(item => item.id === bulletinId);
    if (!b) return;
    setErrorMsg(null);
    try {
      await updateDecision({
        bulletinId,
        decision: decision || null,
        mention: b.mention || null,
        appreciationGenerale: b.appreciation_generale || null
      });
      setSuccessBanner("Council decision updated.");
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update decision.");
    }
  };

  // KPIs Calculations
  const totalStudents = bulletins?.length ?? 0;
  const draftCount = bulletins?.filter(b => b.status === 'DRAFT').length ?? 0;
  const validatedCount = bulletins?.filter(b => b.status === 'VALIDATED').length ?? 0;
  const publishedCount = bulletins?.filter(b => b.status === 'PUBLISHED').length ?? 0;
  
  const validAverages = bulletins?.map(b => b.moyenne_generale).filter(v => v !== null) as number[] ?? [];
  const classAvg = validAverages.length > 0 ? (validAverages.reduce((a, b) => a + b, 0) / validAverages.length).toFixed(2) : 'N/A';
  const highestAvg = validAverages.length > 0 ? Math.max(...validAverages).toFixed(2) : 'N/A';
  const lowestAvg = validAverages.length > 0 ? Math.min(...validAverages).toFixed(2) : 'N/A';

  // Success Rate (Average >= 10)
  const passingStudents = bulletins?.filter(b => b.moyenne_generale !== null && b.moyenne_generale >= 10).length ?? 0;
  const successRate = totalStudents > 0 ? ((passingStudents / totalStudents) * 100).toFixed(1) : 'N/A';

  // Mention Rate (% of students having honors/encouragement/felicitations)
  const honorsCount = bulletins?.filter(b => b.mention === 'felicitations' || b.mention === 'tableau_honneur' || b.mention === 'encouragements').length ?? 0;
  const mentionRate = totalStudents > 0 ? ((honorsCount / totalStudents) * 100).toFixed(1) : 'N/A';

  const isGenerating = generatingBulk || generatingSingle || publishing || validating;

  if (isStudentOrParent) {
    return (
      <div className="space-y-6 animate-fade-in text-neutral-900 w-full">
        {/* Header Panel */}
        <div className="flex flex-col bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900 flex items-center gap-2">
            {user?.role === 'parent' ? "Academic Reports of My Children" : "My Academic Reports"}
            <Badge className="bg-[#d0f137] text-black hover:bg-[#d0f137] text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 border-none rounded">
              Reports
            </Badge>
          </h1>
          <p className="text-[11px] font-semibold text-neutral-450 uppercase tracking-wide mt-1">
            {user?.role === 'parent'
              ? "View and download the official report cards published for your children."
              : "View your report cards and comments validated by the class council."
            }
          </p>
        </div>

        {/* Student Bulletins Grid */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="bg-neutral-50/50 border-b border-[#E5E7EB] p-4">
            <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-800">Available Bulletins</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMyBulletins ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-full bg-neutral-100" />
                <Skeleton className="h-8 w-full bg-neutral-100" />
              </div>
            ) : !myBulletins || myBulletins.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-neutral-400 mb-3" />
                <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">No report cards available</h3>
                <p className="text-xs text-neutral-450 mt-1 max-w-sm">
                  Official reports have not been published yet for this period.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50/50">
                    <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
                      {user?.role === 'parent' && (
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Student</TableHead>
                      )}
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Academic Year</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Period</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Class</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-center">General Average</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-center">Rank</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myBulletins.map((bulletin) => (
                      <TableRow key={bulletin.id} className="border-b border-neutral-50 hover:bg-neutral-50/20 transition-colors">
                        {user?.role === 'parent' && (
                          <TableCell className="font-extrabold text-neutral-800 uppercase text-xs">
                            {bulletin.eleve?.prenom} {bulletin.eleve?.nom}
                          </TableCell>
                        )}
                        <TableCell className="font-extrabold text-neutral-800 uppercase text-xs">{bulletin.annee_scolaire}</TableCell>
                        <TableCell className="font-semibold text-neutral-500 uppercase text-xs">{bulletin.periode}</TableCell>
                        <TableCell className="font-extrabold text-neutral-700 uppercase text-xs">{bulletin.classe?.nom}</TableCell>
                        <TableCell className="text-center font-black text-neutral-900 text-xs">
                          {bulletin.moyenne_generale !== null ? bulletin.moyenne_generale.toFixed(2) : '--'}
                        </TableCell>
                        <TableCell className="text-center font-black text-neutral-900 text-xs">
                          {bulletin.rang_classe !== null ? `${bulletin.rang_classe}e` : '--'}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/bulletins/${bulletin.id}`)}
                            className="h-8 text-xs font-bold uppercase tracking-wider text-neutral-550 hover:text-black cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-1 text-neutral-500" />
                            <span>View Report</span>
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
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900 flex items-center gap-2">
            Academic Report Management
            <Badge className="bg-[#d0f137] text-black hover:bg-[#d0f137] text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 border-none rounded">
              Dashboard
            </Badge>
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mt-1">
            Calculate averages, review council decisions, lock reports, and publish to parents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            onClick={() => navigate('/bulletins/settings')}
            className="border-neutral-200 text-neutral-550 hover:bg-neutral-50 hover:text-black font-extrabold text-[10px] uppercase tracking-wider h-9"
          >
            <Settings className="h-4 w-4 mr-1.5 text-neutral-450" />
            <span>Settings</span>
          </Button>

          <Button
            onClick={handleGenerateBulk}
            disabled={!selectedClassId || isGenerating}
            className="bg-black hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider h-9 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            {generatingBulk ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                <span>Generating...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-white" />
                <span>Calculate & Generate Class</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>Academic Year</span>
              </label>
              <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val || '')}>
                <SelectTrigger className="bg-white border-neutral-200 text-neutral-900 text-xs h-9">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100 text-xs text-neutral-900">
                  {years.map((year: any) => (
                    <SelectItem key={year.id} value={year.libelle} className="hover:bg-neutral-50 focus:bg-neutral-50">
                      {year.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>Period</span>
              </label>
              <Select value={selectedPeriod} onValueChange={(val) => setSelectedPeriod(val || '')}>
                <SelectTrigger className="bg-white border-neutral-200 text-neutral-900 text-xs h-9">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100 text-xs text-neutral-900">
                  <SelectItem value="Trimestre 1">Trimestre 1</SelectItem>
                  <SelectItem value="Trimestre 2">Trimestre 2</SelectItem>
                  <SelectItem value="Trimestre 3">Trimestre 3</SelectItem>
                  <SelectItem value="Semestre 1">Semestre 1</SelectItem>
                  <SelectItem value="Semestre 2">Semestre 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500 flex items-center gap-1.5 uppercase tracking-wide">
                <Users className="h-3.5 w-3.5 text-neutral-400" />
                <span>Class</span>
              </label>
              <Select value={selectedClassId} onValueChange={(val) => setSelectedClassId(val || '')}>
                <SelectTrigger className="bg-white border-neutral-200 text-neutral-900 text-xs h-9">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100 text-xs text-neutral-900">
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()} className="hover:bg-neutral-50 focus:bg-neutral-50">
                      {cls.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings & Errors */}
      {errorMsg && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-red-650" />
          <AlertTitle className="text-xs font-black uppercase tracking-wider text-red-950 font-bold">Error</AlertTitle>
          <AlertDescription className="text-xs text-red-700 mt-0.5">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Success Banner */}
      {successBanner && (
        <Alert className="border-green-200 bg-green-50 text-green-800 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-xs font-black uppercase tracking-wider text-green-900 font-bold">Success</AlertTitle>
          <AlertDescription className="text-xs text-neutral-600 mt-0.5">{successBanner}</AlertDescription>
        </Alert>
      )}

      {/* KPIs Summary Cards */}
      {bulletins && bulletins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Class Average */}
          <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm border-l-4 border-l-black">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider">Class Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-neutral-450" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-neutral-900">{classAvg} / 20</div>
              <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wide font-bold">
                Range: <span className="text-red-500">{lowestAvg}</span> (Min) /{' '}
                <span className="text-green-600">{highestAvg}</span> (Max)
              </p>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm border-l-4 border-l-[#d0f137]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-neutral-450" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-neutral-900">{successRate}%</div>
              <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wide font-bold">
                <span className="text-neutral-700">{passingStudents}</span> students scoring ≥ 10.
              </p>
            </CardContent>
          </Card>

          {/* Honors/Mentions Rate */}
          <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider">Honors Rate</CardTitle>
              <Settings className="h-4 w-4 text-neutral-450" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-neutral-900">{mentionRate}%</div>
              <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wide font-bold">
                <span className="text-neutral-700">{honorsCount}</span> students with honors.
              </p>
            </CardContent>
          </Card>

          {/* Status Counts */}
          <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm border-l-4 border-l-neutral-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider">Card Statuses</CardTitle>
              <Users className="h-4 w-4 text-neutral-450" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-neutral-900">{totalStudents} Total</div>
              <p className="text-[9px] text-neutral-400 mt-1 uppercase tracking-wider font-bold leading-tight flex flex-wrap gap-2">
                <span>{draftCount} Draft</span> • <span>{validatedCount} Locked</span> • <span>{publishedCount} Sent</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Roster DataGrid */}
      <Card className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        <CardHeader className="bg-neutral-50/50 border-b border-[#E5E7EB] flex flex-row items-center justify-between py-3">
          <CardTitle className="text-xs font-black uppercase tracking-wider text-neutral-800">Students & Academic Results</CardTitle>
          {bulletins && bulletins.some(b => b.status === 'VALIDATED') && (
            <Button
              onClick={handlePublishAll}
              disabled={isGenerating}
              size="sm"
              className="bg-black hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider h-7 px-3 flex items-center gap-1 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              <span>Publish All Locked</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingBulletins ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full bg-neutral-50" />
              <Skeleton className="h-8 w-full bg-neutral-50" />
              <Skeleton className="h-8 w-full bg-neutral-50" />
            </div>
          ) : !bulletins || bulletins.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-neutral-400 mb-3" />
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">No reports generated yet</h3>
              <p className="text-xs text-neutral-450 mt-1 max-w-sm">
                Select parameters above and calculate report cards to populate grades.
              </p>
              <Button size="sm" onClick={handleGenerateBulk} className="mt-4 bg-black hover:bg-neutral-800 text-white text-[10px] uppercase tracking-wider font-bold h-8 px-4 rounded-lg" disabled={isGenerating}>
                Generate Now
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50/50">
                  <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Student Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9">Matricule</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-center">General Avg</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-center">Rank</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-center">Mention Honor</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-center w-[160px]">Council Decision</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-center">Status</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 h-9 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulletins.map((bulletin) => {
                    const mentionLabels: Record<string, { label: string; className: string }> = {
                      felicitations: { label: '🏆 Félicitations', className: 'bg-[#d0f137] text-black border-none font-extrabold' },
                      tableau_honneur: { label: '🥈 Honneur', className: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
                      encouragements: { label: '🥉 Encouragements', className: 'bg-orange-50 text-orange-700 border-orange-200' },
                      avertissement_travail: { label: '⚠️ Warning Work', className: 'bg-red-50 text-red-700 border-red-200' },
                      avertissement_conduite: { label: '⚠️ Warning Conduct', className: 'bg-red-50 text-red-700 border-red-200' },
                      blame: { label: '🛑 Blâme', className: 'bg-red-50 text-red-750 border-red-250 font-black' },
                    };
                    const mentionInfo = bulletin.mention ? mentionLabels[bulletin.mention] : null;

                    return (
                      <TableRow key={bulletin.id} className="border-b border-neutral-50 hover:bg-neutral-50/20 transition-colors">
                        {/* Student Name */}
                        <TableCell className="font-extrabold text-neutral-850 uppercase text-xs">
                          {bulletin.eleve?.prenom} {bulletin.eleve?.nom}
                        </TableCell>
                        
                        {/* Matricule */}
                        <TableCell className="font-bold text-neutral-450 text-xs uppercase">{bulletin.eleve?.matricule}</TableCell>
                        
                        {/* Avg */}
                        <TableCell className="text-center font-black text-neutral-900 text-xs">
                          {bulletin.moyenne_generale !== null ? bulletin.moyenne_generale.toFixed(2) : '--'}
                        </TableCell>
                        
                        {/* Rank */}
                        <TableCell className="text-center font-extrabold text-neutral-800 text-xs">
                          {bulletin.rang_classe !== null ? `${bulletin.rang_classe}e` : '--'}
                        </TableCell>

                        {/* Mentions */}
                        <TableCell className="text-center">
                          {mentionInfo ? (
                            <Badge className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${mentionInfo.className} shadow-none`}>
                              {mentionInfo.label}
                            </Badge>
                          ) : (
                            <span className="text-neutral-400 text-xs">--</span>
                          )}
                        </TableCell>

                        {/* Council Decision Select */}
                        <TableCell className="p-1 text-center">
                          <Select
                            value={bulletin.decision_conseil || ''}
                            disabled={bulletin.status === 'PUBLISHED'}
                            onValueChange={(val) => handleDecisionChange(bulletin.id, val)}
                          >
                            <SelectTrigger className="h-8 bg-white border-neutral-200 text-xs text-neutral-900">
                              <SelectValue placeholder="No decision" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-neutral-100 text-xs text-neutral-900">
                              <SelectItem value="admis">Admitted</SelectItem>
                              <SelectItem value="admis_conditionnel">Conditional</SelectItem>
                              <SelectItem value="redoublement">Repeat</SelectItem>
                              <SelectItem value="exclusion">Excluded</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        
                        {/* Status Badge */}
                        <TableCell className="text-center">
                          <Badge
                            className={`font-black rounded-full px-2 py-0.5 text-[9px] border-none uppercase ${
                              bulletin.status === 'PUBLISHED'
                                ? 'bg-green-50 text-green-700'
                                : bulletin.status === 'VALIDATED'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {bulletin.status}
                          </Badge>
                        </TableCell>
                        
                        {/* Action buttons */}
                        <TableCell className="text-right space-x-1 pr-6">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/bulletins/${bulletin.id}`)}
                            className="h-7 w-7 p-0 rounded-md hover:bg-neutral-50 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-neutral-450 hover:text-black" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/bulletins/${bulletin.id}/appreciations`)}
                            className="h-7 w-7 p-0 rounded-md hover:bg-neutral-50 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-neutral-450 hover:text-black" />
                          </Button>
                          
                          {bulletin.status === 'DRAFT' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleGenerateSingle(bulletin.eleve_id)}
                                disabled={isGenerating}
                                className="h-7 px-2 rounded-md hover:bg-neutral-50 cursor-pointer text-[10px] font-bold text-neutral-450 hover:text-black uppercase"
                              >
                                <span>Recalculate</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleValidate(bulletin.id)}
                                disabled={isGenerating}
                                className="bg-[#d0f137] hover:bg-[#b8d630] border-none text-black font-black text-[10px] uppercase h-7 px-2.5 rounded-md cursor-pointer"
                              >
                                <Lock className="h-3 w-3 mr-1 text-black shrink-0" />
                                <span>Lock</span>
                              </Button>
                            </>
                          )}

                          {bulletin.status === 'VALIDATED' && (
                            <Button
                              size="sm"
                              onClick={() => handlePublish(bulletin.id)}
                              disabled={isGenerating}
                              className="bg-black hover:bg-neutral-800 text-white font-bold text-[10px] uppercase h-7 px-3 rounded-md cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              <span>Publish</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
