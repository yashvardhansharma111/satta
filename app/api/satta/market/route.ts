import { NextRequest, NextResponse } from 'next/server';

const API_KEY = '18pcw7mkx91z';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') ?? '';
  const ids = searchParams.get('ids') ?? '';

  if (!date || !ids) {
    return NextResponse.json({ status: 'error', message: 'date and ids are required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.codehap.com/satta/market/?key=${API_KEY}&date=${date}&ids=${ids}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'error', message: 'Failed to fetch market data' }, { status: 500 });
  }
}
