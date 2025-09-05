'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Welcome & Date */}
        <div className="flex items-center space-x-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}!
            </h2>
            <p className="text-gray-600 text-sm">{formatDate(currentTime)}</p>
          </div>
        </div>

        {/* Right Section - Time & Quick Actions */}
        <div className="flex items-center space-x-4">
          {/* Current Time */}
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-lg font-mono font-semibold text-gray-900">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-gray-500">Current Time</div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="flex items-center space-x-3">
            <Card className="px-3 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Period {getCurrentPeriod()}</span>
              </div>
            </Card>

            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative">
              Notifications
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 text-xs min-w-5 h-5 flex items-center justify-center"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Emergency Actions */}
            <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
              Emergency Sub
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Active Substitutions: 2</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>Pending Leave Requests: 1</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Teachers on Leave: 1</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Room Utilization: 85%</span>
        </div>
      </div>
    </header>
  );
}

// Helper function to get current period based on time
function getCurrentPeriod(): number {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

  // School timings (in minutes from midnight)
  const periods = [
    { period: 1, start: 9 * 60, end: 9 * 60 + 40 }, // 9:00-9:40
    { period: 2, start: 9 * 60 + 40, end: 10 * 60 + 20 }, // 9:40-10:20
    // Break: 10:20-10:35
    { period: 3, start: 10 * 60 + 35, end: 11 * 60 + 15 }, // 10:35-11:15
    { period: 4, start: 11 * 60 + 15, end: 11 * 60 + 55 }, // 11:15-11:55
    // Lunch: 11:55-12:40
    { period: 5, start: 12 * 60 + 40, end: 13 * 60 + 20 }, // 12:40-13:20
    { period: 6, start: 13 * 60 + 20, end: 14 * 60 }, // 13:20-14:00
    { period: 7, start: 14 * 60, end: 14 * 60 + 40 }, // 14:00-14:40
    { period: 8, start: 14 * 60 + 40, end: 15 * 60 + 20 }, // 14:40-15:20
  ];

  for (const p of periods) {
    if (currentTime >= p.start && currentTime < p.end) {
      return p.period;
    }
  }

  // Before school starts or after school ends
  if (currentTime < periods[0].start) return 0; // Before school
  return periods.length + 1; // After school
}