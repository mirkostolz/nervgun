const { PrismaClient } = require('@prisma/client');

async function seed() {
  const prisma = new PrismaClient();
  
  try {
    // User erstellen
    const user = await prisma.user.upsert({
      where: { email: 'test@thegoodwins.de' },
      update: {},
      create: {
        id: 'user1',
        name: 'Test User',
        email: 'test@thegoodwins.de',
        role: 'USER'
      }
    });
    
    console.log('User created:', user.email);
    
    // Reports erstellen
    const reports = [
      {
        id: 'report1',
        text: 'Login-Button muss doppelt geklickt werden, sonst passiert nichts. Sehr nervig beim täglichen Arbeiten!',
        url: 'https://company-tool.example.com/login',
        title: 'Company Tool - Login',
        status: 'OPEN',
        authorId: user.id
      },
      {
        id: 'report2',
        text: 'Das Dropdown-Menü schließt sich sofort wieder, wenn man versucht eine Option auszuwählen. Unmöglich zu bedienen!',
        url: 'https://dashboard.company.com/settings',
        title: 'Dashboard Settings',
        status: 'OPEN',
        authorId: user.id
      },
      {
        id: 'report3',
        text: 'Formular-Validierung zeigt Fehler erst nach dem Absenden an. Warum nicht während der Eingabe?',
        url: 'https://forms.company.com/contact',
        title: 'Contact Form',
        status: 'TRIAGED',
        authorId: user.id
      },
      {
        id: 'report4',
        text: 'Ladezeiten sind extrem lang. Manchmal dauert es 30+ Sekunden bis eine Seite lädt. Unproduktiv!',
        url: 'https://reports.company.com/analytics',
        title: 'Analytics Dashboard',
        status: 'OPEN',
        authorId: user.id
      },
      {
        id: 'report5',
        text: 'Mobile Ansicht ist komplett kaputt. Buttons sind zu klein und überlappen sich. Unbenutzbar auf dem Handy.',
        url: 'https://mobile.company.com/tasks',
        title: 'Task Management Mobile',
        status: 'RESOLVED',
        authorId: user.id
      }
    ];
    
    for (const report of reports) {
      await prisma.report.upsert({
        where: { id: report.id },
        update: {},
        create: report
      });
    }
    
    console.log('Reports created:', reports.length);
    
    // Upvotes hinzufügen
    await prisma.upvote.upsert({
      where: { userId_reportId: { userId: user.id, reportId: 'report1' } },
      update: {},
      create: { userId: user.id, reportId: 'report1' }
    });
    
    await prisma.upvote.upsert({
      where: { userId_reportId: { userId: user.id, reportId: 'report2' } },
      update: {},
      create: { userId: user.id, reportId: 'report2' }
    });
    
    console.log('Upvotes created');
    
    // Kommentare hinzufügen
    await prisma.comment.create({
      data: {
        id: 'comment1',
        text: 'Kann ich bestätigen! Passiert mir auch ständig. Sehr frustrierend.',
        authorId: user.id,
        reportId: 'report1'
      }
    });
    
    console.log('Comments created');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();