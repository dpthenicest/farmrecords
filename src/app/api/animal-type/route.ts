import { NextResponse } from 'next/server';
import { createAnimalType, getAnimalTypes } from '../../../services/animalType';

export async function POST(req: Request) {
  try {
    const { type } = await req.json();
    if (!type) {
      return NextResponse.json({ error: 'Missing required field: type' }, { status: 400 });
    }
    const existing = (await getAnimalTypes({ type }))[0];
    if (existing) {
      return NextResponse.json({ error: 'Animal type already exists' }, { status: 409 });
    }
    const animalType = await createAnimalType({ type });
    return NextResponse.json(animalType, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const animalTypes = await getAnimalTypes();
    return NextResponse.json(animalTypes);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// UPDATE and DELETE are handled in the dynamic [id] route
