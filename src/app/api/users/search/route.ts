import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/users/search?q=searchterm - Search for users
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    const whereClause = query.length > 0 
      ? {
          AND: [
            {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { displayName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            },
            {
              role: { notIn: ['ADMIN', 'SUB_ADMIN'] }
            },
            {
              SubAdmin: null
            }
          ]
        }
      : {
          AND: [
            {
              role: { notIn: ['ADMIN', 'SUB_ADMIN'] }
            },
            {
              SubAdmin: null
            }
          ]
        };
    
    // Only return users who are not already admins or sub-admins
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        role: true
      },
      orderBy: {
        displayName: 'asc'
      },
      take: 20
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
} 