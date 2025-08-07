import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';
import Category from '@/models/Category';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const categoryId = searchParams.get('categoryId');

    let query: any = { userId };
    
    if (year) {
      query.date = { $regex: `^${year}` };
    }

    const activities = await Activity.find(query).populate('entries.categoryId');
    
    // Filter by category if specified
    let filteredActivities = activities;
    if (categoryId && categoryId !== 'all') {
      filteredActivities = activities.map(activity => ({
        ...activity.toObject(),
        entries: activity.entries.filter(entry => 
          entry.categoryId.toString() === categoryId
        )
      })).filter(activity => activity.entries.length > 0);
    }

    return NextResponse.json(filteredActivities);
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, entries } = await request.json();
    
    if (!date || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'Date and entries are required' }, { status: 400 });
    }

    // Validate that all categories belong to the user
    const categoryIds = entries.map(entry => entry.categoryId);
    const validCategories = await Category.find({ 
      _id: { $in: categoryIds }, 
      userId,
      isActive: true 
    });
    
    if (validCategories.length !== categoryIds.length) {
      return NextResponse.json({ error: 'Invalid categories' }, { status: 400 });
    }

    // Update or create activity for the date
    const activity = await Activity.findOneAndUpdate(
      { userId, date },
      { userId, date, entries },
      { upsert: true, new: true }
    );

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Save activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}