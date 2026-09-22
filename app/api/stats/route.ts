import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { IPhoto } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase();
    const photosCol = db.collection<IPhoto>('photos');

    const [total, imagesCount, videosCount, favoritesCount, earliestPhoto] = await Promise.all([
      photosCol.countDocuments(),
      photosCol.countDocuments({ mediaType: 'image' }),
      photosCol.countDocuments({ mediaType: 'video' }),
      photosCol.countDocuments({ isFavorite: true }),
      photosCol.find({ date: { $exists: true, $ne: '' } }).sort({ date: 1 }).limit(1).toArray(),
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
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}

