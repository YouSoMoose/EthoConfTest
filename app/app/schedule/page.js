'use client';

import { useEffect, useState } from 'react';
import Loader from '@/components/Loader';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedule')
      .then(r => r.json())
      .then(data => { setSchedule(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-enter">
      <div className="page-header">
        <div className="max-w-lg mx-auto">
          <h1 className="font-heading text-2xl font-bold">📅 Schedule</h1>
          <p className="text-green-200 text-sm font-body mt-1">March 21, 2026</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-4 stagger-in">
          {schedule.map((item, i) => (
            <div key={item.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-green-200 flex-shrink-0 mt-1.5"></div>
                {i < schedule.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-green-300 to-green-100 mt-1"></div>
                )}
              </div>

              {/* Event card */}
              <div className="glass-card p-4 flex-1 mb-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-heading font-bold text-green-900">{item.title}</h3>
                  <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {item.start_time}
                  </span>
                </div>
                {item.description && (
                  <p className="text-gray-500 text-sm font-body mt-2">{item.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  {item.location && (
                    <span className="text-xs text-amber-700 font-body">📍 {item.location}</span>
                  )}
                  {item.end_time && (
                    <span className="text-xs text-gray-400 font-body">
                      {item.start_time} — {item.end_time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
