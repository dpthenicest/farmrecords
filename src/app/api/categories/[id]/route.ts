import { NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '../../../../services/categories';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const category = await getCategoryById(context.params.id);
    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const data = await request.json();
    const category = await updateCategory(context.params.id, data);
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    await deleteCategory(context.params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 