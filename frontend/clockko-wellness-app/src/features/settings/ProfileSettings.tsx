import React from 'react';

const ProfileSettings: React.FC = () => {
  return (
    <section className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input type="text" className="w-full border rounded px-3 py-2" placeholder="Your name" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" className="w-full border rounded px-3 py-2" placeholder="Your email" />
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
    </section>
  );
};

export default ProfileSettings;
