import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const r = await prisma.report.findUnique({
    where: { id: params.id },
    include: {
      comments: { 
        include: { author: true }, 
        orderBy: { createdAt: 'asc' } 
      },
      upvotes: true,
      author: true,
    }
  });
  
  if (!r) return new NextResponse('Not found', { status: 404 });
  
  const screenshot = r.screenshot ? 
    `data:image/png;base64,${Buffer.from(r.screenshot).toString('base64')}` : 
    null;
  
  const upvotes = r.upvotes.length;
  
  return NextResponse.json({
    id: r.id, 
    text: r.text, 
    url: r.url, 
    title: r.title, 
    status: r.status, 
    createdAt: r.createdAt,
    author: { id: r.authorId, email: r.author.email },
    upvotes,
    comments: r.comments.map(c => ({ 
      id: c.id, 
      text: c.text, 
      author: { email: c.author.email }, 
      createdAt: c.createdAt 
    })),
    screenshot,
  });
}