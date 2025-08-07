import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    await dbConnect();
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activity = await Activity.findOne({ 
      userId, 
      date: params.date 
    }).populate('entries.categoryId');

    return NextResponse.json(activity || { entries: [] });
  } catch (error) {
    console.error('Get activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}