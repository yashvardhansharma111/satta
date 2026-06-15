import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo } from '@/lib/mongodb';
import { SiteSettingsModel } from '@/models/SiteSettings';

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  try {
    await connectToMongo();
    const doc = await SiteSettingsModel.findOne({ key }).lean();
    return NextResponse.json({ ok: true, value: doc?.value ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value } = (await req.json()) as { key: string; value: string };
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
    await connectToMongo();
    await SiteSettingsModel.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
