import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { seedDatabase } from '@/lib/seedDb';

// Public endpoint – seeds the database on first use (no auth required)
export async function POST() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      await seedDatabase();
      return NextResponse.json({ seeded: true });
    }
    return NextResponse.json({ seeded: false, message: 'Already seeded' });
  } catch (err) {
    console.error('[setup]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
