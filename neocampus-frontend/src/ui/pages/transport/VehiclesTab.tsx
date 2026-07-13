import React, { useState } from 'react';
import { useTransport } from '@/application/useCases/useTransport';
import { useNotification } from '@/application/useCases/useNotification';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Vehicle } from '@/domain/entities/Vehicle';
import { Driver } from '@/domain/entities/Driver';
import { 
  Bus, Users, Settings, Wrench, ShieldAlert, BadgeAlert, 
  Trash2, Edit3, Plus, MoreVertical, X, Calendar, Compass 
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// --- Draggable Driver Card Component ---
const DraggableDriverCard: React.FC<{ driver: Driver }> = ({ driver }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `driver-${driver.id}`,
    data: { driver },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white border border-neutral-150 rounded-xl shadow-xs flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-black transition-all ${
        isDragging ? 'opacity-50 scale-95 border-dashed' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase">
        {driver.nom.charAt(0)}{driver.prenom.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-neutral-900 truncate">
          {driver.prenom} {driver.nom}
        </p>
        <p className="text-[10px] text-neutral-400 font-medium">
          License: {driver.num_permis.split('-')[0]}
        </p>
      </div>
    </div>
  );
};

// --- Droppable Vehicle Card Component ---
interface DroppableVehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onSelect: (vehicle: Vehicle) => void;
  assignedDriver?: Driver;
  onUnassignDriver: (driver: Driver) => void;
}

const DroppableVehicleCard: React.FC<DroppableVehicleCardProps> = ({
  vehicle,
  onEdit,
  onDelete,
  onSelect,
  assignedDriver,
  onUnassignDriver
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `vehicle-${vehicle.id}`,
    data: { vehicle },
  });

  const statusColors = {
    actif: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    maintenance: 'bg-amber-50 text-amber-700 border-amber-100',
    hors_service: 'bg-red-50 text-red-700 border-red-100',
  };

  const statusLabels = {
    actif: 'Active',
    maintenance: 'Maintenance',
    hors_service: 'Out of Service',
  };

  return (
    <div
      ref={setNodeRef}
      className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-200 relative group ${
        isOver ? 'border-[#d0f137] bg-neutral-50 scale-102 shadow-md ring-2 ring-[#d0f137]/20' : 'border-neutral-200/80 hover:border-neutral-300'
      }`}
    >
      {/* Actions Button */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-8 h-8 rounded-full hover:bg-neutral-50 flex items-center justify-center border-none cursor-pointer">
            <MoreVertical className="h-4 w-4 text-neutral-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-neutral-100">
            <DropdownMenuItem onClick={() => onEdit(vehicle)} className="text-xs font-semibold cursor-pointer">
              <Edit3 className="h-3.5 w-3.5 mr-2" /> Edit Specs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelect(vehicle)} className="text-xs font-semibold cursor-pointer">
              <Wrench className="h-3.5 w-3.5 mr-2" /> View Specs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(vehicle.id)} className="text-xs font-semibold text-red-600 focus:bg-red-50 cursor-pointer">
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Bus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header Info */}
      <div className="flex items-center gap-4 mb-4" onClick={() => onSelect(vehicle)}>
        <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0">
          <Bus className="h-6 w-6 text-[#d0f137]" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black text-neutral-900 uppercase tracking-tight">
            {vehicle.marque} {vehicle.modele}
          </h4>
          <p className="text-xs font-bold text-neutral-450 tracking-wider">
            {vehicle.matricule}
          </p>
        </div>
      </div>

      {/* Badges Info */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-neutral-50 px-2 py-0.5 border-neutral-150">
          {vehicle.capacite} seats
        </Badge>
        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${statusColors[vehicle.statut]}`}>
          {statusLabels[vehicle.statut]}
        </Badge>
      </div>

      {/* Driver Assignment Dropzone Area */}
      <div className="border border-dashed border-neutral-200 rounded-xl p-3 bg-neutral-50/50">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
            Assigned Driver
          </span>
          {assignedDriver && (
            <button 
              onClick={() => onUnassignDriver(assignedDriver)}
              className="text-[9px] font-bold uppercase text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
            >
              Unassign
            </button>
          )}
        </div>
        {assignedDriver ? (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-neutral-850 text-white flex items-center justify-center font-bold text-[10px] uppercase">
              {assignedDriver.nom.charAt(0)}{assignedDriver.prenom.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-neutral-900 truncate">
                {assignedDriver.prenom} {assignedDriver.nom}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-neutral-400 font-semibold text-center py-2">
            Drag a driver here to assign
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Vehicles Tab Component ---
export const VehiclesTab: React.FC = () => {
  const { useVehicles, createVehicle, updateVehicle, deleteVehicle, useDrivers, updateDriver } = useTransport();
  const { useNotifications } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    matricule: '',
    marque: '',
    modele: '',
    capacite: 20,
    statut: 'actif' as Vehicle['statut'],
    annee_mise_en_service: new Date().getFullYear(),
  });

  // Load vehicles & drivers
  const { data: vehiclesData, isLoading: loadingVehicles } = useVehicles({
    q: searchQuery,
    statut: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: driversData } = useDrivers({ per_page: 100 });

  const vehicles = vehiclesData?.data ?? [];
  const allDrivers = driversData?.data ?? [];

  // Filter available drivers (statut === 'actif' and no vehicule_id)
  const availableDrivers = allDrivers.filter(d => d.statut === 'actif' && !d.vehicule_id);

  // Handle Drag End to assign driver
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const driverId = parseInt(active.id.replace('driver-', ''), 10);
    const vehicleId = parseInt(over.id.replace('vehicle-', ''), 10);

    const driver = allDrivers.find(d => d.id === driverId);
    if (driver) {
      try {
        await updateDriver({
          id: driverId,
          data: { vehicule_id: vehicleId }
        });
      } catch (err) {
        console.error('Failed to assign driver', err);
      }
    }
  };

  // Handle Unassign driver
  const handleUnassignDriver = async (driver: Driver) => {
    try {
      await updateDriver({
        id: driver.id,
        data: { vehicule_id: null }
      });
    } catch (err) {
      console.error('Failed to unassign driver', err);
    }
  };

  // Handle Create Vehicle
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVehicle(formData);
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create vehicle', err);
    }
  };

  // Handle Edit Vehicle
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleToEdit) return;
    try {
      await updateVehicle({
        id: vehicleToEdit.id,
        data: formData
      });
      setIsEditOpen(false);
      setVehicleToEdit(null);
      resetForm();
    } catch (err) {
      console.error('Failed to update vehicle', err);
    }
  };

  // Handle Delete Vehicle
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
      } catch (err) {
        console.error('Failed to delete vehicle', err);
      }
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setFormData({
      matricule: vehicle.matricule,
      marque: vehicle.marque,
      modele: vehicle.modele ?? '',
      capacite: vehicle.capacite,
      statut: vehicle.statut,
      annee_mise_en_service: vehicle.annee_mise_en_service ?? new Date().getFullYear(),
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      matricule: '',
      marque: '',
      modele: '',
      capacite: 20,
      statut: 'actif',
      annee_mise_en_service: new Date().getFullYear(),
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Fleet List (8-span) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Filters and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-neutral-100 p-4 rounded-2xl shadow-xs">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
              <Input
                type="text"
                placeholder="Search plate, brand, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs text-xs font-semibold"
              />
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
                <SelectTrigger className="w-[180px] text-xs font-semibold bg-white">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-100">
                  <SelectItem value="all" className="text-xs font-semibold">All Statuses</SelectItem>
                  <SelectItem value="actif" className="text-xs font-semibold">Active Only</SelectItem>
                  <SelectItem value="maintenance" className="text-xs font-semibold">In Maintenance</SelectItem>
                  <SelectItem value="hors_service" className="text-xs font-semibold">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={() => { resetForm(); setIsCreateOpen(true); }}
              className="bg-black hover:bg-neutral-850 text-white rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </div>

          {/* Grid of Vehicles */}
          {loadingVehicles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="h-44 rounded-2xl bg-white border border-neutral-100 p-5 flex flex-col gap-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-xl" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-4 bg-neutral-100 rounded-md w-3/4" />
                      <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-neutral-100 rounded-md w-1/3" />
                  <div className="h-10 bg-neutral-100 rounded-md" />
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12 bg-white border border-neutral-100 rounded-3xl p-6">
              <Bus className="h-12 w-12 text-neutral-350 mx-auto mb-4" />
              <h3 className="text-sm font-black text-neutral-800 uppercase tracking-tight">No Vehicles Found</h3>
              <p className="text-xs text-neutral-400 mt-1 font-semibold">Start by registering your school transport fleet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle) => {
                const assignedDriver = allDrivers.find(d => d.vehicule_id === vehicle.id);
                return (
                  <DroppableVehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    assignedDriver={assignedDriver}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onSelect={setSelectedVehicle}
                    onUnassignDriver={handleUnassignDriver}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Available Drivers (4-span) */}
        <div className="lg:col-span-4 bg-white border border-neutral-150 rounded-2xl p-5 shadow-xs sticky top-4 max-h-[75vh] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-4 w-4 text-neutral-650" />
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">
              Available Drivers
            </h3>
          </div>
          
          <p className="text-[10px] text-neutral-400 font-semibold mb-4 leading-relaxed">
            These active drivers are not currently assigned to any vehicle. Drag and drop them onto a vehicle card to assign them.
          </p>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[150px]">
            {availableDrivers.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                <Users className="h-6 w-6 text-neutral-350 mx-auto mb-2" />
                <p className="text-[10px] text-neutral-400 font-semibold">
                  All active drivers are assigned.
                </p>
              </div>
            ) : (
              availableDrivers.map((driver) => (
                <DraggableDriverCard key={driver.id} driver={driver} />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Detail Drawer (Sheet) */}
      <Sheet open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
        <SheetContent className="bg-white border-l border-neutral-100 text-neutral-900 w-full sm:max-w-md overflow-y-auto">
          {selectedVehicle && (
            <div className="flex flex-col gap-6">
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-neutral-600" />
                  <SheetTitle className="text-sm font-black uppercase tracking-wider">
                    Vehicle Specifications
                  </SheetTitle>
                </div>
              </SheetHeader>

              <div className="flex flex-col items-center gap-2 text-center p-6 bg-neutral-50 border border-neutral-100 rounded-3xl">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm">
                  <Bus className="h-8 w-8 text-[#d0f137]" />
                </div>
                <h3 className="text-base font-black text-neutral-900 uppercase">
                  {selectedVehicle.marque} {selectedVehicle.modele}
                </h3>
                <p className="text-xs font-bold text-neutral-450 tracking-wider">
                  Plate: {selectedVehicle.matricule}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider border-b border-neutral-100 pb-1">
                  Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100/50">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Capacity</p>
                    <p className="text-xs font-black text-neutral-900 mt-0.5">{selectedVehicle.capacite} seats</p>
                  </div>
                  <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100/50">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Status</p>
                    <p className="text-xs font-black text-neutral-900 mt-0.5 capitalize">{selectedVehicle.statut}</p>
                  </div>
                  <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100/50">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Service Year</p>
                    <p className="text-xs font-black text-neutral-900 mt-0.5">{selectedVehicle.annee_mise_en_service ?? 'N/A'}</p>
                  </div>
                  <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100/50">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Internal Code</p>
                    <p className="text-xs font-black text-[#666] mt-0.5">BUS-{String(selectedVehicle.id).padStart(3, '0')}</p>
                  </div>
                </div>
              </div>

              {/* Maintenance placeholder */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider border-b border-neutral-100 pb-1">
                  Maintenance Log
                </h4>
                <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <ShieldAlert className="h-4 w-4 text-neutral-450 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900">Annual Safety Inspection</p>
                    <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Passed on 12/05/2026. Next inspection scheduled for November 2026.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              Add New Transport Vehicle
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="marque" className="text-xs font-bold">Brand Name</Label>
                <Input
                  id="marque"
                  required
                  placeholder="e.g. Mercedes-Benz"
                  value={formData.marque}
                  onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                  className="text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modele" className="text-xs font-bold">Model</Label>
                <Input
                  id="modele"
                  placeholder="e.g. Sprinter"
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  className="text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="matricule" className="text-xs font-bold">Plate Number (Matricule)</Label>
                <Input
                  id="matricule"
                  required
                  placeholder="e.g. 1234|A|99"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacite" className="text-xs font-bold">Seating Capacity</Label>
                <Input
                  id="capacite"
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.capacite}
                  onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value, 10) })}
                  className="text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="annee_mise_en_service" className="text-xs font-bold">Year in Service</Label>
                <Input
                  id="annee_mise_en_service"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.annee_mise_en_service}
                  onChange={(e) => setFormData({ ...formData, annee_mise_en_service: parseInt(e.target.value, 10) })}
                  className="text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="statut" className="text-xs font-bold">Initial Status</Label>
                <Select 
                  value={formData.statut} 
                  onValueChange={(val: any) => setFormData({ ...formData, statut: val })}
                >
                  <SelectTrigger className="w-full text-xs font-semibold bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-100">
                    <SelectItem value="actif" className="text-xs font-semibold">Active</SelectItem>
                    <SelectItem value="maintenance" className="text-xs font-semibold">In Maintenance</SelectItem>
                    <SelectItem value="hors_service" className="text-xs font-semibold">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Register Vehicle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              Edit Vehicle Specifications
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-marque" className="text-xs font-bold">Brand Name</Label>
                <Input
                  id="edit-marque"
                  required
                  value={formData.marque}
                  onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                  className="text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-modele" className="text-xs font-bold">Model</Label>
                <Input
                  id="edit-modele"
                  value={formData.modele}
                  onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                  className="text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-matricule" className="text-xs font-bold">Plate Number</Label>
                <Input
                  id="edit-matricule"
                  required
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-capacite" className="text-xs font-bold">Seating Capacity</Label>
                <Input
                  id="edit-capacite"
                  type="number"
                  required
                  min="1"
                  value={formData.capacite}
                  onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value, 10) })}
                  className="text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-annee" className="text-xs font-bold">Year in Service</Label>
                <Input
                  id="edit-annee"
                  type="number"
                  min="1990"
                  value={formData.annee_mise_en_service}
                  onChange={(e) => setFormData({ ...formData, annee_mise_en_service: parseInt(e.target.value, 10) })}
                  className="text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-statut" className="text-xs font-bold">Vehicle Status</Label>
                <Select 
                  value={formData.statut} 
                  onValueChange={(val: any) => setFormData({ ...formData, statut: val })}
                >
                  <SelectTrigger className="w-full text-xs font-semibold bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-neutral-100">
                    <SelectItem value="actif" className="text-xs font-semibold">Active</SelectItem>
                    <SelectItem value="maintenance" className="text-xs font-semibold">In Maintenance</SelectItem>
                    <SelectItem value="hors_service" className="text-xs font-semibold">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsEditOpen(false); setVehicleToEdit(null); }}
                className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
};

export default VehiclesTab;
