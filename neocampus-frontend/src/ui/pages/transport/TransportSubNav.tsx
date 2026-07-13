import React from 'react';
import { Bus, Users, MapPin } from 'lucide-react';

interface TransportSubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TransportSubNav: React.FC<TransportSubNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'vehicles', name: 'Vehicles Fleet', icon: Bus },
    { id: 'drivers', name: 'Drivers Directory', icon: Users },
    { id: 'routes', name: 'Routes & Tracking', icon: MapPin },
  ];

  return (
    <div className="flex items-center gap-2 bg-white p-1.5 border border-neutral-100 rounded-2xl shadow-sm mb-6 w-fit shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-neutral-900 text-[#d0f137] shadow-sm scale-102'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {tab.name}
          </button>
        );
      })}
    </div>
  );
};

export default TransportSubNav;
