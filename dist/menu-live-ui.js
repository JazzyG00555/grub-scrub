
/*
  GRUB SCRUB - LIVE MENU SCANNER UI

  Adds:
  - Live potential compatibility bar
  - Filter Flags by one or multiple people
  - Breakdown of recognized dishes
  - Support for original and custom food profiles

  Does not replace the existing camera or OCR.
*/

(function () {
  "use strict";

  const RULES = {
    vegan: {
      name: "Animal-derived ingredients",
      pattern: /\b(beef|pork|chicken|duck|lamb|bacon|ham|fish|salmon|tuna|shrimp|prawn|crab|lobster|egg|eggs|milk|butter|cream|cheese|yogurt|gelato|mascarpone|honey|gelatin)\b/i
    },
    nutSafe: {
      name: "Nut ingredients",
      pattern: /\b(peanuts?|almonds?|cashews?|walnuts?|pecans?|pistachios?|hazelnuts?|macadamia|nutella|pine nuts?)\b/i
    },
    glutenFree: {
      name: "Potential gluten ingredients",
      pattern: /\b(wheat|barley|rye|semolina|bulgur|couscous|flour|bread|pasta|noodles?|biscuits?|cookies?|pizza|pastry)\b/i
    },
    seafoodSafe: {
      name: "Fish or shellfish ingredients",
      pattern: /\b(fish|salmon|tuna|shrimp|prawns?|crab|lobster|oysters?|clams?|mussels?|squid|scallops?|anchovies)\b/i
    }
  };

  const screen = document.getElementById("screen-menu-scanner");

  if (!screen) return;

  const scanner = screen.querySelector(".menu-scanner-page");

  if (!scanner) return;

  let people = [];
  let selectedNames = new Set();
  let selectionInitialized = false;
  let lastText = "";
  let filterOpen = false;

  // -----------------------------------------
  // READ FOOD PROFILES
  // -----------------------------------------

  function getPeople() {
    if (typeof window.GrubScanProfiles !== "function") {
      return [];
    }

    try {
      return window.GrubScanProfiles().map(user => ({
        name: String(user.name || "Guest"),
        filters: Array.isArray(user.filters)
          ? user.filters
          : [],
        restrictions: Array.isArray(user.restrictions)
          ? user.restrictions
          : [],
        requiresVerification: !!user.requiresVerification
      }));
    } catch (error) {
      console.warn("Unable to read profiles:", error);
      return [];
    }
  }

  function syncPeople() {
    const latest = getPeople();
    const latestNames = new Set(latest.map(p => p.name));

    // Keep the current selection when possible.
    selectedNames = new Set(
      [...selectedNames].filter(name =>
        latestNames.has(name)
      )
    );

   
  // Select participating people only on initial setup.
  // Never automatically reselect unchecked profiles.
  if (!selectionInitialized && latest.length > 0) {
    selectedNames = new Set(
      latest.map(person => person.name)
    );
    selectionInitialized = true;
  }


    people = latest;
  }

  function activePeople() {
    return people.filter(person =>
      selectedNames.has(person.name)
    );
  }

  window.GrubLiveScan = {
    includesUser(name) {
      return selectedNames.has(name);
    }
  };

  // -----------------------------------------
  // BUILD SCANNER INTERFACE
  // -----------------------------------------

  const style = document.createElement("style");
  style.textContent = `
    #gsLiveScanControls {
      position: relative;
      z-index: 30;
      padding: 14px 18px 18px;
      background: #000;
      color: #fff;
      font-family: Arial, sans-serif;
    }

    .gs-live-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }

    #gsLiveFilterButton {
      border: none;
      border-radius: 28px;
      background: #858585;
      color: white;
      padding: 12px 17px;
      font-size: 14px;
      font-weight: 500;
    }

    #gsLiveGroupCaption {
      color: white;
      font-size: 13px;
      text-align: right;
      line-height: 1.4;
    }

    #gsLiveScoreTrack {
      position: relative;
      height: 32px;
      overflow: hidden;
      border-radius: 24px;
      background: #818181;
    }

    #gsLiveScoreFill {
      width: 0;
      height: 100%;
      border-radius: inherit;
      background: #d0da62;
      transition: width 250ms ease;
    }

    #gsLiveScoreLabel {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #111;
      font-size: 13px;
      font-weight: 800;
      white-space: nowrap;
    }

    #gsLiveFilterPanel {
      margin-top: 14px;
      padding: 15px;
      border: 1px solid #a85a88;
      background: #202020;
    }

    #gsLiveFilterPanel[hidden] {
      display: none !important;
    }

    .gs-live-filter-title {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 700;
    }

    .gs-live-person {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      color: white;
      font-size: 14px;
    }

    .gs-live-person input {
      width: 18px;
      height: 18px;
      accent-color: #b55b91;
    }

    .gs-live-note {
      margin: 12px 0 0;
      color: #c9c9c9;
      font-size: 11px;
      line-height: 1.5;
    }

    #gsLiveBreakdown {
      max-height: 220px;
      overflow-y: auto;
      margin-top: 12px;
      font-size: 12px;
    }

    .gs-live-dish {
      padding: 10px 0;
      border-top: 1px solid #555;
    }

    .gs-live-dish-name {
      color: white;
      font-weight: 700;
    }

    .gs-live-dish-details {
      margin-top: 5px;
      color: #dedede;
      line-height: 1.5;
    }

    .gs-live-flagged {
      color: #ff8e94;
    }

    .gs-live-clear {
      color: #d0da62;
    }

    @media (max-width: 390px) {
      #gsLiveScanControls {
        padding: 10px 12px 13px;
      }

      #gsLiveFilterButton {
        padding: 10px 13px;
        font-size: 12px;
      }

      #gsLiveScoreLabel {
        font-size: 12px;
      }
    }
  `;

  document.head.appendChild(style);

  const controls = document.createElement("div");
  controls.id = "gsLiveScanControls";

  controls.innerHTML = `
    <div class="gs-live-top">
      <button
        type="button"
        id="gsLiveFilterButton"
        aria-expanded="false"
        aria-controls="gsLiveFilterPanel"
      >
        Meal Sharing Filter
      </button>

      <span id="gsLiveGroupCaption">
        Choose food profiles
      </span>
    </div>

    <div
      id="gsLiveScoreTrack"
      role="progressbar"
      aria-label="Potential menu matches"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuetext="Not analyzed"
    >
      <div id="gsLiveScoreFill"></div>
      <span id="gsLiveScoreLabel">
        Waiting for menu...
      </span>
    </div>

    <div id="gsLiveFilterPanel" hidden>
      <p class="gs-live-filter-title">
        Show flags for:
      </p>

      <div id="gsLivePeople"></div>

      <p class="gs-live-note">
        Select one person or several people to
        compare their potential menu conflicts.
      </p>

      <div id="gsLiveBreakdown"></div>
    </div>

    <p class="gs-live-note">
      OCR-based screening only. No detected flag
      does not mean a dish is safe.
      Confirm ingredients and cross-contact.
    </p>
  `;

  const header = scanner.querySelector(
    ".menu-scanner-header"
  );

  if (header) {
    header.after(controls);
  } else {
    scanner.prepend(controls);
  }

  const filterButton = document.getElementById(
    "gsLiveFilterButton"
  );
  const filterPanel = document.getElementById(
    "gsLiveFilterPanel"
  );
  const peopleContainer = document.getElementById(
    "gsLivePeople"
  );
  const scoreLabel = document.getElementById(
    "gsLiveScoreLabel"
  );
  const scoreFill = document.getElementById(
    "gsLiveScoreFill"
  );
  const scoreTrack = document.getElementById(
    "gsLiveScoreTrack"
  );
  const groupCaption = document.getElementById(
    "gsLiveGroupCaption"
  );
  const breakdown = document.getElementById(
    "gsLiveBreakdown"
  );

  // -----------------------------------------
  // IDENTIFY MENU DISHES
  // -----------------------------------------

  function extractDishes(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map(line => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const results = [];
    const pricePattern =
      /(?:\s|[-–])\$?\d{1,3}(?:[.,]\d{1,2})?\s*$/;

    for (let i = 0; i < lines.length; i++) {
      if (!pricePattern.test(lines[i])) continue;

      const name = lines[i]
        .replace(pricePattern, "")
        .trim();

      if (name.length < 3 || name.length > 85) {
        continue;
      }

      const description =
        lines[i + 1] &&
        !pricePattern.test(lines[i + 1])
          ? lines[i + 1]
          : "";

      results.push({
        name,
        text: name + " " + description
      });
    }

    return [...new Map(
      results.map(dish => [
        dish.name.toLowerCase(), dish
      ])
    ).values()].slice(0, 40);
  }

  // -----------------------------------------
  // COMPARE USERS AGAINST ONE DISH
  // -----------------------------------------

  function checkUser(dish, person) {
    const warnings = [];

    for (const filter of person.filters) {
      const rule = RULES[filter];
      if (!rule) continue;

      const match = dish.text.match(rule.pattern);

      if (match) {
        warnings.push(
          rule.name + ": " + match[0]
        );
      }
    }

    const unsupported =
      person.requiresVerification ||
      person.filters.length === 0 ||
      person.filters.some(filter => !RULES[filter]);

    return {
      warnings,
      status: warnings.length
        ? "flagged"
        : unsupported
          ? "unknown"
          : "potential"
    };
  }

  function getResults() {
    const selected = activePeople();
    const dishes = extractDishes(lastText);

    return dishes.map(dish => {
      const peopleResults = selected.map(person => ({
        person,
        result: checkUser(dish, person)
      }));

      const status = peopleResults.some(item =>
        item.result.status === "flagged"
      ) ? "flagged"
        : peopleResults.some(item =>
            item.result.status === "unknown"
          ) ? "unknown"
          : "potential";

      return {
        dish,
        peopleResults,
        status
      };
    });
  }

  // -----------------------------------------
  // RENDER FILTERS
  // -----------------------------------------

  function renderPeople() {
    peopleContainer.replaceChildren();

    for (const person of people) {
      const label = document.createElement("label");
      label.className = "gs-live-person";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selectedNames.has(person.name);

      const name = document.createElement("span");
      name.textContent = person.name;

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selectedNames.add(person.name);
        } else {
          selectedNames.delete(person.name);
        }

        renderScore();
        document.dispatchEvent(
          new CustomEvent("grub-live-profile-filter-change")
        );
      });

      label.append(checkbox, name);
      peopleContainer.appendChild(label);
    }
  }

  // -----------------------------------------
  // RENDER COMPATIBILITY
  // -----------------------------------------

  function renderScore() {
    const selected = activePeople();
    const names = selected.map(person => person.name);

    groupCaption.textContent = names.length
      ? names.join(" + ")
      : "No profiles selected";

    const results = getResults();
    const possible = results.filter(
      item => item.status === "potential"
    ).length;

    const scoreable =
      selected.length > 0 &&
      results.length > 0 &&
      selected.every(person =>
        !person.requiresVerification &&
        person.filters.length > 0 &&
        person.filters.every(filter => RULES[filter])
      );

    if (scoreable) {
      const percentage = Math.round(
        possible / results.length * 100
      );

      scoreLabel.textContent =
        percentage + "% Potential Match";

      scoreFill.style.width = percentage + "%";

      scoreTrack.setAttribute(
        "aria-valuenow", String(percentage)
      );
      scoreTrack.setAttribute(
        "aria-valuetext",
        percentage +
        "% of recognized dishes with no detected conflicts"
      );
    } else {
      scoreLabel.textContent = selected.length
        ? "Not enough menu data"
        : "Select food profiles";

      scoreFill.style.width = "0%";
      scoreTrack.removeAttribute("aria-valuenow");

      scoreTrack.setAttribute(
        "aria-valuetext",
        "No compatibility percentage available"
      );
    }

    renderBreakdown(results);
  }

  function renderBreakdown(results) {
    breakdown.replaceChildren();

    if (!results.length) {
      const note = document.createElement("p");
      note.className = "gs-live-note";
      note.textContent =
        "Point at a readable menu with dish names " +
        "and prices to see individual results.";
      breakdown.appendChild(note);
      return;
    }

    for (const item of results) {
      const card = document.createElement("div");
      card.className = "gs-live-dish";

      const title = document.createElement("div");
      title.className = "gs-live-dish-name";
      title.textContent = item.dish.name;

      card.appendChild(title);

      for (const { person, result } of item.peopleResults) {
        const line = document.createElement("div");
        line.className = "gs-live-dish-details";

        const message = result.warnings.length
          ? result.warnings.join("; ")
          : result.status === "unknown"
            ? "Needs verification"
            : "No detected keyword conflict";

        line.textContent =
          person.name + ": " + message;

        line.classList.add(
          result.status === "flagged"
            ? "gs-live-flagged"
            : "gs-live-clear"
        );

        card.appendChild(line);
      }

      breakdown.appendChild(card);
    }
  }

  // -----------------------------------------
  // OPEN / CLOSE FILTER FLAGS
  // -----------------------------------------

  
  filterButton.addEventListener("click", event => {
    event.preventDefault();

    filterOpen = !filterOpen;
    filterPanel.hidden = !filterOpen;

    // Keep the actual panel visibility in sync.
    filterPanel.style.setProperty(
      "display",
      filterOpen ? "block" : "none",
      "important"
    );

    filterButton.setAttribute(
      "aria-expanded",
      String(filterOpen)
    );

    if (filterOpen) {
      syncPeople();
      renderPeople();
      renderScore();
    }
  });

  // -----------------------------------------
  // RECEIVE TEXT FROM THE EXISTING OCR
  // -----------------------------------------

  document.addEventListener(
    "grub-live-menu-text",
    event => {
      lastText = String(event.detail?.text || "");
      renderScore();
    }
  );

  // -----------------------------------------
  // UPDATE WHEN MENU SCANNER OPENS
  // -----------------------------------------

  const observer = new MutationObserver(() => {
    if (!screen.classList.contains("active")) {
      return;
    }

    syncPeople();
    renderPeople();

    lastText = "";
    filterOpen = false;
    filterPanel.hidden = true;

    filterButton.setAttribute(
      "aria-expanded",
      "false"
    );

    renderScore();
  });

  observer.observe(screen, {
    attributes: true,
    attributeFilter: ["class"]
  });

  syncPeople();
  renderPeople();
  renderScore();
})();
