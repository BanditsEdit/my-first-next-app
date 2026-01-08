import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, message } = body;

  if (!email || !message) {
    return NextResponse.json(
      { error: "Email and message required" },
      { status: 400 }
    );
  }

  const res = await fetch(process.env.N8N_CHAT_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET!,
    },
    body: JSON.stringify({
      user_email: email,
      message,
    }),
  });

  const replyText = await res.text();

  return NextResponse.json({
    reply: replyText,
  });
}
