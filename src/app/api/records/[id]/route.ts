import { NextResponse } from 'next/server';
import { getRecordById, updateRecord, deleteRecord } from '../../../../services/records';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const record = await getRecordById(params.id);
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    // Convert date to Date object if present
    if (data.date) {
      data.date = new Date(data.date);
    }
    const record = await updateRecord(params.id, data);
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: `Server error ${e}` }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteRecord(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 