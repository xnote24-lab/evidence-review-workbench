import { NextResponse } from 'next/server'
import { mockApi } from '@/lib/mockApi'

export async function GET() {
  try {
    const cases = await mockApi.getCases(false)
    return NextResponse.json(cases)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}