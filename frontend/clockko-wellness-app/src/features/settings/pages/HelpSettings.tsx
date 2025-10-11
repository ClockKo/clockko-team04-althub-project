import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  MessageCircle, 
  Send,
  HelpCircle,
  Clock,
  Shield,
  Users,
  Zap,
  ExternalLink,
  Search,
  Star,
  Lightbulb,
  Video,
  Download,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  TrendingUp,
  Headphones,
  BookOpen
} from 'lucide-react';

const faqSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Clock className="h-5 w-5 text-blue-500" />,
    items: [
      {
        question: 'How do I start using ClockKo?',
        answer: 'After signing up, complete your profile setup and start by creating your first task in the Tasks section. Set up your work preferences and explore the time tracking features to get the most out of ClockKo.'
      },
      {
        question: 'What are the main features of ClockKo?',
        answer: 'ClockKo offers task management, time tracking, co-working rooms, wellness reports, smart notifications, and productivity challenges to help you maintain a healthy work-life balance.'
      },
      {
        question: 'How do I set up my first task?',
        answer: 'Navigate to the Tasks section, click "Add Task", fill in the task details including name, description, priority level, and estimated time. You can also set deadlines and categories.'
      }
    ]
  },
  {
    id: 'time-tracking',
    title: 'Time Tracking & Productivity',
    icon: <Zap className="h-5 w-5 text-green-500" />,
    items: [
      {
        question: 'How does the time tracker work?',
        answer: 'Start a timer when you begin working on a task. The tracker records your active work time and can pause automatically during breaks. All time data is saved to generate productivity reports.'
      },
      {
        question: 'What are productivity challenges?',
        answer: 'Challenges are goals you can set to improve your work habits, like "Work for 25 minutes without breaks" (Pomodoro) or "Complete 3 tasks today". They help gamify your productivity.'
      },
      {
        question: 'How do I view my productivity reports?',
        answer: 'Go to the Reports section to see detailed analytics of your time usage, task completion rates, productivity trends, and wellness metrics over different time periods.'
      }
    ]
  },
  {
    id: 'coworking',
    title: 'Co-working Rooms',
    icon: <Users className="h-5 w-5 text-purple-500" />,
    items: [
      {
        question: 'What are co-working rooms?',
        answer: 'Virtual spaces where you can work alongside others in real-time. Join existing rooms or create your own to collaborate, stay motivated, and maintain focus with fellow users.'
      },
      {
        question: 'How do I join or create a room?',
        answer: 'Navigate to Co-working Rooms, browse available rooms, and click "Join" or create a new room by clicking "Create Room" and setting your preferences for room type and privacy.'
      },
      {
        question: 'Can I invite specific people to my room?',
        answer: 'Yes! When creating a room, you can make it private and share the room code with specific people, or keep it public for anyone to join.'
      }
    ]
  },
  {
    id: 'account-security',
    title: 'Account & Security',
    icon: <Shield className="h-5 w-5 text-red-500" />,
    items: [
      {
        question: 'How do I change my password?',
        answer: 'Go to Settings > Security, click "New password", enter your current password, then set and confirm your new password. We recommend using a strong, unique password.'
      },
      {
        question: 'What is two-step verification?',
        answer: 'An extra security layer that requires a code from your authenticator app in addition to your password when signing in. Enable it in Settings > Security for better account protection.'
      },
      {
        question: 'How do I manage my device sessions?',
        answer: 'In Settings > Security, view all devices where you\'re signed in. You can sign out of individual devices or all other devices if you suspect unauthorized access.'
      }
    ]
  },
  {
    id: 'smart-features',
    title: 'Smart Features & Wellness',
    icon: <Zap className="h-5 w-5 text-orange-500" />,
    items: [
      {
        question: 'What are smart notifications?',
        answer: 'AI-powered reminders that learn from your work patterns to suggest breaks, notify you of upcoming deadlines, and help maintain healthy work habits.'
      },
      {
        question: 'How does wellness tracking work?',
        answer: 'ClockKo monitors your work patterns, break frequency, and task load to provide wellness insights and suggestions for maintaining a healthy work-life balance.'
      },
      {
        question: 'Can I customize my notification preferences?',
        answer: 'Yes! Go to Settings > General to customize which notifications you receive, their frequency, and preferred delivery times to match your workflow.'
      }
    ]
  }
];

const supportLinks = [
  { 
    path: '/help/documentation', 
    label: 'Help Documentation', 
    icon: <BookOpen className="h-5 w-5 text-blue-500" />,
    description: 'Comprehensive guides and tutorials'
  },
  { 
    path: '/help/support', 
    label: 'Contact Support', 
    icon: <MessageCircle className="h-5 w-5 text-green-500" />,
    description: 'Get help from our support team'
  },
  { 
    path: '/help/feedback', 
    label: 'Send Feedback', 
    icon: <Send className="h-5 w-5 text-purple-500" />,
    description: 'Share your suggestions and ideas'
  },
];

const quickActions = [
  {
    label: 'Video Tutorials',
    icon: <Video className="h-6 w-6 text-red-500" />,
    description: 'Watch step-by-step video guides',
    action: 'tutorials',
    badge: 'New'
  },
  {
    label: 'Keyboard Shortcuts',
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    description: 'Speed up your workflow',
    action: 'shortcuts'
  },
  {
    label: 'System Status',
    icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
    description: 'Check service uptime',
    action: 'status'
  }
];

