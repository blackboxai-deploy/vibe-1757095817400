'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataStorage } from '@/lib/data/storage';
import { Substitution, LeaveRequest, Teacher } from '@/lib/types';

interface SubstitutionData {
  substitutions: Substitution[];
  leaveRequests: LeaveRequest[];
  active: Substitution[];
  pending: LeaveRequest[];
}

export default function SubstitutionPage() {
  const [data, setData] = useState<SubstitutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  // Form states
  const [leaveForm, setLeaveForm] = useState({
    teacherId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
    loadTeachers();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/substitution');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading substitution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = () => {
    const dataStorage = DataStorage.getInstance();
    setTeachers(dataStorage.getTeachers());
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/substitution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'leave_request',
          ...leaveForm
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadData();
        setShowLeaveDialog(false);
        setLeaveForm({ teacherId: '', startDate: '', endDate: '', reason: '' });
        alert('Leave request submitted successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request.');
    }
  };

  const handleApproveLeave = async (leaveRequestId: string) => {
    try {
      const response = await fetch('/api/substitution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'approve_leave',
          leaveRequestId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadData();
        alert(result.message);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave request.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'Unknown Teacher';
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="mb-4">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Failed to load data</h3>
        <p className="text-gray-600">Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Substitution Management</h1>
          <p className="text-gray-600 mt-2">
            Manage teacher leave requests and automatic substitution assignments.
          </p>
        </div>

        <div className="flex space-x-3">
          <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Submit Leave Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitLeave} className="space-y-4">
                <div>
                  <Label htmlFor="teacherId">Teacher *</Label>
                  <Select value={leaveForm.teacherId} onValueChange={(value) => setLeaveForm(prev => ({ ...prev, teacherId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.post})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason *</Label>
                  <Textarea
                    id="reason"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter reason for leave"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowLeaveDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button>Emergency Substitute</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{data.active.length}</div>
            <p className="text-sm text-gray-600">Active Substitutions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{data.pending.length}</div>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {data.substitutions.filter(s => s.autoAssigned).length}
            </div>
            <p className="text-sm text-gray-600">Auto-Assigned Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {teachers.filter(t => !t.isAvailable).length}
            </div>
            <p className="text-sm text-gray-600">Teachers on Leave</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Leave Requests */}
      {data.pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.pending.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{getTeacherName(request.teacherId)}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                    <p className="text-sm text-gray-600">Reason: {request.reason}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveLeave(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve & Auto-Assign
                    </Button>
                    <Button size="sm" variant="outline">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Substitutions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Substitutions</CardTitle>
        </CardHeader>
        <CardContent>
          {data.active.length > 0 ? (
            <div className="space-y-4">
              {data.active.map(substitution => (
                <div key={substitution.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">
                        {getTeacherName(substitution.substituteTeacherId)} 
                        <span className="text-gray-500"> covering for </span>
                        {getTeacherName(substitution.originalTeacherId)}
                      </h3>
                      <Badge className={getStatusColor(substitution.status)}>
                        {substitution.status}
                      </Badge>
                      {substitution.autoAssigned && (
                        <Badge variant="outline" className="text-xs">
                          Auto-Assigned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Date: {formatDate(substitution.date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reason: {substitution.reason}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
              </div>
              <p className="font-medium">No active substitutions</p>
              <p className="text-sm">All teachers are in their regular assignments.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Substitutions History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Substitution History</CardTitle>
        </CardHeader>
        <CardContent>
          {data.substitutions.length > 0 ? (
            <div className="space-y-3">
              {data.substitutions.slice(0, 10).map(substitution => (
                <div key={substitution.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {getTeacherName(substitution.substituteTeacherId)} → {getTeacherName(substitution.originalTeacherId)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(substitution.date)} • {substitution.reason}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {substitution.autoAssigned && (
                      <Badge variant="outline" className="text-xs">Auto</Badge>
                    )}
                    <Badge className={getStatusColor(substitution.status)}>
                      {substitution.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium">No substitution history</p>
              <p className="text-sm">Substitution records will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}