import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { rateLimit } from '../../../lib/rate-limit';
import { verify } from 'jsonwebtoken';
import { env } from '../../../env.mjs';

function parseDataUrl(dataUrl: string): Buffer | null {
  try {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return null;
    return Buffer.from(base64, 'base64');
  } catch {
    return null;
  }
}

// Get user ID from either session cookie or Bearer token
async function getUserId(req: NextRequest): Promise<string | null> {
  // Try Bearer token first (for extension)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = verify(token, env.NEXTAUTH_SECRET) as any;
      if (payload.userId && payload.type === 'extension') {
        return payload.userId;
      }
    } catch (e) {
      console.error('Token verification failed:', e);
    }
  }
  
  // Fall back to session (for web app)
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get('sort') || 'new';
  const status = searchParams.get('status');
  
  const where = status ? { status: status.toUpperCase() as any } : {};
  const orderBy = sort === 'top' 
    ? { upvotes: { _count: 'desc' as const } } 
    : { createdAt: 'desc' as const };
  
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
    const response = NextResponse.json(
      { error: 'Too many requests. Please try again later.' }, 
      { status: 429 }
    );
    // Add CORS headers for Chrome extension
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  const userId = await getUserId(req);
  if (!userId) {
    const response = new NextResponse('Unauthenticated', { status: 401 });
    // Add CORS headers for Chrome extension
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== 'string' || body.text.trim().length < 1 || body.text.length > 500) {
    const response = new NextResponse('Invalid text', { status: 400 });
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  let bytes: Buffer | undefined;
  if (body.screenshotDataUrl) {
    const b = parseDataUrl(body.screenshotDataUrl);
    if (!b) {
      const response = new NextResponse('Invalid image format', { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }
    
    // Validate MIME type
    const mimeType = body.screenshotDataUrl.split(';')[0].split(':')[1];
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) {
      const response = new NextResponse('Invalid image type. Only PNG and JPEG allowed.', { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }
    
    const max = Number(process.env.MAX_IMAGE_BYTES || 5242880); // 5MB for higher quality screenshots
    if (b.byteLength > max) {
      const response = new NextResponse('Image too large', { status: 413 });
      response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }
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

  const response = NextResponse.json(created, { status: 201 });
  // Add CORS headers for Chrome extension
  response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle preflight requests for CORS
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}