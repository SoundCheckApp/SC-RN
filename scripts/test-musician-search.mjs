/**
 * Smoke test for musician search against Supabase.
 *
 * Run:
 *   node scripts/test-musician-search.mjs
 *   node scripts/test-musician-search.mjs "Jazz Player"
 *
 * Optional auth (add to .env):
 *   TEST_CONSUMER_EMAIL=...
 *   TEST_CONSUMER_PASSWORD=...
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* optional */
  }
}

loadEnv();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const testEmail = process.env.TEST_CONSUMER_EMAIL;
const testPassword = process.env.TEST_CONSUMER_PASSWORD;

if (!url || !key) {
  console.error("FAIL: Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);
const query = process.argv[2] || "a";

const BASIC =
  "id, artist_name, username, genres, location, first_name, last_name";
const EXTENDED = `${BASIC}, latitude, longitude, is_live`;

function buildOrIlikeFilter(q) {
  const term = q.replace(/"/g, "").replace(/\\/g, "");
  const pattern = `"%${term}%"`;
  const cols = [
    "artist_name",
    "username",
    "genres",
    "location",
    "first_name",
    "last_name",
  ];
  return cols.map((c) => `${c}.ilike.${pattern}`).join(",");
}

async function run(label, fn) {
  const result = await fn();
  const { data, error, count } = result;
  console.log(`\n--- ${label} ---`);
  if (error) {
    console.log("ERROR:", error.message, error.code || "", error.details || "");
    return { ok: false, count: 0 };
  }
  const n = data?.length ?? count ?? 0;
  console.log("OK rows:", n);
  if (data?.length) {
    console.log(
      "Sample:",
      data.slice(0, 5).map((r) => ({
        artist_name: r.artist_name,
        username: r.username,
        first_name: r.first_name,
        last_name: r.last_name,
      }))
    );
  }
  return { ok: true, count: n };
}

console.log("Supabase:", url.replace(/https:\/\/([^.]+).*/, "https://$1..."));
console.log("Query:", JSON.stringify(query));

if (testEmail && testPassword) {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  if (authErr) {
    console.error("\nAuth FAIL:", authErr.message);
  } else {
    console.log("\nAuth OK:", auth.user?.email);
  }
} else {
  console.log("\n(No TEST_CONSUMER_EMAIL/PASSWORD — testing as anonymous)");
}

const visible = await run("Visible musicians (count)", () =>
  supabase.from("musicians").select("id", { count: "exact", head: true })
);

await run("Search (app query)", () =>
  supabase
    .from("musicians")
    .select(EXTENDED)
    .or(buildOrIlikeFilter(query))
    .limit(50)
);

if (visible.count === 0) {
  console.log(`
========================================
LIKELY ISSUE: RLS blocks musician reads
========================================
Anonymous / consumer sessions return 0 rows until you run:

  supabase_consumer_discovery.sql

in the Supabase SQL Editor. That adds:

  "Authenticated users can view musicians for discovery"

Then sign in as a consumer and search again.

To test with auth here, add to .env:
  TEST_CONSUMER_EMAIL=your@email.com
  TEST_CONSUMER_PASSWORD=yourpassword
`);
}

process.exit(visible.count > 0 ? 0 : 1);
