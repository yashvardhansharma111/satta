import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'hl4w92ky5tp';
const BASE    = 'https://api.codehap.com/dp/';

type DpMarketsResponse = { success: boolean; data?: unknown };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort  = searchParams.get('sort')  ?? '';
  const order = searchParams.get('order') ?? '';

  try {
    let url = `${BASE}?key=${API_KEY}&type=markets`;
    if (sort)  url += `&short=${sort}`;
    if (order) url += `&order=${order}`;

    const res  = await fetch(url, { cache: 'no-store' });
    const json = (await res.json()) as DpMarketsResponse;

    if (!json.success) {
      return NextResponse.json({ status: 'error', message: 'API error' }, { status: 502 });
    }

    return NextResponse.json({ status: 'success', data: json.data });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Failed to fetch markets' }, { status: 500 });
  }
}
