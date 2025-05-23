// src/app/api/upload-media/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${uuidv4()}-${file.name}`;
    
    // Save file to uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Determine media type
    const mediaType = file.type.startsWith('image/') 
      ? 'IMAGE'
      : file.type.startsWith('video/') 
        ? 'VIDEO' 
        : file.type.startsWith('application/') 
          ? 'DOCUMENT'
          : 'OTHER';

    // Store in database
    const media = await prisma.media.create({
      data: {
        fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        type: mediaType,
        url: `/uploads/${fileName}`,
      },
    });

    return NextResponse.json({
      url: `/uploads/${fileName}`,
      mediaId: media.id,
      type: mediaType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}