import { NextResponse } from 'next/server';
import { getAnimalTypeById, updateAnimalType, deleteAnimalType } from '../../../../services/animalType';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const animalType = await getAnimalTypeById(context.params.id);
    if (!animalType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(animalType);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const data = await request.json();
    const animalType = await updateAnimalType(context.params.id, data);
    return NextResponse.json(animalType);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    await deleteAnimalType(context.params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 