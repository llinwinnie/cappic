import React, { useState, useEffect } from 'react';
import { Settings, Bell, Download, Trash2, Info } from 'lucide-react';
import { Settings as SettingsType } from '../types';

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>({
    promptFrequency: 'manual',
    enableNotifications: false,
    autoCapture: false,
    theme: 'light',
  });

  const [showNotificationPermission, setShowNotificationPermission] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('cappic-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('cappic-settings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingChange = (key: keyof SettingsType, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleSettingChange('enableNotifications', true);
        setShowNotificationPermission(false);
      }
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all your moments? This action cannot be undone.')) {
      localStorage.removeItem('cappic-moments');
      window.location.reload();
    }
  };

  const exportAllData = () => {
    const moments = localStorage.getItem('cappic-moments');
    if (moments) {
      const dataStr = JSON.stringify(JSON.parse(moments), null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cappic-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          localStorage.setItem('cappic-moments', JSON.stringify(data));
          window.location.reload();
        } catch (error) {
          alert('Invalid file format. Please select a valid cappic backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          General Settings
        </h2>
        
        <div className="space-y-6">
          {/* Prompt Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Frequency
            </label>
            <select
              value={settings.promptFrequency}
              onChange={(e) => handleSettingChange('promptFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="manual">Manual only</option>
              <option value="daily">Once per day</option>
              <option value="weekly">Once per week</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              How often should cappic remind you to capture a moment?
            </p>
          </div>

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Browser Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Get reminded to capture moments
                </p>
              </div>
              <button
                onClick={() => setShowNotificationPermission(true)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Auto Capture */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto Capture
                </label>
                <p className="text-sm text-gray-500">
                  Automatically capture moments at set intervals
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('autoCapture', !settings.autoCapture)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoCapture ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoCapture ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (system)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Download className="w-6 h-6 mr-2 text-blue-600" />
          Data Management
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600">Download all your moments as JSON</p>
            </div>
            <button
              onClick={exportAllData}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Import Data</h3>
              <p className="text-sm text-gray-600">Restore from a backup file</p>
            </div>
            <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-medium text-red-900">Clear All Data</h3>
              <p className="text-sm text-red-600">Permanently delete all moments</p>
            </div>
            <button
              onClick={clearAllData}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Info className="w-6 h-6 mr-2 text-blue-600" />
          About cappic
        </h2>
        
        <div className="space-y-4 text-gray-600">
          <p>
            cappic is your personal journaling companion. Capture meaningful moments throughout your year 
            and create a visual memory gallery of your journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features</h4>
              <ul className="space-y-1">
                <li>• Photo capture with webcam</li>
                <li>• Image upload support</li>
                <li>• Mood tracking with emojis</li>
                <li>• Tag organization</li>
                <li>• Timeline view</li>
                <li>• Data export/import</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Privacy</h4>
              <ul className="space-y-1">
                <li>• All data stored locally</li>
                <li>• No cloud uploads</li>
                <li>• Your moments stay private</li>
                <li>• Full data control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Permission Modal */}
      {showNotificationPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Enable Notifications</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Allow cappic to send you notifications when it's time to capture a moment. 
              You can change this later in your browser settings.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNotificationPermission(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={requestNotificationPermission}
                className="flex-1 btn-primary"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel; 