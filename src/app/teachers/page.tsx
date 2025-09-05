'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DataStorage } from '@/lib/data/storage';
import { Teacher, CreateTeacherForm, PostType } from '@/lib/types';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPost, setFilterPost] = useState<'all' | PostType>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateTeacherForm>({
    name: '',
    phone: '',
    email: '',
    post: 'TGT',
    subjects: []
  });

  const [newSubject, setNewSubject] = useState('');

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi',
    'Social Science', 'Computer Science', 'Economics', 'History', 'Geography'
  ];

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, filterPost]);

  const loadTeachers = () => {
    setLoading(true);
    const dataStorage = DataStorage.getInstance();
    const teacherData = dataStorage.getTeachers();
    setTeachers(teacherData);
    setLoading(false);
  };

  const filterTeachers = () => {
    let filtered = teachers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone.includes(searchTerm) ||
        teacher.subjects.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Post filter
    if (filterPost !== 'all') {
      filtered = filtered.filter(teacher => teacher.post === filterPost);
    }

    setFilteredTeachers(filtered);
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || formData.subjects.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        loadTeachers();
        setShowAddDialog(false);
        resetForm();
        alert('Teacher added successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      post: 'TGT',
      subjects: []
    });
    setNewSubject('');
  };

  const addSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject !== subjectToRemove)
    }));
  };

  const getStatusColor = (teacher: Teacher) => {
    if (!teacher.isAvailable) return 'bg-red-100 text-red-800';
    if (teacher.currentPeriods >= teacher.maxPeriods) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (teacher: Teacher) => {
    if (!teacher.isAvailable) return 'On Leave';
    if (teacher.currentPeriods >= teacher.maxPeriods) return 'Full Load';
    return 'Available';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          {[...Array(6)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600 mt-2">
            Manage teacher profiles, qualifications, and assignments.
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>Add New Teacher</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91-XXXXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="teacher@school.edu"
                />
              </div>

              <div>
                <Label htmlFor="post">Post *</Label>
                <Select value={formData.post} onValueChange={(value: PostType) => setFormData(prev => ({ ...prev, post: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select post" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TGT">TGT (Trained Graduate Teacher)</SelectItem>
                    <SelectItem value="PGT">PGT (Post Graduate Teacher)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  TGT: Classes 6-10, PGT: Classes 9-12
                </p>
              </div>

              <div>
                <Label>Subjects *</Label>
                <div className="flex space-x-2 mb-2">
                  <Select value={newSubject} onValueChange={setNewSubject}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select subject to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter(s => !formData.subjects.includes(s)).map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addSubject} disabled={!newSubject}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map(subject => (
                    <Badge key={subject} variant="secondary" className="cursor-pointer" onClick={() => removeSubject(subject)}>
                      {subject} ✕
                    </Badge>
                  ))}
                </div>
                {formData.subjects.length === 0 && (
                  <p className="text-sm text-red-500">Please add at least one subject</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Teacher</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search teachers by name, phone, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterPost} onValueChange={(value: 'all' | PostType) => setFilterPost(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by post" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="TGT">TGT Only</SelectItem>
            <SelectItem value="PGT">PGT Only</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-600">
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map(teacher => (
          <Card key={teacher.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{teacher.name}</CardTitle>
                  <p className="text-sm text-gray-600">{teacher.phone}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant="outline">{teacher.post}</Badge>
                  <Badge className={getStatusColor(teacher)}>
                    {getStatusText(teacher)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Subjects</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.subjects.map(subject => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Current Load</p>
                    <p className="font-medium">{teacher.currentPeriods}/{teacher.maxPeriods} periods</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Eligible Classes</p>
                    <p className="font-medium">
                      {teacher.post === 'PGT' ? '9-12' : '6-10'}
                    </p>
                  </div>
                </div>

                {teacher.email && (
                  <div className="text-sm">
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium text-xs">{teacher.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No teachers found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Teacher Detail Dialog */}
      {selectedTeacher && (
        <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTeacher.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Contact Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">📞 {selectedTeacher.phone}</p>
                      {selectedTeacher.email && (
                        <p className="text-sm">✉️ {selectedTeacher.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Professional Details</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{selectedTeacher.post}</Badge>
                        <Badge className={getStatusColor(selectedTeacher)}>
                          {getStatusText(selectedTeacher)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Eligible Classes: {selectedTeacher.post === 'PGT' ? '9, 10, 11, 12' : '6, 7, 8, 9, 10'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Teaching Load</Label>
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Current Periods</span>
                        <span className="font-medium">{selectedTeacher.currentPeriods}/{selectedTeacher.maxPeriods}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${(selectedTeacher.currentPeriods / selectedTeacher.maxPeriods) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Subject Expertise</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTeacher.subjects.map(subject => (
                        <Badge key={subject} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTeacher(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  Edit Profile
                </Button>
                <Button>
                  View Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}