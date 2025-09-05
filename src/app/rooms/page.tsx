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
import { Room, CreateRoomForm } from '@/lib/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Room['type']>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateRoomForm>({
    name: '',
    capacity: 30,
    type: 'classroom',
    resources: []
  });

  const [newResource, setNewResource] = useState('');

  const roomTypes: { value: Room['type']; label: string }[] = [
    { value: 'classroom', label: 'Classroom' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'auditorium', label: 'Auditorium' },
    { value: 'library', label: 'Library' },
    { value: 'other', label: 'Other' }
  ];

  const commonResources = [
    'Projector', 'Whiteboard', 'Blackboard', 'AC', 'Fan', 'Speakers',
    'Computer', 'Internet', 'Lab Equipment', 'Safety Kit', 'Tables', 'Chairs'
  ];

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, filterType]);

  const loadRooms = () => {
    setLoading(true);
    const dataStorage = DataStorage.getInstance();
    const roomData = dataStorage.getRooms();
    setRooms(roomData);
    setLoading(false);
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.resources.some(resource => 
          resource.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(room => room.type === filterType);
    }

    setFilteredRooms(filtered);
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.capacity <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const dataStorage = DataStorage.getInstance();
      dataStorage.addRoom({
        ...formData,
        isAvailable: true,
        bookings: []
      });

      loadRooms();
      setShowAddDialog(false);
      resetForm();
      alert('Room added successfully!');
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 30,
      type: 'classroom',
      resources: []
    });
    setNewResource('');
  };

  const addResource = () => {
    if (newResource && !formData.resources.includes(newResource)) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, newResource]
      }));
      setNewResource('');
    }
  };

  const removeResource = (resourceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource !== resourceToRemove)
    }));
  };

  const getStatusColor = (room: Room) => {
    return room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (room: Room) => {
    return room.isAvailable ? 'Available' : 'Occupied';
  };

  const getTypeIcon = (type: Room['type']) => {
    switch (type) {
      case 'classroom': return '🏫';
      case 'lab': return '🔬';
      case 'auditorium': return '🎭';
      case 'library': return '📚';
      default: return '🏢';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-2">
            Manage classroom allocation, resources, and availability.
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>Add New Room</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Room Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Room 101, Physics Lab"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    placeholder="Number of students"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Room Type *</Label>
                <Select value={formData.type} onValueChange={(value: Room['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {getTypeIcon(type.value)} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resources & Equipment</Label>
                <div className="flex space-x-2 mb-2">
                  <Select value={newResource} onValueChange={setNewResource}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select resource to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonResources.filter(r => !formData.resources.includes(r)).map(resource => (
                        <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type custom resource"
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addResource} disabled={!newResource}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.resources.map(resource => (
                    <Badge key={resource} variant="secondary" className="cursor-pointer" onClick={() => removeResource(resource)}>
                      {resource} ✕
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Room</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search rooms by name, type, or resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={(value: 'all' | Room['type']) => setFilterType(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Room Types</SelectItem>
            {roomTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {getTypeIcon(type.value)} {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-600">
          Showing {filteredRooms.length} of {rooms.length} rooms
        </div>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{rooms.length}</div>
            <p className="text-sm text-gray-600">Total Rooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {rooms.filter(r => r.isAvailable).length}
            </div>
            <p className="text-sm text-gray-600">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {rooms.filter(r => !r.isAvailable).length}
            </div>
            <p className="text-sm text-gray-600">Occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {Math.round((rooms.reduce((acc, room) => acc + room.capacity, 0) / rooms.length) || 0)}
            </div>
            <p className="text-sm text-gray-600">Avg. Capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedRoom(room)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{getTypeIcon(room.type)}</span>
                    <span>{room.name}</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1 capitalize">{room.type}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(room)}>
                    {getStatusText(room)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Capacity</p>
                    <p className="font-medium text-xl">{room.capacity} students</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Resources</p>
                    <p className="font-medium">{room.resources.length} items</p>
                  </div>
                </div>
                
                {room.resources.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Available Resources</p>
                    <div className="flex flex-wrap gap-1">
                      {room.resources.slice(0, 3).map(resource => (
                        <Badge key={resource} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                      {room.resources.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.resources.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p>Bookings: {room.bookings.length} scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No rooms found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Room Detail Dialog */}
      {selectedRoom && (
        <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span>{getTypeIcon(selectedRoom.type)}</span>
                <span>{selectedRoom.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Room Details</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedRoom.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Capacity</span>
                        <span className="font-medium">{selectedRoom.capacity} students</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge className={getStatusColor(selectedRoom)}>
                          {getStatusText(selectedRoom)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Utilization</Label>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current Bookings</span>
                        <span className="font-medium">{selectedRoom.bookings.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${Math.min((selectedRoom.bookings.length / 8) * 100, 100)}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Daily utilization estimate
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Resources & Equipment</Label>
                    {selectedRoom.resources.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRoom.resources.map(resource => (
                          <Badge key={resource} variant="secondary">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">No resources listed</p>
                    )}
                  </div>

                  <div>
                    <Label>Recent Activity</Label>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Added: {new Date(selectedRoom.createdAt).toLocaleDateString()}</p>
                      <p>Last updated: {new Date(selectedRoom.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedRoom(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  Edit Room
                </Button>
                <Button>
                  Book Room
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}