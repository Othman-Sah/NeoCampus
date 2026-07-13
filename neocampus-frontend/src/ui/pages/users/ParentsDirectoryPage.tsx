import React, { useState } from 'react';
import { useParents } from '@/application/useCases/useParents';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/ui/components/EmptyState';
import {
  Trash2,
  Edit2,
  Search,
  UserPlus,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Link
} from 'lucide-react';

export const ParentsDirectoryPage: React.FC = () => {
  const {
    parents,
    loading,
    createParent,
    creating,
    updateParent,
    updating,
    deleteParent
  } = useParents();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!prenom.trim()) errs.prenom = 'First name is required.';
    if (!nom.trim()) errs.nom = 'Last name is required.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Invalid email address format.';
    }
    if (!editingId && !password.trim()) {
      errs.password = 'Password is required for new parents.';
    } else if (password.trim() && password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingId) {
        const updateData: any = { nom, prenom, email };
        if (password) {
          updateData.password = password;
        }
        await updateParent({ id: editingId, data: updateData });
        showStatus('Parent profile updated successfully.');
      } else {
        await createParent({ nom, prenom, email, password });
        showStatus('New parent registered successfully.');
      }

      setNom('');
      setPrenom('');
      setEmail('');
      setPassword('');
      setEditingId(null);
      setErrors({});
      setShowModal(false);
    } catch (err: any) {
      showStatus(err.response?.data?.message || err.message || 'Error occurred.', 'error');
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setNom(p.nom);
    setPrenom(p.prenom);
    setEmail(p.email);
    setPassword('');
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this parent profile? This action detaches children and cannot be undone.')) {
      try {
        await deleteParent(id);
        showStatus('Parent profile removed successfully.');
      } catch (err: any) {
        showStatus(err.message || 'Error deleting parent profile.', 'error');
      }
    }
  };

  const filteredParents = parents.filter(p => {
    const searchString = `${p.prenom} ${p.nom} ${p.email}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-800 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Parents Directory</h1>
          <p className="text-neutral-500 text-sm">Manage parent accounts, configure login access, and check child linkages.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Search parent..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-neutral-400 w-4 h-4" />
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setNom('');
              setPrenom('');
              setEmail('');
              setPassword('');
              setErrors({});
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 bg-black hover:bg-neutral-850 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Parent
          </button>
        </div>
      </div>

      {/* Messages */}
      {statusMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            statusMsg.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-rose-50 border-rose-200 text-rose-800'
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

      {/* Parents Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                  <th className="p-4 pl-6">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Linked Children</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="p-4 pl-6"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-44" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-4 text-right pr-6"><Skeleton className="h-8 w-16 rounded-lg ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredParents.length === 0 ? (
          <EmptyState
            title="No Parents Found"
            description="No parent profiles match the keywords or filters you set."
            actionText="Add Parent"
            onAction={() => {
              setEditingId(null);
              setNom('');
              setPrenom('');
              setEmail('');
              setPassword('');
              setErrors({});
              setShowModal(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                  <th className="p-4 pl-6">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Linked Children</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredParents.map((p: any) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-all">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-neutral-900">{p.prenom} {p.nom}</div>
                    </td>
                    <td className="p-4 text-neutral-650 font-medium">{p.email}</td>
                    <td className="p-4">
                      {p.children && p.children.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {p.children.map((c: any) => (
                            <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                              <Users className="w-2.5 h-2.5" />
                              {c.prenom} {c.nom}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-bold uppercase italic">
                          No links
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6 space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded-md transition-all inline-flex cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-rose-600 rounded-md transition-all inline-flex cursor-pointer"
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

      {/* --- ADD / EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">
                {editingId ? 'Modify Parent' : 'Register New Parent'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-neutral-550 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm font-semibold"
                  />
                  {errors.prenom && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.prenom}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-neutral-550 uppercase tracking-wider mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm font-semibold"
                  />
                  {errors.nom && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.nom}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-550 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm font-semibold"
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-550 uppercase tracking-wider mb-1">
                  {editingId ? 'New Password (Optional)' : 'Password *'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm font-semibold"
                />
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.password}</p>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-neutral-200 hover:bg-neutral-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-black hover:bg-neutral-850 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center min-w-24"
                >
                  {creating || updating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentsDirectoryPage;
