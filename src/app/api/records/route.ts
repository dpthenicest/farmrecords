import { NextResponse } from 'next/server';
import { createRecord, getRecords } from '../../../services/records';

export async function POST(req: Request) {
  try {
    const { type, categoryId, unitPrice, quantity, note, date, animalId, userId } = await req.json();
    if (!type || !categoryId || !unitPrice || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const data: any = { type, categoryId, unitPrice, quantity, note, animalId, userId };
    if (date) data.date = date;
    const record = await createRecord({ type, categoryId, unitPrice, quantity, note, date, animalId, userId });
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const animalId = searchParams.get('animalId');
    const animalTypeId = searchParams.get('animalTypeId');
    const categoryType = searchParams.get('categoryType');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const where: any = {};
    if (userId) where.userId = userId;
    if (animalId) where.animalId = animalId;
    if (categoryType) where.type = categoryType;
    if (animalTypeId) {
      where.animal = { animalTypeId };
    }
    const result = await getRecords({ where, page, pageSize, orderBy: { date: 'desc' } });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// UPDATE and DELETE are handled in the dynamic [id] route
