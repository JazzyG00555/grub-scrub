
/*
  GRUB SCRUB - MENU COMPATIBILITY

  Reads saved menu OCR text and selected food profiles.
  Finds possible dietary conflicts.
  Supports individual users, pairs and full groups.

  IMPORTANT:
  No detected keyword does NOT mean allergen-safe.
  All findings require restaurant verification.
*/

(function () {
  "use strict";

  const STORAGE_KEY = "grub-scrub-menu-scans-v1";

  const screen = document.getElementById(
    "screen-menu-results"
  );

  const filterButton = document.getElementById(
    "filterFlagsButton"
  );

  const progressText = document.getElementById(
    "menuResultsMatchLabel"
  );

  const progressBar = document.getElementById(
    "menuResultsProgressFill"
  );

  const progressTrack = document.getElementById(
    "menuResultsProgress"
  );

  const photo = document.getElementById(
    "menuResultsPhoto"
  );

  const oldMessage = document.getElementById(
    "menuFlagsMessage"
  );

  if (
    !screen ||
    !filterButton ||
    !progressText ||
    !progressBar ||
    !progressTrack
  ) {
    console.warn(
      "Grub Scrub menu compatibility: missing screen elements."
    );
    return;
  }

  // ------------------------------------------
  // DIETARY KEYWORD RULES
  // ------------------------------------------

  const RULES = {
    vegan: {
      label: "Animal-derived ingredient",
      pattern:
        /\b(beef|pork|chicken|duck|lamb|bacon|ham|fish|salmon|tuna|shrimp|prawn|crab|lobster|anchov(?:y|ies)|egg|eggs|milk|butter|cream|cheese|yogurt|gelato|ice cream|mascarpone|honey|gelatin)\b/gi
    },

    nutSafe: {
      label: "Nut-related ingredient",
      pattern:
        /\b(peanut|peanuts|almond|almonds|cashew|cashews|walnut|walnuts|pecan|pecans|pistachio|pistachios|hazelnut|hazelnuts|macadamia|pine nut|pine nuts|nutella|nut butter)\b/gi
    },

    glutenFree: {
      label: "Possible gluten-containing ingredient",
      pattern:
        /\b(wheat|barley|rye|semolina|couscous|bulgur|flour|bread|breadcrumb|breadcrumbs|pasta|noodle|noodles|biscuit|biscuits|cookie|cookies|pizza|pastry|croissant)\b/gi
    },

    seafoodSafe: {
      label: "Fish or shellfish ingredient",
      pattern:
        /\b(fish|salmon|tuna|anchovy|anchovies|shrimp|prawn|prawns|crab|lobster|oyster|oysters|clam|clams|mussel|mussels|squid|octopus|scallop|scallops)\b/gi
    }
  };

  // ------------------------------------------
  // STATE
  // ------------------------------------------

  let dishes = [];
  let people = [];
  let activeIds = [];
  let panelOpen = false;
  let currentMenuId = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);

    if (className) {
      node.className = className;
    }

    if (text !== undefined) {
      node.textContent = text;
    }

    return node;
  }

  function readMenus() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function selectedProfiles() {
    if (
      typeof window.GrubScanProfiles !== "function"
    ) {
      return [];
    }

    return window.GrubScanProfiles().map(user => ({
      id: String(user.id || user.name),
      name: String(user.name || "Guest"),
      filters: Array.isArray(user.filters)
        ? user.filters
        : [],
      restrictions: Array.isArray(user.restrictions)
        ? user.restrictions
        : [],
      requiresVerification:
        Boolean(user.requiresVerification)
    }));
  }

  // ------------------------------------------
  // EXTRACT DISHES FROM OCR TEXT
  // ------------------------------------------

  function extractDishes(text) {
    if (!text || !text.trim()) return [];

    const lines = text
      .split(/\r?\n/)
      .map(line => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const results = [];

    // Use price-ending lines as likely dish headings.
    // This avoids pretending every OCR line is a meal.
    const PRICE = /(?:\s|[-–])(?:\$)?\d{1,3}(?:[.,]\d{1,2})?\s*$/;

    const IGNORE =
      /^(total|subtotal|tax|service charge|gratuity|page \d+)$/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!PRICE.test(line)) continue;

      const name = line
        .replace(PRICE, "")
        .replace(/\s*[-–]\s*$/, "")
        .trim();

      if (
        name.length < 3 ||
        name.length > 85 ||
        IGNORE.test(name)
      ) {
        continue;
      }

      // Include a following ingredient/description
      // line, but not the heading of the next dish.
      let description = "";

      if (i + 1 < lines.length) {
        const next = lines[i + 1];

        if (
          !PRICE.test(next) &&
          next.length >= 5 &&
          next.length <= 220
        ) {
          description = next;
        }
      }

      results.push({
        name,
        description,
        text: name + " " + description
      });

      if (results.length >= 40) break;
    }

    // Avoid duplicates caused by repeated OCR lines.
    const seen = new Set();

    return results.filter(dish => {
      const key = dish.name.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }

  // ------------------------------------------
  // CHECK ONE DISH FOR ONE USER
  // ------------------------------------------

  function checkDishForUser(dish, user) {
    const warnings = [];
    const knownFilters = [];

    for (const filter of user.filters) {
      const rule = RULES[filter];

      if (!rule) {
        continue;
      }

      knownFilters.push(filter);

      // Reset match state before each test.
      rule.pattern.lastIndex = 0;

      const matches = dish.text.match(rule.pattern);

      if (matches && matches.length) {
        warnings.push({
          type: rule.label,
          words: [...new Set(
            matches.map(word => word.toLowerCase())
          )]
        });
      }
    }

    if (warnings.length) {
      return {
        status: "flagged",
        warnings
      };
    }

    // Unknown restrictions cannot be evaluated
    // by the currently supported OCR keyword rules.
    if (
      user.requiresVerification ||
      user.filters.some(filter => !RULES[filter])
    ) {
      return {
        status: "unknown",
        warnings: []
      };
    }

    // No selected restrictions means no meaningful
    // dietary compatibility screening is possible.
    if (knownFilters.length === 0) {
      return {
        status: "unknown",
        warnings: []
      };
    }

    return {
      status: "possible",
      warnings: []
    };
  }

  // ------------------------------------------
  // CHECK A GROUP OF USERS
  // ------------------------------------------

  function checkDishForGroup(dish, group) {
    const results = group.map(user => ({
      user,
      result: checkDishForUser(dish, user)
    }));

    if (results.some(
      item => item.result.status === "flagged"
    )) {
      return {
        status: "flagged",
        results
      };
    }

    if (results.some(
      item => item.result.status === "unknown"
    )) {
      return {
        status: "unknown",
        results
      };
    }

    return {
      status: "possible",
      results
    };
  }

  // ------------------------------------------
  // GROUP CHOICES
  // ------------------------------------------

  function buildCombinations(items) {
    const groups = [];

    // Individual profiles.
    for (const person of items) {
      groups.push([person]);
    }

    // Pairs.
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        groups.push([items[i], items[j]]);
      }
    }

    // Three-person groups.
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        for (let k = j + 1; k < items.length; k++) {
          groups.push([
            items[i],
            items[j],
            items[k]
          ]);
        }
      }
    }

    // Also support groups larger than three.
    if (items.length > 3) {
      groups.push(items);
    }

    return groups;
  }

  function groupKey(group) {
    return group.map(user => user.id).join("|");
  }

  function findGroup(key) {
    const options = buildCombinations(people);

    return options.find(
      group => groupKey(group) === key
    ) || [];
  }

  // ------------------------------------------
  // CREATE RESULTS PANEL
  // ------------------------------------------

  const panel = element(
    "div",
    "gs-scan-compat-panel"
  );

  panel.id = "gsScanCompatPanel";
  panel.hidden = true;

  // Position below the existing progress bar.
  const scoreSection = screen.querySelector(
    ".menu-results-score"
  );

  if (scoreSection) {
    scoreSection.after(panel);
  }

  function addExplanation(parent, text) {
    parent.appendChild(
      element("p", "gs-scan-explanation", text)
    );
  }

  function makeUserSelector() {
    const label = element(
      "label",
      "gs-scan-selector-label",
      "SHOW RESULTS FOR"
    );

    label.htmlFor = "gsScanUserGroup";

    const select = element(
      "select",
      "gs-scan-group-select"
    );

    select.id = "gsScanUserGroup";

    const groups = buildCombinations(people);

    for (const group of groups) {
      const option = document.createElement("option");

      option.value = groupKey(group);
      option.textContent = group
        .map(person => person.name)
        .join(" + ");

      select.appendChild(option);
    }

    const requestedKey = activeIds.join("|");

    const match = groups.find(
      group => groupKey(group) === requestedKey
    );

    const chosen = match ||
      groups.find(group =>
        group.length === people.length
      ) ||
      groups[0] ||
      [];

    activeIds = chosen.map(user => user.id);

    select.value = groupKey(chosen);

    select.addEventListener("change", () => {
      const selected = findGroup(select.value);
      activeIds = selected.map(user => user.id);
      renderResults();
    });

    const container = element(
      "div",
      "gs-scan-selector"
    );

    container.append(label, select);

    return container;
  }

  // ------------------------------------------
  // DISPLAY SCORES AND FLAGGED DISHES
  // ------------------------------------------

  function setScore(group) {
    const results = dishes.map(dish =>
      checkDishForGroup(dish, group)
    );

    const possible = results.filter(
      result => result.status === "possible"
    ).length;

    const flagged = results.filter(
      result => result.status === "flagged"
    ).length;

    const unknown = results.filter(
      result => result.status === "unknown"
    ).length;

    // A score is not meaningful with no recognized
    // dishes or no dietary screening restrictions.
    const canScore =
      dishes.length > 0 &&
      group.length > 0 &&
      group.every(person =>
        !person.requiresVerification &&
        person.filters.length > 0 &&
        person.filters.every(filter => !!RULES[filter])
      );

    if (!canScore) {
      progressText.textContent =
        "Potential Match: Not enough verified data";

      progressBar.style.width = "0%";

      progressTrack.removeAttribute("aria-valuenow");

      progressTrack.setAttribute(
        "aria-valuetext",
        "Compatibility not calculated"
      );

      return { possible, flagged, unknown };
    }

    const percentage = Math.round(
      (possible / dishes.length) * 100
    );

    progressText.textContent =
      percentage + "% Potential Match";

    progressBar.style.width = percentage + "%";

    progressTrack.setAttribute(
      "aria-valuenow",
      String(percentage)
    );

    progressTrack.setAttribute(
      "aria-valuetext",
      percentage +
      " percent with no detected keyword conflicts"
    );

    return { possible, flagged, unknown };
  }

  function makeDishCard(dish, group) {
    const check = checkDishForGroup(dish, group);

    const card = element(
      "article",
      "gs-scan-dish-card " + check.status
    );

    card.appendChild(
      element("strong", "gs-scan-dish-name", dish.name)
    );

    if (dish.description) {
      card.appendChild(
        element(
          "p",
          "gs-scan-dish-description",
          dish.description
        )
      );
    }

    const statusText = {
      possible: "No keyword conflict detected",
      flagged: "Potential dietary conflict",
      unknown: "Needs ingredient verification"
    };

    card.appendChild(
      element(
        "p",
        "gs-scan-dish-status",
        statusText[check.status]
      )
    );

    // Show the individual result for every member
    // of the chosen pair or group.
    for (const { user, result } of check.results) {
      const line = element(
        "div",
        "gs-scan-person-result"
      );

      const status = {
        possible: "No detected keyword conflict",
        flagged: "Flagged",
        unknown: "Unverified"
      };

      line.appendChild(
        element(
          "strong",
          "",
          user.name + ": " + status[result.status]
        )
      );

      if (result.warnings.length) {
        const words = result.warnings.flatMap(
          warning => warning.words
        );

        line.appendChild(
          element(
            "span",
            "",
            "Found: " + [...new Set(words)].join(", ")
          )
        );
      }

      card.appendChild(line);
    }

    return card;
  }

  function renderResults() {
    people = selectedProfiles();

    panel.replaceChildren();

    if (people.length === 0) {
      progressText.textContent =
        "Select food profiles to compare";

      progressBar.style.width = "0%";

      addExplanation(
        panel,
        "Select Jamie, Gus, Brad, or another profile " +
        "on the Food Profiles screen before scanning."
      );

      return;
    }

    if (!dishes.length) {
      progressText.textContent =
        "Potential Match: Not available";

      progressBar.style.width = "0%";

      panel.appendChild(makeUserSelector());

      addExplanation(
        panel,
        "The scanner could not reliably identify " +
        "individual priced dishes from this image. " +
        "Try scanning a clearer menu. No percentage " +
        "has been estimated."
      );

      return;
    }

    panel.appendChild(makeUserSelector());

    const group = people.filter(user =>
      activeIds.includes(user.id)
    );

    const counts = setScore(group);

    const heading = element(
      "h3",
      "gs-scan-heading",
      group.length === 1
        ? group[0].name + "'s menu results"
        : "Shared meal options for " +
          group.map(person => person.name).join(", ")
    );

    panel.appendChild(heading);

    panel.appendChild(
      element(
        "p",
        "gs-scan-counts",
        counts.possible + " without detected conflicts · " +
        counts.flagged + " flagged · " +
        counts.unknown + " unverified"
      )
    );

    addExplanation(
      panel,
      "Potential Match is based only on keywords " +
      "recognized in the scanned menu. " +
      "It is not a confirmed allergy-safety score. " +
      "Ask the restaurant about complete ingredients, " +
      "preparation, and cross-contact."
    );

    const list = element(
      "div",
      "gs-scan-dish-list"
    );

    for (const dish of dishes) {
      list.appendChild(
        makeDishCard(dish, group)
      );
    }

    panel.appendChild(list);
  }

  // ------------------------------------------
  // LOAD THE SAVED SCAN WHEN RESULTS OPEN
  // ------------------------------------------

  function loadCurrentMenu() {
    const saved = readMenus();

    // Match the displayed menu photo to its scan
    // so old Recall List entries work correctly.
    const match = saved.find(
      item => item.photo &&
        photo?.getAttribute("src") === item.photo
    );

    if (!match) {
      currentMenuId = null;
      dishes = [];
      people = selectedProfiles();
      activeIds = people.map(user => user.id);
      renderResults();
      return;
    }

    if (currentMenuId !== match.id) {
      currentMenuId = match.id;
      activeIds = [];
      
      // Prefer structured dishes from the newer OCR scanner.
      const savedItems = match.menuAnalysis?.items;

      dishes = Array.isArray(savedItems) &&
        savedItems.length
          ? savedItems
              .filter(item => item.name)
              .map(item => ({
                name: item.name,
                description: item.description || "",
                text: [
                  item.name,
                  item.description || ""
                ].join(" ")
              }))
          : extractDishes(
              match.recognizedText || ""
            );

    }

    people = selectedProfiles();

    if (!activeIds.length) {
      activeIds = people.map(user => user.id);
    }

    renderResults();
  }

  // ------------------------------------------
  // FILTER FLAGS BUTTON
  // ------------------------------------------

  // The old code only toggles explanatory text.
  // Capture this click first, then display our
  // functional filter interface instead.
  filterButton.addEventListener(
    "click",
    event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      panelOpen = !panelOpen;
      panel.hidden = !panelOpen;

      filterButton.setAttribute(
        "aria-expanded",
        String(panelOpen)
      );

      if (oldMessage) {
        oldMessage.hidden = true;
      }

      if (panelOpen) {
        loadCurrentMenu();
        panel.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    },
    true
  );

  // The original app changes the screen's
  // "active" class when a saved scan opens.
  const observer = new MutationObserver(() => {
    if (!screen.classList.contains("active")) {
      return;
    }

    panelOpen = false;
    panel.hidden = true;

    filterButton.setAttribute(
      "aria-expanded",
      "false"
    );

    // Load the result data after the existing
    // openMenuResults function sets the photo.
    loadCurrentMenu();
  });

  observer.observe(screen, {
    attributes: true,
    attributeFilter: ["class"]
  });

  filterButton.setAttribute(
    "aria-expanded",
    "false"
  );

})();
