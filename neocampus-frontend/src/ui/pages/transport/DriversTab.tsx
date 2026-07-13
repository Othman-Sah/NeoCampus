import React, { useState } from 'react';
import { useTransport } from '@/application/useCases/useTransport';
import { Driver } from '@/domain/entities/Driver';
import { 
  Users, Compass, Phone, BadgeCheck, Trash2, Edit3, Plus, 
  Search, Info, Bus, ArrowUpRight, ShieldCheck, Mail
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const DriversTab: React.FC = () => {
  const { useDrivers, createDriver, updateDriver, deleteDriver, useVehicles } = useTransport();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDriverId, setDeletingDriverId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    num_permis: '',
    vehicule_id: 'none',
    statut: 'actif' as Driver['statut'],
  });

  // Load drivers & vehicles
  const { data: driversData, isLoading: loadingDrivers } = useDrivers({
    q: searchQuery,
    statut: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: vehiclesData } = useVehicles({ per_page: 100 });

  const drivers = driversData?.data ?? [];
  const vehicles = vehiclesData?.data ?? [];

  // Handle Form Submit (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone || null,
      num_permis: formData.num_permis,
      vehicule_id: formData.vehicule_id === 'none' ? null : parseInt(formData.vehicule_id, 10),
      statut: formData.statut,
    };

    try {
      if (editingDriver) {
        await updateDriver({
          id: editingDriver.id,
          data: payload
        });
      } else {
        await createDriver(payload);
      }
      setIsSheetOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save driver', err);
    }
  };

  // Handle Trigger Edit
  const triggerEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      nom: driver.nom,
      prenom: driver.prenom,
      telephone: driver.telephone ?? '',
      num_permis: driver.num_permis,
      vehicule_id: driver.vehicule_id ? String(driver.vehicule_id) : 'none',
      statut: driver.statut,
    });
    setIsSheetOpen(true);
  };

  // Handle Trigger Delete
  const triggerDelete = (id: number) => {
    setDeletingDriverId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingDriverId) return;
    try {
      await deleteDriver(deletingDriverId);
      setIsDeleteOpen(false);
      setDeletingDriverId(null);
    } catch (err) {
      console.error('Failed to delete driver', err);
    }
  };

  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      nom: '',
      prenom: '',
      telephone: '',
      num_permis: '',
      vehicule_id: 'none',
      statut: 'actif',
    });
  };

  const avatarColors = [
    'bg-indigo-900',
    'bg-emerald-900',
    'bg-rose-900',
    'bg-amber-900',
    'bg-sky-900',
  ];

  return (
    <div className="space-y-6">
      
      {/* Search Filter and Add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-neutral-100 p-4 rounded-2xl shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-450" />
            <Input
              type="text"
              placeholder="Search drivers by name or permit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs font-semibold bg-white"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
            <SelectTrigger className="w-[180px] text-xs font-semibold bg-white">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-neutral-100">
              <SelectItem value="all" className="text-xs font-semibold">All Drivers</SelectItem>
              <SelectItem value="actif" className="text-xs font-semibold">Active Drivers</SelectItem>
              <SelectItem value="inactif" className="text-xs font-semibold">Inactive Drivers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => { resetForm(); setIsSheetOpen(true); }}
          className="bg-black hover:bg-neutral-850 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New Driver
        </Button>
      </div>

      {/* Grid List */}
      {loadingDrivers ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="h-56 rounded-2xl bg-white border border-neutral-100 p-5 flex flex-col gap-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-neutral-100 rounded-full" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-neutral-100 rounded-md w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-neutral-100 rounded-md w-full" />
              <div className="h-10 bg-neutral-100 rounded-md mt-auto" />
            </div>
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-12 bg-white border border-neutral-100 rounded-3xl p-6">
          <Users className="h-12 w-12 text-neutral-350 mx-auto mb-4" />
          <h3 className="text-sm font-black text-neutral-800 uppercase tracking-tight">No Drivers Found</h3>
          <p className="text-xs text-neutral-400 mt-1 font-semibold">Start by registering your school bus drivers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver, index) => {
            const avatarColor = avatarColors[index % avatarColors.length];
            const linkedBus = vehicles.find(v => v.id === driver.vehicule_id);

            return (
              <Card key={driver.id} className="bg-white border border-neutral-200/80 rounded-2xl hover:border-neutral-300 shadow-xs relative overflow-hidden transition-all duration-200">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  
                  {/* Top Header Card */}
                  <div className="flex gap-4 items-start">
                    <div className={`w-14 h-14 rounded-full ${avatarColor} text-white flex items-center justify-center font-black text-sm uppercase shrink-0`}>
                      {driver.nom.charAt(0)}{driver.prenom.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-neutral-900 leading-tight truncate">
                        {driver.prenom} {driver.nom}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
                        <Compass className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                          Permit: {driver.num_permis.split('-')[0]}
                        </span>
                      </div>
                      {driver.user?.email && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-neutral-450">
                          <Mail className="h-3 w-3" />
                          <span className="text-[9px] font-semibold truncate max-w-full">
                            {driver.user.email}
                          </span>
                        </div>
                      )}
                    </div>

                    <Badge className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${
                      driver.statut === 'actif'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-150'
                    }`}>
                      {driver.statut === 'actif' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Body Details */}
                  <div className="my-5 space-y-2 border-t border-neutral-100 pt-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                      <Phone className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{driver.telephone ?? 'No Phone Number'}</span>
                    </div>

                    {/* Assigned Bus Info */}
                    <div className="flex items-center gap-2">
                      <Bus className="h-3.5 w-3.5 text-neutral-400" />
                      {linkedBus ? (
                        <span className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                          {linkedBus.marque} {linkedBus.modele}
                          <Badge variant="outline" className="text-[8px] font-extrabold uppercase px-1.5 py-0 border-neutral-200 text-neutral-500">
                            {linkedBus.matricule}
                          </Badge>
                        </span>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                          Unassigned
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 mt-auto">
                    <Button
                      variant="outline"
                      onClick={() => triggerEdit(driver)}
                      className="flex-1 text-xs font-bold uppercase tracking-wider h-8 rounded-lg flex items-center justify-center gap-1.5 text-neutral-700 border-neutral-200 hover:bg-neutral-50 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => triggerDelete(driver.id)}
                      className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50/50 border-neutral-200 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mx-auto" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Slide Drawer (Sheet) for Add/Edit */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if(!open) resetForm(); }}>
        <SheetContent className="bg-white border-l border-neutral-100 text-neutral-900 w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-sm font-black uppercase tracking-wider">
              {editingDriver ? 'Edit Driver Profile' : 'Add New Bus Driver'}
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-450 font-semibold">
              Fill in the driver specifications. A linked user credentials account will be auto-generated for portal access.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="prenom" className="text-xs font-bold">First Name</Label>
              <Input
                id="prenom"
                required
                placeholder="e.g. John"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nom" className="text-xs font-bold">Last Name</Label>
              <Input
                id="nom"
                required
                placeholder="e.g. Doe"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telephone" className="text-xs font-bold">Telephone Number</Label>
              <Input
                id="telephone"
                placeholder="e.g. +212 600 000 000"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="num_permis" className="text-xs font-bold">Driving License Code</Label>
              <Input
                id="num_permis"
                required
                placeholder="e.g. PERM-123456"
                value={formData.num_permis}
                onChange={(e) => setFormData({ ...formData, num_permis: e.target.value })}
                className="text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vehicule_id" className="text-xs font-bold">Vehicle Fleet Assignment</Label>
              <Select 
                value={formData.vehicule_id} 
                onValueChange={(val) => setFormData({ ...formData, vehicule_id: val || 'none' })}
              >
                <SelectTrigger className="w-full text-xs font-semibold bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100">
                  <SelectItem value="none" className="text-xs font-semibold">Unassigned</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)} className="text-xs font-semibold">
                      {v.marque} {v.modele} ({v.matricule})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="statut" className="text-xs font-bold">Driver Status</Label>
              <Select 
                value={formData.statut} 
                onValueChange={(val: any) => setFormData({ ...formData, statut: val })}
              >
                <SelectTrigger className="w-full text-xs font-semibold bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100">
                  <SelectItem value="actif" className="text-xs font-semibold">Active</SelectItem>
                  <SelectItem value="inactif" className="text-xs font-semibold">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SheetFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsSheetOpen(false); resetForm(); }}
                className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                {editingDriver ? 'Save Details' : 'Create Driver'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              Confirm Profile Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-450 font-semibold">
              Are you sure you want to delete this driver? Their assigned vehicle status and history will remain intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-650 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border-none"
            >
              Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DriversTab;
