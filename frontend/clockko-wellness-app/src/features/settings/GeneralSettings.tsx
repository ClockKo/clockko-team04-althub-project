import React from 'react';

const GeneralSettings: React.FC = () => {
  return (
    <section className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">General Settings</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Language</label>
        <select className="w-full border rounded px-3 py-2">
          <option>English (UK)</option>
          <option>English (US)</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Timezone</label>
        <select className="w-full border rounded px-3 py-2">
          <option>(GMT +1:00) Lagos</option>
          <option>(GMT +0:00) London</option>
        </select>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
    </section>
  );
};

export default GeneralSettings;
