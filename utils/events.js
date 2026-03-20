import { supabase } from "../lib/supabase";

/**
 * One row per consumer check-in at a musician’s event (`consumer_checkins`).
 * @typedef {{ id: string, eventDate: string, tipsAmount: number, rating: number | null, location: string }} MusicianEventRow
 */

export const EVENT_TIME_FRAME_OPTIONS = [
  "This Week",
  "This Month",
  "Past 3 Months",
  "Past 6 Months",
  "Past Year",
];

function startOfWeekMonday(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Inclusive local date range for `consumer_checkins.event_date` (DATE).
 * @param {string} label One of EVENT_TIME_FRAME_OPTIONS
 * @returns {{ start: Date, end: Date }}
 */
export function getEventDateRangeForTimeFrame(label) {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  switch (label) {
    case "This Week":
      start = startOfWeekMonday(now);
      break;
    case "This Month":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    case "Past 3 Months": {
      const s = new Date(now);
      s.setDate(s.getDate() - 90);
      s.setHours(0, 0, 0, 0);
      start = s;
      break;
    }
    case "Past 6 Months": {
      const s = new Date(now);
      s.setDate(s.getDate() - 180);
      s.setHours(0, 0, 0, 0);
      start = s;
      break;
    }
    case "Past Year": {
      const s = new Date(now);
      s.setDate(s.getDate() - 365);
      s.setHours(0, 0, 0, 0);
      start = s;
      break;
    }
    default:
      start = new Date(0);
  }

  return { start, end };
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Sum `consumer_tips.amount` rows when Supabase embeds them on the check-in row. */
function sumEmbeddedTips(embedded) {
  if (!embedded || !Array.isArray(embedded)) return 0;
  return embedded.reduce((s, row) => s + (Number(row?.amount) || 0), 0);
}

/**
 * Tips for one check-in: `tip_amount` on the row plus any linked `consumer_tips` ledger rows.
 * If you only use one of those in production, the other should stay 0 to avoid double-counting.
 */
function tipsAmountForCheckinRow(row) {
  const base = Number(row.tip_amount) || 0;
  const fromLedger = sumEmbeddedTips(row.consumer_tips);
  return base + fromLedger;
}

/**
 * @param {MusicianEventRow[]} events
 * @returns {{ totalEvents: number, totalTips: number, avgRating: number | null }}
 */
export function summarizeEvents(events) {
  const totalEvents = events.length;
  const totalTips = events.reduce((s, e) => s + (Number(e.tipsAmount) || 0), 0);
  const rated = events.filter(
    (e) => e.rating != null && !Number.isNaN(Number(e.rating))
  );
  const avgRating =
    rated.length === 0
      ? null
      : rated.reduce((s, e) => s + Number(e.rating), 0) / rated.length;
  return { totalEvents, totalTips, avgRating };
}

/**
 * Loads `consumer_checkins` for the signed-in musician within the selected time frame.
 * Requires RLS: musician can `SELECT` rows where `musician_id = auth.uid()`.
 */
export async function fetchMusicianEvents(musicianId, timeFrameLabel) {
  if (!musicianId) {
    return { events: [], error: null };
  }

  const { start, end } = getEventDateRangeForTimeFrame(timeFrameLabel);
  const startStr = toISODate(start);
  const endStr = toISODate(end);

  // supabase-js requires .select() immediately after .from() — filters come after.
  const checkinsSelect = (columns) =>
    supabase
      .from("consumer_checkins")
      .select(columns)
      .eq("musician_id", musicianId)
      .gte("event_date", startStr)
      .lte("event_date", endStr)
      .order("event_date", { ascending: false })
      .order("event_start_time", { ascending: false });

  let { data, error } = await checkinsSelect(
    "id, event_date, event_start_time, location, tip_amount, rating, consumer_tips ( amount )"
  );

  // If FK embed name differs in PostgREST, fall back to check-in row only (tip_amount still works).
  if (error) {
    const retry = await checkinsSelect(
      "id, event_date, event_start_time, location, tip_amount, rating"
    );
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.warn("fetchMusicianEvents:", error.message);
    return { events: [], error };
  }

  const events = (data ?? []).map((row) => ({
    id: row.id,
    eventDate: row.event_date,
    tipsAmount: tipsAmountForCheckinRow(row),
    rating: row.rating != null ? Number(row.rating) : null,
    location: typeof row.location === "string" ? row.location.trim() : "",
  }));

  return { events, error: null };
}