const contactMethods = [
  {
    method: 'Email Support',
    icon: <Mail className="h-5 w-5 text-blue-500" />,
    detail: 'support@clockko.com',
    responseTime: '24 hours',
    availability: 'Always available'
  },
  {
    method: 'Live Chat',
    icon: <MessageSquare className="h-5 w-5 text-green-500" />,
    detail: 'Chat with our team',
    responseTime: '< 5 minutes',
    availability: 'Mon-Fri 9AM-6PM EST'
  },
  {
    method: 'Phone Support',
    icon: <Phone className="h-5 w-5 text-purple-500" />,
    detail: '+1 (555) 123-4567',
    responseTime: 'Immediate',
    availability: 'Mon-Fri 9AM-5PM EST'
  }
];

const popularArticles = [
  {
    title: 'How to Set Up Your First Productivity Challenge',
    category: 'Getting Started',
    readTime: '3 min read',
    rating: 4.8,
    views: '2.3k'
  },
  {
    title: 'Maximizing Focus in Co-working Rooms',
    category: 'Co-working',
    readTime: '5 min read',
    rating: 4.9,
    views: '1.8k'
  },
  {
    title: 'Understanding Your Wellness Reports',
    category: 'Wellness',
    readTime: '4 min read',
    rating: 4.7,
    views: '1.5k'
  },
  {
    title: 'Advanced Time Tracking Techniques',
    category: 'Productivity',
    readTime: '7 min read',
    rating: 4.6,
    views: '1.2k'
  }
];

const keyboardShortcuts = [
  { key: 'Ctrl + N', action: 'Create new task' },
  { key: 'Ctrl + Space', action: 'Start/stop timer' },
  { key: 'Ctrl + Shift + R', action: 'Open reports' },
  { key: 'Ctrl + K', action: 'Quick search' },
  { key: 'Ctrl + Shift + C', action: 'Join co-working room' },
  { key: 'Ctrl + ,', action: 'Open settings' }
];

const HelpSettings: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleQuickAction = (action: string) => {
    setActiveAction(action);
    switch (action) {
      case 'shortcuts':
        setShowShortcuts(!showShortcuts);
        break;
      case 'tutorials':
        window.open('/help/tutorials', '_blank');
        break;
      case 'status':
        window.open('/status', '_blank');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  // Filter FAQ sections based on search
  const filteredFaqSections = faqSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Help & Support</h1>
        <p className="text-gray-600">
          Find answers to common questions, get support, and learn how to make the most of ClockKo.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search help articles, FAQs, and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <div className="mt-3 text-sm text-gray-600">
            {filteredFaqSections.length > 0 ? (
              `Found ${filteredFaqSections.reduce((acc, section) => acc + section.items.length, 0)} results`
            ) : (
              'No results found. Try different keywords or contact support.'
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {!searchQuery && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
            <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors relative"
              >
                {action.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {action.badge}
                  </span>
                )}
                <div className="mb-3">
                  {action.icon}
                </div>
                <div className="font-medium text-gray-800 text-sm text-center mb-1">
                  {action.label}
                </div>
                <div className="text-xs text-gray-600 text-center">
                  {action.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              Keyboard Shortcuts
            </h3>
            <button 
              onClick={() => setShowShortcuts(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyboardShortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{shortcut.action}</span>
                <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                  {shortcut.key}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Articles */}
      {!searchQuery && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Popular Help Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                to={`/help/article/${index}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    {article.rating}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
                  {article.title}
                </h3>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{article.readTime}</span>
                  <span>{article.views} views</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}



      {/* FAQ Sections */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
          <HelpCircle className="h-5 w-5 text-blue-500 mr-2" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqSections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <div className="flex items-center">
                  {section.icon}
                  <span className="ml-3 font-medium text-gray-900">{section.title}</span>
                </div>
                {expandedSections.includes(section.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {expandedSections.includes(section.id) && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="space-y-3 pt-4">
                    {section.items.map((item, index) => {
                      const itemId = `${section.id}-${index}`;
                      return (
                        <div key={itemId} className="border-l-2 border-gray-100 pl-4">
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full text-left flex items-center justify-between py-2 hover:text-blue-600 focus:outline-none"
                          >
                            <span className="font-medium text-gray-800 text-sm">
                              {item.question}
                            </span>
                            {expandedItems.includes(itemId) ? (
                              <ChevronUp className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                            )}
                          </button>
                          {expandedItems.includes(itemId) && (
                            <div className="pb-3 pr-6">
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Need More Help?</h2>
        <p className="text-gray-600 mb-4">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Mail className="h-4 w-4 mr-2" />
            Email Support
          </button>
          <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <MessageSquare className="h-4 w-4 mr-2" />
            Live Chat
          </button>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Additional Resources</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {supportLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">All systems operational</span>
            </div>
            <Link to="/status" className="text-sm text-gray-500 hover:text-blue-600">Status Page</Link>
          </div>
        </div>
      </div>

      {/* App Version Info */}
      <div className="mt-8 text-center">
        <div className="text-sm text-gray-500">
          ClockKo Wellness App v2.1.0 | Last updated: October 2025
        </div>
        <div className="flex justify-center items-center mt-2 space-x-4 text-xs text-gray-400">
          <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-blue-600">Terms of Service</Link>
          <span>•</span>
          <a href="https://clockko.com" className="hover:text-blue-600 inline-flex items-center">
            Visit Website
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;