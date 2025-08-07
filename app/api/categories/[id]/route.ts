import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Activity from '@/models/Activity';
import { getUserIdFromRequest } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deleteType = searchParams.get('type'); // 'soft' or 'hard'

    const category = await Category.findOne({ _id: params.id, userId });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (deleteType === 'hard') {
      // Permanently delete category and all associated activities
      await Category.findByIdAndDelete(params.id);
      
      // Remove all activity entries for this category
      await Activity.updateMany(
        { userId },
        { $pull: { entries: { categoryId: params.id } } }
      );
      
      // Remove activities that have no entries left
      await Activity.deleteMany({ userId, entries: { $size: 0 } });
      
      return NextResponse.json({ message: 'Category permanently deleted' });
    } else {
      // Soft delete - set isActive to false
      category.isActive = false;
      await category.save();
      
      return NextResponse.json({ message: 'Category deactivated' });
    }
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}