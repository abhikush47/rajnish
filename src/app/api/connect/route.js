import { NextResponse } from 'next/server';
import { addConnectRequest } from '@/lib/db';

export async function POST(req) {
  try {
    const { name, palika, ward, contact } = await req.json();

    if (!name || !palika || !ward || !contact) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newRequest = await addConnectRequest({
      name,
      palika,
      ward,
      contact
    });

    return NextResponse.json({ success: true, data: newRequest });
  } catch (error) {
    console.error('Error saving connection request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
