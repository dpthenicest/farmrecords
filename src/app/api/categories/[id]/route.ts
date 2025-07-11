import { NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '../../../../services/categories';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const category = await getCategoryById(params.id);
    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const category = await updateCategory(params.id, data);
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteCategory(params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 