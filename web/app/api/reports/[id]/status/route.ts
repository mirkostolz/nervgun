import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }
  
  const body = await req.json().catch(() => null);
  const next = String(body?.status || '').toUpperCase();
  if (!['OPEN', 'TRIAGED', 'RESOLVED'].includes(next)) {
    return new NextResponse('Bad status', { status: 400 });
  }

  // Check if user is a triager
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true }
  });
  
  if (!user || user.role !== 'TRIAGER') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  await prisma.report.update({ 
    where: { id: params.id }, 
    data: { status: next as any } 
  });
  
  return NextResponse.json({ ok: true });
}