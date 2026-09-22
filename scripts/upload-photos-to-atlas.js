const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Read connection string from .env.local
let uri = process.env.MONGODB_URI;
if (!uri) {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) uri = match[1].trim();
  } catch (e) {
    console.error('Could not read .env.local', e);
  }
}

if (!uri) {
  console.error('MONGODB_URI is required!');
  process.exit(1);
}

const MEDIA_DIR = 'G:\\MY';

async function uploadPhotosToAtlas() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('albam_db').collection('photos');

  // Find all images that still have local URL (/api/media/...)
  const pendingPhotos = await col.find({
    mediaType: 'image',
    url: { $regex: '^/api/media/' }
  }).toArray();

  console.log(`Found ${pendingPhotos.length} photos to upload directly to Atlas cloud...`);

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < pendingPhotos.length; i++) {
    const doc = pendingPhotos[i];
    const filePath = path.join(MEDIA_DIR, doc.fileName);

    if (!fs.existsSync(filePath)) {
      skippedCount++;
      continue;
    }

    try {
      // Resize to HD (850px max width/height) and encode to WebP for crisp quality and small size (~80-120KB)
      const buffer = await sharp(filePath)
        .resize({ width: 850, height: 850, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer();

      const dataUri = `data:image/webp;base64,${buffer.toString('base64')}`;

      await col.updateOne(
        { _id: doc._id },
        {
          $set: {
            url: dataUri,
            thumbnailUrl: dataUri,
            updatedAt: new Date().toISOString()
          }
        }
      );

      successCount++;

      if (successCount % 50 === 0 || i === pendingPhotos.length - 1) {
        console.log(`Progress: ${successCount} / ${pendingPhotos.length} photos uploaded to Atlas (${Math.round((successCount / pendingPhotos.length) * 100)}%)...`);
      }
    } catch (err) {
      console.warn(`Could not process ${doc.fileName}:`, err.message);
    }
  }

  console.log(`\n🎉 Upload Complete!`);
  console.log(`Successfully uploaded: ${successCount} photos to Atlas cloud.`);
  console.log(`Skipped: ${skippedCount}`);

  await client.close();
}

uploadPhotosToAtlas().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});

