import React, { useState } from 'react';
import { useFinance } from '@/application/useCases/useFinance';
import { useClass } from '@/application/useCases/useClass';
import { useStudent } from '@/application/useCases/useStudent';
import {
  Plus,
  Trash2,
  Edit2,
  Layers,
  Calendar,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

export const FeeConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'groups' | 'types'>('groups');
  const {
    groups,
    loadingGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    types,
    loadingTypes,
    createType,
    updateType,
    deleteType,
    assignFees,
    assigningFees
  } = useFinance();

  const { classes } = useClass();
  const { students } = useStudent();

  // Group Form States
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupNom, setGroupNom] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  // Type Form States
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeLibelle, setTypeLibelle] = useState('');
  const [typeGroupId, setTypeGroupId] = useState('');
  const [typeMontant, setTypeMontant] = useState('');
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);

  // Assign Form States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [assignTarget, setAssignTarget] = useState<'student' | 'class'>('class');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  // Validation Error States
  const [groupErrors, setGroupErrors] = useState<{ nom?: string }>({});
  const [typeErrors, setTypeErrors] = useState<{ libelle?: string; groupe_frais_id?: string; montant_par_defaut?: string }>({});
  const [assignErrors, setAssignErrors] = useState<{ type_frais_ids?: string; target?: string; date_echeance?: string }>({});

  // Status/Messages
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Group Handlers
  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupNom.trim()) {
      setGroupErrors({ nom: 'Category name is required.' });
      return;
    }
    setGroupErrors({});
    try {
      if (editingGroupId) {
        await updateGroup({ id: editingGroupId, data: { nom: groupNom, description: groupDesc } });
        showStatus('Fee category updated successfully.');
      } else {
        await createGroup({ nom: groupNom, description: groupDesc });
        showStatus('Fee category created successfully.');
      }
      setGroupNom('');
      setGroupDesc('');
      setEditingGroupId(null);
      setShowGroupModal(false);
    } catch (err: any) {
      showStatus(err.message || 'Error saving category.', 'error');
    }
  };

  const handleEditGroup = (g: any) => {
    setEditingGroupId(g.id);
    setGroupNom(g.nom);
    setGroupDesc(g.description || '');
    setShowGroupModal(true);
  };

  const handleDeleteGroup = async (id: number) => {
    if (confirm('Delete this category? Associated fees and prices will be impacted.')) {
      try {
        await deleteGroup(id);
        showStatus('Category deleted.');
      } catch (err: any) {
        showStatus(err.message || 'Error deleting category.', 'error');
      }
    }
  };

  // Type Handlers
  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof typeErrors = {};
    if (!typeLibelle.trim()) {
      errors.libelle = 'Fee rate label is required.';
    }
    if (!typeGroupId) {
      errors.groupe_frais_id = 'Associated category is required.';
    }
    const val = parseFloat(typeMontant);
    if (isNaN(val) || val <= 0) {
      errors.montant_par_defaut = 'Amount must be a positive number.';
    }

    if (Object.keys(errors).length > 0) {
      setTypeErrors(errors);
      return;
    }
    setTypeErrors({});
    try {
      const data = {
        libelle: typeLibelle,
        groupe_frais_id: parseInt(typeGroupId),
        montant_par_defaut: val
      };

      if (editingTypeId) {
        await updateType({ id: editingTypeId, data });
        showStatus('Fee rate updated.');
      } else {
        await createType(data);
        showStatus('Fee rate created.');
      }
      setTypeLibelle('');
      setTypeGroupId('');
      setTypeMontant('');
      setEditingTypeId(null);
      setShowTypeModal(false);
    } catch (err: any) {
      showStatus(err.message || 'Error saving rate.', 'error');
    }
  };

  const handleEditType = (t: any) => {
    setEditingTypeId(t.id);
    setTypeLibelle(t.libelle);
    setTypeGroupId(t.groupe_frais_id.toString());
    setTypeMontant(t.montant_par_defaut.toString());
    setShowTypeModal(true);
  };

  const handleDeleteType = async (id: number) => {
    if (confirm('Delete this fee rate?')) {
      try {
        await deleteType(id);
        showStatus('Fee rate deleted.');
      } catch (err: any) {
        showStatus(err.message || 'Error deleting fee rate.', 'error');
      }
    }
  };

  // Assign Fee Handler
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof assignErrors = {};
    if (selectedTypeIds.length === 0) {
      errors.type_frais_ids = 'Please select at least one fee rate.';
    }
    if (assignTarget === 'student' && !selectedStudentId) {
      errors.target = 'Please select a student.';
    }
    if (assignTarget === 'class' && !selectedClassId) {
      errors.target = 'Please select a class.';
    }
    if (!dueDate) {
      errors.date_echeance = 'Please define a due date.';
    }

    if (Object.keys(errors).length > 0) {
      setAssignErrors(errors);
      return;
    }
    setAssignErrors({});

    try {
      await assignFees({
        type_frais_ids: selectedTypeIds,
        eleve_id: assignTarget === 'student' ? parseInt(selectedStudentId) : null,
        classe_id: assignTarget === 'class' ? parseInt(selectedClassId) : null,
        date_echeance: dueDate,
        annee_scolaire: academicYear
      });
      showStatus('Fees successfully assigned.');
      setSelectedTypeIds([]);
      setSelectedStudentId('');
      setSelectedClassId('');
      setDueDate('');
      setShowAssignModal(false);
    } catch (err: any) {
      showStatus(err.message || 'Error assigning fees.', 'error');
    }
  };

  const toggleTypeSelection = (id: number) => {
    if (selectedTypeIds.includes(id)) {
      setSelectedTypeIds(selectedTypeIds.filter(x => x !== id));
    } else {
      setSelectedTypeIds([...selectedTypeIds, id]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-800 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Fee Configuration</h1>
          <p className="text-neutral-500 text-sm">Configure school tuition categories, standard base rates, and assign them globally or individually.</p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 bg-black hover:bg-neutral-850 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all"
        >
          <Calendar className="w-4 h-4" />
          Assign Fees
        </button>
      </div>

      {/* Messages */}
      {statusMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            statusMsg.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-teal-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span className="font-medium text-sm">{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/50 p-1.5 rounded-xl gap-2 max-w-sm">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'groups'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'types'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Base Rates
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'groups' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/40">
            <div>
              <h2 className="font-bold text-neutral-900">Categories List</h2>
              <p className="text-xs text-neutral-500">Major divisions for structuring school fees (e.g. Tuition, Transport, Lunch).</p>
            </div>
            <button
              onClick={() => {
                setEditingGroupId(null);
                setGroupNom('');
                setGroupDesc('');
                setShowGroupModal(true);
              }}
              className="flex items-center gap-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Category
            </button>
          </div>

          {loadingGroups ? (
            <div className="p-12 text-center text-neutral-500">Loading categories...</div>
          ) : groups.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">No fee categories configured.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                    <th className="p-4 pl-6">Category Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {groups.map((g: any) => (
                    <tr key={g.id} className="hover:bg-neutral-50/50 transition-all">
                      <td className="p-4 pl-6 font-bold text-neutral-900">{g.nom}</td>
                      <td className="p-4 text-neutral-550 max-w-md truncate">{g.description || '-'}</td>
                      <td className="p-4 text-right pr-6 space-x-2">
                        <button
                          onClick={() => handleEditGroup(g)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-teal-600 rounded-md transition-all inline-flex"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(g.id)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-rose-600 rounded-md transition-all inline-flex"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/40">
            <div>
              <h2 className="font-bold text-neutral-900">Standard Base Rates</h2>
              <p className="text-xs text-neutral-500">Individual fee items and their standard baseline amounts.</p>
            </div>
            <button
              onClick={() => {
                setEditingTypeId(null);
                setTypeLibelle('');
                setTypeGroupId(groups[0]?.id?.toString() || '');
                setTypeMontant('');
                setShowTypeModal(true);
              }}
              className="flex items-center gap-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Rate
            </button>
          </div>

          {loadingTypes ? (
            <div className="p-12 text-center text-neutral-500">Loading rates...</div>
          ) : types.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">No rates configured yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                    <th className="p-4 pl-6">Label</th>
                    <th className="p-4">Associated Category</th>
                    <th className="p-4">Standard Amount</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {types.map((t: any) => {
                    const grp = groups.find((g: any) => g.id === t.groupe_frais_id);
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/50 transition-all">
                        <td className="p-4 pl-6 font-bold text-neutral-900">{t.libelle}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                            {grp ? grp.nom : 'Unknown'}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-teal-650">{t.montant_par_defaut} MAD</td>
                        <td className="p-4 text-right pr-6 space-x-2">
                          <button
                            onClick={() => handleEditType(t)}
                            className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-teal-600 rounded-md transition-all inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteType(t.id)}
                            className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-rose-600 rounded-md transition-all inline-flex"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- CATEGORY MODAL --- */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">
                {editingGroupId ? 'Modify Category' : 'New Fee Category'}
              </h3>
              <button onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGroupSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lunch, Annual Tuition"
                  value={groupNom}
                  onChange={e => setGroupNom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
                {groupErrors.nom && <p className="text-[10px] text-red-500 font-semibold mt-1">{groupErrors.nom}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of what this category covers..."
                  value={groupDesc}
                  onChange={e => setGroupDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RATE MODAL --- */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">
                {editingTypeId ? 'Modify Rate' : 'New Standard Rate'}
              </h3>
              <button onClick={() => setShowTypeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTypeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Fee Rate Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: October Tuition, Registration Fee"
                  value={typeLibelle}
                  onChange={e => setTypeLibelle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
                {typeErrors.libelle && <p className="text-[10px] text-red-500 font-semibold mt-1">{typeErrors.libelle}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Associated Category *
                </label>
                <select
                  required
                  value={typeGroupId}
                  onChange={e => setTypeGroupId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                >
                  <option value="" disabled>Select category</option>
                  {groups.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.nom}</option>
                  ))}
                </select>
                {typeErrors.groupe_frais_id && <p className="text-[10px] text-red-500 font-semibold mt-1">{typeErrors.groupe_frais_id}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Standard Amount (MAD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={typeMontant}
                    onChange={e => setTypeMontant(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-bold"
                  />
                  <DollarSign className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                </div>
                {typeErrors.montant_par_defaut && <p className="text-[10px] text-red-500 font-semibold mt-1">{typeErrors.montant_par_defaut}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ASSIGNATION MODAL --- */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">Assign Fees</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Type selector (Checkbox list) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Select Fees to Assign *
                </label>
                <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                  {types.map((t: any) => (
                    <label key={t.id} className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypeIds.includes(t.id)}
                        onChange={() => toggleTypeSelection(t.id)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <div className="text-sm font-bold text-neutral-950">
                        {t.libelle} <span className="text-teal-600 text-xs font-black">({t.montant_par_defaut} MAD)</span>
                      </div>
                    </label>
                  ))}
                </div>
                {assignErrors.type_frais_ids && <p className="text-[10px] text-red-500 font-semibold mt-1">{assignErrors.type_frais_ids}</p>}
              </div>

              {/* Targets */}
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 border border-gray-200 p-3 rounded-xl cursor-pointer hover:bg-gray-50/50">
                  <input
                    type="radio"
                    name="target"
                    checked={assignTarget === 'class'}
                    onChange={() => setAssignTarget('class')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm font-bold text-neutral-800">By Class</span>
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 border border-gray-200 p-3 rounded-xl cursor-pointer hover:bg-gray-50/50">
                  <input
                    type="radio"
                    name="target"
                    checked={assignTarget === 'student'}
                    onChange={() => setAssignTarget('student')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm font-bold text-neutral-800">Single Student</span>
                </label>
              </div>

              {assignTarget === 'class' ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Select Class *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  >
                    <option value="">Choose class</option>
                    {classes?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Select Student *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  >
                    <option value="">Choose student</option>
                    {students?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.prenom} {s.nom} ({s.matricule})</option>
                    ))}
                  </select>
                </div>
              )}
              {assignErrors.target && <p className="text-[10px] text-red-500 font-semibold mt-1">{assignErrors.target}</p>}

              {/* Academic Year and Due date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                  {assignErrors.date_echeance && <p className="text-[10px] text-red-500 font-semibold mt-1">{assignErrors.date_echeance}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningFees}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all disabled:opacity-50"
                >
                  {assigningFees ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeConfigPage;
