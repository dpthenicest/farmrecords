import { NextResponse } from 'next/server';
import { createCategory, getCategories } from '../../../services/categories';

export async function POST(req: Request) {
  try {
    const { name, type, description, color, userId } = await req.json();
    if (!name || !type || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const existing = (await getCategories({ name, userId }))[0];
    if (existing) {
      return NextResponse.json({ error: 'Category already exists for this user' }, { status: 409 });
    }
    const category = await createCategory({ name, type, description, color, userId });
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const where = userId ? { userId } : {};
    const categories = await getCategories(where);
    return NextResponse.json(categories);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// UPDATE and DELETE are handled in the dynamic [id] route
