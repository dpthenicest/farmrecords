import { NextResponse } from 'next/server';
import { createAnimal, getAnimals } from '../../../services/animals';
import { createAnimalPurchaseRecord } from '../../../services/animal-records';

export async function POST(req: Request) {
  try {
    const { name, animalTypeId, description, userId, purchasePrice, quantity, note, purchaseDate } = await req.json();
    if (!name || !animalTypeId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create the animal first
    const animal = await createAnimal({ name, animalTypeId, description, userId });
    
    // Create a record for the animal purchase
    try {
      await createAnimalPurchaseRecord({
        animalId: animal.id,
        animalName: animal.name,
        animalTypeId: animal.animalTypeId,
        userId: animal.userId,
        purchasePrice,
        quantity,
        note,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined
      });
    } catch (recordError: any) {
      console.error('Error creating animal purchase record:', recordError);
      // If record creation fails, we should still return the animal but log the error
      // In a production environment, you might want to rollback the animal creation
      return NextResponse.json({ 
        animal, 
        warning: 'Animal created but purchase record could not be created',
        recordError: recordError.message 
      }, { status: 201 });
    }
    
    return NextResponse.json(animal, { status: 201 });
  } catch (e: any) {
    console.error('Error creating animal:', e);
    
    // Handle specific error cases
    if (e.message === 'Animal type not found') {
      return NextResponse.json({ error: 'Invalid animal type' }, { status: 400 });
    }
    
    if (e.message === 'Expense category type not found') {
      return NextResponse.json({ error: 'System configuration error: Expense category type not found' }, { status: 500 });
    }
    
    if (e.message === 'Failed to create record for animal purchase') {
      return NextResponse.json({ error: 'Failed to create purchase record for animal' }, { status: 500 });
    }
    
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