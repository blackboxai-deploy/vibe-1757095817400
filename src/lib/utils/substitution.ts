// Automatic teacher substitution logic
import { Teacher, Period, LeaveRequest, Substitution, BUSINESS_RULES } from '../types';
import { DataStorage } from '../data/storage';

export class SubstitutionEngine {
  private dataStorage: DataStorage;

  constructor() {
    this.dataStorage = DataStorage.getInstance();
  }

  /**
   * Find available substitute teachers for a given period
   */
  findAvailableSubstitutes(period: Period, leaveTeacherId: string): Teacher[] {
    const allTeachers = this.dataStorage.getTeachers();
    const teacherOnLeave = this.dataStorage.getTeacher(leaveTeacherId);
    const classData = this.dataStorage.getClass(period.classId);
    const subjectData = this.dataStorage.getSubject(period.subjectId);

    if (!teacherOnLeave || !classData || !subjectData) {
      return [];
    }

    // Get all periods for the same day and time to check conflicts
    const allPeriods = this.dataStorage.getPeriods();
    const conflictingPeriods = allPeriods.filter(p => 
      p.day === period.day && 
      p.periodNumber === period.periodNumber &&
      p.id !== period.id
    );

    const availableTeachers = allTeachers.filter(teacher => {
      // Skip the teacher on leave
      if (teacher.id === leaveTeacherId) return false;
      
      // Check if teacher is available
      if (!teacher.isAvailable) return false;
      
      // Check post eligibility (PGT for classes 9-12, TGT for classes 6-10)
      if (teacher.post === 'PGT' && !BUSINESS_RULES.PGT_ELIGIBLE_CLASSES.includes(classData.grade)) {
        return false;
      }
      if (teacher.post === 'TGT' && !BUSINESS_RULES.TGT_ELIGIBLE_CLASSES.includes(classData.grade)) {
        return false;
      }

      // Check if teacher can teach the subject
      if (!teacher.subjects.includes(subjectData.name)) return false;

      // Check if teacher is already assigned to another class at the same time
      const hasConflict = conflictingPeriods.some(p => p.teacherId === teacher.id);
      if (hasConflict) return false;

      // Check if teacher has not exceeded maximum periods (6 per day)
      if (teacher.currentPeriods >= BUSINESS_RULES.MAX_PERIODS_PER_DAY) {
        return false;
      }

      return true;
    });

    // Sort by priority: subject expertise, current load, then alphabetically
    return availableTeachers.sort((a, b) => {
      // Priority 1: Subject expertise (teachers who have taught this subject)
      const aSubjectMatch = a.subjects.includes(subjectData.name);
      const bSubjectMatch = b.subjects.includes(subjectData.name);
      
      if (aSubjectMatch && !bSubjectMatch) return -1;
      if (!aSubjectMatch && bSubjectMatch) return 1;

      // Priority 2: Current workload (prefer teachers with fewer periods)
      const loadDiff = a.currentPeriods - b.currentPeriods;
      if (loadDiff !== 0) return loadDiff;

      // Priority 3: Alphabetical order
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Automatically assign substitute teacher for a period
   */
  assignSubstitute(period: Period, leaveTeacherId: string, reason: string): Substitution | null {
    const availableTeachers = this.findAvailableSubstitutes(period, leaveTeacherId);
    
    if (availableTeachers.length === 0) {
      return null; // No suitable substitute found
    }

    // Select the best substitute (first in the sorted list)
    const substituteTeacher = availableTeachers[0];

    // Create substitution record
    const substitution = this.dataStorage.addSubstitution({
      periodId: period.id,
      originalTeacherId: leaveTeacherId,
      substituteTeacherId: substituteTeacher.id,
      date: new Date(),
      status: 'assigned',
      reason,
      autoAssigned: true,
    });

    // Update the period with substitute teacher
    this.dataStorage.updateTeacher(substituteTeacher.id, {
      currentPeriods: substituteTeacher.currentPeriods + 1,
    });

    return substitution;
  }

  /**
   * Process leave request and assign substitutes for all affected periods
   */
  processLeaveRequest(leaveRequest: LeaveRequest): {
    successful: Substitution[];
    failed: Period[];
  } {
    const successful: Substitution[] = [];
    const failed: Period[] = [];

    // Get all periods affected by the leave request
    const allPeriods = this.dataStorage.getPeriods();
    const affectedPeriods = allPeriods.filter(period => 
      leaveRequest.affectedPeriods.includes(period.id)
    );

    for (const period of affectedPeriods) {
      const substitution = this.assignSubstitute(
        period, 
        leaveRequest.teacherId, 
        `Leave: ${leaveRequest.reason}`
      );

      if (substitution) {
        successful.push(substitution);
      } else {
        failed.push(period);
      }
    }

    return { successful, failed };
  }

  /**
   * Check for schedule conflicts
   */
  checkScheduleConflicts(teacherId: string, day: string, periodNumber: number): boolean {
    const allPeriods = this.dataStorage.getPeriods();
    
    return allPeriods.some(period => 
      period.teacherId === teacherId && 
      period.day === day && 
      period.periodNumber === periodNumber
    );
  }

  /**
   * Get teacher's current day schedule
   */
  getTeacherDaySchedule(teacherId: string, day: string): Period[] {
    const allPeriods = this.dataStorage.getPeriods();
    
    return allPeriods.filter(period => 
      period.teacherId === teacherId && 
      period.day === day
    ).sort((a, b) => a.periodNumber - b.periodNumber);
  }

  /**
   * Calculate teacher's daily workload
   */
  calculateDailyWorkload(teacherId: string, day: string): {
    regularPeriods: number;
    substitutionPeriods: number;
    totalPeriods: number;
    canTakeMore: boolean;
  } {
    const daySchedule = this.getTeacherDaySchedule(teacherId, day);
    
    const regularPeriods = daySchedule.filter(p => !p.isSubstitution).length;
    const substitutionPeriods = daySchedule.filter(p => p.isSubstitution).length;
    const totalPeriods = daySchedule.length;
    const canTakeMore = totalPeriods < BUSINESS_RULES.MAX_PERIODS_PER_DAY;

    return {
      regularPeriods,
      substitutionPeriods,
      totalPeriods,
      canTakeMore,
    };
  }

  /**
   * Generate substitution report
   */
  generateSubstitutionReport(startDate: Date, endDate: Date): {
    totalSubstitutions: number;
    successfulAssignments: number;
    failedAssignments: number;
    teacherWorkload: { [teacherId: string]: number };
    mostActiveSubstitutes: Teacher[];
  } {
    const allSubstitutions = this.dataStorage.getSubstitutions();
    const filteredSubstitutions = allSubstitutions.filter(sub => {
      const subDate = new Date(sub.date);
      return subDate >= startDate && subDate <= endDate;
    });

    const totalSubstitutions = filteredSubstitutions.length;
    const successfulAssignments = filteredSubstitutions.filter(s => s.status === 'assigned' || s.status === 'completed').length;
    const failedAssignments = totalSubstitutions - successfulAssignments;

    // Calculate teacher workload
    const teacherWorkload: { [teacherId: string]: number } = {};
    filteredSubstitutions.forEach(sub => {
      teacherWorkload[sub.substituteTeacherId] = (teacherWorkload[sub.substituteTeacherId] || 0) + 1;
    });

    // Get most active substitutes
    const allTeachers = this.dataStorage.getTeachers();
    const mostActiveSubstitutes = allTeachers
      .filter(teacher => teacherWorkload[teacher.id] > 0)
      .sort((a, b) => (teacherWorkload[b.id] || 0) - (teacherWorkload[a.id] || 0))
      .slice(0, 5);

    return {
      totalSubstitutions,
      successfulAssignments,
      failedAssignments,
      teacherWorkload,
      mostActiveSubstitutes,
    };
  }

  /**
   * Validate business rules for teacher assignment
   */
  validateTeacherAssignment(teacherId: string, classGrade: number, subjectName: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const teacher = this.dataStorage.getTeacher(teacherId);
    
    if (!teacher) {
      errors.push('Teacher not found');
      return { isValid: false, errors };
    }

    // Check post eligibility
    if (teacher.post === 'PGT' && !BUSINESS_RULES.PGT_ELIGIBLE_CLASSES.includes(classGrade)) {
      errors.push(`PGT teachers can only teach classes ${BUSINESS_RULES.PGT_ELIGIBLE_CLASSES.join(', ')}`);
    }
    
    if (teacher.post === 'TGT' && !BUSINESS_RULES.TGT_ELIGIBLE_CLASSES.includes(classGrade)) {
      errors.push(`TGT teachers can only teach classes ${BUSINESS_RULES.TGT_ELIGIBLE_CLASSES.join(', ')}`);
    }

    // Check subject qualification
    if (!teacher.subjects.includes(subjectName)) {
      errors.push(`Teacher is not qualified to teach ${subjectName}`);
    }

    // Check availability
    if (!teacher.isAvailable) {
      errors.push('Teacher is currently not available');
    }

    // Check period limit
    if (teacher.currentPeriods >= BUSINESS_RULES.MAX_PERIODS_PER_DAY) {
      errors.push(`Teacher has already reached the maximum limit of ${BUSINESS_RULES.MAX_PERIODS_PER_DAY} periods per day`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}