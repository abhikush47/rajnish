import { addVolunteer } from '@/lib/db';

export async function POST(req) {
  try {
    const { name, phone, email, village, interests, locale } = await req.json();

    if (!name || !phone || !village) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newVolunteer = await addVolunteer({
      name,
      phone,
      email: email || '',
      village,
      interests: interests || '',
      locale: locale || 'ne'
    });

    return Response.json({ success: true, data: newVolunteer });
  } catch (error) {
    console.error('Error saving volunteer application:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
