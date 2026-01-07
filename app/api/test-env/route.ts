import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseKey?.length || 0,
    // Don't expose actual values, just check if they exist
    message: supabaseUrl && supabaseKey 
      ? "Environment variables are loaded correctly" 
      : "Missing environment variables. Check your .env.local file.",
  });
}
