const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://nagaarjunn31_db_user:CVRobOwLeDDFzkVD@cluster0.3qpdvfo.mongodb.net/albam_db?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = process.env.MONGODB_DB || "albam_db";
const MEDIA_DIR = 'G:\\MY';

const SUPPORTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4'];

async function syncMedia() {
  console.log('🚀 Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    const db = client.db(DB_NAME);
    const photosCol = db.collection('photos');

    // Create index on date, category, mediaType, isFavorite for super-fast queries on 1100+ items
    await photosCol.createIndex({ date: -1 });
    await photosCol.createIndex({ category: 1 });
    await photosCol.createIndex({ mediaType: 1 });
    await photosCol.createIndex({ isFavorite: 1 });
    await photosCol.createIndex({ fileName: 1 }, { unique: true });

    console.log(`📁 Scanning media folder: ${MEDIA_DIR}...`);
    const allFiles = fs.readdirSync(MEDIA_DIR);

    const mediaFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_EXTS.includes(ext);
    });

    console.log(`Found ${mediaFiles.length} media files in ${MEDIA_DIR}`);

    const operations = [];

    for (let i = 0; i < mediaFiles.length; i++) {
      const fileName = mediaFiles[i];
      const ext = path.extname(fileName).toLowerCase();
      const filePath = path.join(MEDIA_DIR, fileName);

      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch (e) {
        continue;
      }

      const isVideo = ext === '.mp4';
      const isGif = ext === '.gif';
      const mediaType = isVideo ? 'video' : isGif ? 'gif' : 'image';

      // Parse date from filename timestamp or file modified time
      let fileDate = new Date(stat.mtime);
      const match = fileName.match(/(\d{12,13})/);
      if (match) {
        const timestamp = parseInt(match[1], 10);
        const parsed = new Date(timestamp);
        if (parsed.getFullYear() >= 2000 && parsed.getFullYear() <= 2030) {
          fileDate = parsed;
        }
      }

      const dateStr = fileDate.toISOString().split('T')[0];
      const year = fileDate.getFullYear();

      // Determine category
      let category = 'Romantic Moments';
      if (isVideo) {
        category = 'Videos';
      } else if (year <= 2023) {
        category = 'Golden Days';
      } else if (year === 2024) {
        category = 'Sweet 2024';
      } else if (year >= 2025) {
        category = 'Our Journey';
      }

      // Title
      let title = `Memory #${i + 1}`;
      if (isVideo) {
        title = `Video Memory #${i + 1}`;
      }

      const url = `/api/media/${encodeURIComponent(fileName)}`;

      // Upsert operation so we never duplicate files even if re-run
      operations.push({
        updateOne: {
          filter: { fileName: fileName },
          update: {
            $setOnInsert: {
              url,
              thumbnailUrl: url,
              title,
              caption: '',
              category,
              mediaType,
              date: dateStr,
              isFavorite: i % 15 === 0, // Mark a few as initial favorites
              notes: '',
              fileName,
              fileSize: stat.size,
              createdAt: new Date().toISOString(),
            },
            $set: {
              updatedAt: new Date().toISOString(),
            }
          },
          upsert: true,
        }
      });
    }

    console.log(`⏳ Syncing ${operations.length} items to MongoDB Atlas...`);
    
    // Batch in chunks of 200
    const chunkSize = 200;
    for (let i = 0; i < operations.length; i += chunkSize) {
      const chunk = operations.slice(i, i + chunkSize);
      await photosCol.bulkWrite(chunk);
      console.log(`Synced ${Math.min(i + chunkSize, operations.length)} / ${operations.length} items...`);
    }

    const totalInDb = await photosCol.countDocuments();
    console.log(`🎉 SUCCESS! Total media in MongoDB Atlas database: ${totalInDb}`);

  } catch (err) {
    console.error('❌ Error during sync:', err);
  } finally {
    await client.close();
  }
}

syncMedia();

