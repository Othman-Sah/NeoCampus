import React, { useState } from 'react'
import { useSalary } from '@/application/useCases/useSalary'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Printer, 
  Wallet, 
  Sparkles, 
  Award
} from 'lucide-react'

export const TeacherSalaryPage: React.FC = () => {
  const { mySalaries, loadingMySalaries } = useSalary()
  const [selectedSlipId, setSelectedSlipId] = useState<number | null>(null)
  const [slipModalOpen, setSlipModalOpen] = useState(false)

  const selectedSlip = mySalaries.find(s => s.id === selectedSlipId)

  const paidSlips = mySalaries.filter(s => s.statut === 'Paid')
  const cumulativeEarnings = paidSlips.reduce((sum, s) => sum + s.salaire_net, 0)
  const cumulativePrimes = paidSlips.reduce((sum, s) => sum + s.primes, 0)
  const averageNet = paidSlips.length > 0 ? Math.round(cumulativeEarnings / paidSlips.length) : 0

  const handleViewSlip = (id: number) => {
    setSelectedSlipId(id)
    setSlipModalOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
            My Payslips
          </h1>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            Track your payment history, cumulative earnings, and download official monthly statements
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cumulative Earnings */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Cumulative Earnings (Annual)
              </p>
              <p className="text-xl font-black text-neutral-900 leading-tight">
                {cumulativeEarnings.toLocaleString('en-US')} DH
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Primes Received */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#d0f137]/10 border border-[#d0f137]/20 flex items-center justify-center text-black">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Cumulative Bonuses
              </p>
              <p className="text-xl font-black text-neutral-900 leading-tight flex items-center gap-2">
                {cumulativePrimes.toLocaleString('en-US')} DH
                {cumulativePrimes > 0 && (
                  <Badge className="bg-[#d0f137] hover:bg-[#d0f137] text-black border-none text-[8px] font-extrabold uppercase px-1 py-0.5 rounded">
                    Good Job
                  </Badge>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average net */}
        <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-neutral-450 uppercase tracking-wider leading-none mb-1">
                Average Net Monthly
              </p>
              <p className="text-xl font-black text-neutral-900 leading-tight">
                {averageNet.toLocaleString('en-US')} DH
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary history table */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e5e7eb] bg-[#f9f9f9]/50">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            Payout History
          </h3>
        </div>

        <Table>
          <TableHeader className="bg-[#f9f9f9]">
            <TableRow className="border-b border-[#e5e7eb] hover:bg-transparent">
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10 pl-4">Period / Month</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Base Salary</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Bonuses</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Deductions</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Net Salary</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10">Status</TableHead>
              <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 h-10 text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingMySalaries ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  Loading statement records...
                </TableCell>
              </TableRow>
            ) : mySalaries.length > 0 ? (
              mySalaries.map((s) => (
                <TableRow key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50/20">
                  <TableCell className="py-3 pl-4 font-bold text-xs text-neutral-800 uppercase">
                    {s.mois}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-semibold text-neutral-500">
                    {s.salaire_de_base.toLocaleString('en-US')} DH
                  </TableCell>
                  <TableCell className="py-3 text-xs font-semibold text-blue-600">
                    +{s.primes.toLocaleString('en-US')} DH
                  </TableCell>
                  <TableCell className="py-3 text-xs font-semibold text-red-500">
                    -{s.retenues.toLocaleString('en-US')} DH
                  </TableCell>
                  <TableCell className="py-3 text-xs font-black text-neutral-900">
                    {s.salaire_net.toLocaleString('en-US')} DH
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge 
                      className={`text-[9px] font-black uppercase tracking-wider rounded border-none px-2 py-0.5 ${
                        s.statut === 'Paid' 
                          ? 'bg-green-50 text-green-700 hover:bg-green-50' 
                          : 'bg-yellow-50 text-yellow-750 hover:bg-yellow-50'
                      }`}
                    >
                      {s.statut === 'Paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right pr-4">
                    {s.statut === 'Paid' ? (
                      <Button
                        onClick={() => handleViewSlip(s.id)}
                        className="bg-black hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg h-7 px-3 flex items-center border-none cursor-pointer shadow-sm ml-auto"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        View Statement
                      </Button>
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-400 uppercase italic">Not Available</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-neutral-450 text-xs font-bold uppercase tracking-wider">
                  No payslips registered
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Slip Modal Pop-up */}
      <Dialog open={slipModalOpen} onOpenChange={setSlipModalOpen}>
        <DialogContent className="bg-white max-w-2xl rounded-2xl p-6 text-neutral-900 border border-neutral-100 shadow-xl overflow-y-auto">
          {selectedSlip && (
            <div className="space-y-6">
              
              {/* Slip Layout */}
              <div id="printable-slip" className="p-6 border border-neutral-200 rounded-xl space-y-6 bg-white text-left font-sans">
                
                {/* School Header */}
                <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
                  <div className="text-left">
                    <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900 leading-none mb-1">
                      EMSI SCHOOL GROUP
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-semibold uppercase leading-none">
                      Casablanca, Morocco | Teacher Portal
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-black text-[#d0f137] hover:bg-black text-[9px] font-black uppercase tracking-wider border-none px-2 py-0.5 rounded leading-none">
                      CONFIDENTIAL
                    </Badge>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center">
                  <h3 className="text-sm font-black uppercase tracking-widest text-neutral-850 leading-none mb-1">
                    SALARY PAYOUT STATEMENT
                  </h3>
                  <p className="text-[10px] font-bold text-neutral-450 uppercase leading-none">
                    PERIOD : {selectedSlip.mois}
                  </p>
                </div>

                {/* Employee / Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-neutral-50/60 border border-neutral-100 rounded-lg p-3 text-xs font-semibold text-neutral-600">
                  <div>
                    <p className="leading-relaxed">
                      <span className="text-neutral-400 font-extrabold uppercase text-[10px] tracking-wide block">EMPLOYEE</span>
                      <span className="text-neutral-950 font-black uppercase">{selectedSlip.enseignant?.prenom} {selectedSlip.enseignant?.nom}</span>
                    </p>
                    <p className="leading-relaxed mt-2">
                      <span className="text-neutral-400 font-extrabold uppercase text-[10px] tracking-wide block">SPECIALTY</span>
                      <span className="text-neutral-800 uppercase">{selectedSlip.enseignant?.specialite}</span>
                    </p>
                  </div>
                  <div>
                    <p className="leading-relaxed">
                      <span className="text-neutral-400 font-extrabold uppercase text-[10px] tracking-wide block">PAYMENT DATE</span>
                      <span className="text-neutral-800">{selectedSlip.date_paiement ? new Date(selectedSlip.date_paiement).toLocaleDateString('en-US') : 'N/A'}</span>
                    </p>
                    <p className="leading-relaxed mt-2">
                      <span className="text-neutral-400 font-extrabold uppercase text-[10px] tracking-wide block">METHOD</span>
                      <span className="text-neutral-850">Bank Transfer</span>
                    </p>
                  </div>
                </div>

                {/* Matrix Table breakdown */}
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="py-2 px-3 font-bold uppercase text-[9px] text-neutral-450 tracking-wider text-left">Description</th>
                        <th className="py-2 px-3 font-bold uppercase text-[9px] text-neutral-450 tracking-wider text-right">Earnings</th>
                        <th className="py-2 px-3 font-bold uppercase text-[9px] text-neutral-450 tracking-wider text-right">Deductions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-semibold text-neutral-600">
                      <tr>
                        <td className="py-2 px-3 text-neutral-850">Base Monthly Salary</td>
                        <td className="py-2 px-3 text-right text-neutral-850">{selectedSlip.salaire_de_base.toFixed(2)} DH</td>
                        <td className="py-2 px-3 text-right">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-neutral-850">Performance / Merit Bonuses</td>
                        <td className="py-2 px-3 text-right text-blue-600">+{selectedSlip.primes.toFixed(2)} DH</td>
                        <td className="py-2 px-3 text-right">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-neutral-850">Transport / Meal Allowances</td>
                        <td className="py-2 px-3 text-right text-neutral-850">+{selectedSlip.indemnites.toFixed(2)} DH</td>
                        <td className="py-2 px-3 text-right">-</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-neutral-850">AMO / Tax Deductions</td>
                        <td className="py-2 px-3 text-right">-</td>
                        <td className="py-2 px-3 text-right text-red-500">-{selectedSlip.retenues.toFixed(2)} DH</td>
                      </tr>
                      {/* Sub-total */}
                      <tr className="bg-neutral-50 font-bold border-t border-neutral-200">
                        <td className="py-2 px-3 text-neutral-800 uppercase text-[10px]">Sub-totals</td>
                        <td className="py-2 px-3 text-right text-neutral-800">{(selectedSlip.salaire_de_base + selectedSlip.primes + selectedSlip.indemnites).toFixed(2)} DH</td>
                        <td className="py-2 px-3 text-right text-red-500">-{selectedSlip.retenues.toFixed(2)} DH</td>
                      </tr>
                      {/* Net salary */}
                      <tr className="bg-black text-[#d0f137] font-black border-t border-neutral-350">
                        <td className="py-3 px-3 uppercase tracking-wide text-xs">NET TO PAY</td>
                        <td colSpan={2} className="py-3 px-3 text-right text-sm">
                          {selectedSlip.salaire_net.toLocaleString('en-US')} DH
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Notes & Footer signature */}
                <div className="flex justify-between items-end pt-4">
                  <div className="text-left w-2/3">
                    <p className="text-[10px] font-extrabold text-neutral-450 uppercase mb-1">Office Notes</p>
                    <p className="text-[10px] text-neutral-500 font-medium italic">
                      {selectedSlip.notes || 'This payslip serves as an official proof of earnings for the designated month.'}
                    </p>
                  </div>
                  <div className="text-center w-1/3">
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-6">COMPTROLLER</p>
                    <div className="border-b border-neutral-300 w-24 mx-auto" />
                    <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Electronically Signed</p>
                  </div>
                </div>

              </div>

              {/* Action Tools */}
              <DialogFooter className="mt-4 flex sm:justify-end gap-2">
                <Button
                  onClick={() => setSlipModalOpen(false)}
                  variant="outline"
                  className="bg-white border border-[#E5E7EB] text-black font-bold text-xs h-9 rounded-lg cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  onClick={handlePrint}
                  className="bg-black hover:bg-neutral-800 text-white font-bold text-xs h-9 rounded-lg border-none flex items-center cursor-pointer"
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print Statement
                </Button>
              </DialogFooter>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default TeacherSalaryPage;
