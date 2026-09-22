import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();
    const photosCol = db.collection('photos');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (typeof body.isFavorite === 'boolean') {
      updateFields.isFavorite = body.isFavorite;
    }
    if (typeof body.notes === 'string') {
      updateFields.notes = body.notes;
    }
    if (typeof body.caption === 'string') {
      updateFields.caption = body.caption;
    }
    if (typeof body.title === 'string') {
      updateFields.title = body.title;
    }
    if (typeof body.category === 'string') {
      updateFields.category = body.category;
    }

    const result = await photosCol.updateOne(query, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: updateFields });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const photosCol = db.collection('photos');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const result = await photosCol.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}

