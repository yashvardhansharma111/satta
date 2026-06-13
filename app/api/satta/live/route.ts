import { NextResponse } from 'next/server';

const API_KEY = '18pcw7mkx91z';

export async function GET() {
  try {
    const res = await fetch(
      `https://api.codehap.com/satta/live/?key=${API_KEY}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'error', message: 'Failed to fetch live data' }, { status: 500 });
  }
}
