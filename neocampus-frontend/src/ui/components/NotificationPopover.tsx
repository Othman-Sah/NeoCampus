import React from 'react';
import { AppNotification } from '@/domain/entities/AppNotification';
import { useNotification } from '@/application/useCases/useNotification';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, Bus, Award, Calendar, CreditCard, ShieldCheck, 
  Check, CheckSquare, BellOff, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NotificationPopoverProps {
  notifications: AppNotification[];
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ notifications, onClose }) => {
  const navigate = useNavigate();
  const { markAsRead, markAllAsRead } = useNotification();

  const iconMap = {
    annonce: { icon: Megaphone, bg: 'bg-indigo-50 text-indigo-700' },
    transport: { icon: Bus, bg: 'bg-amber-50 text-amber-700' },
    note: { icon: Award, bg: 'bg-emerald-50 text-emerald-700' },
    presence: { icon: Calendar, bg: 'bg-red-50 text-red-700' },
    paiement: { icon: CreditCard, bg: 'bg-blue-50 text-blue-700' },
    systeme: { icon: ShieldCheck, bg: 'bg-neutral-100 text-neutral-800' },
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    try {
      await markAsRead(notif.id);
      onClose();
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / 60000));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="absolute right-0 mt-3 w-80 bg-white border border-neutral-200/80 rounded-2xl shadow-xl overflow-hidden z-100 text-neutral-900 animate-in fade-in slide-in-from-top-1 duration-150">
      
      {/* Header Popover */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50 shrink-0">
        <span className="text-xs font-black uppercase text-neutral-900 tracking-wider">
          Unread Alerts
        </span>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-neutral-500 hover:text-black transition cursor-pointer bg-transparent border-none p-0"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-neutral-100 max-h-[320px] overflow-y-auto bg-white">
        {notifications.length === 0 ? (
          <div className="text-center py-8 px-4 flex flex-col items-center">
            <BellOff className="h-8 w-8 text-neutral-300 mb-2" />
            <p className="text-xs text-neutral-500 font-semibold">
              All caught up! No unread notifications.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const config = iconMap[notif.type] ?? iconMap.systeme;
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className="p-3.5 hover:bg-neutral-50 transition cursor-pointer flex items-start gap-3 text-left group"
              >
                {/* Icon bubble */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-xs font-black text-neutral-900 leading-tight group-hover:text-black truncate">
                      {notif.titre}
                    </p>
                    <span className="text-[8px] font-bold text-neutral-450 uppercase tracking-wide shrink-0">
                      {formatRelativeTime(notif.date_envoi)}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-450 font-medium leading-relaxed truncate">
                    {notif.contenu}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Redirect all */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50 text-center shrink-0">
        <button
          onClick={() => { onClose(); navigate('/announcements'); }}
          className="w-full py-1.5 flex items-center justify-center gap-1 text-[10px] font-black uppercase text-neutral-600 hover:text-black transition cursor-pointer bg-white border border-neutral-200 rounded-xl shadow-2xs"
        >
          View Communications feed <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
};

export default NotificationPopover;
