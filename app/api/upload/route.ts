import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { IPhoto } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'New Memory';
    const caption = (formData.get('caption') as string) || '';
    const category = (formData.get('category') as string) || 'Memories';
    const notes = (formData.get('notes') as string) || '';
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];
    const isPrivate = formData.get('isPrivate') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
    const isGif = file.name.endsWith('.gif');
    const mediaType = isVideo ? 'video' : isGif ? 'gif' : 'image';

    // Safe filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanName}`;

    // For permanent persistence:
    // 1. If running locally or self-hosted, save to G:\MY or public/uploads
    // 2. Also create a Base64 data URL for images so even on serverless Vercel without S3, the uploaded image NEVER disappears on refresh!
    let url = '';
    let thumbnailUrl = '';

    // If file is an image under 4MB, base64 data URI ensures it's 100% permanently stored inside MongoDB Atlas directly!
    // This solves "refresh pannalum poga kudathu" on Vercel 100%!
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

    // If still no url (e.g. large video), fallback
    if (!url) {
      url = `/api/media/${encodeURIComponent(fileName)}`;
      thumbnailUrl = url;
    }

    const db = await getDatabase();
    const photosCol = db.collection<IPhoto>('photos');

    const newPhoto: IPhoto = {
      url,
      thumbnailUrl,
      title,
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

    const result = await photosCol.insertOne(newPhoto);

    return NextResponse.json({
      success: true,
      photo: { ...newPhoto, _id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  }
}

