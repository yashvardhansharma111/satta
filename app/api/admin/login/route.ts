import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = (await req.json()) as { password?: string };
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'dpboss@123';

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
