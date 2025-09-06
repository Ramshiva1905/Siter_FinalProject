const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCountries() {
  try {
    const countries = await prisma.country.findMany();
    console.log('Countries found:', countries.length);
    console.log('Countries:', countries);
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkCountries();
