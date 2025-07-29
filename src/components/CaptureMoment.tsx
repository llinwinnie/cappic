import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Smile, Tag } from 'lucide-react';
import { Moment } from '../types';

interface CaptureMomentProps {
  onClose: () => void;
  onCapture: (moment: Moment) => void;
  userId?: string;
}

const CaptureMoment: React.FC<CaptureMomentProps> = ({ onClose, onCapture, userId }) => {
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [note, setNote] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const moods = ['😊', '😢', '😡', '😴', '🤔', '😍', '😎', '😭'];

  useEffect(() => {
    if (captureMode === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [captureMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCaptureMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const capturedImageUrl = canvas.toDataURL('image/jpeg');
        setImageUrl(capturedImageUrl);
        setIsCapturing(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const moment: Moment = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl,
      note: note.trim() || undefined,
      mood: mood || undefined,
      tags: tags.length > 0 ? tags : undefined,
      userId: userId || 'local-user', // Use userId prop or default
    };

    onCapture(moment);
    onClose();
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Capture This Moment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Capture Mode Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setCaptureMode('camera')}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  captureMode === 'camera'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Camera className="w-5 h-5 inline mr-2" />
              Camera
            </button>
            <button
              onClick={() => setCaptureMode('upload')}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  captureMode === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Upload className="w-5 h-5 inline mr-2" />
              Upload
            </button>
          </div>

          {/* Camera/Upload Area */}
          <div className="bg-gray-50 rounded-lg p-4">
            {captureMode === 'camera' ? (
              <div className="space-y-4">
                {!imageUrl ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setIsCapturing(true);
                        setTimeout(capturePhoto, 100);
                      }}
                      disabled={isCapturing}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Camera className="w-6 h-6 text-gray-700" />
                    </button>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt="Captured moment"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {!imageUrl ? (
                  <label className="block w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-gray-600 font-medium">Click to upload image</span>
                    <span className="text-sm text-gray-500 mt-2">or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <img
                    src={imageUrl}
                    alt="Uploaded moment"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's happening in this moment?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling? <Smile className="w-4 h-4 inline" />
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setMood(mood === emoji ? '' : emoji)}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    mood === emoji
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add tags <Tag className="w-4 h-4 inline" />
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['work', 'family', 'friends', 'travel', 'food', 'nature', 'art', 'music'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    disabled={tags.includes(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      tags.includes(tag)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!imageUrl}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Moment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptureMoment; 