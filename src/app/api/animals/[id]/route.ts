import { NextResponse } from 'next/server';
import { getAnimalById, updateAnimal, deleteAnimal } from '../../../../services/animals';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const animal = await getAnimalById(context.params.id);
    if (!animal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(animal);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const data = await request.json();
    const animal = await updateAnimal(context.params.id, data);
    return NextResponse.json(animal);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    await deleteAnimal(context.params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 