import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { IPhoto } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const photosCol = db.collection<IPhoto>('photos');

    const publicFilter = { isPrivate: { $ne: true } };

    const [total, imagesCount, videosCount, favoritesCount, earliestPhoto] = await Promise.all([
      photosCol.countDocuments(publicFilter),
      photosCol.countDocuments({ ...publicFilter, mediaType: 'image' }),
      photosCol.countDocuments({ ...publicFilter, mediaType: 'video' }),
      photosCol.countDocuments({ ...publicFilter, isFavorite: true }),
      photosCol
        .find({ ...publicFilter, date: { $exists: true, $ne: '' } })
        .sort({ date: 1 })
        .limit(1)
        .toArray(),
    ]);

    const earliestDate = earliestPhoto.length > 0 ? earliestPhoto[0].date : null;

    return NextResponse.json({
      total,
      imagesCount,
      videosCount,
      favoritesCount,
      earliestDate,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({
      total: 0,
      imagesCount: 0,
      videosCount: 0,
      favoritesCount: 0,
      earliestDate: null,
      error: String(error),
    });
  }
}
