import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Settings, Home, Image as ImageIcon } from 'lucide-react';
import CaptureMoment from './components/CaptureMoment';
import Timeline from './components/Timeline';
import SettingsPanel from './components/SettingsPanel';
import { Moment } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'settings'>('home');
  const [moments, setMoments] = useState<Moment[]>([]);
  const [showCapturePrompt, setShowCapturePrompt] = useState(false);

  useEffect(() => {
    // Load moments from localStorage
    const savedMoments = localStorage.getItem('cappic-moments');
    if (savedMoments) {
      setMoments(JSON.parse(savedMoments));
    }
  }, []);

  useEffect(() => {
    // Save moments to localStorage whenever they change
    localStorage.setItem('cappic-moments', JSON.stringify(moments));
  }, [moments]);

  const addMoment = (moment: Moment) => {
    setMoments(prev => [moment, ...prev]);
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
              </div>
            </div>
            <button
              onClick={() => setShowCapturePrompt(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Capture Now</span>
            </button>
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
                onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to cappic</h2>
              <p className="text-gray-600 mb-4">
                Capture meaningful moments throughout your year. Each photo and note becomes part of your personal journey.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Capture</h3>
                  <p className="text-sm text-gray-600">Take photos or upload images</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Remember</h3>
                  <p className="text-sm text-gray-600">View your timeline</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <ImageIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Reflect</h3>
                  <p className="text-sm text-gray-600">See your year in review</p>
                </div>
              </div>
            </div>

            {moments.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Moments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moments.slice(0, 6).map((moment) => (
                    <div key={moment.id} className="bg-gray-50 rounded-lg p-4">
                      {moment.imageUrl && (
                        <img
                          src={moment.imageUrl}
                          alt="Moment"
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(moment.timestamp).toLocaleDateString()}
                      </p>
                      {moment.note && (
                        <p className="text-gray-900 text-sm line-clamp-2">{moment.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <Timeline moments={moments} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel />
        )}
      </main>

      {/* Capture Prompt Modal */}
      {showCapturePrompt && (
        <CaptureMoment
          onClose={() => setShowCapturePrompt(false)}
          onCapture={addMoment}
        />
      )}
    </div>
  );
}

export default App;
