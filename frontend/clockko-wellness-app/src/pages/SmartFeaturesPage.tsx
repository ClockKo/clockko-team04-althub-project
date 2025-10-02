import { useHead } from '@unhead/react';
import RealTimeFeaturesPanel from '../features/realtime/RealTimeFeaturesPanel';

export default function SmartFeaturesPage() {
  // Set meta tags for smart features page
  useHead({
    title: 'Smart Features - ClockKo | AI-Powered Productivity',
    meta: [
      {
        name: 'description',
        content: 'Configure smart notifications, cross-device sync, and view real-time productivity analytics with ClockKo\'s intelligent features.'
      },
      {
        name: 'robots',
        content: 'noindex, nofollow' // Private features page
      }
    ]
  });

  return (
    <div className="w-full min-h-screen px-8 xs:px-4 py-6 bg-powderBlue">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧠 Smart Features
        </h1>
        <p className="text-gray-600 text-lg">
          Enhance your productivity with intelligent notifications, cross-device sync, and real-time analytics
        </p>
      </div>

      {/* Smart Features Panel */}
      <div className="max-w-6xl mx-auto">
        <RealTimeFeaturesPanel />
      </div>

      {/* Feature Benefits Card */}
      <div className="max-w-6xl mx-auto mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          ✨ Why Smart Features?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="font-medium text-gray-800 mb-2">Intelligent Notifications</h3>
            <p className="text-sm text-gray-600">
              Get break reminders and focus insights based on your unique work patterns
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-medium text-gray-800 mb-2">Cross-Device Sync</h3>
            <p className="text-sm text-gray-600">
              Start on your phone, continue on desktop. Never lose your progress
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-medium text-gray-800 mb-2">Real-Time Analytics</h3>
            <p className="text-sm text-gray-600">
              Live productivity insights and personalized recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}