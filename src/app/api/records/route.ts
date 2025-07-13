import { NextResponse } from 'next/server';
import { createRecord, getRecords } from '../../../services/records';

export async function POST(req: Request) {
  try {
    const { categoryId, unitPrice, quantity, note, date, animalId, userId } = await req.json();
    if (!categoryId || !unitPrice || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Prepare data with proper date conversion
    const data: any = { 
      categoryId, 
      unitPrice: parseFloat(unitPrice), 
      quantity: parseInt(quantity), 
      note, 
      animalId, 
      userId 
    };
    
    // Convert date string to Date object if provided
    if (date) {
      data.date = new Date(date);
    }
    
    const record = await createRecord(data);
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e}` }, { status: 500 });
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
    if (categoryType) where.category = { categoryType: { name: categoryType } };
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
