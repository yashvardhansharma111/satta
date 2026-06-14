import { NextResponse } from 'next/server';

import { connectToMongo } from '@/lib/mongodb';
import { GameSettingsModel } from '@/models/GameSettings';

const DEFAULT_TIME = '12:00 PM - 02:00 PM';

export async function GET() {
  try {
    await connectToMongo();
    const doc = await GameSettingsModel.findOne({ gameId: 'LAXMI_DAY' }).lean();
    return NextResponse.json({ time: doc?.time ?? DEFAULT_TIME });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ time: DEFAULT_TIME, error: message }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToMongo();
    const { time } = (await req.json()) as { time?: string };
    if (!time || typeof time !== 'string' || !time.trim()) {
      return NextResponse.json({ error: 'time is required' }, { status: 400 });
    }
    const doc = await GameSettingsModel.findOneAndUpdate(
      { gameId: 'LAXMI_DAY' },
      { $set: { gameId: 'LAXMI_DAY', time: time.trim() } },
      { upsert: true, new: true }
    ).lean();
    return NextResponse.json({ ok: true, time: doc?.time });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
