window.addEventListener("load", function () {
  "use strict";

  /* == GLOBAL: ASSETS & AUDIO GITHUB == */
  const BASE =
    "https://raw.githubusercontent.com/JazzyG00555/grub-scrub-ar/main/";

  const SALAD_URL =
    BASE + "salad%20%281%29.glb";

  const SOUNDS = {
    click:
      BASE +
      "683099__florianreichelt__computer-mouse-click.mp3",
    profile:
      BASE + "320549__debsound__pop-19.wav",
    bell:
      BASE + "restaurantbellisamatch.mp3",
    crunch:
      BASE + "crunchnotamatch.wav"
  };

  const AudioClass =
    window.AudioContext || window.webkitAudioContext;

  let audioContext = null;
  const soundBuffers = {};
  const soundPromises = {};

  const downloads = Object.fromEntries(
    Object.entries(SOUNDS).map(([name, url]) => [
      name,
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }
          return response.arrayBuffer();
        })
        .catch(error => {
          console.warn("Audio unavailable:", name, error);
          return null;
        })
    ])
  );

  function unlockAudio() {
    if (!AudioClass) return;

    if (!audioContext) {
      audioContext = new AudioClass();
    }

    audioContext.resume().catch(console.warn);

    try {
      const buffer =
        audioContext.createBuffer(1, 1, 22050);

      const source =
        audioContext.createBufferSource();

      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.warn("Audio unlock:", error);
    }

    Object.keys(SOUNDS).forEach(name => {
      if (soundPromises[name]) return;

      soundPromises[name] = downloads[name]
        .then(async bytes => {
          if (bytes) {
            soundBuffers[name] =
              await audioContext.decodeAudioData(bytes);
          }
        })
        .catch(console.warn);
    });
  }

  function playSound(name) {
    if (!audioContext) return;

    const play = () => {
      if (!soundBuffers[name]) return;

      const source =
        audioContext.createBufferSource();

      const gain =
        audioContext.createGain();

      source.buffer = soundBuffers[name];

      gain.gain.value =
        name === "click" ? 0.9 : 0.75;

      source.connect(gain);
      gain.connect(audioContext.destination);

      if (audioContext.state === "running") {
        source.start();
      } else {
        audioContext.resume()
          .then(() => source.start())
          .catch(console.warn);
      }
    };

    if (soundBuffers[name]) {
      play();
    } else if (soundPromises[name]) {
      soundPromises[name].then(play);
    }
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button || button.disabled) return;

    unlockAudio();

    const profileSelection =
      button.classList.contains("user-add-button") ||
      button.id === "addAllButton";

    playSound(
      profileSelection ? "profile" : "click"
    );
  }, true);


  /* == GLOBAL: USER FOOD PROFILES & JPGS == */
  const users = [
    {
      name: "Jamie",
      image: BASE + "Jamie.jpg",
      restrictions: ["Vegan"],
      filters: ["vegan"],
      selected: false
    },
    {
      name: "Gus",
      image: BASE + "Gus.jpg",
      restrictions: ["Nut Allergy"],
      filters: ["nutSafe"],
      selected: false
    },
    {
      name: "Brad",
      image: BASE + "Brad.jpg",
      restrictions: [
        "Gluten Free",
        "Seafood Allergy"
      ],
      filters: [
        "glutenFree",
        "seafoodSafe"
      ],
      selected: false
    }
  ];


  /* == GLOBAL: RESTAURANT MENUS & DIETARY DATA == */
  const restaurants = [
    {
      name: "P.S. Kitchen",
      meals: [
        {
          name: "House Salad",
          model: SALAD_URL,
          vegan: true,
          nutSafe: true,
          glutenFree: true,
          seafoodSafe: true,
          heroAR: true,
          ingredients: [
            { name: "Lettuce", part: "lettuce" },
            { name: "Tomatoes", part: "tomato" },
            { name: "Cucumbers", part: "cucumber" }
          ]
        },
        {
          name: "Sweet Potato & Red Rice Bowl",
          model:
            BASE +
            "sweet_potato__red_rice_bowl_scaniverse_lidar.glb",
          vegan: true,
          nutSafe: true,
          glutenFree: true,
          seafoodSafe: true
        },
        {
          name: "Salmon & Brussels Sprouts",
          model:
            BASE + "salmon_and_brussel_sprouts.glb",
          vegan: false,
          nutSafe: true,
          glutenFree: true,
          seafoodSafe: false
        },
        {
          name: "Mac and Cheese",
          model:
            BASE + "mac_and_cheese_bowl.glb",
          vegan: true,
          nutSafe: false,
          glutenFree: false,
          seafoodSafe: true
        }
      ]
    },
    {
      name: "Ramen DANBO",
      meals: [
        {
          name: "Pork Belly Tonkotsu Ramen",
          model:
            BASE + "pork_belly_tonkotsu_ramen.glb",
          vegan: false,
          nutSafe: true,
          glutenFree: false,
          seafoodSafe: true
        },
        {
          name: "Shoyu Ramen",
          model:
            BASE +
            "stylized_ramen_bowl_3d_model_rapid_assets.glb",
          vegan: false,
          nutSafe: true,
          glutenFree: false,
          seafoodSafe: true
        },
        {
          name: "Vegan Assam Fish Head",
          model:
            BASE +
            "vegan_assam__fish_head_scaniverse.glb",
          vegan: true,
          nutSafe: false,
          glutenFree: false,
          seafoodSafe: true
        },
        {
          name: "Vegan Hainanese Chicken Rice",
          model:
            BASE +
            "vegan_hainanese_chicken_rice_scaniverse.glb",
          vegan: true,
          nutSafe: false,
          glutenFree: false,
          seafoodSafe: true
        }
      ]
    }
  ];


  /* == GLOBAL: APPLICATION SCAN STATE == */
  const state = {
    screen: "title",
    restaurant: 0,
    activeUser: 0,
    scanComplete: false,
    mindARStarted: false,
    mindARStarting: false,
    profileMenuOpen: false,
    flowVersion: 0,
    menuVersion: 0
  };

  const $ = selector =>
    document.querySelector(selector);

  const mobile = () =>
    window.matchMedia("(max-width:767px)").matches ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


  /* == GLOBAL: HTML ELEMENT REFERENCES & LINGO == */
  const screens = {
    title: $("#screen-title"),
    users: $("#screen-users"),
    camera: $("#screen-camera"),
    loading: $("#screen-loading"),
    result: $("#screen-result"),
    menu: $("#screen-menu"),
    dish: $("#screen-dish")
  };

  const startButton = $("#startButton");
  const scanButton = $("#scanButton");
  const addAllButton = $("#addAllButton");
  const userList = $("#userList");
  const trackingStatus = $("#trackingStatus");

  const resultCard = $("#resultCard");
  const resultTitle = $("#resultTitle");
  const resultSubtitle = $("#resultSubtitle");
  const resultIcon = $("#resultIcon");

  const restaurantName = $("#restaurantName");
  const activeUserName = $("#activeUserName");
  const activeUserRestrictions =
    $("#activeUserRestrictions");

  const availabilityCount = $("#availabilityCount");
  const optionsMessage = $("#optionsMessage");
  const menuGrid = $("#menuGrid");

  const profileDisc = $("#profileDisc");
  const profileButtons = $("#profileButtons");
  const addProfileButton = $("#addProfileButton");
  const scanAgainButton = $("#scanAgainButton");
  const backToMenu = $("#backToMenu");

  const dishRestaurant = $("#dishRestaurant");
  const dishName = $("#dishName");
  const dishLoading = $("#dishLoading");
  const ingredientButtons = $("#ingredientButtons");

  const detailViewer = $("#saladDetailViewer");
  const hotspot = $("#ingredientHotspot");
  const hotspotLabel = $("#hotspotLabel");

  const scene = $("#arScene");
  const psTarget = $("#psTarget");
  const danboTarget = $("#danboTarget");


  /* == GLOBAL: SCREEN MAIN NAVIGATION == */

  function showScreen(name) {
    Object.values(screens).forEach(screen => {
      screen.classList.remove("active");
    });

    screens[name].classList.add("active");
    state.screen = name;

    if (name !== "menu") {
      state.profileMenuOpen = false;
      state.menuVersion++;
    }

    if (name !== "dish") {
      showDishStatus("");
    }
  }


  /* == GLOBAL: FOOD DIETARY MATCHING LOGIC == */
  function selectedUsers() {
    return users.filter(user => user.selected);
  }

  function activeUser() {
    const list = selectedUsers();

    if (!list.length) return null;

    if (state.activeUser >= list.length) {
      state.activeUser = 0;
    }

    return list[state.activeUser];
  }

  function fits(meal, user) {
    return user.filters.every(
      filter => meal[filter] === true
    );
  }

  function available(restaurant, user) {
    return restaurant.meals.filter(
      meal => fits(meal, user)
    );
  }

  function groupMatch(restaurant) {
    const selected = selectedUsers();

    return (
      selected.length > 0 &&
      selected.every(user =>
        available(restaurant, user).length > 0
      )
    );
  }


  /* == SCREEN 1: TITLE SCREEN START BUTTON == */
  startButton.addEventListener("click", () => {
    renderUsers();
    showScreen("users");
  });


  /* == SCREEN 2: FOOD PROFILE SELECTION == */
  function renderUsers() {
    userList.innerHTML = "";

    users.forEach((user, index) => {
      const card = document.createElement("div");
      card.className = "user-card";

      const left = document.createElement("div");
      left.className = "user-left";

      left.innerHTML = `
        <div class="profile-photo">
          <img src="${user.image}" alt="${user.name}">
        </div>

        <div class="user-text">
          <div class="user-name">${user.name}</div>

          <div class="user-restrictions">
            ${user.restrictions.map(
              text => `<span>${text}</span>`
            ).join(
              '<span class="restriction-dot"></span>'
            )}
          </div>
        </div>
      `;

      const button = document.createElement("button");
      button.type = "button";

      button.className =
        "user-add-button" +
        (user.selected ? " selected" : "");

      button.innerHTML = user.selected
        ? '<i class="ph ph-check"></i>'
        : '<i class="ph ph-plus"></i>';

      button.setAttribute(
        "aria-label",
        (user.selected ? "Remove " : "Add ") +
        user.name
      );

      button.addEventListener("click", () => {
        users[index].selected = !users[index].selected;
        state.activeUser = 0;
        renderUsers();
      });

      card.append(left, button);
      userList.appendChild(card);
    });

    scanButton.disabled =
      selectedUsers().length === 0;

    const allSelected =
      users.every(user => user.selected);

    addAllButton.classList.toggle(
      "all-selected",
      allSelected
    );

    addAllButton.textContent = allSelected
      ? "UNSELECT ALL"
      : "SELECT ALL";
  }

  addAllButton.addEventListener("click", () => {
    const allSelected =
      users.every(user => user.selected);

    users.forEach(user => {
      user.selected = !allSelected;
    });

    state.activeUser = 0;
    renderUsers();
  });


  /* == SCREEN 2: LET'S GET SCANNING BUTTON == */
  scanButton.addEventListener("click", async () => {
    if (!selectedUsers().length) return;

    state.activeUser = 0;
    state.scanComplete = false;
    state.profileMenuOpen = false;
    state.flowVersion++;

    trackingStatus.textContent =
      "Looking for logo...";

    showScreen("camera");

    await startAR();
  });


  /* == SCREEN 3: AR CAMERA MANAGEMENT == */
  async function waitForScene() {
    if (scene.hasLoaded) return;

    await new Promise(resolve => {
      scene.addEventListener(
        "loaded",
        resolve,
        { once: true }
      );
    });
  }

  async function startAR() {
    if (
      state.mindARStarted ||
      state.mindARStarting
    ) return;

    state.mindARStarting = true;

    try {
      await waitForScene();

      const system =
        scene.systems["mindar-image-system"];

      if (!system) {
        trackingStatus.textContent =
          "Scanner not ready";
        return;
      }

      await system.start();

      state.mindARStarted = true;

      if (
        state.screen === "camera" &&
        !state.scanComplete
      ) {
        trackingStatus.textContent =
          "Looking for logo...";
      }

    } catch (error) {
      console.error(
        "MindAR camera error:",
        error
      );

      trackingStatus.textContent =
        "Camera could not start";

    } finally {
      state.mindARStarting = false;
    }
  }

  async function restartAR() {
    await waitForScene();

    const system =
      scene.systems["mindar-image-system"];

    if (state.mindARStarted && system) {
      try {
        await system.stop();
      } catch (error) {
        console.warn(
          "Camera stop error:",
          error
        );
      }

      state.mindARStarted = false;
    }

    await startAR();
  }


  /* == SCREEN 3: RESTAURANT LOGO RECOGNITION == */

  function restaurantDetected(index) {
    if (
      state.scanComplete ||
      state.screen !== "camera"
    ) return;

    state.restaurant = index;
    state.scanComplete = true;
    state.profileMenuOpen = false;

    const version = ++state.flowVersion;

    trackingStatus.textContent = "Logo found";

    setTimeout(() => {
      if (version !== state.flowVersion) return;

      showScreen("loading");

      setTimeout(() => {
        if (version !== state.flowVersion) return;

        renderResult();
        showScreen("result");

        setTimeout(() => {
          if (version !== state.flowVersion) return;

          showScreen("menu");
          renderMenu();
        }, 1200);

      }, 850);
    }, 250);
  }

  psTarget.addEventListener("targetFound", () => {
    if (state.screen === "camera") {
      restaurantDetected(0);
    }
  });

  danboTarget.addEventListener("targetFound", () => {
    if (state.screen === "camera") {
      restaurantDetected(1);
    }
  });


  /* == SCREENS 4 & 5: LOADING & MATCH RESULTS == */

  function renderResult() {
    const matched =
      groupMatch(restaurants[state.restaurant]);

    resultTitle.textContent =
      matched ? "A MATCH!" : "NOT A MATCH";

    resultSubtitle.textContent = matched
      ? "Everyone can eat here!"
      : "Whoops! Not everyone can eat here!";

    screens.result.classList.toggle(
      "no-match",
      !matched
    );

    resultCard.classList.toggle(
      "bad-match",
      !matched
    );

    resultIcon.className =
      "ph result-icon " +
      (matched
        ? "ph-check-circle"
        : "ph-x-circle");

    playSound(matched ? "bell" : "crunch");
  }


  /* == SCREEN 6: 3D MENU MODEL LOADING ALERT == */
  function createViewer(meal) {
    const viewer =
      document.createElement("model-viewer");

    viewer.setAttribute(
      "alt",
      "3D model of " + meal.name
    );

    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("interaction-prompt", "none");
    viewer.setAttribute("loading", "eager");
    viewer.setAttribute("shadow-intensity", "0.8");
    viewer.setAttribute("exposure", "1");

    if (!mobile()) {
      viewer.setAttribute("auto-rotate", "");
      viewer.setAttribute(
        "rotation-per-second",
        "15deg"
      );
    }

    return viewer;
  }

  async function loadModel(entry, version) {
    if (
      version !== state.menuVersion ||
      state.screen !== "menu"
    ) return;

    await customElements.whenDefined("model-viewer");

    if (
      version !== state.menuVersion ||
      state.screen !== "menu"
    ) return;

    return new Promise(resolve => {
      const { viewer, status, meal } = entry;

      let finished = false;
      let timeout;

      function finish(success, reason) {
        if (finished) return;

        finished = true;
        clearTimeout(timeout);

        viewer.removeEventListener("load", onLoad);
        viewer.removeEventListener("error", onError);

        if (version === state.menuVersion) {
          if (success) {
            status.remove();
          } else {
            viewer.removeAttribute("src");
            status.textContent =
              "3D model unavailable";

            console.warn(
              "Model failed:",
              meal.name,
              reason
            );
          }
        }

        resolve();
      }

      const onLoad = () => finish(true);

      const onError = event =>
        finish(false, event);

      status.textContent = "Loading 3D food...";

      viewer.addEventListener("load", onLoad);
      viewer.addEventListener("error", onError);

      timeout = setTimeout(
        () => finish(false, "60-second timeout"),
        60000
      );

      viewer.setAttribute("src", meal.model);
    });
  }

  async function loadMobileModels(entries, version) {
    for (const entry of entries) {
      if (
        version !== state.menuVersion ||
        state.screen !== "menu"
      ) return;

      await loadModel(entry, version);
    }
  }


  /* == SCREEN 6: RESTAURANT MENU GRID GENERATION == */

  function renderMenu() {
    const restaurant =
      restaurants[state.restaurant];

    const user = activeUser();

    if (!user) {
      renderUsers();
      showScreen("users");
      return;
    }

    const meals = available(restaurant, user);

    restaurantName.textContent = restaurant.name;
    activeUserName.textContent = user.name;

    activeUserRestrictions.innerHTML =
      user.restrictions.map(
        text => `<span>${text}</span>`
      ).join("<span> • </span>");

    availabilityCount.textContent =
      `${meals.length}/${restaurant.meals.length}`;

    optionsMessage.textContent = meals.length
      ? "meal options available"
      : "no meal options available";

    const version = ++state.menuVersion;
    const entries = [];

    menuGrid.innerHTML = "";

    meals.forEach(meal => {
      const card = document.createElement("div");
      card.className = "meal-card";

      const picture = document.createElement("div");
      picture.className = "meal-picture";

      const label = document.createElement("div");
      label.className = "meal-name";
      label.textContent = meal.name;

      card.append(picture, label);

      if (meal.model) {
        const viewer = createViewer(meal);
        const status = document.createElement("div");

        Object.assign(status.style, {
          position: "absolute",
          inset: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          boxSizing: "border-box",
          background: "#E8E8E8",
          color: "#666",
          fontSize: "12px",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: "1"
        });

        status.textContent = mobile()
          ? "Waiting to load 3D..."
          : "Loading 3D food...";

        picture.append(viewer, status);

        entries.push({
          viewer,
          status,
          meal
        });
      }

 /* == INFORMATION ICON ONLY USED ON HOUSE SALAD MENU OPTION == */

      if (meal.heroAR) {
        const infoButton =
          document.createElement("button");

        infoButton.type = "button";
        infoButton.className = "ar-label";

        infoButton.innerHTML =
          '<i class="ph ph-info"></i>';

        infoButton.setAttribute(
          "aria-label",
          "View detailed 3D House Salad"
        );

        infoButton.addEventListener("click", event => {
          event.stopPropagation();
          openHeroDish(meal);
        });

        card.appendChild(infoButton);
      }

      menuGrid.appendChild(card);
    });

    renderProfileDisc();

    if (mobile()) {
      loadMobileModels(entries, version);
    } else {
      entries.forEach(entry =>
        loadModel(entry, version)
      );
    }
  }
  
  
    /* == SCREEN 6: BOTTOM-RIGHT DISC PROFILE NAVIGATION == */
  function renderProfileDisc() {
    profileButtons.innerHTML = "";

    profileDisc.classList.toggle(
      "open",
      state.profileMenuOpen
    );

    const restaurant =
      restaurants[state.restaurant];

    const ordered = selectedUsers().map(
      (user, index) => ({
        user,
        index
      })
    );

    const active = ordered[state.activeUser];

    const arranged = [
      active,
      ...ordered.filter(
        item => item.index !== state.activeUser
      )
    ].filter(Boolean);

    /* PROFILE CIRCLE POSITIONS */

    const slots = [
      { left: "25px", top: "11px" },
      { right: "2px", top: "2px" },
      { left: "2px", bottom: "2px" }
    ];

    arranged.forEach((entry, slot) => {
      const user = entry.user;

      const isActive =
        entry.index === state.activeUser;

      const compatible =
        available(restaurant, user).length > 0;

      const button =
        document.createElement("button");

      button.type = "button";

      button.className = isActive
        ? "profile-button active current"
        : "profile-button small";

      if (state.profileMenuOpen) {
        Object.assign(button.style, slots[slot]);
      } else if (isActive) {
        button.style.right = "4px";
        button.style.bottom = "4px";
      }

      button.setAttribute(
        "aria-label",
        user.name +
        (compatible
          ? ", options available"
          : ", no options available")
      );

      button.innerHTML = `
        <span class="profile-main-icon ${
          compatible
            ? "profile-has-options"
            : "profile-no-options"
        }">
          <img
            class="profile-nav-image"
            src="${user.image}"
            alt="${user.name}">
        </span>

        <span class="profile-status-icon ${
          compatible ? "ok" : "bad"
        }">
          <i class="ph ${
            compatible ? "ph-check" : "ph-x"
          }"></i>
        </span>
      `;

      button.addEventListener("click", () => {
        if (!state.profileMenuOpen) {
          state.profileMenuOpen = true;
          renderProfileDisc();
          return;
        }

        state.activeUser = entry.index;
        state.profileMenuOpen = false;

        renderMenu();
      });

      profileButtons.appendChild(button);
    });

    addProfileButton.style.display =
      state.profileMenuOpen ? "flex" : "none";
  }

  addProfileButton.addEventListener("click", () => {
    state.profileMenuOpen = false;

    renderUsers();
    showScreen("users");
  });


  /* == SCREEN 6: SCAN AGAIN BUTTON == */
  scanAgainButton.addEventListener(
    "click",
    async event => {
      event.preventDefault();

      state.scanComplete = false;
      state.profileMenuOpen = false;
      state.flowVersion++;

      trackingStatus.textContent =
        "Looking for logo...";

      showScreen("camera");

      await restartAR();
    }
  );


  /* == SCREEN 7: INGREDIENT HOTSPOTS == */

  let detailReady = false;
  let detailFailed = false;
  let selectedIngredient = null;

  const INGREDIENT_NAMES = {
    lettuce: "Lettuce",
    tomato: "Tomatoes",
    cucumber: "Cucumbers"
  };

  /*
    Current hotspot ingredient positions.
     1. Tomatoes
     2. Cucumbers
     3. Lettuce
  */

  const HOTSPOT_DEFAULTS = {
    lettuce: {
      x: -0.24,
      y: 0.26,
      z: 0.08
    },

    tomato: {
      x: -0.10,
      y: 0.05,
      z: 0.36
    },

    cucumber: {
      x: 0.34,
      y: -0.08,
      z: 0.40
    }
  };

  const HOTSPOT_STORAGE_KEY =
    "grub-scrub-salad-hotspots-v3";

  let savedHotspots = {};

  try {
    const stored = JSON.parse(
      localStorage.getItem(HOTSPOT_STORAGE_KEY) || "{}"
    );

    if (stored && typeof stored === "object") {
      savedHotspots = stored;
    }
  } catch (error) {
    console.warn("Hotspot storage unavailable:", error);
  }

  function showDishStatus(message) {
    dishLoading.textContent = message;
    dishLoading.hidden = !message;
  }

  function hideHotspot() {
    hotspot.classList.add("is-hidden");
    hotspot.setAttribute("aria-hidden", "true");
  }

  function positionString(point) {
    return (
      point.x.toFixed(5) + "m " +
      point.y.toFixed(5) + "m " +
      point.z.toFixed(5) + "m"
    );
  }

  function getDefaultHotspot(part) {
    const preset = HOTSPOT_DEFAULTS[part];

    if (!preset || !detailReady) return null;

    const dimensions = detailViewer.getDimensions();
    const center = detailViewer.getBoundingBoxCenter();

    const width = dimensions.x || 1;
    const height = dimensions.y || 1;
    const depth = dimensions.z || 1;

    return {
      position: positionString({
        x: center.x + preset.x * width,
        y: center.y + preset.y * height,
        z: center.z + preset.z * depth
      }),
      normal: "0m 1m 0m"
    };
  }

  function getHotspotPosition(part) {
    const stored = savedHotspots[part];

    if (
      stored &&
      typeof stored.position === "string" &&
      typeof stored.normal === "string"
    ) {
      return stored;
    }

    return getDefaultHotspot(part);
  }


  /* == SCREEN 7: HOTSPOT LABEL POSITIONING & DIRECTION == */
  function showIngredientHotspot(part) {
    selectedIngredient = part;

    if (!detailReady || !part) {
      hideHotspot();
      return;
    }

    const coordinates = getHotspotPosition(part);

    if (!coordinates) {
      hideHotspot();
      return;
    }

    hotspotLabel.textContent = INGREDIENT_NAMES[part];

    hotspot.classList.toggle(
      "label-left",
      part === "cucumber"
    );

    try {
      detailViewer.updateHotspot({
        name: "hotspot-ingredient",
        position: coordinates.position,
        normal: coordinates.normal
      });

      hotspot.classList.remove("is-hidden");
      hotspot.setAttribute("aria-hidden", "false");

    } catch (error) {
      console.error(
        "Hotspot positioning error:",
        error
      );
      hideHotspot();
    }
  }

  function selectIngredient(part) {
    if (selectedIngredient === part) {
      selectedIngredient = null;
      hideHotspot();

      ingredientButtons.querySelectorAll("button")
        .forEach(button => {
          button.classList.remove("active");
        });

      detailViewer.setAttribute("auto-rotate", "");
      return;
    }

    selectedIngredient = part;

    ingredientButtons.querySelectorAll("button")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.part === part
        );
      });

    detailViewer.removeAttribute("auto-rotate");

    showIngredientHotspot(part);
  }

  detailViewer.addEventListener("load", () => {
    detailReady = true;
    detailFailed = false;

    showDishStatus("");

    if (selectedIngredient) {
      showIngredientHotspot(selectedIngredient);
    }
  });

  detailViewer.addEventListener("error", error => {
    detailReady = false;
    detailFailed = true;

    hideHotspot();

    console.error("Salad model error:", error);

    if (state.screen === "dish") {
      showDishStatus(
        "House Salad 3D model could not load."
      );
    }
  });


  /* == SCREEN 7: HOUSE SALAD 3D DETAILS & INGREDIENT LABELS== */

  function openHeroDish(meal) {
    if (
      state.restaurant !== 0 ||
      !meal.heroAR
    ) return;

    state.profileMenuOpen = false;

    dishRestaurant.textContent = "P.S. Kitchen";
    dishName.textContent = "House Salad";

    ingredientButtons.innerHTML = "";

    selectedIngredient = null;
    hideHotspot();

    meal.ingredients.forEach(ingredient => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "ingredient-button";
      button.textContent = ingredient.name;
      button.dataset.part = ingredient.part;

      button.addEventListener("click", () => {
        selectIngredient(ingredient.part);
      });

      ingredientButtons.appendChild(button);
    });

    showScreen("dish");

    showDishStatus(
      detailReady
        ? ""
        : detailFailed
          ? "House Salad 3D model could not load."
          : "Loading House Salad..."
    );

    detailViewer.setAttribute("auto-rotate", "");

    if (!detailViewer.getAttribute("src")) {
      detailViewer.setAttribute("src", SALAD_URL);
    }
  }


  /* == SCREEN 7: BACK TO MENU BUTTON == */
  backToMenu.addEventListener("click", () => {
    state.profileMenuOpen = false;
    hideHotspot();

    showScreen("menu");
    renderMenu();
  });


  /* == GLOBAL: INITIALIZATION == */
  renderUsers();
});