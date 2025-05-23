import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export function GET(request: NextRequest) {
  redirect('/afro-video');
} 