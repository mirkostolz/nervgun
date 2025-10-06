const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  
  try {
    const items = await prisma.report.findMany({
      include: { 
        _count: { 
          select: { 
            upvotes: true, 
            comments: true 
          } 
        } 
      }
    });
    
    console.log('Found items:', items.length);
    console.log('Items:', JSON.stringify(items, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();