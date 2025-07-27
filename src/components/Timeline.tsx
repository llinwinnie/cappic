import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Tag, Smile, Filter, Download } from 'lucide-react';
import { Moment } from '../types';
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

interface TimelineProps {
  moments: Moment[];
}

const Timeline: React.FC<TimelineProps> = ({ moments }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMoments = useMemo(() => {
    let filtered = moments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(moment => 
        moment.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        moment.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by mood/tags
    if (filter !== 'all') {
      filtered = filtered.filter(moment => 
        moment.mood === filter || moment.tags?.includes(filter)
      );
    }

    return filtered;
  }, [moments, filter, searchTerm]);

  const groupedMoments = useMemo(() => {
    const groups: { [key: string]: Moment[] } = {};
    
    filteredMoments.forEach(moment => {
      const date = new Date(moment.timestamp);
      let groupKey = '';
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else if (isThisWeek(date)) {
        groupKey = 'This Week';
      } else if (isThisYear(date)) {
        groupKey = format(date, 'MMMM yyyy');
      } else {
        groupKey = format(date, 'MMMM yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(moment);
    });

    return groups;
  }, [filteredMoments]);

  const exportData = () => {
    const dataStr = JSON.stringify(moments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cappic-moments-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      '😊': 'Happy',
      '😢': 'Sad',
      '😡': 'Angry',
      '😴': 'Tired',
      '🤔': 'Thoughtful',
      '😍': 'In Love',
      '😎': 'Cool',
      '😭': 'Crying',
    };
    return moodMap[mood] || mood;
  };

  if (moments.length === 0) {
    return (
      <div className="card text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No moments yet</h3>
        <p className="text-gray-600 mb-6">
          Start capturing your moments to see them here in your timeline.
        </p>
        <button className="btn-primary">
          Capture Your First Moment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Timeline</h2>
            <p className="text-gray-600">
              {moments.length} moment{moments.length !== 1 ? 's' : ''} captured
            </p>
          </div>
          <button
            onClick={exportData}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search moments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All moments</option>
                <option value="😊">Happy</option>
                <option value="😢">Sad</option>
                <option value="😡">Angry</option>
                <option value="😴">Tired</option>
                <option value="🤔">Thoughtful</option>
                <option value="😍">In Love</option>
                <option value="😎">Cool</option>
                <option value="😭">Crying</option>
                <option value="work">Work</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="nature">Nature</option>
                <option value="art">Art</option>
                <option value="music">Music</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedMoments).map(([group, groupMoments]) => (
          <div key={group}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              {group}
            </h3>
            <div className="space-y-4">
              {groupMoments.map((moment) => (
                <div key={moment.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex space-x-4">
                    {moment.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={moment.imageUrl}
                          alt="Moment"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(moment.timestamp), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                        {moment.mood && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Smile className="w-4 h-4 text-gray-500" />
                            <span className="text-2xl">{moment.mood}</span>
                            <span className="text-gray-600">({getMoodEmoji(moment.mood)})</span>
                          </div>
                        )}
                      </div>
                      
                      {moment.note && (
                        <p className="text-gray-900 mt-2 leading-relaxed">
                          {moment.note}
                        </p>
                      )}
                      
                      {moment.tags && moment.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3">
                          <Tag className="w-4 h-4 text-gray-500" />
                          <div className="flex flex-wrap gap-1">
                            {moment.tags.map((tag) => (
                                                             <span
                                 key={tag}
                                 className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                               >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredMoments.length === 0 && moments.length > 0 && (
        <div className="card text-center py-8">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No moments match your filters</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Timeline; 