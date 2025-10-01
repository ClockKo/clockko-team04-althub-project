import React from 'react';

const SecuritySettings: React.FC = () => {
  return (
    <section className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Security Settings</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Change Password</label>
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="New password" />
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Update Password</button>
    </section>
  );
};

export default SecuritySettings;
