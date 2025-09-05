'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataStorage } from '@/lib/data/storage';
import { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      const dataStorage = DataStorage.getInstance();
      
      const teachers = dataStorage.getTeachers();
      const classes = dataStorage.getClasses();
      const rooms = dataStorage.getRooms();
      const substitutions = dataStorage.getSubstitutions();
      const leaveRequests = dataStorage.getLeaveRequests();
      
      // Calculate statistics
      const dashboardStats: DashboardStats = {
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        totalRooms: rooms.length,
        activeSubstitutions: substitutions.filter(s => s.status === 'assigned').length,
        pendingLeaveRequests: leaveRequests.filter(r => r.status === 'pending').length,
        todaySubstitutions: substitutions.filter(s => {
          const today = new Date();
          const subDate = new Date(s.date);
          return subDate.toDateString() === today.toDateString();
        }).length,
        teachersOnLeave: teachers.filter(t => !t.isAvailable).length,
        roomUtilization: Math.round((rooms.filter(r => !r.isAvailable).length / rooms.length) * 100),
      };

      setStats(dashboardStats);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the School Management System. Monitor and manage your school's timetable and substitution operations.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Teachers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-gray-600">
              {stats.teachersOnLeave > 0 && (
                <span className="text-red-600">{stats.teachersOnLeave} on leave</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Classes Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-gray-600">Active academic sessions</p>
          </CardContent>
        </Card>

        {/* Rooms Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Utilization</CardTitle>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roomUtilization}%</div>
            <p className="text-xs text-gray-600">{stats.totalRooms} total rooms</p>
          </CardContent>
        </Card>

        {/* Substitutions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Substitutions</CardTitle>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubstitutions}</div>
            <p className="text-xs text-gray-600">
              {stats.todaySubstitutions} today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.pendingLeaveRequests > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Pending Leave Requests</p>
                    <p className="text-xs text-gray-600">{stats.pendingLeaveRequests} requests need approval</p>
                  </div>
                </div>
                <Badge variant="secondary">{stats.pendingLeaveRequests}</Badge>
              </div>
            )}

            {stats.activeSubstitutions > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Active Substitutions</p>
                    <p className="text-xs text-gray-600">Teachers covering for absent colleagues</p>
                  </div>
                </div>
                <Badge variant="secondary">{stats.activeSubstitutions}</Badge>
              </div>
            )}

            {stats.roomUtilization > 90 && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">High Room Utilization</p>
                    <p className="text-xs text-gray-600">Room availability is critically low</p>
                  </div>
                </div>
                <Badge variant="destructive">{stats.roomUtilization}%</Badge>
              </div>
            )}

            {stats.pendingLeaveRequests === 0 && stats.activeSubstitutions === 0 && stats.roomUtilization <= 90 && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                </div>
                <p className="font-medium">All systems running smoothly!</p>
                <p className="text-sm">No urgent issues require attention.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/teachers">
                <div className="text-left">
                  <div className="font-medium">Add New Teacher</div>
                  <div className="text-xs text-gray-500">Register new teaching staff</div>
                </div>
              </a>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/timetable">
                <div className="text-left">
                  <div className="font-medium">Create Timetable</div>
                  <div className="text-xs text-gray-500">Generate class schedules</div>
                </div>
              </a>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/substitution/requests">
                <div className="text-left">
                  <div className="font-medium">Process Leave Request</div>
                  <div className="text-xs text-gray-500">Handle teacher absences</div>
                </div>
              </a>
            </Button>

            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/rooms">
                <div className="text-left">
                  <div className="font-medium">Manage Rooms</div>
                  <div className="text-xs text-gray-500">Allocate classroom resources</div>
                </div>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900">Academic Year</p>
              <p className="text-gray-600">2024-2025</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Current Semester</p>
              <p className="text-gray-600">First Semester</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Working Days</p>
              <p className="text-gray-600">Monday - Saturday</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Periods per Day</p>
              <p className="text-gray-600">8 Periods</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}