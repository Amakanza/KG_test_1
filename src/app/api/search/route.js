import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/neo4j';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    const query = `
      MATCH (c:Condition)
      WHERE toLower(c.name) CONTAINS toLower($searchTerm)
      RETURN c.name as name
      ORDER BY c.name
      LIMIT 20
    `;
    
    const results = await executeQuery(query, { searchTerm: q });
    const conditions = results.map(r => r.name);
    
    return NextResponse.json({ conditions });
  } catch (error) {
    console.error('Error searching conditions:', error);
    return NextResponse.json(
      { error: 'Failed to search conditions' },
      { status: 500 }
    );
  }
}
