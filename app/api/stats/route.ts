import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';
import { getUserIdFromRequest } from '@/lib/auth';
import { calculateStreaks } from '@/lib/streaks';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activities = await Activity.find({ userId });
    const stats = calculateStreaks(activities);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}