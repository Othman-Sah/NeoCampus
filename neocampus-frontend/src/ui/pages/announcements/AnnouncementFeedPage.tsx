import React, { useState } from 'react';
import { useAnnouncement } from '@/application/useCases/useAnnouncement';
import { useAuth } from '@/application/useCases/useAuth';
import { Announcement } from '@/domain/entities/Announcement';
import AnnouncementCreateDialog from './AnnouncementCreateDialog';
import { 
  Megaphone, Pin, Search, Plus, Calendar, User, Eye, 
  Trash2, Edit3, ShieldAlert, Sparkles, FilterX, Clock, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export const AnnouncementFeedPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    useAnnouncements, createAnnouncement, creatingAnnouncement,
    updateAnnouncement, updatingAnnouncement, deleteAnnouncement, togglePinAnnouncement
  } = useAnnouncement();

  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Dialog state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  const { data: announcementsData, isLoading } = useAnnouncements({
    q: searchQuery,
  });

  const allAnnouncements = announcementsData?.data ?? [];

  // Filter announcements (since pinned is handled first, we sort: pinned true first, then date desc)
  let filteredAnnouncements = [...allAnnouncements];
  if (pinnedOnly) {
    filteredAnnouncements = filteredAnnouncements.filter(a => a.is_pinned);
  }

  // Sort: Pinned first, then by published_at desc
  filteredAnnouncements.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const canPublish = user?.role === 'admin';

  const handleSaveAnnouncement = async (data: any) => {
    try {
      if (announcementToEdit) {
        await updateAnnouncement({
          id: announcementToEdit.id,
          data
        });
      } else {
        await createAnnouncement(data);
      }
      setIsEditorOpen(false);
      setAnnouncementToEdit(null);
    } catch (err) {
      console.error('Failed to save announcement', err);
    }
  };

  const handleEditTrigger = (ann: Announcement, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnnouncementToEdit(ann);
    setIsEditorOpen(true);
  };

  const handleDeleteTrigger = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
      } catch (err) {
        console.error('Failed to delete announcement', err);
      }
    }
  };

  const handleTogglePin = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await togglePinAnnouncement(id);
    } catch (err) {
      console.error('Failed to toggle pin', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-neutral-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-neutral-100 p-5 rounded-3xl shadow-xs">
        <div>
          <Badge className="bg-black text-[#d0f137] text-[9px] font-black uppercase tracking-wider mb-2">
            Campus Communications
          </Badge>
          <h1 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
            News & Announcements
          </h1>
          <p className="text-xs font-semibold text-neutral-450 uppercase tracking-wide mt-1">
            Stay updated with school alerts, department announcements and coordination news
          </p>
        </div>

        {canPublish && (
          <Button
            onClick={() => { setAnnouncementToEdit(null); setIsEditorOpen(true); }}
            className="bg-black hover:bg-neutral-850 text-white rounded-2xl px-5 py-5 flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer border-none"
          >
            <Plus className="h-4 w-4" /> Compose News
          </Button>
        )}
      </div>

      {/* Filters card */}
      <Card className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-450" />
            <Input
              type="text"
              placeholder="Search announcements by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs font-semibold bg-white border border-neutral-200"
            />
          </div>

          <button
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              pinnedOnly
                ? 'bg-neutral-100 text-black border-neutral-300'
                : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <Pin className={`h-3.5 w-3.5 ${pinnedOnly ? 'fill-black' : ''}`} />
            Pinned Only
          </button>
        </CardContent>
      </Card>

      {/* Feed Layout */}
      {isLoading ? (
        <div className="space-y-6 max-w-3xl">
          {[1, 2].map(idx => (
            <div key={idx} className="h-40 rounded-2xl bg-white border border-neutral-100 p-5 flex flex-col gap-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-neutral-100 rounded-full" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-neutral-100 rounded-md w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded-md w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-neutral-100 rounded-md w-full" />
              <div className="h-4 bg-neutral-100 rounded-md w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-100 rounded-3xl p-6 max-w-3xl">
          <Megaphone className="h-14 w-14 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-sm font-black text-neutral-800 uppercase tracking-tight">Feed is Empty</h3>
          <p className="text-xs text-neutral-450 mt-1 font-semibold">No announcements fit your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {filteredAnnouncements.map((ann) => {
            const authorInitials = ann.author 
              ? `${ann.author.prenom.charAt(0)}${ann.author.nom.charAt(0)}`
              : 'AD';
            
            const isTargeted = ann.target_roles.includes('*') 
              ? 'Public'
              : ann.target_roles.map(r => r.toUpperCase()).join(', ');

            return (
              <Card 
                key={ann.id} 
                onClick={() => setSelectedAnnouncement(ann)}
                className={`bg-white border rounded-2xl shadow-xs hover:shadow-sm hover:border-neutral-300 transition duration-150 relative overflow-hidden cursor-pointer ${
                  ann.is_pinned ? 'border-neutral-450 ring-1 ring-neutral-900/5' : 'border-neutral-200/80'
                }`}
              >
                {/* Pin Header Accent */}
                {ann.is_pinned && (
                  <div className="bg-black text-[#d0f137] text-[8px] font-black uppercase tracking-wider px-3 py-1 flex items-center gap-1.5 w-fit rounded-br-xl shrink-0 absolute top-0 left-0 z-10">
                    <Pin className="h-3 w-3 fill-[#d0f137]" /> Pinned Alert
                  </div>
                )}

                <CardContent className={`p-6 ${ann.is_pinned ? 'pt-8' : ''} flex flex-col justify-between h-full`}>
                  
                  {/* Author and Date bar */}
                  <div className="flex justify-between items-center gap-4 text-neutral-450 text-[10px] font-bold uppercase tracking-wider mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-black text-[9px]">
                        {authorInitials}
                      </div>
                      <span className="text-neutral-800">
                        {ann.author ? `${ann.author.prenom} ${ann.author.nom}` : 'Administrator'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(ann.created_at)}</span>
                    </div>
                  </div>

                  {/* Title and Excerpt */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight group-hover:text-black">
                      {ann.titre}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                      {ann.extrait ?? 'Click to view details...'}
                    </p>
                  </div>

                  {/* Footer Badges & Actions */}
                  <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3.5 mt-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-wider bg-neutral-50 border border-neutral-150 text-neutral-500">
                        Audience: {isTargeted}
                      </Badge>
                    </div>

                    {/* Admin Actions */}
                    {canPublish && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleTogglePin(ann.id, e)}
                          className="w-7 h-7 rounded-lg hover:bg-neutral-50 flex items-center justify-center border-none bg-transparent cursor-pointer text-neutral-400 hover:text-black"
                          title={ann.is_pinned ? 'Unpin' : 'Pin to Top'}
                        >
                          <Pin className={`h-3.5 w-3.5 ${ann.is_pinned ? 'fill-black text-black' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleEditTrigger(ann, e)}
                          className="w-7 h-7 rounded-lg hover:bg-neutral-50 flex items-center justify-center border-none bg-transparent cursor-pointer text-neutral-400 hover:text-black"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTrigger(ann.id, e)}
                          className="w-7 h-7 rounded-lg hover:bg-neutral-50 flex items-center justify-center border-none bg-transparent cursor-pointer text-neutral-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Details View Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-xl rounded-3xl overflow-y-auto max-h-[85vh]">
          {selectedAnnouncement && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="h-5 w-5 text-neutral-600" />
                  <DialogDescription className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                    School Announcement details
                  </DialogDescription>
                </div>
                <DialogTitle className="text-base font-black text-neutral-900 uppercase leading-snug">
                  {selectedAnnouncement.titre}
                </DialogTitle>
              </DialogHeader>

              {/* Author Banner */}
              <div className="flex items-center justify-between gap-4 p-3 bg-neutral-50 border border-neutral-150 rounded-2xl text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-black text-[10px]">
                    {selectedAnnouncement.author 
                      ? `${selectedAnnouncement.author.prenom.charAt(0)}${selectedAnnouncement.author.nom.charAt(0)}`
                      : 'AD'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-neutral-800 font-black">
                      {selectedAnnouncement.author ? `${selectedAnnouncement.author.prenom} ${selectedAnnouncement.author.nom}` : 'Administrator'}
                    </span>
                    <span className="text-[8px] font-semibold text-neutral-400 lowercase">Author account</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(selectedAnnouncement.created_at)}</span>
                </div>
              </div>

              {/* Body Text Content */}
              <div 
                className="text-xs leading-relaxed text-neutral-850 p-4 border border-neutral-100 rounded-2xl bg-white prose prose-neutral max-w-none max-h-[350px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: selectedAnnouncement.contenu }}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compose Announcement Editor Dialog */}
      <AnnouncementCreateDialog
        open={isEditorOpen}
        onOpenChange={(open) => { setIsEditorOpen(open); if(!open) setAnnouncementToEdit(null); }}
        announcementToEdit={announcementToEdit}
        isSaving={creatingAnnouncement || updatingAnnouncement}
        onSave={handleSaveAnnouncement}
      />

    </div>
  );
};

export default AnnouncementFeedPage;
