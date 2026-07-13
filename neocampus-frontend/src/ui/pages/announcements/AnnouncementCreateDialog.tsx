import React, { useState, useEffect, useRef } from 'react';
import { Announcement } from '@/domain/entities/Announcement';
import { 
  X, Bold, Italic, Heading, List, ListOrdered, Link, 
  Eye, Pin, AlertCircle, Sparkles, CheckSquare, Square
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AnnouncementCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementToEdit: Announcement | null;
  onSave: (data: { titre: string; contenu: string; target_roles: string[]; is_pinned: boolean }) => Promise<void>;
  isSaving: boolean;
}

export const AnnouncementCreateDialog: React.FC<AnnouncementCreateDialogProps> = ({
  open,
  onOpenChange,
  announcementToEdit,
  onSave,
  isSaving
}) => {
  const [titre, setTitre] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [targetRoles, setTargetRoles] = useState<string[]>(['*']);
  const editorRef = useRef<HTMLDivElement>(null);

  const availableRoles = [
    { value: '*', label: 'All Users (Public)' },
    { value: 'admin', label: 'Administrators' },
    { value: 'enseignant', label: 'Teachers' },
    { value: 'parent', label: 'Parents' },
    { value: 'eleve', label: 'Students' },
    { value: 'chauffeur', label: 'Drivers' },
  ];

  // Initialize form when editing
  useEffect(() => {
    if (open) {
      if (announcementToEdit) {
        setTitre(announcementToEdit.titre);
        setIsPinned(announcementToEdit.is_pinned);
        setTargetRoles(announcementToEdit.target_roles);
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = announcementToEdit.contenu;
          }
        }, 50);
      } else {
        setTitre('');
        setIsPinned(false);
        setTargetRoles(['*']);
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = '';
          }
        }, 50);
      }
    }
  }, [open, announcementToEdit]);

  const handleFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleLink = () => {
    const url = prompt('Enter website URL:');
    if (url) {
      handleFormat('createLink', url);
    }
  };

  const toggleRole = (role: string) => {
    if (role === '*') {
      setTargetRoles(['*']);
      return;
    }

    let updated = [...targetRoles].filter(r => r !== '*');
    if (updated.includes(role)) {
      updated = updated.filter(r => r !== role);
      if (updated.length === 0) updated = ['*'];
    } else {
      updated.push(role);
    }
    setTargetRoles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const htmlContent = editorRef.current?.innerHTML || '';
    
    if (!titre.trim()) return alert('Please enter a title');
    if (!htmlContent.replace(/<[^>]*>/g, '').trim()) {
      return alert('Please write some content');
    }

    await onSave({
      titre,
      contenu: htmlContent,
      target_roles: targetRoles,
      is_pinned: isPinned,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-neutral-100 text-neutral-900 max-w-2xl rounded-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#d0f137]" />
            {announcementToEdit ? 'Edit Announcement' : 'Compose School Announcement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title" className="text-xs font-bold">Announcement Title</Label>
            <Input
              id="announcement-title"
              required
              placeholder="e.g. Welcome Back Assemblies & Scheduling"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="text-xs font-semibold bg-white"
            />
          </div>

          {/* Target Audience Roles */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Target Visibility Audience</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableRoles.map((role) => {
                const isSelected = targetRoles.includes(role.value);
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleRole(role.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                      isSelected
                        ? 'bg-black text-[#d0f137] border-black'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-350'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-3 w-3" />
                    ) : (
                      <Square className="h-3 w-3" />
                    )}
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* WYSIWYG Editor Toolbar */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Announcement Body Content</Label>
            <div className="border border-neutral-200 rounded-2xl overflow-hidden flex flex-col bg-white">
              
              {/* Toolbar */}
              <div className="bg-neutral-50 border-b border-neutral-200 p-2 flex flex-wrap gap-1 items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleFormat('bold')}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center border-none bg-transparent cursor-pointer"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('italic')}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center border-none bg-transparent cursor-pointer"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <div className="h-4 w-px bg-neutral-200 mx-1" />
                <button
                  type="button"
                  onClick={() => handleFormat('formatBlock', 'h3')}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center border-none bg-transparent cursor-pointer"
                  title="Heading 3"
                >
                  <Heading className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('insertUnorderedList')}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center border-none bg-transparent cursor-pointer"
                  title="Unordered List"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('insertOrderedList')}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center border-none bg-transparent cursor-pointer"
                  title="Ordered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <div className="h-4 w-px bg-neutral-200 mx-1" />
                <button
                  type="button"
                  onClick={handleLink}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-200 flex items-center justify-center border-none bg-transparent cursor-pointer"
                  title="Insert Hyperlink"
                >
                  <Link className="h-4 w-4" />
                </button>
              </div>

              {/* Editing Canvas */}
              <div
                ref={editorRef}
                contentEditable
                className="p-4 min-h-[180px] focus:outline-hidden text-xs leading-relaxed max-h-[300px] overflow-y-auto bg-white text-neutral-900 prose prose-neutral max-w-none"
                placeholder="Write news updates, schedules, guidelines here..."
                style={{ outline: 'none' }}
              />

            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2 bg-neutral-50 p-3.5 border border-neutral-100 rounded-2xl">
            <input
              type="checkbox"
              id="announcement-pin"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black cursor-pointer"
            />
            <Label htmlFor="announcement-pin" className="text-xs font-black uppercase text-neutral-800 tracking-wider flex items-center gap-1.5 cursor-pointer">
              <Pin className="h-3.5 w-3.5" /> Pin to top of feed
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-black hover:bg-neutral-850 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
            >
              {isSaving ? 'Publishing...' : (announcementToEdit ? 'Save Changes' : 'Publish Announcement')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementCreateDialog;
