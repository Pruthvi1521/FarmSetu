import React from 'react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-white">Platform Administration</h1>
      <p className="text-slate-400 text-sm">Manage open mandi datasets, users, buyer verifications, and system health.</p>
      <div className="p-8 rounded-2xl glass-panel text-center text-slate-300">
        <p className="text-lg font-semibold text-indigo-400">Phase 1 Foundation Ready</p>
      </div>
    </div>
  );
};
