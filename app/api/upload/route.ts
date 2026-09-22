import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { IPhoto } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Support both multiple files ('files') and single file ('file')
    let files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      const single = formData.get('file') as File | null;
      if (single) files = [single];
    }

    const titlePrefix = (formData.get('title') as string) || '';
    const caption = (formData.get('caption') as string) || '';
    const category = (formData.get('category') as string) || 'Memories';
    const notes = (formData.get('notes') as string) || '';
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];
    const isPrivate = formData.get('isPrivate') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No file(s) uploaded' }, { status: 400 });
    }

    const db = await getDatabase();
    const photosCol = db.collection<IPhoto>('photos');

    const createdPhotos: IPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
      const isGif = file.name.endsWith('.gif');
      const mediaType = isVideo ? 'video' : isGif ? 'gif' : 'image';

      // Safe filename with unique timestamp
      const timestamp = Date.now() + i;
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${cleanName}`;

      let url = '';
      let thumbnailUrl = '';

      // Permanent Base64 persistence for images under 5MB in MongoDB Atlas
      if (!isVideo && buffer.length < 5 * 1024 * 1024) {
        const mime = file.type || 'image/jpeg';
        url = `data:${mime};base64,${buffer.toString('base64')}`;
        thumbnailUrl = url;
      }

      // Also attempt saving to G:\MY if accessible
      try {
        const targetDir = 'G:\\MY';
        if (fs.existsSync(targetDir)) {
          const targetPath = path.join(targetDir, fileName);
          fs.writeFileSync(targetPath, buffer);
          if (!url) {
            url = `/api/media/${encodeURIComponent(fileName)}`;
            thumbnailUrl = url;
          }
        }
      } catch (fsErr) {
        console.warn('Could not write to local disk, relying on DB data URI:', fsErr);
      }

      if (!url) {
        url = `/api/media/${encodeURIComponent(fileName)}`;
        thumbnailUrl = url;
      }

      // Format title
      let itemTitle = titlePrefix;
      if (!itemTitle) {
        itemTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        itemTitle = itemTitle.charAt(0).toUpperCase() + itemTitle.slice(1);
      } else if (files.length > 1) {
        itemTitle = `${titlePrefix} (${i + 1})`;
      }

      const newPhoto: IPhoto = {
        url,
        thumbnailUrl,
        title: itemTitle,
        caption,
        category,
        mediaType,
        date,
        isFavorite: false,
        isPrivate,
        notes,
        fileName,
        fileSize: buffer.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createdPhotos.push(newPhoto);
    }

    if (createdPhotos.length > 0) {
      const result = await photosCol.insertMany(createdPhotos);
      // Attach insertedIds
      const insertedIds = Object.values(result.insertedIds);
      createdPhotos.forEach((photo, idx) => {
        photo._id = insertedIds[idx].toString();
      });
    }

    return NextResponse.json({
      success: true,
      count: createdPhotos.length,
      photos: createdPhotos,
      photo: createdPhotos[0],
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  }
}
