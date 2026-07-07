import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useBulletin from '@/application/useCases/useBulletin';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, ArrowLeft, School, Mail, MapPin, Award, CheckSquare, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const BulletinPrintView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useGetBulletin, useGetSettings } = useBulletin();

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const { data: bulletin, isLoading: loadingBulletin } = useGetBulletin(id ?? '');
  const { data: settings, isLoading: loadingSettings } = useGetSettings();

  const handlePrint = () => {
    window.print();
  };

  const isLoading = loadingBulletin || loadingSettings;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/3 bg-zinc-800" />
        <Skeleton className="h-[600px] w-full bg-zinc-800" />
      </div>
    );
  }

  if (!bulletin) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center space-y-4 font-sans">
        <h2 className="text-xl font-bold text-zinc-200">Report Card Not Found</h2>
        <Button onClick={() => navigate(-1)} className="bg-teal-600 text-zinc-950 font-bold hover:bg-teal-700">Back</Button>
      </div>
    );
  }

  // Configuration settings fallbacks
  const showMinMax = settings?.show_min_max ?? true;
  const showRangMatiere = settings?.show_rang_matiere ?? true;
  const showDetailNotes = settings?.show_detail_notes ?? false;
  const showSousTotalGroupe = settings?.show_sous_total_groupe ?? true;

  // Calculate total coefficients
  const totalCoef = bulletin.details?.reduce((acc, detail) => acc + Number(detail.coefficient), 0) ?? 0;

  // Group details by subject category/group name
  const groupedDetails: Record<string, { group: { nom: string; ordre: number }; details: typeof bulletin.details }> = {};

  bulletin.details?.forEach(detail => {
    const groupName = detail.matiere?.groupe_matiere?.nom || 'Other Subjects';
    const groupOrdre = detail.matiere?.groupe_matiere?.ordre ?? 999;

    if (!groupedDetails[groupName]) {
      groupedDetails[groupName] = {
        group: { nom: groupName, ordre: groupOrdre },
        details: []
      };
    }
    groupedDetails[groupName].details.push(detail);
  });

  const sortedGroups = Object.values(groupedDetails).sort((a, b) => a.group.ordre - b.group.ordre);

  const getGroupStats = (details: typeof bulletin.details) => {
    let totalPoints = 0;
    let totalCoef = 0;
    let classMatierePoints = 0;

    details?.forEach(d => {
      if (d.moyenne_eleve !== null) {
        totalPoints += d.moyenne_eleve * d.coefficient;
        totalCoef += d.coefficient;
      }
      if (d.moyenne_classe_matiere !== null) {
        classMatierePoints += d.moyenne_classe_matiere * d.coefficient;
      }
    });

    return {
      groupAverage: totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : 'N/A',
      groupClassAverage: totalCoef > 0 ? (classMatierePoints / totalCoef).toFixed(2) : 'N/A',
      totalCoef
    };
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto font-sans text-zinc-800">
      {/* CSS print overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          @page {
            size: A4;
            margin: 15mm 10mm 15mm 10mm;
          }
        }
      `}</style>

      {/* Action Header Bar */}
      <div className="flex items-center justify-between no-print bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-md text-zinc-200">
        <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-zinc-800 text-zinc-300 flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="flex space-x-3">
          <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700 text-zinc-950 font-bold flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Print Document A4 Container */}
      <div
        id="print-area"
        ref={printAreaRef}
        className="bg-white border border-gray-200 p-8 shadow-lg rounded-2xl print:border-none print:shadow-none print:p-0 space-y-8 font-serif"
      >
        {/* White-labeled Institution Header */}
        <div className="grid grid-cols-3 border-b-2 border-gray-800 pb-6 items-center">
          {/* Logo on Left */}
          <div className="col-span-1 flex justify-start">
            {bulletin.etablissement?.logo ? (
              <img
                src={bulletin.etablissement.logo}
                alt={bulletin.etablissement.nom}
                className="max-h-20 max-w-full object-contain"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                <School className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Title in Center */}
          <div className="col-span-1 text-center font-sans">
            <h2 className="text-2xl font-black tracking-wider text-gray-900 leading-none">
              REPORT CARD
            </h2>
            <p className="text-sm font-bold text-gray-600 uppercase mt-1 tracking-widest">
              {bulletin.periode}
            </p>
          </div>

          {/* School Details on Right */}
          <div className="col-span-1 text-right text-xs space-y-1 font-sans text-gray-600">
            <div className="font-bold text-sm text-gray-900 uppercase">
              {bulletin.etablissement?.nom || 'Educational Institution'}
            </div>
            {bulletin.etablissement?.adresse && (
              <div className="flex items-center justify-end space-x-1">
                <span>{bulletin.etablissement.adresse}</span>
                <MapPin className="h-3 w-3 text-gray-400" />
              </div>
            )}
            <div className="flex items-center justify-end space-x-1">
              <span>support@neocampus.com</span>
              <Mail className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Student & Class Information Grid */}
        <div className="grid grid-cols-2 gap-8 bg-gray-50/50 border border-gray-200 rounded-xl p-6 font-sans text-sm text-gray-800">
          {/* Student details */}
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Student:</span>
              <div className="font-bold text-base text-gray-900 mt-0.5">
                {bulletin.eleve?.prenom} {bulletin.eleve?.nom}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">
                  Matricule:
                </span>
                <div className="font-bold text-gray-800">{bulletin.eleve?.matricule}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">
                  Date of Birth:
                </span>
                <div className="font-bold text-gray-800">
                  {bulletin.eleve?.date_naissance
                    ? new Date(bulletin.eleve.date_naissance).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Year details */}
          <div className="space-y-2 border-l border-gray-200 pl-8">
            <div>
              <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">
                Class:
              </span>
              <div className="font-bold text-base text-gray-900 mt-0.5">{bulletin.classe?.nom}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Academic Year:</span>
                <div className="font-bold text-gray-800">{bulletin.annee_scolaire}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Period:</span>
                <div className="font-bold text-gray-800">{bulletin.periode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulletins details table (Grades) */}
        <div className="border border-gray-200 rounded-xl overflow-hidden font-sans">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow className="border-b border-gray-200">
                <TableHead className="font-bold text-gray-800 w-1/4 py-3 pl-6">Subject & Teacher</TableHead>
                <TableHead className="font-bold text-gray-800 text-center w-[80px]">Coef</TableHead>
                <TableHead className="font-bold text-gray-800 text-center w-[100px]">Average</TableHead>
                <TableHead className="font-bold text-gray-800 text-center w-[100px]">Class Avg</TableHead>
                {showMinMax && (
                  <TableHead className="font-bold text-gray-800 text-center w-[120px]">Min / Max</TableHead>
                )}
                {showRangMatiere && (
                  <TableHead className="font-bold text-gray-800 text-center w-[80px]">Rank</TableHead>
                )}
                <TableHead className="font-bold text-gray-800 w-1/3">Appreciations & Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGroups.length > 0 ? (
                sortedGroups.map(({ group, details }) => {
                  const stats = getGroupStats(details);

                  return (
                    <React.Fragment key={group.nom}>
                      {/* Group Header Row */}
                      <TableRow className="bg-gray-50 font-bold border-b border-gray-200">
                        <TableCell colSpan={showMinMax && showRangMatiere ? 7 : showMinMax || showRangMatiere ? 6 : 5} className="py-2.5 pl-6 text-xs text-gray-900 uppercase tracking-widest font-black">
                          {group.nom}
                        </TableCell>
                      </TableRow>

                      {/* Subject Rows */}
                      {details?.map((detail) => (
                        <TableRow key={detail.id} className="border-b border-gray-200 hover:bg-transparent">
                          {/* Subject Name */}
                          <TableCell className="py-3 font-semibold text-gray-900 pl-6">
                            <div>{detail.matiere?.nom}</div>
                            <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                              Prof. {detail.prof?.prenom} {detail.prof?.nom}
                            </div>
                            
                            {/* Detailed Exam Grades List */}
                            {showDetailNotes && detail.notes_detail && detail.notes_detail.length > 0 && (
                              <div className="text-[10px] text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded border border-gray-200 flex flex-wrap gap-2.5">
                                {detail.notes_detail.map((n, idx) => (
                                  <span key={idx} className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">
                                    <span className="font-bold text-gray-700">{n.type}:</span>{' '}
                                    <span className="text-gray-950 font-black">{n.valeur !== null ? n.valeur.toFixed(1) : (n.absent ? 'Abs' : '--')}</span>{' '}
                                    <span className="text-gray-400 text-[8px]">(x{n.poids})</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </TableCell>

                          {/* Coef */}
                          <TableCell className="text-center font-bold text-gray-700">{detail.coefficient}</TableCell>

                          {/* Student Average */}
                          <TableCell className="text-center font-extrabold text-teal-700">
                            {detail.moyenne_eleve !== null ? (
                              detail.moyenne_eleve.toFixed(2)
                            ) : (
                              <span className="text-red-500 font-bold uppercase text-[9px] tracking-wider">
                                Absent
                              </span>
                            )}
                          </TableCell>

                          {/* Class Subject Average */}
                          <TableCell className="text-center font-medium text-gray-600">
                            {detail.moyenne_classe_matiere !== null ? detail.moyenne_classe_matiere.toFixed(2) : '--'}
                          </TableCell>

                          {/* Extremes (Min / Max) */}
                          {showMinMax && (
                            <TableCell className="text-center text-xs text-gray-500 font-medium">
                              {detail.moyenne_min !== null && detail.moyenne_max !== null ? (
                                <span>{detail.moyenne_min.toFixed(2)} / {detail.moyenne_max.toFixed(2)}</span>
                              ) : (
                                '--'
                              )}
                            </TableCell>
                          )}

                          {/* Rank */}
                          {showRangMatiere && (
                            <TableCell className="text-center font-bold text-gray-800">
                              {detail.rang_matiere !== null ? `${detail.rang_matiere}e` : '--'}
                            </TableCell>
                          )}

                          {/* Comments */}
                          <TableCell className="text-xs text-gray-600 italic">
                            {detail.appreciation_prof || "No feedback recorded yet."}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Group Sub-Total Row */}
                      {showSousTotalGroupe && (
                        <TableRow className="bg-gray-50/50 font-bold border-b border-gray-200">
                          <TableCell className="py-2 pl-6 text-xs text-gray-800 uppercase tracking-wider">
                            Subtotal: {group.nom}
                          </TableCell>
                          <TableCell className="text-center py-2 text-gray-800">{stats.totalCoef}</TableCell>
                          <TableCell className="text-center py-2 text-teal-700 font-extrabold">{stats.groupAverage}</TableCell>
                          <TableCell className="text-center py-2 text-gray-600">{stats.groupClassAverage}</TableCell>
                          {showMinMax && <TableCell className="py-2" />}
                          {showRangMatiere && <TableCell className="py-2" />}
                          <TableCell className="py-2" />
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={showMinMax && showRangMatiere ? 7 : showMinMax || showRangMatiere ? 6 : 5} className="text-center py-6 text-gray-500 italic">
                    No subject records assigned.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-2 gap-8 font-sans text-gray-850">
          {/* Averages and Ranks */}
          <div className="border border-gray-200 rounded-xl p-5 space-y-3 bg-gray-50/30 text-sm">
            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 uppercase text-xs tracking-wider">
              Academic Summary
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total Coefficients:</span>
              <span className="font-bold text-gray-800">{totalCoef}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="text-gray-850 font-bold">General Average:</span>
              <span className="font-extrabold text-teal-700 text-lg">
                {bulletin.moyenne_generale !== null ? bulletin.moyenne_generale.toFixed(2) : '--'} / 20
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="text-gray-500 font-medium">Class Average:</span>
              <span className="font-bold text-gray-800">
                {bulletin.moyenne_classe !== null ? bulletin.moyenne_classe.toFixed(2) : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="text-gray-850 font-bold">Class Rank:</span>
              <span className="font-extrabold text-gray-800 text-base">
                {bulletin.rang_classe !== null ? `${bulletin.rang_classe}e` : '--'} / {bulletin.classe?.niveau || '--'}
              </span>
            </div>
          </div>

          {/* Attendance and discipline */}
          <div className="border border-gray-200 rounded-xl p-5 space-y-3 bg-gray-50/30 text-sm">
            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 uppercase text-xs tracking-wider">
              Attendance & Discipline
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Justified Absences:</span>
              <span className="font-bold text-gray-800">
                {bulletin.absences_justifiees ?? 0} Hours
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="text-gray-500 font-medium">Unjustified Absences:</span>
              <span className={`font-bold ${bulletin.absences_injustifiees > 5 ? 'text-red-650' : 'text-gray-800'}`}>
                {bulletin.absences_injustifiees ?? 0} Hours
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="text-gray-500 font-medium">Total Absences:</span>
              <span className="font-bold text-gray-800">
                {bulletin.total_absences ?? 0} Hours
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="text-gray-550 font-bold">Lateness / Tardies:</span>
              <span className="font-bold text-gray-800">
                {bulletin.retards ?? 0} Times
              </span>
            </div>
          </div>
        </div>

        {/* Council Decision & Mention Panel */}
        {(bulletin.decision_conseil || bulletin.mention) && (
          <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-6 font-sans grid grid-cols-2 gap-8 text-sm">
            <div>
              <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider flex items-center space-x-1.5">
                <CheckSquare className="h-4 w-4 text-teal-600" />
                <span>Class Council Decision</span>
              </span>
              <div className="text-base font-extrabold text-gray-900 uppercase mt-2">
                {bulletin.decision_conseil?.replace('_', ' ') || 'Pending'}
              </div>
            </div>
            <div className="border-l border-gray-200 pl-8">
              <span className="font-semibold text-gray-500 uppercase text-xs tracking-wider flex items-center space-x-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Performance Mention</span>
              </span>
              <div className="text-base font-extrabold text-amber-600 uppercase mt-2">
                {bulletin.mention?.replace('_', ' ') || 'None'}
              </div>
            </div>
          </div>
        )}

        {/* Principal/Teacher council appraisal section */}
        <div className="border-2 border-gray-800 rounded-xl p-6 font-sans space-y-2">
          <h3 className="font-extrabold text-gray-900 uppercase text-xs tracking-wider">
            General Council Appreciation & Remarks
          </h3>
          <p className="text-gray-700 italic min-h-[50px] text-sm leading-relaxed">
            {bulletin.appreciation_generale ||
              "Student performs well. Continued focus is advised for next semester to solidify learning outcomes."}
          </p>
        </div>

        {/* Validation watermark / signoff */}
        {bulletin.validated_at && (
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-sans border-t border-gray-100 pt-4">
            <ShieldCheck className="h-4 w-4 text-teal-500" />
            <span>Officially locked and validated on {new Date(bulletin.validated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        {/* Signatures section */}
        <div className="grid grid-cols-2 pt-8 text-center text-sm font-sans text-gray-600">
          {/* Left signature */}
          <div className="space-y-16">
            <span className="font-bold uppercase tracking-widest text-xs">
              Parent Signature
            </span>
            <div className="border-b border-gray-300 w-2/3 mx-auto"></div>
          </div>

          {/* Right signature */}
          <div className="space-y-16">
            <span className="font-bold uppercase tracking-widest text-xs">
              Director Signature
            </span>
            <div className="border-b border-gray-300 w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulletinPrintView;
