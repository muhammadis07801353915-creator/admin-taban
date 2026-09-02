import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('taban_admin_role', '', { path: '/', maxAge: 0 });
  response.cookies.set('taban_admin_auth', '', { path: '/', maxAge: 0 });

  return response;
}
