// Core TypeScript interfaces for School Management System

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  email?: string;
  post: 'PGT' | 'TGT';
  subjects: string[];
  eligibleClasses: number[];
  currentPeriods: number;
  maxPeriods: number;
  isAvailable: boolean;
  leaveRequests: LeaveRequest[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  grade: number;
  section: string;
  subjects: string[];
  roomId: string;
  strength: number;
  classTeacherId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'auditorium' | 'library' | 'other';
  resources: string[];
  isAvailable: boolean;
  bookings: RoomBooking[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Period {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  isSubstitution: boolean;
  originalTeacherId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  eligiblePosts: ('PGT' | 'TGT')[];
  eligibleClasses: number[];
  periodsPerWeek: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  teacherId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  affectedPeriods: string[];
  substitutions: Substitution[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Substitution {
  id: string;
  periodId: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  date: Date;
  status: 'assigned' | 'completed' | 'cancelled';
  reason: string;
  autoAssigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  purpose: string;
  bookedBy: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Timetable {
  id: string;
  classId: string;
  periods: Period[];
  academicYear: string;
  semester: 'first' | 'second';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: 'class_reminder' | 'schedule_change' | 'substitution' | 'leave_request';
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Business rule constants
export const BUSINESS_RULES = {
  PGT_ELIGIBLE_CLASSES: [9, 10, 11, 12],
  TGT_ELIGIBLE_CLASSES: [6, 7, 8, 9, 10],
  MAX_PERIODS_PER_DAY: 6,
  PERIODS_PER_DAY: 8,
  WORKING_DAYS: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const,
  DEFAULT_PERIOD_DURATION: 40, // minutes
  BREAK_DURATION: 15, // minutes
};

// Utility types
export type DayOfWeek = typeof BUSINESS_RULES.WORKING_DAYS[number];
export type PostType = 'PGT' | 'TGT';
export type NotificationType = 'class_reminder' | 'schedule_change' | 'substitution' | 'leave_request';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface CreateTeacherForm {
  name: string;
  phone: string;
  email?: string;
  post: PostType;
  subjects: string[];
}

export interface CreateClassForm {
  grade: number;
  section: string;
  subjects: string[];
  roomId: string;
  strength: number;
  classTeacherId?: string;
}

export interface CreateRoomForm {
  name: string;
  capacity: number;
  type: Room['type'];
  resources: string[];
}

export interface LeaveRequestForm {
  teacherId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalTeachers: number;
  totalClasses: number;
  totalRooms: number;
  activeSubstitutions: number;
  pendingLeaveRequests: number;
  todaySubstitutions: number;
  teachersOnLeave: number;
  roomUtilization: number;
}

// Time slot configuration
export interface TimeSlot {
  periodNumber: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  breakType?: 'short' | 'lunch' | 'assembly';
}

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { periodNumber: 1, startTime: '09:00', endTime: '09:40', isBreak: false },
  { periodNumber: 2, startTime: '09:40', endTime: '10:20', isBreak: false },
  { periodNumber: 0, startTime: '10:20', endTime: '10:35', isBreak: true, breakType: 'short' },
  { periodNumber: 3, startTime: '10:35', endTime: '11:15', isBreak: false },
  { periodNumber: 4, startTime: '11:15', endTime: '11:55', isBreak: false },
  { periodNumber: 0, startTime: '11:55', endTime: '12:40', isBreak: true, breakType: 'lunch' },
  { periodNumber: 5, startTime: '12:40', endTime: '13:20', isBreak: false },
  { periodNumber: 6, startTime: '13:20', endTime: '14:00', isBreak: false },
  { periodNumber: 7, startTime: '14:00', endTime: '14:40', isBreak: false },
  { periodNumber: 8, startTime: '14:40', endTime: '15:20', isBreak: false },
];