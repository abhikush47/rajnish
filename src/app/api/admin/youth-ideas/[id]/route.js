import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getYouthIdeas, updateYouthIdea, deleteRecord } from '@/lib/db';

export async function GET(req, { params }) {
  try {
    try {
      await verifyAdminToken(req);
    } catch (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 401 });
    }

    const { id } = params;
    const allIdeas = await getYouthIdeas();
    const idea = allIdeas.find(yi => yi.id === id);

    if (!idea) {
      return NextResponse.json({ success: false, error: 'Youth idea not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: idea });
  } catch (error) {
    console.error('Error fetching admin youth idea detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    try {
      await verifyAdminToken(req);
    } catch (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { status, admin_note } = body;

    const fieldsToUpdate = {};
    if (status !== undefined) fieldsToUpdate.status = status;
    if (admin_note !== undefined) fieldsToUpdate.admin_note = admin_note;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields provided to update' }, { status: 400 });
    }

    const updatedIdea = await updateYouthIdea(id, fieldsToUpdate);
    return NextResponse.json({ success: true, data: updatedIdea });
  } catch (error) {
    console.error('Error updating youth idea status/note:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    try {
      await verifyAdminToken(req);
    } catch (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 401 });
    }

    const { id } = params;
    const deleted = await deleteRecord('youth_idea', id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Youth idea not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Youth idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting youth idea:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
