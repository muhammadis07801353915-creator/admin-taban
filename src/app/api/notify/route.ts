import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
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

    // Build Expo push messages (batch of 100)
    const messages = tokens.map((row: any) => ({
      to: row.token,
      sound: 'default',
      title: `${title}`,
      body: body,
      data: { type: 'broadcast' },
      channelId: 'default',
    }));

    // Send to Expo Push API in batches of 100
    const batchSize = 100;
    let totalSent = 0;
    let errors = 0;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(batch),
      });

      const result = await response.json();
      
      if (response.ok) {
        totalSent += batch.length;
      } else {
        errors += batch.length;
        console.error('Expo push error:', result);
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
      message: 'Notifications sent successfully',
      sent: totalSent,
      failed: errors,
      total: tokens.length,
    });
  } catch (e: any) {
    console.error('Notification error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
