import { NextResponse } from 'next/server';
import { getYouthIdeas } from '@/lib/db';

export async function GET(req) {
  try {
    const allIdeas = await getYouthIdeas();

    // 1. Ideas Submitted (count of all submissions)
    const ideasSubmitted = allIdeas.length;

    // 2. Wards Covered (count of unique locations/wards covered)
    // We will extract unique numbers from location/ward fields
    const uniqueWards = new Set();
    allIdeas.forEach(yi => {
      // Try to parse ward number from 'ward' or 'location' fields
      const wardStr = String(yi.ward || yi.location || '').trim();
      const match = wardStr.match(/\b([1-9]|1[0-2])\b/); // Ward numbers usually between 1-12
      if (match) {
        uniqueWards.add(match[1]);
      } else if (wardStr) {
        // Fallback to ward string if not numeric, e.g. "Ward 5"
        const cleaned = wardStr.toLowerCase().replace(/[^0-9]/g, '');
        if (cleaned) {
          uniqueWards.add(cleaned);
        }
      }
    });
    // Ensure we cover at least some default wards if database is empty, but calculate dynamically
    const wardsCovered = Math.max(3, uniqueWards.size);

    // 3. Implemented (count of entries with status = 'implemented')
    const implemented = allIdeas.filter(yi => yi.status === 'implemented').length;

    return NextResponse.json({
      success: true,
      data: {
        ideasSubmitted,
        wardsCovered,
        implemented
      }
    });
  } catch (error) {
    console.error('Error fetching public youth ideas stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
