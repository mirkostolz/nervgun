import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { sign } from 'jsonwebtoken';
import { env } from '../../../../env.mjs';

export async function GET(req: NextRequest) {
  // Check if user is logged in via regular session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    const response = new NextResponse('Unauthenticated', { status: 401 });
    response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  // Generate JWT token for extension
  const token = sign(
    { 
      userId: session.user.id,
      email: session.user.email,
      type: 'extension'
    },
    env.NEXTAUTH_SECRET,
    { expiresIn: '30d' } // Token valid for 30 days
  );

  const response = NextResponse.json({ token });
  response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

