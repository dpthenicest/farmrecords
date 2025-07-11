import { NextResponse } from 'next/server';
import { createAnimal, getAnimals } from '../../../services/animals';

export async function POST(req: Request) {
  try {
    const { name, animalTypeId, description, userId } = await req.json();
    if (!name || !animalTypeId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const animal = await createAnimal({ name, animalTypeId, description, userId });
    return NextResponse.json(animal, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const animalTypeId = searchParams.get('animalTypeId');
    const where: any = {};
    if (userId) where.userId = userId;
    if (animalTypeId) where.animalTypeId = animalTypeId;
    const animals = await getAnimals(where);
    return NextResponse.json(animals);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// UPDATE and DELETE are handled in the dynamic [id] route 