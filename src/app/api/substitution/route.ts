import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/data/storage';
import { SubstitutionEngine } from '@/lib/utils/substitution';

const dataStorage = DataStorage.getInstance();
const substitutionEngine = new SubstitutionEngine();

export async function GET() {
  try {
    const substitutions = dataStorage.getSubstitutions();
    const leaveRequests = dataStorage.getLeaveRequests();
    
    return NextResponse.json({
      success: true,
      data: {
        substitutions,
        leaveRequests,
        active: substitutions.filter(s => s.status === 'assigned'),
        pending: leaveRequests.filter(r => r.status === 'pending')
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch substitution data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'leave_request') {
      // Handle leave request submission
      const { teacherId, startDate, endDate, reason, affectedPeriods } = data;

      if (!teacherId || !startDate || !endDate || !reason) {
        return NextResponse.json({
          success: false,
          error: 'Missing required fields for leave request'
        }, { status: 400 });
      }

      // Create leave request
      const leaveRequest = dataStorage.addLeaveRequest({
        teacherId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'pending',
        affectedPeriods: affectedPeriods || [],
        substitutions: []
      });

      return NextResponse.json({
        success: true,
        data: leaveRequest,
        message: 'Leave request submitted successfully'
      });

    } else if (type === 'approve_leave') {
      // Handle leave request approval and automatic substitution
      const { leaveRequestId } = data;

      if (!leaveRequestId) {
        return NextResponse.json({
          success: false,
          error: 'Leave request ID is required'
        }, { status: 400 });
      }

      const leaveRequests = dataStorage.getLeaveRequests();
      const leaveRequest = leaveRequests.find(r => r.id === leaveRequestId);

      if (!leaveRequest) {
        return NextResponse.json({
          success: false,
          error: 'Leave request not found'
        }, { status: 404 });
      }

      // Process automatic substitution
      const result = substitutionEngine.processLeaveRequest(leaveRequest);

      // Update leave request status
      leaveRequest.status = 'approved';
      leaveRequest.substitutions = result.successful;

      // Update teacher availability
      const teacher = dataStorage.getTeacher(leaveRequest.teacherId);
      if (teacher) {
        dataStorage.updateTeacher(teacher.id, { isAvailable: false });
      }

      return NextResponse.json({
        success: true,
        data: {
          leaveRequest,
          substitutions: result.successful,
          failedPeriods: result.failed
        },
        message: `Leave approved. ${result.successful.length} substitutions assigned, ${result.failed.length} periods need manual assignment.`
      });

    } else if (type === 'manual_substitute') {
      // Handle manual substitute assignment
      const { periodId, originalTeacherId, substituteTeacherId, reason } = data;

      if (!periodId || !originalTeacherId || !substituteTeacherId || !reason) {
        return NextResponse.json({
          success: false,
          error: 'Missing required fields for manual substitution'
        }, { status: 400 });
      }

      const periods = dataStorage.getPeriods();
      const period = periods.find(p => p.id === periodId);

      if (!period) {
        return NextResponse.json({
          success: false,
          error: 'Period not found'
        }, { status: 404 });
      }

      // Validate the assignment
      const classData = dataStorage.getClass(period.classId);
      const subjectData = dataStorage.getSubject(period.subjectId);
      
      if (!classData || !subjectData) {
        return NextResponse.json({
          success: false,
          error: 'Invalid period data'
        }, { status: 400 });
      }

      const validation = substitutionEngine.validateTeacherAssignment(
        substituteTeacherId,
        classData.grade,
        subjectData.name
      );

      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          error: `Assignment validation failed: ${validation.errors.join(', ')}`
        }, { status: 400 });
      }

      // Create substitution
      const substitution = dataStorage.addSubstitution({
        periodId,
        originalTeacherId,
        substituteTeacherId,
        date: new Date(),
        status: 'assigned',
        reason,
        autoAssigned: false
      });

      // Update teacher's period count
      const substituteTeacher = dataStorage.getTeacher(substituteTeacherId);
      if (substituteTeacher) {
        dataStorage.updateTeacher(substituteTeacherId, {
          currentPeriods: substituteTeacher.currentPeriods + 1
        });
      }

      return NextResponse.json({
        success: true,
        data: substitution,
        message: 'Manual substitution assigned successfully'
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid request type'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Substitution API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process substitution request'
    }, { status: 500 });
  }
}

// GET available substitutes for a specific period
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get('periodId');
    const leaveTeacherId = searchParams.get('leaveTeacherId');

    if (!periodId || !leaveTeacherId) {
      return NextResponse.json({
        success: false,
        error: 'Period ID and leave teacher ID are required'
      }, { status: 400 });
    }

    const periods = dataStorage.getPeriods();
    const period = periods.find(p => p.id === periodId);

    if (!period) {
      return NextResponse.json({
        success: false,
        error: 'Period not found'
      }, { status: 404 });
    }

    const availableSubstitutes = substitutionEngine.findAvailableSubstitutes(period, leaveTeacherId);

    return NextResponse.json({
      success: true,
      data: availableSubstitutes,
      total: availableSubstitutes.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to find available substitutes'
    }, { status: 500 });
  }
}