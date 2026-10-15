import { createClient } from "@/lib/supabase/server";
import { isRecordId } from "@/lib/validations/recordValidation";
import { getTrackerRecord } from "@/lib/repositories/trackerRepository";
import { buildRecordView } from "@/lib/tracker/record";

// Memuat satu catatan milik pengguna yang login untuk halaman detail & pratinjau PDF.
// { status: "guest" } | { status: "unavailable", reason } | { status: "ok", view }
export async function loadRecordView(id) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { status: "guest" };
  if (!isRecordId(id)) return { status: "unavailable", reason: "not_found" };
  const result = await getTrackerRecord(supabase, id);
  if (!result.ok) return { status: "unavailable", reason: result.reason };
  return { status: "ok", view: buildRecordView(result.record) };
}
