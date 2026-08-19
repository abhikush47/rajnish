import { NextResponse } from 'next/server';
import { getYouthIdeas, addYouthIdea } from '@/lib/db';

// Rate limiting & spam protection: track recent IPs / submissions in memory (basic protection)
const recentSubmissions = new Map(); // key: name-idea-hash, value: timestamp

export async function GET(req) {
  try {
    const allIdeas = await getYouthIdeas();
    
    // Anonymize/Format for public feed (max 8 records)
    const publicFeed = allIdeas.slice(0, 8).map(yi => ({
      id: yi.id,
      name: yi.name,
      idea: yi.idea,
      category: yi.category,
      location: yi.location,
      ward: yi.ward,
      status: yi.status,
      createdAt: yi.createdAt
    }));

    return NextResponse.json({ success: true, data: publicFeed });
  } catch (error) {
    console.error('Error fetching public youth ideas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { category, idea, name, location, contact, email, language } = body;

    // 1. Sanitize & Validations
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    if (!location || !location.trim()) {
      return NextResponse.json({ success: false, error: 'Location is required' }, { status: 400 });
    }
    if (!idea || idea.trim().length < 20 || idea.trim().length > 500) {
      return NextResponse.json({ success: false, error: 'Please describe your idea in at least 20 characters (maximum 500 characters).' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category is required' }, { status: 400 });
    }

    // Phone / Contact validation
    if (!contact || !/^[0-9+\-\s]{7,15}$/.test(contact.trim())) {
      return NextResponse.json({ success: false, error: 'Please enter a valid phone number.' }, { status: 400 });
    }
    // Reject suspicious dummy numbers
    const cleanedContact = contact.replace(/[^0-9]/g, '');
    if (/^(.)\1+$/.test(cleanedContact) || cleanedContact.length < 7 || cleanedContact === '1234567890') {
      return NextResponse.json({ success: false, error: 'Please enter a valid contact number.' }, { status: 400 });
    }

    // Basic duplicate / spam check (prevents identical ideas within 10 seconds)
    const submissionHash = `${name.trim()}-${idea.trim()}`.toLowerCase();
    const now = Date.now();
    if (recentSubmissions.has(submissionHash)) {
      const lastTime = recentSubmissions.get(submissionHash);
      if (now - lastTime < 10000) {
        return NextResponse.json({ success: false, error: 'Duplicate submission detected. Please wait a moment.' }, { status: 429 });
      }
    }
    recentSubmissions.set(submissionHash, now);

    // Clean up older items from Map to prevent memory leaks
    if (recentSubmissions.size > 1000) {
      for (const [key, value] of recentSubmissions.entries()) {
        if (now - value > 60000) {
          recentSubmissions.delete(key);
        }
      }
    }

    // 2. Save to database
    const allIdeas = await getYouthIdeas();
    const nextSerial = allIdeas.length + 1;
    const serialId = `YI-${String(nextSerial).padStart(6, '0')}`;

    const newIdea = await addYouthIdea({
      name: name.trim(),
      location: location.trim(),
      ward: body.ward || '',
      contact_number: contact.trim(),
      email: email ? email.trim() : '',
      category,
      idea: idea.trim(),
      language: language || 'en',
    });

    return NextResponse.json({
      success: true,
      serialId,
      data: {
        id: newIdea.id,
        status: newIdea.status,
        createdAt: newIdea.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving youth idea:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
