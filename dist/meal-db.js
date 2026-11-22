
/*
  GRUB SCRUB
  Shared ingredient labels and approved 3D positions

  Browser: read-only Supabase access
  Unapproved ingredient records: hidden
  Missing database: local JavaScript fallback
*/

(function () {
  "use strict";

  // Replace these two placeholders with values
  // from Supabase Project Settings -> API.
  //
  // Use a PUBLISHABLE key or legacy ANON key.
  // NEVER use a secret or service_role key.

  

  const SUPABASE_URL = "https://kfjvdviwqndadvztufez.supabase.co";



  const SUPABASE_KEY = "sb_publishable_HDvoxEfL25kcIJz0mi5xTg_cARq6ziP";

  const TABLE_NAME = "gs_meal_ingredients";

  const meals = new Map();
  let loaded = false;
  let loadingPromise = null;

  function isConfigured() {
    return (
      SUPABASE_URL.startsWith("https://") &&
      !SUPABASE_URL.includes("YOUR_") &&
      SUPABASE_KEY.length > 20 &&
      !SUPABASE_KEY.includes("YOUR_")
    );
  }

  function mealKey(restaurant, meal) {
    return JSON.stringify([
      String(restaurant || ""),
      String(meal || "")
    ]);
  }

  function validPosition(row) {
    return (
      typeof row.position === "string" &&
      typeof row.normal === "string" &&
      row.position.trim().length > 0 &&
      row.normal.trim().length > 0
    );
  }

  async function load() {
    if (loaded) return true;
    if (loadingPromise) return loadingPromise;

    if (!isConfigured()) {
      console.info(
        "Grub Scrub database not configured. " +
        "Using local demo ingredient labels."
      );
      return false;
    }

    loadingPromise = (async function () {
      try {
        const url = new URL(
          SUPABASE_URL.replace(/\/$/, "") +
          "/rest/v1/" + TABLE_NAME
        );

        url.searchParams.set(
          "select",
          "restaurant_name,meal_name,ingredient_name," +
          "sort_order,position,normal"
        );
        url.searchParams.set(
          "published", "eq.true"
        );
        url.searchParams.set(
          "order", "sort_order.asc"
        );

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "apikey": SUPABASE_KEY,
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(
            "Supabase returned " + response.status
          );
        }

        const rows = await response.json();

        if (!Array.isArray(rows)) {
          throw new Error("Unexpected database response");
        }

        meals.clear();

        for (const row of rows) {
          const key = mealKey(
            row.restaurant_name,
            row.meal_name
          );

          if (!meals.has(key)) {
            meals.set(key, []);
          }

          meals.get(key).push({
            name: row.ingredient_name,
            order: Number(row.sort_order || 0),
            position: validPosition(row)
              ? row.position
              : null,
            normal: validPosition(row)
              ? row.normal
              : null
          });
        }

        for (const ingredients of meals.values()) {
          ingredients.sort(
            (a, b) => a.order - b.order
          );
        }

        loaded = true;

        document.dispatchEvent(
          new CustomEvent("grub-meal-db-loaded")
        );

        console.info(
          "Grub Scrub: loaded ingredients for",
          meals.size,
          "meals"
        );

        return true;
      } catch (error) {
        console.warn(
          "Could not load shared ingredients:",
          error
        );
        return false;
      } finally {
        loadingPromise = null;
      }
    })();

    return loadingPromise;
  }

  function getIngredients(restaurant, meal) {
    const rows = meals.get(mealKey(restaurant, meal));

    if (!rows || !rows.length) {
      return null;
    }

    return rows.map(row => row.name);
  }

  function getPosition(restaurant, meal, ingredient) {
    const rows = meals.get(mealKey(restaurant, meal));

    if (!rows) return null;

    const row = rows.find(
      item => item.name === ingredient
    );

    if (!row || !row.position || !row.normal) {
      return null;
    }

    return {
      position: row.position,
      normal: row.normal
    };
  }


  // Get all published meal names for a restaurant
  // directly from the Supabase ingredient records.
  function getMealNames(restaurant) {
    const result = [];
    const seen = new Set();

    for (const key of meals.keys()) {
      const [restaurantName, mealName] = JSON.parse(key);

      if (restaurantName !== restaurant) continue;
      if (seen.has(mealName)) continue;

      seen.add(mealName);
      result.push(mealName);
    }

    return result;
  }


 
  window.GSMealDB = {
    load,
    getIngredients,
    getPosition,
    getMealNames,
    isConfigured,
    isLoaded: () => loaded
  };


  // Start loading immediately.
  load();
})();
