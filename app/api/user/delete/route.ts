import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Category from '@/models/Category';
import Activity from '@/models/Activity';
import { getUserIdFromRequest } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Category.deleteMany({ userId }),
      Activity.deleteMany({ userId })
    ]);

    const response = NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
    
    // Clear the authentication cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}