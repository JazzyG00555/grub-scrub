import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
} from "./supabase-config.js";

const KEY_PLACEHOLDER = "PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE";

async function loadRestaurants() {
  if (
    !SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_PUBLISHABLE_KEY === KEY_PLACEHOLDER
  ) {
    console.warn(
      "Supabase test skipped: paste your sb_publishable_ key into dist/supabase-config.js."
    );
    return;
  }

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  const { data, error } = await supabase
    .from("restaurants")
    .select(`
      id,
      name,
      google_place_id,
      website,
      menu_url,
      created_at,
      menu_items (
        id,
        restaurant_id,
        name,
        description,
        price,
        ingredients,
        allergens,
        verification_status,
        created_at
      )
    `);

  if (error) {
    console.error("Supabase restaurants query failed:", error);
    return;
  }

  console.log("Supabase restaurants with menu items:", data);
}

loadRestaurants().catch(error => {
  console.error("Supabase test failed:", error);
});
