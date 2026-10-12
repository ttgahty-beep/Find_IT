import { NextRequest, NextResponse } from 'next/server';
import { validateReportInput } from '@/lib/validation';
import { campusStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get('type');
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('q')?.toLowerCase();

  let reports = campusStore.getAllReports();

  if (typeFilter && (typeFilter === 'LOST' || typeFilter === 'FOUND')) {
    reports = reports.filter((r) => r.type === typeFilter);
  }

  if (categoryFilter && categoryFilter !== 'All') {
    reports = reports.filter((r) => r.category === categoryFilter);
  }

  if (searchQuery) {
    reports = reports.filter(
      (r) =>
        r.title.toLowerCase().includes(searchQuery) ||
        r.publicDescription.toLowerCase().includes(searchQuery) ||
        r.campusLocation.toLowerCase().includes(searchQuery)
    );
  }

  // PRD FR-08 Safe public projection: Withhold private clues and encrypted clues from public GET
  const safeReports = reports.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    category: r.category,
    campusLocation: r.campusLocation,
    eventDate: r.eventDate,
    status: r.status,
    publicDescription: r.publicDescription,
    hasPrivateClues: r.hasPrivateClues,
    photoUrl: r.photoUrl,
    matchScore: r.matchScore,
    matchFactors: r.matchFactors,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({
    success: true,
    count: safeReports.length,
    reports: safeReports,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateReportInput(body);

    if (!validation.isValid || !validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Report validation failed.',
          errors: validation.errors,
        },
        { status: 422 }
      );
    }

    const {
      type,
      title,
      category,
      campusLocation,
      eventDate,
      publicDescription,
      privateClues,
      primaryPhotoUrl,
    } = validation.sanitizedData;

    // Use user from request or default demo user
    const userId = body.userId || 'usr-student-01';
    const user = campusStore.findUserById(userId);
    const reporterName = user ? user.name : 'Campus Member';

    const newReport = campusStore.createReport({
      userId,
      reporterName,
      type,
      title,
      category,
      campusLocation,
      eventDate,
      publicDescription,
      privateClues,
      photoUrl: primaryPhotoUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: `${type} item report registered. Candidates will be ranked automatically.`,
        report: {
          id: newReport.id,
          type: newReport.type,
          title: newReport.title,
          category: newReport.category,
          status: newReport.status,
          matchScore: newReport.matchScore,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create report API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Could not submit item report. Please check server logs.',
      },
      { status: 500 }
    );
  }
}
