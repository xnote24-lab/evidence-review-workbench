import { NextResponse } from 'next/server'
import { mockApi } from '@/lib/mockApi'

export async function GET(
  { params }: { params: { id: string } }
) {
  try {
    const caseData = await mockApi.getCaseDetails(params.id, false)
    return NextResponse.json(caseData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch case details' },
      { status: 500 }
    )
  }
}
