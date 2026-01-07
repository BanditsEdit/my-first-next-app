import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Database configuration error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, user_email, user_name } = body;

  if (!title || !user_email) {
    return NextResponse.json(
      { error: "Title and email required" },
      { status: 400 }
    );
  }

  try {
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title,
        user_email,
        user_name,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Call N8N webhook asynchronously (don't wait for it)
    const webhookUrl = process.env.N8N_ENHANCE_WEBHOOK_URL;
    if (webhookUrl && webhookUrl !== "https://your-n8n-instance.com/webhook/your-webhook-id") {
      console.log("Calling N8N webhook for task:", data.id);
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.N8N_WEBHOOK_SECRET && {
            "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET,
          }),
        },
        body: JSON.stringify({
          taskId: data.id,
          title: data.title,
          user_email: data.user_email,
        }),
      })
        .then(async (response) => {
          console.log(
            `N8N webhook response status: ${response.status} for task ${data.id}`
          );
          if (!response.ok) {
            const text = await response.text();
            console.error(
              `N8N webhook error: ${response.status} - ${text}`
            );
          } else {
            console.log("N8N webhook called successfully");
          }
        })
        .catch((error) => {
          console.error("Failed to call N8N webhook:", error);
        });
    } else {
      console.log("N8N webhook URL not configured or is placeholder");
    }
    
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Database configuration error" },
      { status: 500 }
    );
  }
}
