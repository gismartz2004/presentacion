const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findIds() {
  const company = await prisma.company.findFirst({ select: { id: true, name: true } });
  const user = await prisma.users.findFirst({ select: { id: true, name: true } });
  
  const fs = require('fs');
  fs.writeFileSync('ids-output.txt', 
    'COMPANY_ID=' + (company?.id || 'NULL') + '\n' +
    'COMPANY_NAME=' + (company?.name || 'NULL') + '\n' +
    'USER_ID=' + (user?.id || 'NULL') + '\n' +
    'USER_NAME=' + (user?.name || 'NULL') + '\n'
  );
  console.log('Done! Check ids-output.txt');
  
  await prisma.$disconnect();
}

findIds();
