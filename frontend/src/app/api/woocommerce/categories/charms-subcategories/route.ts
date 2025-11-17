import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty subcategories for charms category
    return NextResponse.json({
      subcategories: [],
      message: "No subcategories found for charms category"
    });
  } catch (error) {
    console.error('Error fetching charms subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charms subcategories' },
      { status: 500 }
    );
  }
}