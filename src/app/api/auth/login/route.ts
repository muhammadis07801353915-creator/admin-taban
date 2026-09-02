import { NextResponse } from 'next/server';

const SUPERADMIN_PASSCODE = 'Tabancars1#';
const ASSISTANT_PASSCODE = '1000';

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();

    if (!passcode) {
      return NextResponse.json({ error: 'تکایە کۆدی تێپەڕبوون بنووسە' }, { status: 400 });
    }

    let role: 'superadmin' | 'assistant' | null = null;
    let redirectUrl = '/dashboard';

    if (passcode === SUPERADMIN_PASSCODE) {
      role = 'superadmin';
      redirectUrl = '/dashboard';
    } else if (passcode === ASSISTANT_PASSCODE) {
      role = 'assistant';
      redirectUrl = '/cars';
    } else {
      return NextResponse.json({ error: 'کۆدی تێپەڕبوون هەڵەیە' }, { status: 401 });
    }

    const response = NextResponse.json({ 
      success: true, 
      role, 
      redirectUrl 
    });

    // Set secure HTTP-only cookies
    const cookieOptions = {
      httpOnly: false, // Accessible to clientJS & middleware
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };

    response.cookies.set('taban_admin_role', role, cookieOptions);
    response.cookies.set('taban_admin_auth', 'authenticated', cookieOptions);

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'هەڵەیەک ڕوویدا لە سێرڤەر' }, { status: 500 });
  }
}
