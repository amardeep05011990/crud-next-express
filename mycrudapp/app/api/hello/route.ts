
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // const res = await fetch(process.env.PATH_URL_BACKEND+'/api/posts', {
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // })
  // const result = await res.json()
  return NextResponse.json({ result: "test data" })
}