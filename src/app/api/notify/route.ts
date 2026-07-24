import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '') ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'https://kdlwstunxgbwxwafhvkm.supabase.co';

export async function POST(req: NextRequest) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: 'Service key missing' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, serviceKey);

    const { title, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // Fetch all push tokens from Supabase
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('token')
      .not('token', 'is', null);

    if (tokenError) {
      return NextResponse.json({ error: tokenError.message }, { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ message: 'No registered devices found', sent: 0 });
    }

    // Build Expo push messages
    const allMessages = tokens.map((row: any) => ({
      to: row.token,
      sound: 'default',
      title: `${title}`,
      body: body,
      data: { type: 'broadcast' },
      channelId: 'default',
    }));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    };
    
    if (process.env.EXPO_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
    }

    let totalSent = 0;
    let errors = 0;
    let errorDetails: any[] = [];

    // Expo API fails with PUSH_TOO_MANY_EXPERIENCE_IDS if a single request batch contains tokens from different Expo account experiences.
    // To solve this, we send each token individually (or grouped by project, sending 1-by-1 prevents 1 bad token from breaking others).
    for (const msg of allMessages) {
      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers,
          body: JSON.stringify([msg]),
        });

        const result = await response.json();
        
        if (response.ok && result.data && Array.isArray(result.data)) {
          const ticket = result.data[0];
          if (ticket && ticket.status === 'ok') {
            totalSent++;
          } else {
            errors++;
            errorDetails.push({ token: msg.to, ticket });
          }
        } else {
          errors++;
          errorDetails.push({ token: msg.to, error: result });
        }
      } catch (err: any) {
        errors++;
        errorDetails.push({ token: msg.to, exception: err.message });
      }
    }

    // Log the notification in Supabase
    await supabase.from('notifications_log').insert({
      title,
      body,
      sent_count: totalSent,
      failed_count: errors,
      total_devices: tokens.length,
    });

    return NextResponse.json({
      message: 'Notifications processed',
      sent: totalSent,
      failed: errors,
      total: tokens.length,
      details: errorDetails
    });
  } catch (e: any) {
    console.error('Notification error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
