import React, { useState } from 'react';
import TransportSubNav from './TransportSubNav';
import VehiclesTab from './VehiclesTab';
import DriversTab from './DriversTab';
import RoutesTab from './RoutesTab';

export const TransportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vehicles');

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900 pb-12">
      {/* Top Header Section */}
      <div>
        <h1 className="text-xl font-bold tracking-wider uppercase text-neutral-900">
          Transport Fleet & Route Tracking
        </h1>
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
          Manage transport vehicles, drivers directory, configure routes and track coordinates
        </p>
      </div>

      {/* Subnavigation Switcher */}
      <TransportSubNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Render Active Tab */}
      <div className="w-full">
        {activeTab === 'vehicles' && <VehiclesTab />}
        {activeTab === 'drivers' && <DriversTab />}
        {activeTab === 'routes' && <RoutesTab />}
      </div>
    </div>
  );
};

export default TransportPage;
