import { NextRequest, NextResponse } from 'next/server';
import { DataStorage } from '@/lib/data/storage';
import { CreateTeacherForm, BUSINESS_RULES } from '@/lib/types';

const dataStorage = DataStorage.getInstance();

export async function GET() {
  try {
    const teachers = dataStorage.getTeachers();
    return NextResponse.json({
      success: true,
      data: teachers,
      total: teachers.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch teachers'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateTeacherForm;
    
    // Validate required fields
    if (!body.name || !body.phone || !body.post || !body.subjects || body.subjects.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, phone, post, or subjects'
      }, { status: 400 });
    }

    // Validate post type
    if (!['PGT', 'TGT'].includes(body.post)) {
      return NextResponse.json({
        success: false,
        error: 'Post must be either PGT or TGT'
      }, { status: 400 });
    }

    // Determine eligible classes based on post
    const eligibleClasses = body.post === 'PGT' 
      ? BUSINESS_RULES.PGT_ELIGIBLE_CLASSES 
      : BUSINESS_RULES.TGT_ELIGIBLE_CLASSES;

    // Create new teacher
    const newTeacher = dataStorage.addTeacher({
      name: body.name,
      phone: body.phone,
      email: body.email,
      post: body.post,
      subjects: body.subjects,
      eligibleClasses,
      currentPeriods: 0,
      maxPeriods: BUSINESS_RULES.MAX_PERIODS_PER_DAY,
      isAvailable: true,
      leaveRequests: []
    });

    return NextResponse.json({
      success: true,
      data: newTeacher,
      message: 'Teacher created successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create teacher'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Teacher ID is required'
      }, { status: 400 });
    }

    const updatedTeacher = dataStorage.updateTeacher(id, updates);
    
    if (!updatedTeacher) {
      return NextResponse.json({
        success: false,
        error: 'Teacher not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedTeacher,
      message: 'Teacher updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update teacher'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Teacher ID is required'
      }, { status: 400 });
    }

    const deleted = dataStorage.deleteTeacher(id);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Teacher not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete teacher'
    }, { status: 500 });
  }
}