import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: sessionId } = await context.params;

    // Hybrid approach: Try to fetch user from database first
    let user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    // Fallback: If user doesn't exist, create them using Clerk data
    if (!user) {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json(
          { error: 'User not found in Clerk' },
          { status: 404 }
        );
      }

      user = await prisma.user.create({
        data: {
          clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.username || 'User',
        },
      });

      console.log(`✅ User created via fallback: ${clerkUserId}`);
    }

    // Fetch the session with all related data
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: user.id, // Ensure user owns this session
      },
      include: {
        notes: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        statusItems: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        Preference: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: sessionId } = await context.params;
    const body = await request.json();

    // Hybrid approach: Try to fetch user from database first
    let user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    // Fallback: If user doesn't exist, create them using Clerk data
    if (!user) {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json(
          { error: 'User not found in Clerk' },
          { status: 404 }
        );
      }

      user = await prisma.user.create({
        data: {
          clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.username || 'User',
        },
      });

      console.log(`✅ User created via fallback: ${clerkUserId}`);
    }

    // Verify session ownership
    const existingSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Update session title if provided
      await tx.session.update({
        where: { id: sessionId },
        data: {
          title: body.title ?? existingSession.title,
          metadata: body.metadata ?? existingSession.metadata,
        },
      });

      // Update status items if provided
      if (body.statusItems && Array.isArray(body.statusItems)) {
        // Delete existing status items
        await tx.statusItem.deleteMany({
          where: { sessionId },
        });

        // Create new status items
        await tx.statusItem.createMany({
          data: body.statusItems.map((item: { type: string; content: string; confidence?: number; sourceNoteId?: string }) => ({
            sessionId,
            type: item.type,
            content: item.content,
            confidence: item.confidence ?? 1.0,
            sourceNoteId: item.sourceNoteId,
          })),
        });
      }

      // Update preferences if provided
      if (body.preferences) {
        await tx.preference.upsert({
          where: { sessionId },
          update: {
            pov: body.preferences.pov,
            format: body.preferences.format,
            tone: body.preferences.tone,
            thirdPersonName: body.preferences.thirdPersonName,
          },
          create: {
            sessionId,
            pov: body.preferences.pov,
            format: body.preferences.format,
            tone: body.preferences.tone,
            thirdPersonName: body.preferences.thirdPersonName,
          },
        });
      }
    });

    // Fetch the complete updated session
    const completeSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        notes: {
          orderBy: { createdAt: 'asc' },
        },
        statusItems: {
          orderBy: { createdAt: 'asc' },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        Preference: true,
      },
    });

    return NextResponse.json({ session: completeSession });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
