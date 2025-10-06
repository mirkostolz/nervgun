import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { rateLimit } from '../../../lib/rate-limit';

function parseDataUrl(dataUrl: string): Buffer | null {
  try {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return null;
    return Buffer.from(base64, 'base64');
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get('sort') || 'new';
  const status = searchParams.get('status');
  
  const where = status ? { status: status.toUpperCase() as any } : {};
  const orderBy = sort === 'top' ? { upvotes: { _count: 'desc' } } : { createdAt: 'desc' };
  
  const items = await prisma.report.findMany({
    where,
    orderBy,
    include: { 
      _count: { 
        select: { 
          upvotes: true, 
          comments: true 
        } 
      },
      author: { select: { name: true, email: true } }
    }
  });
  
  console.log('API returning items:', items.length);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(req, '/api/reports');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' }, 
      { status: 429 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== 'string' || body.text.trim().length < 1 || body.text.length > 500) {
    return new NextResponse('Invalid text', { status: 400 });
  }

  let bytes: Buffer | undefined;
  if (body.screenshotDataUrl) {
    const b = parseDataUrl(body.screenshotDataUrl);
    if (!b) return new NextResponse('Invalid image format', { status: 400 });
    
    // Validate MIME type
    const mimeType = body.screenshotDataUrl.split(';')[0].split(':')[1];
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) {
      return new NextResponse('Invalid image type. Only PNG and JPEG allowed.', { status: 400 });
    }
    
    const max = Number(process.env.MAX_IMAGE_BYTES || 5242880); // 5MB for higher quality screenshots
    if (b.byteLength > max) return new NextResponse('Image too large', { status: 413 });
    bytes = b;
  }

  const created = await prisma.report.create({
    data: {
      text: body.text.trim(),
      url: String(body.url || ''),
      title: String(body.title || ''),
      clientJson: body.client ? JSON.stringify(body.client) : null,
      screenshot: bytes,
      authorId: session.user.id,
    },
    select: { id: true, createdAt: true }
  });

  return NextResponse.json(created, { status: 201 });
}