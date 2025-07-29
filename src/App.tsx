import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Settings, Home, Image as ImageIcon, User, LogOut } from 'lucide-react';
import CaptureMoment from './components/CaptureMoment';
import Timeline from './components/Timeline';
import SettingsPanel from './components/SettingsPanel';
import AuthModal from './components/AuthModal';
import { Moment, User as UserType } from './types';
import { signIn, signUp, signOutUser, onAuthStateChange } from './services/authService';
import { getMoments, addMoment as addMomentToFirebase } from './services/momentService';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'settings'>('home');
  const [moments, setMoments] = useState<Moment[]>([]);
  const [showCapturePrompt, setShowCapturePrompt] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load moments when user changes
  useEffect(() => {
    const loadMoments = async () => {
      if (user?.uid) {
        try {
          const userMoments = await getMoments(user.uid);
          setMoments(userMoments);
        } catch (error) {
          console.error('Error loading moments:', error);
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        const savedMoments = localStorage.getItem('cappic-moments');
        if (savedMoments) {
          setMoments(JSON.parse(savedMoments));
        }
      }
      setLoading(false);
    };

    loadMoments();
  }, [user]);

  // Save to localStorage as backup (for non-authenticated users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cappic-moments', JSON.stringify(moments));
    }
  }, [moments, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const addMoment = async (moment: Moment) => {
    try {
      if (user?.uid) {
        // Save to Firebase
        const momentWithoutId = { ...moment, id: undefined };
        const newMomentId = await addMomentToFirebase(momentWithoutId);
        const newMoment = { ...moment, id: newMomentId };
        setMoments(prev => [newMoment, ...prev]);
      } else {
        // Save to localStorage
        setMoments(prev => [moment, ...prev]);
      }
    } catch (error) {
      console.error('Error adding moment:', error);
      // Fallback to localStorage
      setMoments(prev => [moment, ...prev]);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    setIsAuthModalOpen(false);
  };

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    await signUp(email, password, displayName);
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">cappic</h1>
                <p className="text-sm text-gray-600">Capture yours now. Remember your year.</p>
                <button 
                  onClick={() => console.log('Test button clicked')}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded mt-1"
                >
                  Test Click
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
              <button
                onClick={() => {
                  console.log('Capture Now button clicked');
                  setShowCapturePrompt(true);
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Capture Now</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  console.log('Tab clicked:', tab.id);
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your moments...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to cappic
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Capture your daily moments and build a beautiful memory gallery.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card text-center p-6">
                      <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Capture Moments</h3>
                      <p className="text-gray-600">Take photos or upload images to remember special times.</p>
                    </div>
                    <div className="card text-center p-6">
                      <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Timeline View</h3>
                      <p className="text-gray-600">Browse your memories in chronological order.</p>
                    </div>
                    <div className="card text-center p-6">
                      <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Customize</h3>
                      <p className="text-gray-600">Set preferences and manage your data.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'timeline' && (
              <Timeline moments={moments} />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel />
            )}
          </>
        )}
      </main>

      {/* Capture Prompt Modal */}
      {showCapturePrompt && (
        <CaptureMoment
          onClose={() => {
            console.log('Closing capture modal');
            setShowCapturePrompt(false);
          }}
          onCapture={(moment) => {
            console.log('Capturing moment:', moment);
            addMoment(moment);
          }}
          userId={user?.uid}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleSignIn}
        onSignup={handleSignUp}
      />
    </div>
  );
}

export default App;
