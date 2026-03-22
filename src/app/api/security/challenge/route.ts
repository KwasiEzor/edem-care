import { generateMathChallenge } from "@/lib/security/challenges";
import { NextResponse } from "next/server";

export async function GET() {
  const challenge = generateMathChallenge();
  return NextResponse.json(challenge);
}
