import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { date, typedName } = body;

  if (!date) return Response.json({ error: "Missing date." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("wednesday_cooks")
    .select("cook_name")
    .eq("wed_date", date)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "This week is not claimed." }, { status: 404 });

  const stored = data.cook_name;

  const nameOk =
    typeof typedName === "string" &&
    typedName.trim().length > 0 &&
    stored.toLowerCase() === typedName.trim().toLowerCase();

  if (!nameOk) {
    return Response.json(
      { error: "Name doesn’t match the cook on file for this week." },
      { status: 403 }
    );
  }

  const del = await supabaseAdmin.from("wednesday_cooks").delete().eq("wed_date", date);
  if (del.error) return Response.json({ error: del.error.message }, { status: 500 });

  return Response.json({ ok: true });
}
