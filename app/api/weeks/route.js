import { supabaseAdmin } from "@/lib/supabaseAdmin";

function toISODate(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function nextWednesday(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0..6
  const delta = (3 - day + 7) % 7; // 3 = Wed
  d.setDate(d.getDate() + delta);
  return d;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const count = Math.min(parseInt(searchParams.get("count") || "8", 10), 52);
  const page = Math.max(parseInt(searchParams.get("page") || "0", 10), 0);

  const start = nextWednesday(new Date());

  // page=0 -> next 8 Wednesdays
  // page=1 -> following 8 Wednesdays, etc.
  const first = new Date(start);
  first.setDate(start.getDate() + page * count * 7);

  const dates = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(first);
    d.setDate(first.getDate() + i * 7);
    dates.push(toISODate(d));
  }

  const { data, error } = await supabaseAdmin
    .from("wednesday_cooks")
    .select("wed_date, cook_name")
    .in("wed_date", dates);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const map = new Map();
  for (const row of data) map.set(row.wed_date, row.cook_name);

  return Response.json({
    weeks: dates.map((date) => ({ date, cookName: map.get(date) || null })),
  });
}
