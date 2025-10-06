import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }
  
  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== 'string' || body.text.trim().length < 1 || body.text.length > 500) {
    return new NextResponse('Invalid text', { status: 400 });
  }
  
  const c = await prisma.comment.create({ 
    data: { 
      text: body.text.trim(), 
      authorId: session.user.id, 
      reportId: params.id 
    } 
  });
  
  return NextResponse.json({ 
    id: c.id, 
    text: c.text, 
    createdAt: c.createdAt 
  });
}