import React, { useState } from 'react';
import { useAccountant } from '@/application/useCases/useAccountant';
import {
  Trash2,
  Edit2,
  Search,
  UserPlus,
  X,
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const AccountantDirectoryPage: React.FC = () => {
  const {
    accountants,
    loading,
    createAccountant,
    creating,
    updateAccountant,
    updating,
    deleteAccountant
  } = useAccountant();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !prenom || !email) return;

    try {
      if (editingId) {
        const updateData: any = { nom, prenom, email };
        if (password) {
          updateData.password = password;
        }
        await updateAccountant({ id: editingId, data: updateData });
        showStatus('Accountant profile updated successfully.');
      } else {
        if (!password) {
          showStatus('Password is required for new accountants.', 'error');
          return;
        }
        await createAccountant({ nom, prenom, email, password });
        showStatus('New accountant registered successfully.');
      }

      setNom('');
      setPrenom('');
      setEmail('');
      setPassword('');
      setEditingId(null);
      setShowModal(false);
    } catch (err: any) {
      showStatus(err.response?.data?.message || err.message || 'Error occurred.', 'error');
    }
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setNom(u.nom);
    setPrenom(u.prenom);
    setEmail(u.email);
    setPassword(''); // Reset password input
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this accountant? This action cannot be undone.')) {
      try {
        await deleteAccountant(id);
        showStatus('Accountant removed successfully.');
      } catch (err: any) {
        showStatus(err.message || 'Error deleting accountant.', 'error');
      }
    }
  };

  const filteredAccountants = accountants.filter(u => {
    const searchString = `${u.prenom} ${u.nom} ${u.email}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-800 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Accountants Directory</h1>
          <p className="text-neutral-500 text-sm">Manage finance managers, configure login access, and track registered accountants.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Search accountant..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50/50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
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
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 bg-black hover:bg-neutral-850 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Add Accountant
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

      {/* Accountants Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-500">Loading accountants list...</div>
        ) : filteredAccountants.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">No accountants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold text-xs uppercase border-b border-neutral-100">
                  <th className="p-4 pl-6">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Access Level</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAccountants.map((u: any) => (
                  <tr key={u.id} className="hover:bg-neutral-50/50 transition-all">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-neutral-900">{u.prenom} {u.nom}</div>
                    </td>
                    <td className="p-4 text-neutral-600 font-medium">{u.email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        <ShieldCheck className="w-3 h-3" />
                        Accountant
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6 space-x-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-teal-600 rounded-md transition-all inline-flex"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
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

      {/* --- ADD / EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-lg">
                {editingId ? 'Modify Accountant' : 'Register New Accountant'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-205 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Smith"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-205 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john.smith@neocampus.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-205 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-550 uppercase tracking-wider mb-1.5">
                  Password {editingId && '(Leave blank to keep current)'} *
                </label>
                <input
                  type="password"
                  required={!editingId}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-205 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-550 hover:bg-neutral-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-black text-white hover:bg-neutral-850 transition-all disabled:opacity-50"
                >
                  {creating || updating ? 'Saving...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantDirectoryPage;
