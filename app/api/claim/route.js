import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { date, name } = body;

  if (!date || !name || typeof name !== "string") {
    return Response.json({ error: "Missing date or name." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("wednesday_cooks")
    .insert({ wed_date: date, cook_name: name.trim() });

  if (error) {
    return Response.json({ error: "This week is already claimed (locked)." }, { status: 409 });
  }

  return Response.json({ ok: true });
}
