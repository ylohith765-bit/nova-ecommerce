import { NextRequest } from "next/server";
import { POST as webhookHandler } from "../../stripe/webhook/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return webhookHandler(req);
}
