'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataStorage } from '@/lib/data/storage';
import { Class, Teacher, Subject, Period, DayOfWeek, DEFAULT_TIME_SLOTS, BUSINESS_RULES } from '@/lib/types';

export default function TimetablePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const dataStorage = DataStorage.getInstance();
    
    setClasses(dataStorage.getClasses());
    setTeachers(dataStorage.getTeachers());
    setSubjects(dataStorage.getSubjects());
    setPeriods(dataStorage.getPeriods());
    setLoading(false);
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'Unassigned';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getClassPeriods = (classId: string): Period[] => {
    return periods.filter(p => p.classId === classId);
  };

  const getPeriodForSlot = (classId: string, day: DayOfWeek, periodNumber: number): Period | undefined => {
    return periods.find(p => 
      p.classId === classId && 
      p.day === day && 
      p.periodNumber === periodNumber
    );
  };

  const checkForConflicts = (classId: string) => {
    const classPeriods = getClassPeriods(classId);
    const conflictList: string[] = [];

    classPeriods.forEach(period => {
      // Check teacher conflicts
      const teacherPeriods = periods.filter(p => 
        p.teacherId === period.teacherId && 
        p.day === period.day && 
        p.periodNumber === period.periodNumber &&
        p.id !== period.id
      );

      if (teacherPeriods.length > 0) {
        conflictList.push(`Teacher ${getTeacherName(period.teacherId)} has conflict on ${period.day}, Period ${period.periodNumber}`);
      }

      // Check teacher period limit
      const teacherDayPeriods = periods.filter(p => 
        p.teacherId === period.teacherId && 
        p.day === period.day
      );
      
      if (teacherDayPeriods.length > BUSINESS_RULES.MAX_PERIODS_PER_DAY) {
        conflictList.push(`Teacher ${getTeacherName(period.teacherId)} exceeds ${BUSINESS_RULES.MAX_PERIODS_PER_DAY} periods limit on ${period.day}`);
      }
    });

    setConflicts(conflictList);
  };

  const generateSampleTimetable = async (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    if (!classData) return;

    const dataStorage = DataStorage.getInstance();
    
    // Clear existing periods for this class (in a real implementation)
    // const existingPeriods = periods.filter(p => p.classId === classId);

    // Get eligible teachers for this class
    const eligibleTeachers = teachers.filter(teacher => {
      if (teacher.post === 'PGT') {
        return BUSINESS_RULES.PGT_ELIGIBLE_CLASSES.includes(classData.grade);
      } else {
        return BUSINESS_RULES.TGT_ELIGIBLE_CLASSES.includes(classData.grade);
      }
    });

    // Create periods for each day and time slot
    const newPeriods: Period[] = [];
    
    BUSINESS_RULES.WORKING_DAYS.forEach((day, dayIndex) => {
      DEFAULT_TIME_SLOTS.filter(slot => !slot.isBreak).forEach((slot, slotIndex) => {
        const subjectIndex = (dayIndex * 6 + slotIndex) % classData.subjects.length;
        const subjectName = classData.subjects[subjectIndex];
        const subject = subjects.find(s => s.name === subjectName);
        
        if (subject) {
          // Find eligible teacher for this subject
          const eligibleForSubject = eligibleTeachers.filter(teacher => 
            teacher.subjects.includes(subjectName)
          );
          
          const teacher = eligibleForSubject[Math.floor(Math.random() * eligibleForSubject.length)];
          
          if (teacher) {
            const period: Omit<Period, 'id' | 'createdAt' | 'updatedAt'> = {
              periodNumber: slot.periodNumber,
              startTime: slot.startTime,
              endTime: slot.endTime,
              day: day,
              classId: classData.id,
              subjectId: subject.id,
              teacherId: teacher.id,
              roomId: classData.roomId,
              isSubstitution: false
            };

            const newPeriod = dataStorage.addPeriod(period);
            newPeriods.push(newPeriod);
          }
        }
      });
    });

    loadData();
    alert('Sample timetable generated successfully!');
  };

  const selectedClassData = classes.find(c => c.id === selectedClass);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <Card>
            <CardContent className="p-6">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage class timetables with automatic conflict detection.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            disabled={!selectedClass}
            onClick={() => selectedClass && generateSampleTimetable(selectedClass)}
          >
            Generate Sample Timetable
          </Button>
          <Button disabled={!selectedClass}>
            Create Custom Timetable
          </Button>
        </div>
      </div>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class to view/edit timetable" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      Class {cls.grade}-{cls.section} ({cls.strength} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClass && (
              <Button onClick={() => checkForConflicts(selectedClass)}>
                Check Conflicts
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Timetable Conflicts Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm text-red-800">{conflict}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Information */}
      {selectedClassData && (
        <Card>
          <CardHeader>
            <CardTitle>Class {selectedClassData.grade}-{selectedClassData.section}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Students</p>
                <p className="text-xl font-semibold">{selectedClassData.strength}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Room</p>
                <p className="text-xl font-semibold">{selectedClassData.roomId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Subjects</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedClassData.subjects.map(subject => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable Grid */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-3 bg-gray-50 text-left font-medium">Time</th>
                    {BUSINESS_RULES.WORKING_DAYS.map(day => (
                      <th key={day} className="border border-gray-300 p-3 bg-gray-50 text-center font-medium capitalize">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEFAULT_TIME_SLOTS.map(slot => (
                    <tr key={slot.periodNumber} className={slot.isBreak ? 'bg-gray-100' : ''}>
                      <td className="border border-gray-300 p-3 font-medium">
                        {slot.isBreak ? (
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-600">
                              {slot.breakType === 'lunch' ? 'Lunch Break' : 
                               slot.breakType === 'assembly' ? 'Assembly' : 'Break'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium">Period {slot.periodNumber}</div>
                            <div className="text-xs text-gray-500">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        )}
                      </td>
                      {BUSINESS_RULES.WORKING_DAYS.map(day => (
                        <td key={`${day}-${slot.periodNumber}`} className="border border-gray-300 p-2">
                          {slot.isBreak ? (
                            <div className="text-center text-gray-400 text-sm">-</div>
                          ) : (
                            (() => {
                              const period = getPeriodForSlot(selectedClass, day, slot.periodNumber);
                              return period ? (
                                <div className="text-center space-y-1">
                                  <div className="text-sm font-medium">
                                    {getSubjectName(period.subjectId)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {getTeacherName(period.teacherId)}
                                  </div>
                                  {period.isSubstitution && (
                                    <Badge variant="outline" className="text-xs">
                                      Substitute
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs h-8 w-full"
                                  >
                                    + Add Period
                                  </Button>
                                </div>
                              );
                            })()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {getClassPeriods(selectedClass).length}
              </div>
              <p className="text-sm text-gray-600">Total Periods Assigned</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {getClassPeriods(selectedClass).filter(p => p.isSubstitution).length}
              </div>
              <p className="text-sm text-gray-600">Substitution Periods</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">
                {conflicts.length}
              </div>
              <p className="text-sm text-gray-600">Active Conflicts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedClass && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Select a class to get started</h3>
          <p className="text-gray-600">Choose a class from the dropdown above to view or create its timetable.</p>
        </div>
      )}
    </div>
  );
}