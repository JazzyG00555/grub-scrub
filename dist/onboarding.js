
/**
 * GRUB SCRUB - CREATE FOOD PROFILE
 * Four-step onboarding flow
 * Keeps existing app screens and scanners intact.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "grub-scrub-created-profiles-v1";

  // Reset custom profiles on refresh.
  // Jamie, Gus and Brad remain in script.js.
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Could not reset demo profiles:", error);
  }

  const ALLERGIES = [
    "Peanuts", "Tree nuts", "Shellfish", "Fish",
    "Milk", "Eggs", "Soy", "Wheat",
    "Sesame", "Apples", "Bananas", "Corn",
    "Dragonfruit"
  ];

  const INTOLERANCES = [
    "Gluten", "Lactose", "Fructose"
  ];

  const DIETS = [
    "Vegan", "Vegetarian", "Pescatarian",
    "Halal", "Kosher"
  ];

  let step = 0;
  let editingIndex = null;
  let profile = emptyProfile();

  function emptyProfile() {
    return {
      id: "",
      name: "",
      image: "",
      allergies: [],
      intolerances: [],
      diets: [],
      minMeals: 3,
      dislikes: ""
    };
  }

  function readProfiles() {
    try {
      const value = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function saveProfiles(items) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
      return true;
    } catch (error) {
      console.error("Could not save food profile:", error);
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function labelList(items) {
    return items.length
      ? items.map(escapeHTML).join(", ")
      : "None";
  }

  function optionsMarkup(items, selected, group) {
    return items.map(value => `
      <label class="gs-ob-choice">
        <input
          type="checkbox"
          data-group="${group}"
          value="${escapeHTML(value)}"
          ${selected.includes(value) ? "checked" : ""}
        >
        <span>${escapeHTML(value)}</span>
      </label>
    `).join("");
  }

  function generateAvatar(name) {
    const initial = (name.trim()[0] || "?").toUpperCase();
    return `
      <span class="gs-ob-avatar-fallback">
        ${escapeHTML(initial)}
      </span>
    `;
  }

  function photoMarkup() {
    return profile.image
      ? `<img src="${profile.image}" alt="Profile picture">`
      : generateAvatar(profile.name);
  }

  // Match dietary flags supported by the demo.
  function appProfile(source) {
    const filters = new Set();
    const restrictions = [];
    let requiresVerification = false;

    function add(value, filter) {
      restrictions.push(value);
      if (filter) filters.add(filter);
      else requiresVerification = true;
    }

    for (const allergy of source.allergies) {
      if (
        allergy === "Peanuts" ||
        allergy === "Tree nuts"
      ) {
        add(allergy + " Allergy", "nutSafe");
      } else if (
        allergy === "Fish" ||
        allergy === "Shellfish"
      ) {
        add(allergy + " Allergy", "seafoodSafe");
      } else if (allergy === "Wheat") {
        add("Wheat Allergy", "glutenFree");
      } else {
        add(allergy + " Allergy", null);
      }
    }

    for (const intolerance of source.intolerances) {
      if (intolerance === "Gluten") {
        add("Gluten Intolerance", "glutenFree");
      } else {
        add(intolerance + " Intolerance", null);
      }
    }

    for (const diet of source.diets) {
      if (diet === "Vegan") {
        add(diet, "vegan");
      } else if (diet === "Vegetarian") {
        // Conservative prototype rule.
        add(diet, "vegan");
      } else {
        add(diet, null);
      }
    }

    if (source.dislikes.trim()) {
      restrictions.push(
        "Dislikes: " + source.dislikes.trim()
      );
      requiresVerification = true;
    }

    return {
      id: source.id,
      name: source.name,
      image: source.image,
      restrictions: restrictions.length
        ? restrictions
        : ["No dietary restrictions"],
      filters: [...filters],
      minMeals: Number(source.minMeals) || 3,
      requiresVerification,
      selected: true,
      custom: true
    };
  }

  window.GrubOnboarding = {
    getProfiles() {
      return readProfiles().map(appProfile);
    }
  };

  function root() {
    return document.getElementById("gsOnboarding");
  }

  function close() {
    root().hidden = true;
    document.body.classList.remove("gs-onboarding-open");
  }

  function open(index = null) {
    const saved = readProfiles();

    editingIndex = (
      Number.isInteger(index) &&
      saved[index]
    ) ? index : null;

    profile = editingIndex === null
      ? emptyProfile()
      : JSON.parse(JSON.stringify(saved[editingIndex]));

    step = 0;
    root().hidden = false;
    document.body.classList.add("gs-onboarding-open");
    render();
  }

  window.GrubOnboarding.open = open;

  function progressMarkup() {
    return `
      <div class="gs-ob-progress" aria-label="Step ${step + 1} of 4">
        ${[0, 1, 2, 3].map(index => `
          <span class="${index === step ? "current" : ""}"></span>
        `).join("")}
      </div>
    `;
  }

  function firstStep() {
    return `
      <div class="gs-ob-photo-section">
        <label class="gs-ob-photo-label" for="gsObImage">
          <span id="gsObPhotoPreview" class="gs-ob-photo-preview">
            ${photoMarkup()}
          </span>
          <span>Add profile picture</span>
        </label>
        <input
          id="gsObImage"
          type="file"
          accept="image/*"
          hidden
        >
      </div>

      <label class="gs-ob-field-label" for="gsObName">
        Name
      </label>

      <input
        id="gsObName"
        class="gs-ob-text-input"
        type="text"
        maxlength="40"
        autocomplete="name"
        placeholder="Name"
        value="${escapeHTML(profile.name)}"
      >
    `;
  }

  function secondStep() {
    return `
      <div class="gs-ob-scroll-content">
        <fieldset class="gs-ob-fieldset">
          <legend>Allergies</legend>
          <div class="gs-ob-choices">
            ${optionsMarkup(
              ALLERGIES,
              profile.allergies,
              "allergies"
            )}
          </div>
        </fieldset>

        <fieldset class="gs-ob-fieldset">
          <legend>Intolerances</legend>
          <div class="gs-ob-choices">
            ${optionsMarkup(
              INTOLERANCES,
              profile.intolerances,
              "intolerances"
            )}
          </div>
        </fieldset>

        <fieldset class="gs-ob-fieldset">
          <legend>Lifestyle Diet</legend>
          <div class="gs-ob-choices">
            ${optionsMarkup(
              DIETS,
              profile.diets,
              "diets"
            )}
          </div>
        </fieldset>

        <p class="gs-ob-note">
          Dietary details will be checked against
          available restaurant information. Unknown
          ingredients and cross-contact require confirmation.
        </p>
      </div>
    `;
  }

  function thirdStep() {
    return `
      <label class="gs-ob-question" for="gsObMinMeals">
        How many meal matches minimum to be compatible?
      </label>

      <select id="gsObMinMeals" class="gs-ob-select">
        ${Array.from({length: 10}, (_, index) => index + 1)
          .map(number => `
            <option value="${number}"
              ${number === Number(profile.minMeals)
                ? "selected" : ""}>
              ${number} compatible
              ${number === 1 ? "dish" : "dishes"}
            </option>
          `).join("")}
      </select>

      <label
        class="gs-ob-question gs-ob-dislikes"
        for="gsObDislikes"
      >
        Any foods you dislike?
      </label>

      <textarea
        id="gsObDislikes"
        class="gs-ob-textarea"
        rows="5"
        placeholder="Enter any specific meals or ingredients..."
      >${escapeHTML(profile.dislikes)}</textarea>

      <p class="gs-ob-note">
        Disliked foods will be recorded in your profile.
        They require menu verification before a dish
        can be marked compatible.
      </p>
    `;
  }

  function reviewRow(title, value, target) {
    return `
      <div class="gs-ob-review-row">
        <div>
          <strong>${title}</strong>
          <div class="gs-ob-review-value">${value}</div>
        </div>
        <button
          type="button"
          class="gs-ob-edit"
          data-edit="${target}"
          aria-label="Edit ${title}"
        >edit</button>
      </div>
    `;
  }

  function fourthStep() {
    return `
      <div class="gs-ob-review">
        <h3>Final Results</h3>

        <div class="gs-ob-summary-name">
          ${photoMarkup()}
          <strong>${escapeHTML(profile.name)}</strong>
        </div>

        ${reviewRow(
          "Allergies",
          labelList(profile.allergies),
          1
        )}

        ${reviewRow(
          "Intolerances",
          labelList(profile.intolerances),
          1
        )}

        ${reviewRow(
          "Lifestyle Diet",
          labelList(profile.diets),
          1
        )}

        ${reviewRow(
          "Compatible Dishes",
          escapeHTML(profile.minMeals),
          2
        )}

        ${reviewRow(
          "Foods you dislike",
          profile.dislikes.trim()
            ? escapeHTML(profile.dislikes)
            : "None",
          2
        )}
      </div>
    `;
  }

  function screenContent() {
    switch (step) {
      case 0: return firstStep();
      case 1: return secondStep();
      case 2: return thirdStep();
      default: return fourthStep();
    }
  }

  function render() {
    root().innerHTML = `
      <div
        class="gs-ob-screen"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gsObHeading"
      >
        <div class="gs-ob-top">
          <button
            type="button"
            class="gs-ob-close"
            id="gsObClose"
            aria-label="Close onboarding"
          >×</button>

          <h2 id="gsObHeading">
            Create your Food Profile
          </h2>

          ${progressMarkup()}
        </div>

        <div class="gs-ob-content">
          ${screenContent()}
        </div>

        <p
          class="gs-ob-error"
          id="gsObError"
          role="alert"
        ></p>

        <div class="gs-ob-actions">
          <button
            type="button"
            id="gsObBack"
            class="gs-ob-back"
          >
            Back
          </button>

          <button
            type="button"
            id="gsObNext"
            class="gs-ob-next"
          >
            ${step === 3 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    `;

    document.getElementById("gsObClose")
      .addEventListener("click", close);

    document.getElementById("gsObBack")
      .addEventListener("click", () => {
        collectStep();

        if (step === 0) {
          close();
        } else {
          step--;
          render();
        }
      });

    document.getElementById("gsObNext")
      .addEventListener("click", next);

    root().querySelectorAll("[data-edit]")
      .forEach(button => {
        button.addEventListener("click", () => {
          step = Number(button.dataset.edit);
          render();
        });
      });

    const image = document.getElementById("gsObImage");

    if (image) {
      image.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
          profile.image = await resizeImage(file);
          collectStep();
          render();
        } catch (error) {
          showError("Could not read this image.");
        }
      });
    }
  }

  function showError(message) {
    const element = document.getElementById("gsObError");
    if (element) {
      element.textContent = message;
    }
  }

  function collectStep() {
    if (step === 0) {
      const input = document.getElementById("gsObName");

      if (input) {
        profile.name = input.value.trim();
      }
    }

    if (step === 1) {
      for (const group of [
        "allergies",
        "intolerances",
        "diets"
      ]) {
        profile[group] = [
          ...root().querySelectorAll(
            `input[data-group="${group}"]:checked`
          )
        ].map(item => item.value);
      }
    }

    if (step === 2) {
      profile.minMeals = Number(
        document.getElementById("gsObMinMeals")?.value || 3
      );

      profile.dislikes =
        document.getElementById("gsObDislikes")
          ?.value.trim() || "";
    }
  }

  function next() {
    collectStep();
    showError("");

    if (step === 0 && !profile.name) {
      showError("Please enter a name.");
      return;
    }

    if (step < 3) {
      step++;
      render();
      return;
    }

    finish();
  }

  function finish() {
    const saved = readProfiles();

    if (!profile.id) {
      profile.id = (
        window.crypto?.randomUUID?.() ||
        "profile-" + Date.now()
      );
    }

    if (editingIndex === null) {
      saved.push(profile);
    } else {
      saved[editingIndex] = profile;
    }

    if (!saveProfiles(saved)) {
      showError(
        "Could not save this profile. " +
        "Try a smaller profile picture."
      );
      return;
    }

    close();

    window.dispatchEvent(
      new CustomEvent("grub-profile-saved", {
        detail: {
          profile: appProfile(profile)
        }
      })
    );
  }

  // Resize profile photos to avoid storage limits.
  async function resizeImage(file) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Not an image");
    }

    const dataURL = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const image = new Image();
    image.src = dataURL;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = 180;
    canvas.height = 180;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("No canvas context");

    const size = Math.min(image.width, image.height);
    const sx = (image.width - size) / 2;
    const sy = (image.height - size) / 2;

    context.drawImage(
      image,
      sx,
      sy,
      size,
      size,
      0,
      0,
      180,
      180
    );

    return canvas.toDataURL("image/jpeg", 0.75);
  }

  
  function addLaunchButton(container, text) {
    if (!container) return;

    const existing = container.querySelector(".gs-ob-launch");
    if (existing) return;

    const button = document.createElement("button");

    button.type = "button";
    button.className = "gs-ob-launch";
    button.textContent = text;

    // WHITE BUTTON WITH PINK OUTLINE
    button.style.setProperty(
      "background-color", "#ffffff", "important"
    );

    button.style.setProperty(
      "color", "#591536", "important"
    );

    button.style.setProperty(
      "border", "2px solid #b65c91", "important"
    );

    button.style.setProperty(
      "border-radius", "0", "important"
    );

    button.addEventListener("click", () => open());

    container.appendChild(button);
  }


  function initialize() {
    // Existing onboarding overlay.
    let overlay = document.getElementById(
      "gsOnboarding"
    );

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "gsOnboarding";
      overlay.hidden = true;
      document.body.appendChild(overlay);
    }

    // HOME SCREEN:
    // Leave START unchanged.
    // Add a separate Create Profile button.
    addLaunchButton(
      document.querySelector(
        "#screen-title .title-content"
      ),
      "CREATE PROFILE"
    );

    // FOOD PROFILES:
    // Put Create New Profile INSIDE
    // the same row as SELECT ALL.
    const profilePage = document.querySelector(
      "#screen-users .profiles-page"
    );

    if (profilePage) {
      const row = profilePage.querySelector(
        ".select-all-row"
      );

      const selectAll = document.getElementById(
        "addAllButton"
      );

      let button = profilePage.querySelector(
        ".gs-ob-launch-inline"
      );

      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className =
          "gs-ob-launch gs-ob-launch-inline";
        button.textContent = "+ CREATE NEW PROFILE";
        button.addEventListener(
          "click",
          () => open()
        );
      }

      if (row && selectAll) {
        row.insertBefore(button, selectAll);
      } else {
        const userList = document.getElementById(
          "userList"
        );

        if (userList) {
          userList.before(button);
        }
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
