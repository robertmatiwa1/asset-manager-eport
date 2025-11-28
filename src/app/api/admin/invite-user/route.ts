import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { email, fullName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 1. Create the user with Supabase Admin API (invitation email sent automatically)
    const { data: newUser, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
      });

    if (userError || !newUser?.user) {
      return NextResponse.json(
        { error: userError?.message || 'Failed to create user' },
        { status: 500 }
      );
    }

    // 2. Insert into public.profiles with default USER role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: fullName || '',
        role: 'USER',
      });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
