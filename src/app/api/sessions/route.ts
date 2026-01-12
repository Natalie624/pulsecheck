import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Hybrid approach: Try to fetch user from database first
    let user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    // Fallback: If user doesn't exist, create them using Clerk data
    // (This handles existing Clerk users who haven't been synced via webhook yet)
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter'); // 'yesterday' | 'last7days' | 'date' | null (all)
    const dateParam = searchParams.get('date'); // ISO date string for specific date

    // Build date filter
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      startDate = yesterday;

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      endDate = endOfYesterday;
    } else if (filter === 'last7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      startDate = sevenDaysAgo;
      endDate = new Date(); // Now
    } else if (filter === 'date' && dateParam) {
      // Specific date - parse the ISO date string
      const specificDate = new Date(dateParam);
      specificDate.setHours(0, 0, 0, 0);
      startDate = specificDate;

      const endOfDay = new Date(specificDate);
      endOfDay.setHours(23, 59, 59, 999);
      endDate = endOfDay;
    }

    // Query sessions with date filter
    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        ...(startDate && endDate ? {
          startedAt: {
            gte: startDate,
            lte: endDate,
          },
        } : {}),
      },
      include: {
        _count: {
          select: {
            notes: true,
            statusItems: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // Format response
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      title: session.title || `Session ${session.startedAt.toLocaleDateString()}`,
      startedAt: session.startedAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      noteCount: session._count.notes,
      itemCount: session._count.statusItems,
    }));

    return NextResponse.json({
      sessions: formattedSessions,
      count: formattedSessions.length,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
