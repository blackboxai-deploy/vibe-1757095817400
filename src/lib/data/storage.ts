// Data storage management for School Management System
import { 
  Teacher, 
  Class, 
  Room, 
  Subject, 
  Period, 
  LeaveRequest, 
  Substitution,
  Timetable,
  Notification
} from '../types';

// Sample data for initialization
export const SAMPLE_SUBJECTS: Subject[] = [
  { id: 'sub1', name: 'Mathematics', code: 'MATH', eligiblePosts: ['PGT'], eligibleClasses: [9, 10, 11, 12], periodsPerWeek: 6, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sub2', name: 'Physics', code: 'PHY', eligiblePosts: ['PGT'], eligibleClasses: [9, 10, 11, 12], periodsPerWeek: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sub3', name: 'Chemistry', code: 'CHEM', eligiblePosts: ['PGT'], eligibleClasses: [9, 10, 11, 12], periodsPerWeek: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sub4', name: 'Biology', code: 'BIO', eligiblePosts: ['PGT'], eligibleClasses: [9, 10, 11, 12], periodsPerWeek: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sub5', name: 'English', code: 'ENG', eligiblePosts: ['TGT', 'PGT'], eligibleClasses: [6, 7, 8, 9, 10, 11, 12], periodsPerWeek: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sub6', name: 'Hindi', code: 'HIN', eligiblePosts: ['TGT', 'PGT'], eligibleClasses: [6, 7, 8, 9, 10, 11, 12], periodsPerWeek: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sub7', name: 'Social Science', code: 'SST', eligiblePosts: ['TGT'], eligibleClasses: [6, 7, 8, 9, 10], periodsPerWeek: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sub8', name: 'Computer Science', code: 'CS', eligiblePosts: ['PGT'], eligibleClasses: [9, 10, 11, 12], periodsPerWeek: 3, createdAt: new Date(), updatedAt: new Date() },
];

export const SAMPLE_TEACHERS: Teacher[] = [
  {
    id: 'teacher1',
    name: 'Dr. Rajesh Kumar',
    phone: '+91-9876543210',
    email: 'rajesh.kumar@school.edu',
    post: 'PGT',
    subjects: ['Mathematics', 'Physics'],
    eligibleClasses: [9, 10, 11, 12],
    currentPeriods: 5,
    maxPeriods: 6,
    isAvailable: true,
    leaveRequests: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'teacher2',
    name: 'Mrs. Priya Sharma',
    phone: '+91-9876543211',
    email: 'priya.sharma@school.edu',
    post: 'TGT',
    subjects: ['English', 'Hindi'],
    eligibleClasses: [6, 7, 8, 9, 10],
    currentPeriods: 4,
    maxPeriods: 6,
    isAvailable: true,
    leaveRequests: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'teacher3',
    name: 'Mr. Amit Singh',
    phone: '+91-9876543212',
    email: 'amit.singh@school.edu',
    post: 'PGT',
    subjects: ['Chemistry', 'Biology'],
    eligibleClasses: [9, 10, 11, 12],
    currentPeriods: 6,
    maxPeriods: 6,
    isAvailable: true,
    leaveRequests: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'teacher4',
    name: 'Ms. Sunita Gupta',
    phone: '+91-9876543213',
    email: 'sunita.gupta@school.edu',
    post: 'TGT',
    subjects: ['Social Science', 'English'],
    eligibleClasses: [6, 7, 8, 9, 10],
    currentPeriods: 3,
    maxPeriods: 6,
    isAvailable: true,
    leaveRequests: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

export const SAMPLE_ROOMS: Room[] = [
  {
    id: 'room1',
    name: 'Room 101',
    capacity: 40,
    type: 'classroom',
    resources: ['Projector', 'Whiteboard', 'AC'],
    isAvailable: true,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'room2',
    name: 'Room 102',
    capacity: 35,
    type: 'classroom',
    resources: ['Whiteboard', 'Fan'],
    isAvailable: true,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'room3',
    name: 'Physics Lab',
    capacity: 30,
    type: 'lab',
    resources: ['Lab Equipment', 'Safety Kit', 'Projector'],
    isAvailable: true,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'room4',
    name: 'Computer Lab',
    capacity: 25,
    type: 'lab',
    resources: ['Computers', 'Projector', 'AC', 'Internet'],
    isAvailable: true,
    bookings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

export const SAMPLE_CLASSES: Class[] = [
  {
    id: 'class1',
    grade: 9,
    section: 'A',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi'],
    roomId: 'room1',
    strength: 35,
    classTeacherId: 'teacher1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'class2',
    grade: 9,
    section: 'B',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi'],
    roomId: 'room2',
    strength: 32,
    classTeacherId: 'teacher2',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'class3',
    grade: 10,
    section: 'A',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science'],
    roomId: 'room3',
    strength: 30,
    classTeacherId: 'teacher3',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'class4',
    grade: 8,
    section: 'A',
    subjects: ['Mathematics', 'English', 'Hindi', 'Social Science'],
    roomId: 'room4',
    strength: 38,
    classTeacherId: 'teacher4',
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

// Data storage class
export class DataStorage {
  private static instance: DataStorage;
  private data: {
    teachers: Teacher[];
    classes: Class[];
    rooms: Room[];
    subjects: Subject[];
    periods: Period[];
    leaveRequests: LeaveRequest[];
    substitutions: Substitution[];
    timetables: Timetable[];
    notifications: Notification[];
  };

  private constructor() {
    this.data = {
      teachers: [...SAMPLE_TEACHERS],
      classes: [...SAMPLE_CLASSES],
      rooms: [...SAMPLE_ROOMS],
      subjects: [...SAMPLE_SUBJECTS],
      periods: [],
      leaveRequests: [],
      substitutions: [],
      timetables: [],
      notifications: [],
    };
    this.loadFromStorage();
  }

  static getInstance(): DataStorage {
    if (!DataStorage.instance) {
      DataStorage.instance = new DataStorage();
    }
    return DataStorage.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('schoolManagementData');
      if (stored) {
        const parsedData = JSON.parse(stored);
        this.data = { ...this.data, ...parsedData };
      }
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('schoolManagementData', JSON.stringify(this.data));
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error);
    }
  }

  // Teachers CRUD operations
  getTeachers(): Teacher[] {
    return this.data.teachers;
  }

  getTeacher(id: string): Teacher | undefined {
    return this.data.teachers.find(teacher => teacher.id === id);
  }

  addTeacher(teacher: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Teacher {
    const newTeacher: Teacher = {
      ...teacher,
      id: `teacher${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.teachers.push(newTeacher);
    this.saveToStorage();
    return newTeacher;
  }

  updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
    const index = this.data.teachers.findIndex(teacher => teacher.id === id);
    if (index === -1) return null;
    
    this.data.teachers[index] = {
      ...this.data.teachers[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.saveToStorage();
    return this.data.teachers[index];
  }

  deleteTeacher(id: string): boolean {
    const index = this.data.teachers.findIndex(teacher => teacher.id === id);
    if (index === -1) return false;
    
    this.data.teachers.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Classes CRUD operations
  getClasses(): Class[] {
    return this.data.classes;
  }

  getClass(id: string): Class | undefined {
    return this.data.classes.find(cls => cls.id === id);
  }

  addClass(cls: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Class {
    const newClass: Class = {
      ...cls,
      id: `class${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.classes.push(newClass);
    this.saveToStorage();
    return newClass;
  }

  // Rooms CRUD operations
  getRooms(): Room[] {
    return this.data.rooms;
  }

  getRoom(id: string): Room | undefined {
    return this.data.rooms.find(room => room.id === id);
  }

  addRoom(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Room {
    const newRoom: Room = {
      ...room,
      id: `room${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.rooms.push(newRoom);
    this.saveToStorage();
    return newRoom;
  }

  // Subjects CRUD operations
  getSubjects(): Subject[] {
    return this.data.subjects;
  }

  getSubject(id: string): Subject | undefined {
    return this.data.subjects.find(subject => subject.id === id);
  }

  // Leave Requests operations
  getLeaveRequests(): LeaveRequest[] {
    return this.data.leaveRequests;
  }

  addLeaveRequest(request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>): LeaveRequest {
    const newRequest: LeaveRequest = {
      ...request,
      id: `leave${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.leaveRequests.push(newRequest);
    this.saveToStorage();
    return newRequest;
  }

  // Substitutions operations
  getSubstitutions(): Substitution[] {
    return this.data.substitutions;
  }

  addSubstitution(substitution: Omit<Substitution, 'id' | 'createdAt' | 'updatedAt'>): Substitution {
    const newSubstitution: Substitution = {
      ...substitution,
      id: `sub${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.substitutions.push(newSubstitution);
    this.saveToStorage();
    return newSubstitution;
  }

  // Periods operations
  getPeriods(): Period[] {
    return this.data.periods;
  }

  addPeriod(period: Omit<Period, 'id' | 'createdAt' | 'updatedAt'>): Period {
    const newPeriod: Period = {
      ...period,
      id: `period${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.periods.push(newPeriod);
    this.saveToStorage();
    return newPeriod;
  }

  // Reset data (for testing)
  resetData(): void {
    this.data = {
      teachers: [...SAMPLE_TEACHERS],
      classes: [...SAMPLE_CLASSES],
      rooms: [...SAMPLE_ROOMS],
      subjects: [...SAMPLE_SUBJECTS],
      periods: [],
      leaveRequests: [],
      substitutions: [],
      timetables: [],
      notifications: [],
    };
    this.saveToStorage();
  }
}