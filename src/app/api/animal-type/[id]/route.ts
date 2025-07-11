import { NextResponse } from 'next/server';
import { getAnimalTypeById, updateAnimalType, deleteAnimalType } from '../../../../services/animalType';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const animalType = await getAnimalTypeById(params.id);
    if (!animalType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(animalType);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const animalType = await updateAnimalType(params.id, data);
    return NextResponse.json(animalType);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteAnimalType(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 