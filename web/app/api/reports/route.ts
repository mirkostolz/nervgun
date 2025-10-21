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
  // CORS headers for browser extension
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'chrome-extension://*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  };

  const { searchParams } = new URL(req.url);
  const sort = searchParams.get('sort') || 'new';
  const status = searchParams.get('status');
  
  const where = status ? { status: status.toUpperCase() as any } : {};
  const orderBy = sort === 'top' ? { upvotes: { _count: 'desc' as any } } : { createdAt: 'desc' as any };
  
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
  return NextResponse.json(items, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  // CORS headers for browser extension
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'chrome-extension://*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  // Rate limiting
  const rateLimitResult = rateLimit(req, '/api/reports');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' }, 
      { status: 429, headers: corsHeaders }
    );
  }

  const session = await getServerSession(authOptions);
  
  // Temporary development bypass - remove in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!session?.user?.email && !isDevelopment) {
    return new NextResponse('Unauthenticated', { status: 401, headers: corsHeaders });
  }
  
  // Use a default user ID for development
  let userId = (session?.user as any)?.id || 'dev-user-id';
  
  // Create a default user if it doesn't exist
  if (isDevelopment && !(session?.user as any)?.id) {
    try {
      await prisma.user.upsert({
        where: { id: 'dev-user-id' },
        update: {},
        create: {
          id: 'dev-user-id',
          name: 'Development User',
          email: 'dev@example.com',
          role: 'USER'
        }
      });
    } catch (error) {
      console.error('Error creating dev user:', error);
      // If user creation fails, try to find existing user
      const existingUser = await prisma.user.findFirst();
      if (existingUser) {
        userId = existingUser.id;
      } else {
        return new NextResponse('No user available', { status: 500, headers: corsHeaders });
      }
    }
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== 'string' || body.text.trim().length < 1 || body.text.length > 500) {
    return new NextResponse('Invalid text', { status: 400, headers: corsHeaders });
  }

  let bytes: Buffer | undefined;
  if (body.screenshotDataUrl) {
    const b = parseDataUrl(body.screenshotDataUrl);
    if (!b) return new NextResponse('Invalid image format', { status: 400, headers: corsHeaders });
    
    // Validate MIME type
    const mimeType = body.screenshotDataUrl.split(';')[0].split(':')[1];
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) {
      return new NextResponse('Invalid image type. Only PNG and JPEG allowed.', { status: 400, headers: corsHeaders });
    }
    
    const max = Number(process.env.MAX_IMAGE_BYTES || 5242880); // 5MB for higher quality screenshots
    if (b.byteLength > max) return new NextResponse('Image too large', { status: 413, headers: corsHeaders });
    bytes = b;
  }

  const created = await prisma.report.create({
    data: {
      text: body.text.trim(),
      url: String(body.url || ''),
      title: String(body.title || ''),
      clientJson: body.client ? JSON.stringify(body.client) : null,
      screenshot: bytes,
      authorId: userId,
    },
    select: { id: true, createdAt: true }
  });

  return NextResponse.json(created, { status: 201, headers: corsHeaders });
}