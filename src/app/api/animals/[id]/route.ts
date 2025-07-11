import { NextResponse } from 'next/server';
import { getAnimalById, updateAnimal, deleteAnimal } from '../../../../services/animals';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const animal = await getAnimalById(params.id);
    if (!animal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(animal);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const animal = await updateAnimal(params.id, data);
    return NextResponse.json(animal);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteAnimal(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 