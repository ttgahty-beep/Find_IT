import { NextRequest, NextResponse } from 'next/server';
import { validateContactInput } from '@/lib/validation';
import { campusStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateContactInput(body);

    if (!validation.isValid || !validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Contact form validation failed. Please check the form.',
          errors: validation.errors,
        },
        { status: 422 }
      );
    }

    const { fullName, email, topic, relatedId, preferredDesk, subject, message } =
      validation.sanitizedData;

    const ticket = campusStore.createContactTicket({
      fullName,
      email,
      topic,
      relatedId,
      preferredDesk,
      subject,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been submitted to campus property services.',
        ticket: {
          id: ticket.id,
          status: ticket.status,
          createdAt: ticket.createdAt,
          estimatedResponse: 'Within 4 business hours',
          deskAssigned: ticket.preferredDesk,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process inquiry. Please try again.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const tickets = campusStore.getTickets();
  return NextResponse.json({ success: true, count: tickets.length, tickets });
}
