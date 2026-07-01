import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStudent } from '@/application/useCases/useStudent'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Loader2,
  Trash2
} from 'lucide-react'

interface ParsedStudent {
  id: number;
  prenom: string;
  nom: string;
  sexe: 'Male' | 'Female' | 'Other';
  date_naissance: string;
  classe_nom: string;
  parent_nom: string;
  parent_phone: string;
  parent_email: string;
}

const normalizeDate = (rawDate: string): string => {
  if (!rawDate) return '2015-01-01'
  
  // Replace slashes with dashes
  let cleaned = rawDate.replace(/\//g, '-').trim()
  
  // 1. Matches YYYY-MM-DD, YYYY-M-D, etc.
  const isoRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  const matchIso = cleaned.match(isoRegex)
  if (matchIso) {
    const year = matchIso[1]
    const month = matchIso[2].padStart(2, '0')
    const day = matchIso[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 2. Matches DD-MM-YYYY or D-M-YYYY
  const ddMmYyyyRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  const matchDdMm = cleaned.match(ddMmYyyyRegex)
  if (matchDdMm) {
    const day = matchDdMm[1].padStart(2, '0')
    const month = matchDdMm[2].padStart(2, '0')
    const year = matchDdMm[3]
    return `${year}-${month}-${day}`
  }

  return '2015-01-01'
}

export const StudentImportPage: React.FC = () => {
  const navigate = useNavigate()
  const { createStudent } = useStudent()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([])

  // Existing classes to check if new ones will be created
  const existingClasses = ['Grade 6-A', 'Grade 5-B', 'Grade 3-A', 'Grade 6-C', 'Grade 5-A']

  // CSV Template Column Sample
  const templateHeaders = [
    'First Name',
    'Last Name',
    'Gender',
    'Birth Date (YYYY-MM-DD)',
    'Class Name',
    'Parent Name',
    'Parent Phone',
    'Parent Email'
  ]

  const templateRows = [
    ['Lucas', 'Smith', 'Male', '2014-06-15', 'Grade 6-A', 'William Smith', '+212 611 112 233', 'william@example.com'],
    ['Emma', 'Johnson', 'Female', '2015-09-20', 'Grade 7-B', 'Sarah Johnson', '+212 655 443 322', 'sarah@example.com']
  ]

  // File Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Invalid file format. Please drop a valid CSV (.csv) file.')
      return
    }
    setErrorMsg('')
    setParsing(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      try {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
        if (lines.length <= 1) {
          setErrorMsg('The CSV file appears to be empty or missing data rows.')
          setParsing(false)
          return
        }

        const parsed: ParsedStudent[] = lines.slice(1).map((line, index) => {
          // Handle comma/semicolon/tab delimiter
          const cols = line.split(/[;,]/).map(c => c.trim().replace(/^["']|["']$/g, ''))
          
          let genderVal: 'Male' | 'Female' | 'Other' = 'Male'
          const genderLower = (cols[2] || '').toLowerCase()
          if (genderLower.startsWith('f')) genderVal = 'Female'
          else if (genderLower.startsWith('o')) genderVal = 'Other'

          return {
            id: index + 1,
            prenom: cols[0] || 'Unknown',
            nom: cols[1] || 'Student',
            sexe: genderVal,
            date_naissance: normalizeDate(cols[3]),
            classe_nom: cols[4] || 'Grade 6-A',
            parent_nom: cols[5] || '',
            parent_phone: cols[6] || '',
            parent_email: cols[7] || '',
          }
        })

        setParsedData(parsed)
        setTimeout(() => {
          setParsing(false)
          setStep(2)
        }, 800) // Small simulation buffer
      } catch (err) {
        setErrorMsg('Error reading or parsing the CSV. Check line structures.')
        setParsing(false)
      }
    }
    reader.readAsText(file)
  }

  // Handle inline cell changes
  const handleCellChange = (id: number, field: keyof ParsedStudent, value: string) => {
    setParsedData(prev => 
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    )
  }

  // Remove row from import list
  const removeRow = (id: number) => {
    setParsedData(prev => prev.filter(item => item.id !== id))
  }

  // Submit and save processed records concurrently using Promise.all
  const handleSaveAll = async () => {
    if (parsedData.length === 0) return
    setSaving(true)
    setErrorMsg('')

    try {
      const promises = parsedData.map(item => {
        const classIdx = existingClasses.findIndex(c => c.toLowerCase() === item.classe_nom.toLowerCase())
        const classe_id = classIdx !== -1 ? (classIdx + 1) : null

        const formattedData = {
          nom: item.nom,
          prenom: item.prenom,
          email: `${item.prenom.toLowerCase()}.${item.nom.toLowerCase()}.${Math.floor(100 + Math.random() * 900)}@neocampus.com`,
          sexe: item.sexe,
          date_naissance: item.date_naissance,
          classe_id: classe_id,
          classe_nom: item.classe_nom,
          status: 'Active' as const,
          scolarite_anterieure: 'CSV Bulk Enrollment',
          parent_contact: {
            nom: item.parent_nom || 'N/A',
            relation: 'Father',
            telephone: item.parent_phone || 'N/A',
            email: item.parent_email || 'parent@neocampus.com',
          },
          documents: {
            birth_certificate: true,
            previous_transcript: true,
            photos: true,
          },
          matricule: '', // Auto-generated
        }
        return createStudent(formattedData)
      })

      await Promise.all(promises)
      setSaving(false)
      navigate('/admin/students')
    } catch (err: any) {
      console.error('Failed bulk student imports:', err)
      setSaving(false)
      const details = err.response?.data?.message || err.message || ''
      const validationDetails = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : ''
      setErrorMsg(`Failed saving students: ${details}${validationDetails ? ' (' + validationDetails + ')' : ''}`)
    }
  }

  // Compute stats for preview screen
  const classesIdentified = Array.from(new Set(parsedData.map(d => d.classe_nom)))
  const newClassesToCreate = classesIdentified.filter(c => !existingClasses.includes(c))
  const parentsCount = Array.from(new Set(parsedData.map(d => d.parent_nom).filter(Boolean))).length

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 pb-12">
      
      {/* Breadcrumbs */}
      <div className="flex gap-2 items-center text-xs text-neutral-400 font-semibold uppercase tracking-wider">
        <Link to="/admin/students" className="hover:text-black transition-colors">
          Students
        </Link>
        <span>/</span>
        <span className="text-black">Bulk Import Wizard</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
            Bulk Student Import
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Import student profiles and assign parental folders via CSV files
          </p>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Instructions Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2 text-neutral-900">
                  <Info className="h-5 w-5 text-neutral-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">CSV Structure Format</h3>
                </div>

                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Your CSV file must include a header row. Ensure columns are ordered correctly as shown in the layout table below. Missing fields will receive fallback defaults.
                </p>

                {/* Format Table */}
                <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#f9f9f9] border-b border-[#e5e7eb]">
                      <TableRow className="border-b border-[#e5e7eb] hover:bg-transparent">
                        {templateHeaders.map((header, idx) => (
                          <TableHead key={idx} className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3 px-3">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templateRows.map((row, idx) => (
                        <TableRow key={idx} className="border-b border-[#e5e7eb] hover:bg-transparent">
                          {row.map((val, cellIdx) => (
                            <TableCell key={cellIdx} className="text-[10px] font-medium text-neutral-600 px-3 py-2.5">
                              {val}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Quick Info Alerts */}
                <div className="p-4 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb] space-y-2">
                  <h4 className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider">Requirements:</h4>
                  <ul className="list-disc pl-4 text-[10px] font-semibold text-neutral-500 space-y-1">
                    <li><span className="text-black font-bold">Gender:</span> Use 'Male', 'Female', or 'Other' (or abbreviation starting with M/F).</li>
                    <li><span className="text-black font-bold">Birth Date:</span> Format must be ISO Standard `YYYY-MM-DD`.</li>
                    <li><span className="text-black font-bold">Class Name:</span> Classes matching existing ones will auto-link. New class names will be automatically initialized inside your etablissement.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drag & Drop Column */}
          <div className="space-y-6">
            <Card 
              className={`bg-white border-2 border-dashed rounded-xl shadow-sm transition-all duration-200 h-full min-h-[340px] flex flex-col justify-center items-center p-6 text-center select-none ${
                dragActive ? 'border-black bg-neutral-50/50' : 'border-[#e5e7eb] hover:border-black'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="space-y-5 p-0 flex flex-col items-center justify-center">
                {parsing ? (
                  <div className="space-y-3">
                    <Loader2 className="h-10 w-10 text-black animate-spin mx-auto" />
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Parsing CSV Data...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-[#f9f9f9] border border-[#e5e7eb] rounded-full">
                      <UploadCloud className="h-8 w-8 text-neutral-400" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Drag and Drop CSV File</h4>
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase">Or browse from folder</p>
                    </div>

                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".csv"
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-5 border-none cursor-pointer"
                    >
                      Browse CSV
                    </Button>

                    {errorMsg && (
                      <div className="flex items-center gap-1.5 text-red-500 justify-center text-[10px] font-bold mt-2">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* STEP 2: VERIFICATION & EDITING TABLE */}
      {step === 2 && (
        <div className="space-y-6">
          
          {/* Metadata Statistics Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Total students parsed */}
            <Card className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
              <span className="text-[9px] font-bold text-neutral-400 uppercase block tracking-wider">Students Parsed</span>
              <span className="text-2xl font-black text-neutral-900 tracking-tight block mt-1">{parsedData.length}</span>
            </Card>

            {/* Total parents identified */}
            <Card className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
              <span className="text-[9px] font-bold text-neutral-400 uppercase block tracking-wider">Parents Count</span>
              <span className="text-2xl font-black text-neutral-900 tracking-tight block mt-1">{parentsCount}</span>
            </Card>

            {/* Total Classes identified */}
            <Card className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
              <span className="text-[9px] font-bold text-neutral-400 uppercase block tracking-wider">Classes Identified</span>
              <span className="text-2xl font-black text-neutral-900 tracking-tight block mt-1">{classesIdentified.length}</span>
            </Card>

            {/* New classes to initialize */}
            <Card className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
              <span className="text-[9px] font-bold text-neutral-400 uppercase block tracking-wider">New Classes to Create</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-neutral-900 tracking-tight">
                  {newClassesToCreate.length}
                </span>
                {newClassesToCreate.length > 0 && (
                  <Badge className="bg-amber-50 text-amber-600 border border-amber-200 text-[8px] font-bold uppercase rounded-full">
                    Auto-Init
                  </Badge>
                )}
              </div>
            </Card>

          </div>

          {/* New classes alert list */}
          {newClassesToCreate.length > 0 && (
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800 font-semibold leading-relaxed">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                The following identified classes will be auto-initialized inside the etablissement: <span className="font-bold text-black">{newClassesToCreate.join(', ')}</span>.
              </div>
            </div>
          )}

          {/* Verification Table */}
          <Card className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e5e7eb] bg-[#f9f9f9] flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Verification Grid</h3>
                <p className="text-[10px] text-neutral-400 font-semibold uppercase">Double click cells to fix typos directly before saving</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="bg-white text-neutral-500 border border-[#e5e7eb] rounded-lg text-xs font-bold h-8 cursor-pointer"
              >
                Upload Different File
              </Button>
            </div>

            <div className="overflow-x-auto max-h-[450px]">
              <Table>
                <TableHeader className="bg-[#f9f9f9] sticky top-0 border-b border-[#e5e7eb] z-10">
                  <TableRow className="border-b border-[#e5e7eb] hover:bg-transparent">
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5 pl-6">
                      First Name
                    </TableHead>
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                      Last Name
                    </TableHead>
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                      Gender
                    </TableHead>
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                      Birth Date
                    </TableHead>
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                      Class
                    </TableHead>
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                      Parent Name
                    </TableHead>
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                      Parent Phone
                    </TableHead>
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5">
                      Parent Email
                    </TableHead>
                    <TableHead className="text-[8px] font-bold text-neutral-400 tracking-wider uppercase py-3.5 pr-6 text-right">
                      Delete
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((item) => (
                    <TableRow key={item.id} className="border-b border-[#e5e7eb]/80 hover:bg-neutral-50/50">
                      
                      {/* First Name */}
                      <TableCell className="pl-6 py-2">
                        <input 
                          type="text" 
                          value={item.prenom} 
                          onChange={(e) => handleCellChange(item.id, 'prenom', e.target.value)}
                          className="bg-transparent border-none text-xs font-bold text-neutral-900 outline-none w-24 focus:bg-white focus:ring-1 focus:ring-black rounded px-1.5 py-0.5"
                        />
                      </TableCell>

                      {/* Last Name */}
                      <TableCell className="py-2">
                        <input 
                          type="text" 
                          value={item.nom} 
                          onChange={(e) => handleCellChange(item.id, 'nom', e.target.value)}
                          className="bg-transparent border-none text-xs font-bold text-neutral-900 outline-none w-24 focus:bg-white focus:ring-1 focus:ring-black rounded px-1.5 py-0.5"
                        />
                      </TableCell>

                      {/* Gender */}
                      <TableCell className="py-2">
                        <select
                          value={item.sexe}
                          onChange={(e) => handleCellChange(item.id, 'sexe', e.target.value as any)}
                          className="bg-transparent border-none text-xs font-semibold text-neutral-700 outline-none cursor-pointer focus:bg-white focus:ring-1 focus:ring-black rounded"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </TableCell>

                      {/* Birth Date */}
                      <TableCell className="py-2">
                        <input 
                          type="date" 
                          value={item.date_naissance} 
                          onChange={(e) => handleCellChange(item.id, 'date_naissance', e.target.value)}
                          className="bg-transparent border-none text-xs text-neutral-700 outline-none focus:bg-white focus:ring-1 focus:ring-black rounded px-1.5 py-0.5"
                        />
                      </TableCell>

                      {/* Class Name */}
                      <TableCell className="py-2">
                        <input 
                          type="text" 
                          value={item.classe_nom} 
                          onChange={(e) => handleCellChange(item.id, 'classe_nom', e.target.value)}
                          className="bg-transparent border-none text-xs text-neutral-700 outline-none w-28 focus:bg-white focus:ring-1 focus:ring-black rounded px-1.5 py-0.5"
                        />
                      </TableCell>

                      {/* Parent Name */}
                      <TableCell className="py-2">
                        <input 
                          type="text" 
                          value={item.parent_nom} 
                          onChange={(e) => handleCellChange(item.id, 'parent_nom', e.target.value)}
                          className="bg-transparent border-none text-xs text-neutral-700 outline-none w-32 focus:bg-white focus:ring-1 focus:ring-black rounded px-1.5 py-0.5"
                        />
                      </TableCell>

                      {/* Parent Phone */}
                      <TableCell className="py-2">
                        <input 
                          type="text" 
                          value={item.parent_phone} 
                          onChange={(e) => handleCellChange(item.id, 'parent_phone', e.target.value)}
                          className="bg-transparent border-none text-xs text-neutral-700 outline-none w-32 focus:bg-white focus:ring-1 focus:ring-black rounded px-1.5 py-0.5"
                        />
                      </TableCell>

                      {/* Parent Email */}
                      <TableCell className="py-2">
                        <input 
                          type="text" 
                          value={item.parent_email} 
                          onChange={(e) => handleCellChange(item.id, 'parent_email', e.target.value)}
                          className="bg-transparent border-none text-xs text-neutral-700 outline-none w-44 focus:bg-white focus:ring-1 focus:ring-black rounded px-1.5 py-0.5"
                        />
                      </TableCell>

                      {/* Delete Action */}
                      <TableCell className="pr-6 text-right py-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeRow(item.id)}
                          className="h-7 w-7 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer border-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-xs font-semibold leading-relaxed">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between bg-[#f9f9f9] border border-[#e5e7eb] rounded-xl px-6 py-4">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Verification required — Please ensure details are correct before saving
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="bg-white border border-[#e5e7eb] text-black hover:bg-neutral-50 rounded-lg h-9 px-4 font-bold text-xs cursor-pointer"
              >
                Back
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={saving || parsedData.length === 0}
                className="bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg h-9 px-6 flex items-center cursor-pointer disabled:opacity-50 border-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save & Process {parsedData.length} Students
                  </>
                )}
              </Button>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}

export default StudentImportPage
