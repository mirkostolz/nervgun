import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  const existing = await prisma.upvote.findUnique({ 
    where: { 
      userId_reportId: { 
        userId: session.user.id, 
        reportId: params.id 
      } 
    } 
  });
  
  let upvoted: boolean;
  if (existing) {
    await prisma.upvote.delete({ 
      where: { 
        userId_reportId: { 
          userId: session.user.id, 
          reportId: params.id 
        } 
      } 
    });
    upvoted = false;
  } else {
    await prisma.upvote.create({ 
      data: { 
        userId: session.user.id, 
        reportId: params.id 
      } 
    });
    upvoted = true;
  }
  
  const count = await prisma.upvote.count({ where: { reportId: params.id } });
  return NextResponse.json({ upvoted, upvotes: count });
}