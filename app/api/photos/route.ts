import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { IPhoto } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '3000', 10);
    const category = searchParams.get('category') || 'All';
    const search = searchParams.get('search') || '';
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const mediaType = searchParams.get('mediaType');
    const isPrivate = searchParams.get('isPrivate') === 'true';

    const db = await getDatabase();
    const photosCol = db.collection<IPhoto>('photos');

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (isPrivate) {
      filter.isPrivate = true;
    } else {
      filter.isPrivate = { $ne: true };
    }

    if (category && !['All', 'Favorites', 'Videos', 'Images', 'Photos'].includes(category)) {
      filter.category = category;
    }

    if (category === 'Favorites' || favoritesOnly) {
      filter.isFavorite = true;
    }

    if (category === 'Images' || category === 'Photos' || mediaType === 'image') {
      filter.mediaType = 'image';
    }

    if (category === 'Videos' || mediaType === 'video') {
      filter.mediaType = 'video';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caption: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [photos, total, distinctCategories] = await Promise.all([
      photosCol
        .find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      photosCol.countDocuments(filter),
      photosCol.distinct('category', filter),
    ]);

    return NextResponse.json({
      photos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + photos.length < total,
      categories: ['All', 'Images', 'Videos', 'Favorites', ...distinctCategories.filter((c) => c && !['All', 'Images', 'Photos', 'Videos', 'Favorites'].includes(c))],
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos from database', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, caption, category, mediaType, date, notes } = body;

    if (!url) {
      return NextResponse.json({ error: 'Photo URL is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const photosCol = db.collection<IPhoto>('photos');

    const newPhoto: IPhoto = {
      url,
      thumbnailUrl: body.thumbnailUrl || url,
      title: title || 'Special Moment',
      caption: caption || '',
      category: category || 'Memories',
      mediaType: mediaType || 'image',
      date: date || new Date().toISOString().split('T')[0],
      isFavorite: false,
      isPrivate: body.isPrivate === true,
      notes: notes || '',
      fileName: body.fileName || 'upload.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await photosCol.insertOne(newPhoto);

    return NextResponse.json({
      success: true,
      photo: { ...newPhoto, _id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error('Error adding photo:', error);
    return NextResponse.json(
      { error: 'Failed to save photo in database', details: String(error) },
      { status: 500 }
    );
  }
}

