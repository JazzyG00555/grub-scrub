
window.addEventListener("load", function () {
  "use strict";

  const BASE = "https://raw.githubusercontent.com/JazzyG00555/grub-scrub-ar/main/";
  const SALAD_URL = BASE + "salad%20%281%29.glb";

  const RESTAURANT_LOGOS = {
    psKitchen: "https://static.wixstatic.com/media/705a3e_f84fc59012154b508d470217c567e238~mv2.png/v1/fit/w_2500%2Ch_1330%2Cal_c/705a3e_f84fc59012154b508d470217c567e238~mv2.png",
    danbo: "https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/d94dd458-30b3-45b8-81e5-45a4bf18e061.png"
  };

  const SOUNDS = {
    click: BASE + "683099__florianreichelt__computer-mouse-click.mp3",
    profile: BASE + "320549__debsound__pop-19.wav",
    bell: BASE + "restaurantbellisamatch.mp3",
    crunch: BASE + "crunchnotamatch.wav"
  };

  const $ = selector => document.querySelector(selector);
  const mobile = () =>
    window.matchMedia("(max-width:767px)").matches ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // ==========================================
  // AUDIO
  // ==========================================

  const AudioClass = window.AudioContext || window.webkitAudioContext;
  let audioContext = null;
  const audioBuffers = {};
  const audioLoading = {};

  async function unlockAudio() {
    if (!AudioClass) return;
    if (!audioContext) audioContext = new AudioClass();

    try {
      await audioContext.resume();
    } catch (error) {}

    for (const [name, url] of Object.entries(SOUNDS)) {
      if (audioBuffers[name] || audioLoading[name]) continue;

      audioLoading[name] = fetch(url)
        .then(response => response.ok ? response.arrayBuffer() : null)
        .then(bytes => bytes ? audioContext.decodeAudioData(bytes) : null)
        .then(buffer => {
          if (buffer) audioBuffers[name] = buffer;
        })
        .catch(() => {});
    }
  }

  function playSound(name) {
    if (!audioContext || !audioBuffers[name]) return;

    try {
      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      source.buffer = audioBuffers[name];
      gain.gain.value = name === "click" ? 0.9 : 0.75;
      source.connect(gain);
      gain.connect(audioContext.destination);
      source.start();
    } catch (error) {}
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    unlockAudio();
    playSound(
      button.classList.contains("user-add-button") ||
      button.id === "addAllButton"
        ? "profile"
        : "click"
    );
  }, true);

  // ==========================================
  // FOOD PROFILES
  // ==========================================

  const users = [
    {
      name: "Jamie",
      image: BASE + "Jamie.jpg",
      restrictions: ["Vegan"],
      filters: ["vegan"],
      minMeals: 5,
      selected: false
    },
    {
      name: "Gus",
      image: BASE + "Gus.jpg",
      restrictions: ["Nut Allergy"],
      filters: ["nutSafe"],
      minMeals: 3,
      selected: false
    },
    {
      name: "Brad",
      image: BASE + "Brad.jpg",
      restrictions: ["Gluten Free", "Seafood Allergy"],
      filters: ["glutenFree", "seafoodSafe"],
      minMeals: 3,
      selected: false
    }
  ];

  // ==========================================
  // RESTAURANTS
  // ==========================================

  const restaurants = [
    {
      name: "P.S. Kitchen",
      logo: RESTAURANT_LOGOS.psKitchen,
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
          model: BASE + "sweet_potato__red_rice_bowl_scaniverse_lidar.glb",
          vegan: true,
          nutSafe: true,
          glutenFree: true,
          seafoodSafe: true
        },
        {
          name: "Salmon & Brussels Sprouts",
          model: BASE + "salmon_and_brussel_sprouts.glb",
          vegan: false,
          nutSafe: true,
          glutenFree: true,
          seafoodSafe: false
        },
        {
          name: "Mac and Cheese",
          model: BASE + "mac_and_cheese_bowl.glb",
          vegan: true,
          nutSafe: false,
          glutenFree: false,
          seafoodSafe: true
        }
      ]
    },
    {
      name: "Ramen DANBO",
      logo: RESTAURANT_LOGOS.danbo,
      meals: [
        {
          name: "Pork Belly Tonkotsu Ramen",
          model: BASE + "pork_belly_tonkotsu_ramen.glb",
          vegan: false,
          nutSafe: true,
          glutenFree: false,
          seafoodSafe: true
        },
        {
          name: "Shoyu Ramen",
          model: BASE + "stylized_ramen_bowl_3d_model_rapid_assets.glb",
          vegan: false,
          nutSafe: true,
          glutenFree: false,
          seafoodSafe: true
        },
        {
          name: "Vegan Assam Fish Head",
          model: BASE + "vegan_assam__fish_head_scaniverse.glb",
          vegan: true,
          nutSafe: false,
          glutenFree: false,
          seafoodSafe: true
        },
        {
          name: "Vegan Hainanese Chicken Rice",
          model: BASE + "vegan_hainanese_chicken_rice_scaniverse.glb",
          vegan: true,
          nutSafe: false,
          glutenFree: false,
          seafoodSafe: true
        }
      ]
    }
  ];

 
  // ==========================================
  // SUPABASE RESTAURANTS
  // BEYOND SUSHI + LITTLE BEET
  // ==========================================

  async function loadAdditionalRestaurants() {
    const db = window.GSMealDB;

    if (!db || typeof db.getMealNames !== "function") {
      console.warn(
        "Grub Scrub: Supabase meal discovery unavailable."
      );
      return;
    }

    const loaded = await db.load();

    if (!loaded) {
      console.warn(
        "Grub Scrub: Supabase unavailable. Existing restaurants remain."
      );
      return;
    }

    const configurations = [
      {
        name: "Beyond Sushi",
        location: {
          lat: 40.7523,
          lon: -73.9890
        },
        demoVegan: true
      },
      {
        name: "Little Beet",
        location: {
          lat: 40.7614,
          lon: -73.9819
        },
        demoVegan: false
      }
    ];

    for (const config of configurations) {
      const mealNames = db.getMealNames(config.name);

      if (!mealNames.length) {
        console.warn(
          "No published Supabase meals for:",
          config.name
        );
        continue;
      }

      const databaseMeals = mealNames.map(mealName => ({
        name: mealName,

        // These are conservative prototype classifications.
        // Beyond Sushi's vegan-only demo is enabled.
        // Allergy safety is not verified.
        vegan: config.demoVegan,
        nutSafe: false,
        glutenFree: false,
        seafoodSafe: false,

        ingredients: (
          db.getIngredients(config.name, mealName) || []
        ).map(name => ({ name }))
      }));

      const existingIndex = restaurants.findIndex(
        restaurant => restaurant.name === config.name
      );

      if (existingIndex >= 0) {
        restaurants[existingIndex].meals = databaseMeals;
        analyzerRestaurantLocations[existingIndex] =
          config.location;
      } else {
        restaurants.push({
          name: config.name,
          logo: null,
          meals: databaseMeals,
          demoFromSupabase: true
        });

        analyzerRestaurantLocations.push(config.location);
      }
    }

    if (state.screen === "analyzer") {
      renderAnalyzerRecommendations();
    }

    if (state.screen === "recall") {
      renderRecallList();
    }

    console.info(
      "Grub Scrub: new restaurants loaded from Supabase."
    );
  }
 
  // ==========================================
  // STATE
  // ==========================================

  const state = {
    screen: "title",
    restaurant: 0,
    activeUser: 0,
    selectedScanType: null,
    scanComplete: false,
    mindARStarted: false,
    mindARStarting: false,
    profileMenuOpen: false,
    flowVersion: 0,
    menuVersion: 0,
    recallOrigin: "menu",
    menuResultFromRecall: false
  };

  // ==========================================
  // ELEMENTS
  // ==========================================

  const screens = {
    title: $("#screen-title"),
    plans: $("#screen-plans"),
    scanChoice: $("#screen-scan-choice"),
    users: $("#screen-users"),
    analyzer: $("#screen-analyzer"),
    menuScanner: $("#screen-menu-scanner"),
    menuResults: $("#screen-menu-results"),
    camera: $("#screen-camera"),
    loading: $("#screen-loading"),
    result: $("#screen-result"),
    recall: $("#screen-recall"),
    menu: $("#screen-menu"),
    dish: $("#screen-dish")
  };

  const startButton = $("#startButton");
  const lastMinuteButton = $("#lastMinuteButton");
  const pregatheringButton = $("#pregatheringButton");
  const chooseLogoScanner = $("#chooseLogoScanner");
  const chooseMenuScanner = $("#chooseMenuScanner");
  const scannerChoiceBack = $("#scannerChoiceBack");

  const userList = $("#userList");
  const addAllButton = $("#addAllButton");
  const scanButton = $("#scanButton");

  const analyzerBack = $("#analyzerBack");
  const analyzerLocation = $("#analyzerLocation");
  const analyzerRadius = $("#analyzerRadius");
  const analyzerSearchForm = $("#analyzerSearchForm");
  const analyzerFindButton = $("#analyzerFindButton");
  const analyzerLocationStatus = $("#analyzerLocationStatus");
  const analyzerGrid = $("#analyzerGrid");
  const analyzerEmpty = $("#analyzerEmpty");

  const menuScannerBack = $("#menuScannerBack");
  const menuCameraVideo = $("#menuCameraVideo");
  const menuCameraStatus = $("#menuCameraStatus");
  const captureMenuButton = $("#captureMenuButton");
  const menuCaptureCanvas = $("#menuCaptureCanvas");
  const menuARFlagLayer = $("#menuARFlagLayer");

  const menuResultsPhoto = $("#menuResultsPhoto");
  const menuResultsBack = $("#menuResultsBack");
  const menuResultsMatchLabel = $("#menuResultsMatchLabel");
  const menuResultsProgress = $("#menuResultsProgress");
  const menuResultsProgressFill = $("#menuResultsProgressFill");
  const filterFlagsButton = $("#filterFlagsButton");
  const menuFlagsMessage = $("#menuFlagsMessage");
  const retakeMenuResultsButton = $("#retakeMenuResultsButton");
  const saveMenuResultsButton = $("#saveMenuResultsButton");
  const menuSaveStatus = $("#menuSaveStatus");

  const scene = $("#arScene");
  const psTarget = $("#psTarget");
  const danboTarget = $("#danboTarget");
  const trackingStatus = $("#trackingStatus");
  const logoScannerBack = $("#logoScannerBack");
  const logoCameraPreview = $("#logoCameraPreview");

  const resultCard = $("#resultCard");
  const resultTitle = $("#resultTitle");
  const resultSubtitle = $("#resultSubtitle");
  const resultIcon = $("#resultIcon");

  const restaurantName = $("#restaurantName");
  const activeUserName = $("#activeUserName");
  const activeUserRestrictions = $("#activeUserRestrictions");
  const availabilityCount = $("#availabilityCount");
  const optionsMessage = $("#optionsMessage");
  const menuGrid = $("#menuGrid");
  const profileDisc = $("#profileDisc");
  const profileButtons = $("#profileButtons");
  const addProfileButton = $("#addProfileButton");
  const scanAgainButton = $("#scanAgainButton");

  const recallBackButton = $("#recallBackButton");
  const recallList = $("#recallList");
  const openRecallButton = $("#openRecallButton");
  const recallEmpty = $("#recallEmpty");

  const backToMenu = $("#backToMenu");
  const dishRestaurant = $("#dishRestaurant");
  const dishName = $("#dishName");
  const dishLoading = $("#dishLoading");
  const ingredientButtons = $("#ingredientButtons");
  const detailViewer = $("#saladDetailViewer");
  const hotspot = $("#ingredientHotspot");
  const hotspotLabel = $("#hotspotLabel");

  // ==========================================
  // NAVIGATION
  // ==========================================

  let menuCameraStream = null;
  let menuCameraRequest = 0;
  let menuPhotoCaptured = false;
  let capturedMenuPhoto = "";
  let lastRecognizedMenuText = "";
  let lastDetectedMenuWarnings = [];
  let menuOCRGeneration = 0;
  let menuOCRWorkerPromise = null;

  function showDishStatus(message) {
    dishLoading.textContent = message;
    dishLoading.hidden = !message;
  }

  function showScreen(name) {
    if (!screens[name]) {
      console.error("Missing screen:", name);
      return;
    }

    Object.values(screens).forEach(screen => {
      if (screen) screen.classList.remove("active");
    });

    screens[name].classList.add("active");
    state.screen = name;

    document.body.classList.toggle(
      "logo-scanner-active",
      name === "camera"
    );

    if (name !== "menu") {
      state.profileMenuOpen = false;
      state.menuVersion++;
    }

    if (name !== "dish") showDishStatus("");
    if (name !== "menuScanner") stopMenuCamera();
    if (name !== "camera") releaseLogoPreview();
  }

  // ==========================================
  // COMPATIBILITY
  // ==========================================

  function selectedUsers() {
    return users.filter(user => user.selected);
  }

  function activeUser() {
    const list = selectedUsers();
    if (!list.length) return null;
    if (state.activeUser >= list.length) state.activeUser = 0;
    return list[state.activeUser];
  }

  function fits(meal, user) {
    if (user.requiresVerification) {
      return false;
    }

    return user.filters.every(
      filter => meal[filter] === true
    );
  }

  function available(restaurant, user) {
    return restaurant.meals.filter(meal => fits(meal, user));
  }

  function groupMatch(restaurant) {
    const list = selectedUsers();
    return list.length > 0 &&
      list.every(user =>
        available(restaurant, user).length >= user.minMeals
      );
  }

  function groupCompatibility(restaurant) {
    const list = selectedUsers();
    if (!list.length) return 0;

    return Math.round(
      100 * list.filter(user =>
        available(restaurant, user).length >= user.minMeals
      ).length / list.length
    );
  }

  // ==========================================
  // START FLOW
  // ==========================================

  startButton.addEventListener("click", () => showScreen("plans"));

  lastMinuteButton.addEventListener("click", () =>
    showScreen("scanChoice")
  );

  pregatheringButton.addEventListener("click", () => {
    state.selectedScanType = "analyzer";
    state.activeUser = 0;
    renderUsers();
    showScreen("users");
  });

  chooseLogoScanner.addEventListener("click", () => {
    state.selectedScanType = "logo";
    state.activeUser = 0;
    renderUsers();
    showScreen("users");
  });

  chooseMenuScanner.addEventListener("click", () => {
    state.selectedScanType = "menu";
    state.activeUser = 0;
    renderUsers();
    showScreen("users");
  });

  scannerChoiceBack.addEventListener("click", () =>
    showScreen("plans")
  );

  function renderUsers() {
    userList.replaceChildren();

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
            ${user.restrictions.map(text =>
              `<span>${text}</span>`
            ).join('<span class="restriction-dot"></span>')}
          </div>
        </div>
      `;

      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "user-add-button" + (user.selected ? " selected" : "");

      button.innerHTML = user.selected
        ? '<i class="ph ph-check"></i>'
        : '<i class="ph ph-plus"></i>';

      button.addEventListener("click", () => {
        users[index].selected = !users[index].selected;
        state.activeUser = 0;
        renderUsers();
      });

      card.append(left, button);
      userList.appendChild(card);
    });

    scanButton.disabled = selectedUsers().length === 0;
    scanButton.textContent =
      state.selectedScanType === "analyzer"
        ? "CONTINUE TO MENU ANALYZER"
        : "LET'S GET SCANNING!";

    addAllButton.textContent =
      users.every(user => user.selected)
        ? "UNSELECT ALL"
        : "SELECT ALL";
  }

  addAllButton.addEventListener("click", () => {
    const allSelected = users.every(user => user.selected);
    users.forEach(user => user.selected = !allSelected);
    state.activeUser = 0;
    renderUsers();
  });

  scanButton.addEventListener("click", async () => {
    if (!selectedUsers().length) return;

    if (state.selectedScanType === "analyzer") {
      showScreen("analyzer");
      renderAnalyzerRecommendations();
      return;
    }

    if (state.selectedScanType === "menu") {
      showScreen("menuScanner");
      await startMenuCamera();
      return;
    }

    if (state.selectedScanType === "logo") {
      state.activeUser = 0;
      state.scanComplete = false;
      state.flowVersion++;
      trackingStatus.textContent = "Starting logo camera...";
      showScreen("camera");
      await startAR();
      return;
    }

    showScreen("scanChoice");
  });

  // ==========================================
  // MENU ANALYZER
  // ==========================================

  const analyzerRestaurantLocations = [
    { lat: 40.76078, lon: -73.98655 },
    { lat: 40.7310, lon: -74.0030 }
  ];

  let analyzerSearchCenter = null;
  let analyzerSearchLabel = "";
  let analyzerSearchRequest = 0;

  function analyzerDistanceMiles(lat1, lon1, lat2, lon2) {
    const rad = degrees => degrees * Math.PI / 180;
    const a =
      Math.sin(rad(lat2 - lat1) / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
      Math.sin(rad(lon2 - lon1) / 2) ** 2;
    return 2 * 3958.8 * Math.asin(Math.min(1, Math.sqrt(a)));
  }


  function createRestaurantLogoCard(restaurant) {
    const picture = document.createElement("div");
    picture.className = "analyzer-card-image";

    function showName() {
      const fallback = document.createElement("span");
      fallback.textContent = restaurant.name;

      Object.assign(fallback.style, {
        display: "block",
        width: "100%",
        textAlign: "center",
        fontWeight: "800",
        fontSize: "clamp(16px, 4vw, 25px)",
        lineHeight: "1.2",
        overflowWrap: "break-word"
      });

      picture.replaceChildren(fallback);
    }

    if (!restaurant.logo) {
      showName();
      return picture;
    }

    const logo = document.createElement("img");
    logo.src = restaurant.logo;
    logo.alt = restaurant.name + " logo";
    logo.className = "analyzer-restaurant-logo";
    logo.loading = "lazy";
    logo.onerror = showName;

    picture.appendChild(logo);
    return picture;
  }


  function renderAnalyzerRecommendations() {
    const radius = Number(analyzerRadius.value);
    analyzerGrid.replaceChildren();

    let matches = restaurants.map((restaurant, index) => {
      const position = analyzerRestaurantLocations[index];
      return {
        restaurant,
        index,
        distance: analyzerSearchCenter && position
          ? analyzerDistanceMiles(
              analyzerSearchCenter.lat,
              analyzerSearchCenter.lon,
              position.lat,
              position.lon
            )
          : null
      };
    });

    if (analyzerSearchCenter) {
      matches = matches
        .filter(item =>
          item.distance !== null && item.distance <= radius
        )
        .sort((a, b) => a.distance - b.distance);
    }

    analyzerEmpty.hidden = matches.length > 0;
    analyzerEmpty.textContent =
      "No demo restaurants found within this radius.";

    matches.forEach(item => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "analyzer-card";

      const details = document.createElement("div");
      details.className = "analyzer-card-details";

      const name = document.createElement("p");
      name.className = "analyzer-card-name";
      name.textContent = item.restaurant.name;
      details.appendChild(name);

      if (item.distance !== null) {
        const distance = document.createElement("span");
        distance.className = "analyzer-card-distance";
        distance.textContent =
          `About ${item.distance.toFixed(1)} miles away`;
        details.appendChild(distance);
      }

      card.append(
        createRestaurantLogoCard(item.restaurant),
        details
      );

      card.addEventListener("click", () => {
        state.restaurant = item.index;
        state.activeUser = 0;
        saveRestaurantToRecall(item.index);
        showCompatibilitySequence();
      });

      analyzerGrid.appendChild(card);
    });
  }

  async function searchAnalyzerLocation() {
    const location = analyzerLocation.value.trim();
    const request = ++analyzerSearchRequest;

    if (!location) {
      analyzerSearchCenter = null;
      analyzerLocationStatus.textContent =
        "Enter a city or ZIP code first.";
      renderAnalyzerRecommendations();
      return;
    }

    analyzerFindButton.disabled = true;
    analyzerLocationStatus.textContent = "Finding your selected area...";

    try {
      const url = new URL(
        "https://geocoding-api.open-meteo.com/v1/search"
      );
      url.searchParams.set("name", location);
      url.searchParams.set("count", "5");
      url.searchParams.set("language", "en");
      url.searchParams.set("format", "json");

      const response = await fetch(url);
      if (!response.ok) throw new Error("Location lookup failed");

      const data = await response.json();
      if (request !== analyzerSearchRequest) return;

      if (!data.results?.length) {
        analyzerSearchCenter = null;
        analyzerLocationStatus.textContent =
          "Location not found. Try another city or ZIP code.";
        renderAnalyzerRecommendations();
        return;
      }

      const place = data.results[0];
      analyzerSearchCenter = {
        lat: Number(place.latitude),
        lon: Number(place.longitude)
      };

      analyzerSearchLabel = [
        place.name,
        place.admin1,
        place.country
      ].filter(Boolean).join(", ");

      analyzerLocationStatus.textContent =
        `Within ${analyzerRadius.value} miles of ` +
        analyzerSearchLabel + " (straight-line distance).";

      renderAnalyzerRecommendations();
    } catch (error) {
      if (request !== analyzerSearchRequest) return;
      analyzerSearchCenter = null;
      analyzerLocationStatus.textContent =
        "Could not look up this area. Check your connection.";
      console.error(error);
      renderAnalyzerRecommendations();
    } finally {
      if (request === analyzerSearchRequest) {
        analyzerFindButton.disabled = false;
      }
    }
  }

  analyzerSearchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchAnalyzerLocation();
  });

  analyzerLocation.addEventListener("input", () => {
    analyzerSearchRequest++;
    analyzerSearchCenter = null;
    analyzerFindButton.disabled = false;
    analyzerLocationStatus.textContent =
      "Tap the search icon to find restaurants.";
    renderAnalyzerRecommendations();
  });

  analyzerRadius.addEventListener("change", () => {
    if (analyzerSearchCenter) {
      analyzerLocationStatus.textContent =
        `Within ${analyzerRadius.value} miles of ` +
        analyzerSearchLabel + " (straight-line distance).";
    }
    renderAnalyzerRecommendations();
  });

  analyzerBack.addEventListener("click", () => {
    renderUsers();
    showScreen("users");
  });

  // ==========================================
  // RESULTS FLOW
  // ==========================================

  function showCompatibilitySequence() {
    const version = ++state.flowVersion;
    showScreen("loading");

    setTimeout(() => {
      if (
        version !== state.flowVersion ||
        state.screen !== "loading"
      ) return;

      renderResult();
      showScreen("result");

      setTimeout(() => {
        if (
          version !== state.flowVersion ||
          state.screen !== "result"
        ) return;

        showScreen("menu");
        renderMenu();
      }, 3500);
    }, 850);
  }

  function renderResult() {
    const restaurant = restaurants[state.restaurant];
    const percentage = groupCompatibility(restaurant);
    const matched = groupMatch(restaurant);

    resultTitle.textContent = `${percentage}% MATCH`;
    resultSubtitle.textContent = matched
      ? "Everyone meets their minimum meal requirement!"
      : "Not everyone has enough meal options here.";

    screens.result.classList.toggle("no-match", !matched);
    resultCard.classList.toggle("bad-match", !matched);
    resultIcon.className =
      "ph result-icon " +
      (matched ? "ph-check-circle" : "ph-x-circle");

    playSound(matched ? "bell" : "crunch");
  }

  // ==========================================
  // WORKING LOGO CAMERA
  // ==========================================

  let logoPreviewRequest = 0;

  function releaseLogoPreview() {
    logoPreviewRequest++;
    logoCameraPreview.pause();
    logoCameraPreview.srcObject = null;
  }

  async function waitForScene() {
    if (scene.hasLoaded) return;
    await new Promise(resolve => {
      scene.addEventListener("loaded", resolve, { once: true });
    });
  }

  async function attachLogoPreview() {
    const request = ++logoPreviewRequest;
    const system = scene.systems["mindar-image-system"];

    for (let attempt = 0; attempt < 30; attempt++) {
      if (
        request !== logoPreviewRequest ||
        state.screen !== "camera"
      ) return false;

      const systemVideo =
        system && system.video instanceof HTMLVideoElement
          ? system.video
          : null;

      const candidates = [
        systemVideo,
        ...document.querySelectorAll("video")
      ].filter(video =>
        video &&
        video !== menuCameraVideo &&
        video !== logoCameraPreview
      );

      const source = candidates.find(video =>
        video.srcObject instanceof MediaStream &&
        video.srcObject.getVideoTracks().some(track =>
          track.readyState === "live"
        )
      );

      if (source?.srcObject) {
        logoCameraPreview.srcObject = source.srcObject;

        try {
          await logoCameraPreview.play();
          if (request !== logoPreviewRequest) return false;
          return true;
        } catch (error) {
          console.warn("Logo preview play:", error);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (
      request === logoPreviewRequest &&
      state.screen === "camera"
    ) {
      trackingStatus.textContent =
        "Camera preview unavailable. Check Safari camera permissions.";
    }

    return false;
  }

  async function stopAR() {
    releaseLogoPreview();

    try {
      await waitForScene();
      const system = scene.systems["mindar-image-system"];
      if (system && state.mindARStarted) {
        await system.stop();
      }
    } catch (error) {
      console.warn("Logo camera stop:", error);
    } finally {
      state.mindARStarted = false;
      state.mindARStarting = false;
    }
  }

  async function startAR() {
    if (state.mindARStarting) return;

    if (state.mindARStarted) {
      await attachLogoPreview();
      return;
    }

    state.mindARStarting = true;

    try {
      await waitForScene();
      if (state.screen !== "camera") return;

      const system = scene.systems["mindar-image-system"];

      if (!system) {
        trackingStatus.textContent =
          "Logo scanner could not initialize.";
        return;
      }

      trackingStatus.textContent = "Starting camera...";
      await system.start();

      if (state.screen !== "camera") {
        try { await system.stop(); } catch (error) {}
        return;
      }

      state.mindARStarted = true;
      const previewReady = await attachLogoPreview();

      if (
        state.screen === "camera" &&
        !state.scanComplete &&
        previewReady
      ) {
        trackingStatus.textContent = "Looking for logo...";
      }
    } catch (error) {
      console.error("Logo scanner:", error);
      if (state.screen === "camera") {
        trackingStatus.textContent =
          "Logo camera could not start. Check permissions.";
      }
    } finally {
      state.mindARStarting = false;
    }
  }

  async function restartAR() {
    await stopAR();
    if (state.screen === "camera") await startAR();
  }

  logoScannerBack.addEventListener("click", async () => {
    state.flowVersion++;
    state.scanComplete = false;
    renderUsers();
    showScreen("users");
    await stopAR();
  });

  function restaurantDetected(index) {
    if (state.scanComplete || state.screen !== "camera") return;

    state.restaurant = index;
    state.scanComplete = true;
    saveRestaurantToRecall(index);
    trackingStatus.textContent = "Logo found";

    const version = ++state.flowVersion;

    setTimeout(async () => {
      if (version !== state.flowVersion) return;
      showCompatibilitySequence();
      await stopAR();
    }, 250);
  }

  psTarget.addEventListener("targetFound", () => {
    if (state.screen === "camera") restaurantDetected(0);
  });

  danboTarget.addEventListener("targetFound", () => {
    if (state.screen === "camera") restaurantDetected(1);
  });

  // ==========================================
  // MENU SCANNER
  // ==========================================

  const dietaryFlagRules = [
    {
      profile: "Gus",
      filter: "nutSafe",
      label: "Nut warning",
      pattern: /\b(peanut|peanuts|walnut|walnuts|almond|almonds|cashew|cashews|pistachio|pistachios|pecan|pecans|hazelnut|hazelnuts)\b/i
    },
    {
      profile: "Brad",
      filter: "seafoodSafe",
      label: "Seafood warning",
      pattern: /\b(shrimp|prawn|prawns|crab|lobster|oyster|oysters|mussel|mussels|clam|clams|salmon|tuna|anchovy|anchovies|fish)\b/i
    },
    {
      profile: "Brad",
      filter: "glutenFree",
      label: "Gluten warning",
      pattern: /\b(wheat|barley|rye|semolina|couscous|bulgur)\b/i
    },
    {
      profile: "Jamie",
      filter: "vegan",
      label: "Animal ingredient",
      pattern: /\b(beef|pork|chicken|bacon|ham|milk|butter|cheese|egg|eggs|honey|gelatin|shrimp|salmon|fish)\b/i
    }
  ];

  const MENU_SCAN_STORAGE_KEY = "grub-scrub-menu-scans-v1";
  const RECALL_STORAGE_KEY = "grub-scrub-recall-v1";

  
try {
  localStorage.removeItem("grub-scrub-recall-v1");
  localStorage.removeItem("grub-scrub-menu-scans-v1");
} catch (error) {
  console.warn("Recall reset failed:", error);
}

  // ==========================================
  // CLEAR DEMO RECALL HISTORY ON REFRESH
  // ==========================================

  try {
    localStorage.removeItem(RECALL_STORAGE_KEY);
    localStorage.removeItem(MENU_SCAN_STORAGE_KEY);

    console.info(
      "Grub Scrub: recall history reset on refresh."
    );
  } catch (error) {
    console.warn(
      "Could not reset recall history:",
      error
    );
  }

  // ==========================================
  // END RECALL RESET
  // ==========================================

  function clearMenuARFlags() {
    menuARFlagLayer.replaceChildren();
  }

  function getOCRWords(data) {
    if (Array.isArray(data.words) && data.words.length) {
      return data.words;
    }
    if (!Array.isArray(data.blocks)) return [];

    return data.blocks.flatMap(block =>
      (block.paragraphs || []).flatMap(paragraph =>
        (paragraph.lines || []).flatMap(line =>
          line.words || []
        )
      )
    );
  }

  function getMenuVideoBounds(imageWidth, imageHeight) {
    const container = $(".menu-camera-container");
    const width = container.clientWidth;
    const height = container.clientHeight;
    const scale = Math.min(
      width / imageWidth,
      height / imageHeight
    );

    return {
      scale,
      left: (width - imageWidth * scale) / 2,
      top: (height - imageHeight * scale) / 2,
      width,
      height
    };
  }

  function renderMenuARFlags(data, imageWidth, imageHeight) {
    clearMenuARFlags();

    const words = getOCRWords(data);
    const selected = selectedUsers();
    const bounds = getMenuVideoBounds(imageWidth, imageHeight);
    const warnings = [];
    let flagsShown = 0;

    words.forEach(word => {
      if (flagsShown >= 8 || !word.bbox || !word.text) return;

      const text = word.text.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (!text || Number(word.confidence ?? 100) < 40) return;

    
      const conflicts = dietaryFlagRules.flatMap(rule =>
        selected
          .filter(user =>
            user.filters.includes(rule.filter) &&
            (
              !window.GrubLiveScan ||
              window.GrubLiveScan.includesUser(user.name)
            ) &&
            rule.pattern.test(text)
          )
          .map(user => ({
            ...rule,
            profile: user.name
          }))
      );

      if (!conflicts.length) return;

      const bbox = word.bbox;
      const wordLeft = bounds.left + bbox.x0 * bounds.scale;
      const wordRight = bounds.left + bbox.x1 * bounds.scale;
      const wordCenterY =
        bounds.top + ((bbox.y0 + bbox.y1) / 2) * bounds.scale;

      const flag = document.createElement("div");
      flag.className = "menu-ar-warning";
      flag.style.visibility = "hidden";

      const symbol = document.createElement("span");
      symbol.className = "menu-ar-flag-symbol";
      symbol.innerHTML = `
        <span class="menu-ar-flag-pole"></span>
        <span class="menu-ar-flag-cloth"></span>
      `;

      const label = document.createElement("span");
      label.className = "menu-ar-flag-label";
      label.textContent = conflicts.map(rule =>
        `${rule.profile}: ${rule.label}`
      ).join(" / ");

      flag.append(symbol, label);
      menuARFlagLayer.appendChild(flag);

      const flagWidth = flag.offsetWidth || 170;
      const flagHeight = flag.offsetHeight || 44;

      let x = wordRight + 18;
      if (x + flagWidth > bounds.width - 12) {
        x = wordLeft - flagWidth - 18;
      }
      x = Math.max(12, Math.min(
        x, bounds.width - flagWidth - 12
      ));

      let y = wordCenterY - flagHeight / 2;
      if (flagsShown % 2) y += 10;
      y = Math.max(12, Math.min(
        y, bounds.height - flagHeight - 12
      ));

      flag.style.left = `${x}px`;
      flag.style.top = `${y}px`;
      flag.style.visibility = "visible";

      warnings.push({
        word: text,
        profiles: conflicts.map(rule => rule.profile),
        warnings: conflicts.map(rule => rule.label)
      });
      flagsShown++;
    });

    lastDetectedMenuWarnings = warnings;
    return flagsShown;
  }

  function stopMenuCamera(invalidate = true) {
    menuOCRGeneration++;
    clearMenuARFlags();

    if (invalidate) menuCameraRequest++;

    if (menuCameraStream) {
      menuCameraStream.getTracks().forEach(track => track.stop());
      menuCameraStream = null;
    }

    menuCameraVideo.pause();
    menuCameraVideo.srcObject = null;
  }

  async function startMenuCamera() {
    const request = ++menuCameraRequest;
    stopMenuCamera(false);

    menuPhotoCaptured = false;
    capturedMenuPhoto = "";
    lastRecognizedMenuText = "";
    lastDetectedMenuWarnings = [];

    menuCaptureCanvas.hidden = true;
    menuCameraVideo.hidden = false;
    captureMenuButton.disabled = true;
    captureMenuButton.textContent = "SAVE MENU RESULTS";
    menuCameraStatus.textContent = "Starting camera...";

    if (!navigator.mediaDevices?.getUserMedia) {
      menuCameraStatus.textContent =
        "Camera unavailable. Use HTTPS or localhost.";
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } }
      });

      if (
        request !== menuCameraRequest ||
        state.screen !== "menuScanner"
      ) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      menuCameraStream = stream;
      menuCameraVideo.srcObject = stream;
      await menuCameraVideo.play();

      if (
        request !== menuCameraRequest ||
        state.screen !== "menuScanner"
      ) {
        stopMenuCamera();
        return;
      }

      captureMenuButton.disabled = false;
      menuCameraStatus.textContent =
        "Point your camera at the restaurant menu to scan.";

      startLiveMenuOCR();
    } catch (error) {
      if (request !== menuCameraRequest) return;
      console.error("Menu camera:", error);
      stopMenuCamera();
      menuCameraStatus.textContent =
        "Camera could not start. Check camera permissions.";
      captureMenuButton.disabled = true;
    }
  }

  async function getMenuOCRWorker() {
    if (!window.Tesseract) {
      throw new Error("Tesseract.js did not load");
    }

    if (!menuOCRWorkerPromise) {
      menuOCRWorkerPromise = window.Tesseract.createWorker("eng")
        .catch(error => {
          menuOCRWorkerPromise = null;
          throw error;
        });
    }

    return menuOCRWorkerPromise;
  }

  async function startLiveMenuOCR() {
    const generation = ++menuOCRGeneration;
    const isActive = () =>
      generation === menuOCRGeneration &&
      state.screen === "menuScanner" &&
      !!menuCameraStream;

    let worker;

    try {
      menuCameraStatus.textContent =
        "Loading menu text recognition...";
      worker = await getMenuOCRWorker();
    } catch (error) {
      console.error("OCR initialization:", error);
      if (isActive()) {
        menuCameraStatus.textContent =
          "OCR unavailable. You can still save a menu photo.";
      }
      return;
    }

    if (!isActive()) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {
      willReadFrequently: true
    });
    if (!context) return;

    let unclearFrames = 0;

    function prepareImage(sourcePixels, invert = false) {
      const width = canvas.width;
      const height = canvas.height;
      const image = context.createImageData(width, height);
      image.data.set(sourcePixels);

      const pixels = image.data;
      const left = Math.round(width * 0.06);
      const right = Math.round(width * 0.94);
      const top = Math.round(height * 0.08);
      const bottom = Math.round(height * 0.92);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;

          if (
            x < left || x >= right ||
            y < top || y >= bottom
          ) {
            pixels[i] = 255;
            pixels[i + 1] = 255;
            pixels[i + 2] = 255;
            pixels[i + 3] = 255;
            continue;
          }

          let gray =
            pixels[i] * 0.299 +
            pixels[i + 1] * 0.587 +
            pixels[i + 2] * 0.114;

          gray = (gray - 128) * 1.45 + 128;
          if (invert) gray = 255 - gray;
          gray = Math.max(0, Math.min(255, gray));

          pixels[i] = gray;
          pixels[i + 1] = gray;
          pixels[i + 2] = gray;
          pixels[i + 3] = 255;
        }
      }

      context.putImageData(image, 0, 0);
    }

    function scoreOCR(result) {
      const text = (result.data.text || "").trim();
      const words = getOCRWords(result.data).filter(word =>
        (word.text || "").replace(/[^a-zA-Z]/g, "").length >= 3 &&
        Number(word.confidence ?? 0) >= 35
      );

      const confidence = words.length
        ? words.reduce(
            (sum, word) => sum + Number(word.confidence ?? 0),
            0
          ) / words.length
        : 0;

      return {
        text,
        wordCount: words.length,
        confidence,
        score: words.length * 5 + confidence * 0.5
      };
    }

    while (isActive()) {
      try {
        const video = menuCameraVideo;

        if (video.videoWidth && video.videoHeight) {
          const width = Math.min(1600, video.videoWidth);
          const scale = width / video.videoWidth;

          canvas.width = Math.round(width);
          canvas.height = Math.round(
            video.videoHeight * scale
          );

          context.drawImage(
            video, 0, 0, canvas.width, canvas.height
          );

          const original = context.getImageData(
            0, 0, canvas.width, canvas.height
          );

          menuCameraStatus.textContent = "Analyzing menu text...";

          prepareImage(original.data, false);
          const lightResult = await worker.recognize(
            canvas, {}, { text: true, blocks: true }
          );

          if (!isActive()) return;
          const lightScore = scoreOCR(lightResult);

          prepareImage(original.data, true);
          const darkResult = await worker.recognize(
            canvas, {}, { text: true, blocks: true }
          );

          if (!isActive()) return;
          const darkScore = scoreOCR(darkResult);

          const useDark = darkScore.score > lightScore.score;
          const bestResult = useDark ? darkResult : lightResult;
          const bestScore = useDark ? darkScore : lightScore;

          if (
            bestScore.wordCount >= 3 &&
            bestScore.confidence >= 35
          ) {
            unclearFrames = 0;
            lastRecognizedMenuText = bestScore.text;


            document.dispatchEvent(
              new CustomEvent("grub-live-menu-text", {
                detail: {
                  text: bestScore.text
                }
              })
            );


            renderMenuARFlags(
              bestResult.data,
              canvas.width,
              canvas.height
            );

            menuCameraStatus.textContent =
              "Detected: " +
              bestScore.text.replace(/\s+/g, " ").slice(0, 100);
          } else {
            unclearFrames++;
            menuCameraStatus.textContent =
              unclearFrames === 1
                ? "Refocusing on menu text..."
                : "Move closer or hold the menu steady.";

            if (unclearFrames > 1) {
              clearMenuARFlags();
              lastDetectedMenuWarnings = [];
            }
          }
        }
      } catch (error) {
        console.warn("OCR frame:", error);
        if (isActive()) {
          menuCameraStatus.textContent =
            "Could not read menu. Try better lighting.";
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // ==========================================
  // SAVE SCANNED MENUS
  // ==========================================

  function createMenuPhotoDataURL(
    sourceCanvas, maxWidth = 720, quality = 0.65
  ) {
    if (!sourceCanvas.width || !sourceCanvas.height) return "";

    const scale = Math.min(1, maxWidth / sourceCanvas.width);
    const output = document.createElement("canvas");
    output.width = Math.max(
      1, Math.round(sourceCanvas.width * scale)
    );
    output.height = Math.max(
      1, Math.round(sourceCanvas.height * scale)
    );

    const context = output.getContext("2d");
    if (!context) return "";

    context.drawImage(
      sourceCanvas, 0, 0, output.width, output.height
    );

    return output.toDataURL("image/jpeg", quality);
  }

  function getSavedMenuScans() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(MENU_SCAN_STORAGE_KEY) || "[]"
      );
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveCapturedMenu() {
    if (!menuPhotoCaptured || !menuCaptureCanvas.width) {
      return false;
    }

    const photo = createMenuPhotoDataURL(
      menuCaptureCanvas, 640, 0.55
    );
    if (!photo) return false;

    const entry = {
      id: Date.now(),
      name: "Scanned Menu",
      photo,
      savedAt: new Date().toISOString(),
      recognizedText: lastRecognizedMenuText,
      potentialWarnings: lastDetectedMenuWarnings,
      analyzed: false
    };

    localStorage.setItem(
      MENU_SCAN_STORAGE_KEY,
      JSON.stringify([entry, ...getSavedMenuScans()].slice(0, 5))
    );

    state.recallOrigin = "scanChoice";
    renderRecallList();
    showScreen("recall");
    return true;
  }

  captureMenuButton.addEventListener("click", () => {
    if (
      !menuCameraStream ||
      !menuCameraVideo.videoWidth ||
      !menuCameraVideo.videoHeight
    ) {
      menuCameraStatus.textContent = "Camera is not ready yet.";
      return;
    }

    captureMenuButton.disabled = true;
    const canvas = menuCaptureCanvas;
    const context = canvas.getContext("2d");

    if (!context) {
      captureMenuButton.disabled = false;
      return;
    }

    canvas.width = menuCameraVideo.videoWidth;
    canvas.height = menuCameraVideo.videoHeight;
    context.drawImage(
      menuCameraVideo, 0, 0, canvas.width, canvas.height
    );

    capturedMenuPhoto = createMenuPhotoDataURL(
      canvas, 1100, 0.82
    );

    if (!capturedMenuPhoto) {
      captureMenuButton.disabled = false;
      return;
    }

    menuPhotoCaptured = true;
    stopMenuCamera();

    menuCameraVideo.hidden = true;
    menuCaptureCanvas.hidden = false;

    try {
      if (!saveCapturedMenu()) {
        throw new Error("Could not save menu");
      }
    } catch (error) {
      console.error("Menu save:", error);
      menuCameraStatus.textContent =
        "Could not save menu. Browser storage may be full.";
      captureMenuButton.disabled = false;
    }
  });

  menuScannerBack.addEventListener("click", () => {
    stopMenuCamera();
    renderUsers();
    showScreen("users");
  });

  // ==========================================
  // SAVED MENU RESULTS
  // ==========================================

  function openMenuResults(photo, fromRecall = false) {
    state.menuResultFromRecall = fromRecall;
    menuResultsPhoto.src = photo;
    menuResultsMatchLabel.textContent = "Analysis pending";
    menuResultsProgressFill.style.width = "0%";
    menuResultsProgress.removeAttribute("aria-valuenow");
    menuResultsProgress.setAttribute(
      "aria-valuetext", "Not analyzed"
    );

    menuFlagsMessage.hidden = true;
    menuSaveStatus.textContent = "";
    retakeMenuResultsButton.hidden = fromRecall;
    saveMenuResultsButton.hidden = fromRecall;

    showScreen("menuResults");
  }

  filterFlagsButton.addEventListener("click", () => {
    menuFlagsMessage.hidden = !menuFlagsMessage.hidden;
  });

  retakeMenuResultsButton.addEventListener("click", async () => {
    showScreen("menuScanner");
    await startMenuCamera();
  });

  menuResultsBack.addEventListener("click", async () => {
    if (state.menuResultFromRecall) {
      renderRecallList();
      showScreen("recall");
    } else {
      showScreen("menuScanner");
      await startMenuCamera();
    }
  });

  saveMenuResultsButton.addEventListener("click", () => {
    try {
      if (!saveCapturedMenu()) {
        menuSaveStatus.textContent = "Please scan a menu first.";
      }
    } catch (error) {
      console.error(error);
      menuSaveStatus.textContent = "Could not save menu.";
    }
  });

  // ==========================================
  // RECALL LIST
  // ==========================================

  function getRecallList() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(RECALL_STORAGE_KEY) || "[]"
      );
      return Array.isArray(saved)
        ? saved.filter(index =>
            Number.isInteger(index) &&
            index >= 0 &&
            index < restaurants.length
          )
        : [];
    } catch (error) {
      return [];
    }
  }

  function saveRestaurantToRecall(index) {
    try {
      const existing = getRecallList();
      localStorage.setItem(
        RECALL_STORAGE_KEY,
        JSON.stringify([
          index,
          ...existing.filter(i => i !== index)
        ])
      );
    } catch (error) {
      console.warn("Recall save:", error);
    }
  }

  function renderRecallList() {
    recallList.replaceChildren();

    const savedRestaurants = getRecallList();
    const savedMenus = getSavedMenuScans();

    recallEmpty.style.display =
      savedRestaurants.length || savedMenus.length
        ? "none"
        : "block";

    [...savedRestaurants]
      .sort((a, b) =>
        groupCompatibility(restaurants[b]) -
        groupCompatibility(restaurants[a])
      )
      .forEach(index => {
        const restaurant = restaurants[index];
        const percentage = groupCompatibility(restaurant);

        const card = document.createElement("button");
        card.type = "button";
        card.className = "recall-card";
        if (percentage === 100) card.classList.add("full-match");

        const name = document.createElement("span");
        name.className = "recall-restaurant-name";
        name.textContent = restaurant.name;

        const score = document.createElement("span");
        score.className = "recall-score";
        score.textContent = `${percentage}% MATCH`;

        card.append(name, score);

        card.addEventListener("click", () => {
          state.restaurant = index;
          state.activeUser = 0;
          showScreen("menu");
          renderMenu();
        });

        recallList.appendChild(card);
      });

    savedMenus.forEach(item => {
      if (!item?.photo) return;

      const card = document.createElement("button");
      card.type = "button";
      card.className = "recall-card menu-photo-recall";

      const name = document.createElement("span");
      name.className = "recall-restaurant-name";
      name.textContent = item.name || "Scanned Menu";

      const score = document.createElement("span");
      score.className = "recall-score";

      const count = Array.isArray(item.potentialWarnings)
        ? item.potentialWarnings.length
        : 0;

      score.textContent = count
        ? `${count} possible warning${count === 1 ? "" : "s"}`
        : "Not analyzed";

      card.append(name, score);
      card.addEventListener("click", () => {
        openMenuResults(item.photo, true);
      });
      recallList.appendChild(card);
    });
  }

  openRecallButton.addEventListener("click", () => {
    state.recallOrigin = "menu";
    renderRecallList();
    showScreen("recall");
  });

  recallBackButton.addEventListener("click", () => {
    if (state.recallOrigin === "menu") {
      showScreen("menu");
      renderMenu();
    } else if (state.selectedScanType === "analyzer") {
      showScreen("analyzer");
      renderAnalyzerRecommendations();
    } else {
      showScreen("scanChoice");
    }
  });

  // ==========================================
  // 3D FOOD MODELS
  // ==========================================

  function createViewer(meal) {
    const viewer = document.createElement("model-viewer");
    viewer.setAttribute("alt", "3D model of " + meal.name);
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("interaction-prompt", "none");
    viewer.setAttribute("loading", "eager");
    viewer.setAttribute("shadow-intensity", "0.8");
    viewer.setAttribute("exposure", "1");

    if (!mobile()) {
      viewer.setAttribute("auto-rotate", "");
      viewer.setAttribute("rotation-per-second", "15deg");
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
            status.textContent = "3D model unavailable";
            console.warn("Model failed:", meal.name, reason);
          }
        }
        resolve();
      }

      const onLoad = () => finish(true);
      const onError = event => finish(false, event);

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

  // ==========================================
  // RESTAURANT MENU
  // ==========================================

  function renderMenu() {
    const restaurant = restaurants[state.restaurant];
    const user = activeUser();

    if (!user) {
      renderUsers();
      showScreen("users");
      return;
    }

    const meals = available(restaurant, user);
    restaurantName.textContent = restaurant.name;
    activeUserName.textContent = user.name;
    activeUserRestrictions.textContent =
      user.restrictions.join(" • ");
    availabilityCount.textContent =
      `${meals.length}/${restaurant.meals.length}`;
    optionsMessage.textContent = meals.length
      ? "meal options available"
      : "no meal options available";

    const version = ++state.menuVersion;
    const entries = [];
    menuGrid.replaceChildren();

    meals.forEach(meal => {
      const card = document.createElement("div");
      card.className = "meal-card";

      const picture = document.createElement("div");
      picture.className = "meal-picture";

      const label = document.createElement("div");
      label.className = "meal-name";
      label.textContent = meal.name;

      card.append(picture, label);


      // Show a placeholder for database meals
      // that do not yet have a 3D model.
      if (!meal.model) {
        const placeholder = document.createElement("div");
        placeholder.textContent = "🍽️";

        Object.assign(placeholder.style, {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: "110px",
          width: "100%",
          fontSize: "50px",
          backgroundColor: "#f1ecef"
        });

        picture.appendChild(placeholder);
      }


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
          background: "#e8e8e8",
          color: "#666",
          fontSize: "12px",
          textAlign: "center",
          pointerEvents: "none",
          zIndex: "1"
        });

        status.textContent = "Loading 3D food...";
        picture.append(viewer, status);
        entries.push({ viewer, status, meal });
      }

      menuGrid.appendChild(card);
    });

    // Preserve the current open/closed state.
    // The wheel starts closed when a menu first opens.
    renderProfileDisc();

    if (mobile()) {
      loadMobileModels(entries, version);
    } else {
      entries.forEach(entry => loadModel(entry, version));
    }
  }

  // ==========================================
  // PROJECT 2 PROFILE WHEEL RESTORATION
  // ==========================================

  function renderProfileDisc() {
    profileButtons.replaceChildren();

    profileDisc.classList.toggle(
      "open",
      state.profileMenuOpen
    );

    const restaurant = restaurants[state.restaurant];
    const ordered = selectedUsers().map((user, index) => ({
      user,
      index
    }));

    const active = ordered[state.activeUser];

    const arranged = [
      active,
      ...ordered.filter(item =>
        item.index !== state.activeUser
      )
    ].filter(Boolean);

    // Original Project 2 positions.
    const slots = [
      { left: "25px", top: "11px" },
      { right: "2px", top: "2px" },
      { left: "2px", bottom: "2px" }
    ];

    arranged.forEach((entry, slot) => {
      const user = entry.user;
      const isActive = entry.index === state.activeUser;
      const compatible =
        available(restaurant, user).length > 0;

      // Closed wheel: only the active portrait.
      if (!state.profileMenuOpen && !isActive) return;

      const button = document.createElement("button");
      button.type = "button";

      button.className = isActive
        ? "profile-button active current"
        : "profile-button small";

      if (state.profileMenuOpen) {
        Object.assign(button.style, slots[slot]);
      } else {
        button.style.right = "4px";
        button.style.bottom = "4px";
      }

      button.setAttribute("aria-label", user.name);

      button.innerHTML = `
        <span class="profile-main-icon ${
          compatible
            ? "profile-has-options"
            : "profile-no-options"
        }">
          <img
            class="profile-nav-image"
            src="${user.image}"
            alt="${user.name}"
          >
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
          // First tap expands the original wheel.
          state.profileMenuOpen = true;
          renderProfileDisc();
          return;
        }

        // Selecting a profile collapses the wheel.
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

  // ==========================================
  // SCAN AGAIN
  // ==========================================

  scanAgainButton.addEventListener("click", async () => {
    if (state.selectedScanType === "analyzer") {
      showScreen("analyzer");
      renderAnalyzerRecommendations();
      return;
    }

    if (state.selectedScanType === "menu") {
      showScreen("menuScanner");
      await startMenuCamera();
      return;
    }

    state.selectedScanType = "logo";
    state.scanComplete = false;
    state.flowVersion++;
    trackingStatus.textContent = "Starting logo camera...";
    showScreen("camera");
    await restartAR();
  });

  // ==========================================
  // HOUSE SALAD 3D HOTSPOTS
  // ==========================================

  let detailReady = false;
  let detailFailed = false;
  let selectedIngredient = null;

  const INGREDIENT_NAMES = {
    lettuce: "Lettuce",
    tomato: "Tomatoes",
    cucumber: "Cucumbers"
  };

  const HOTSPOT_DEFAULTS = {
    lettuce: { x: -0.24, y: 0.26, z: 0.08 },
    tomato: { x: -0.10, y: 0.05, z: 0.36 },
    cucumber: { x: 0.34, y: -0.08, z: 0.40 }
  };

  const HOTSPOT_STORAGE_KEY =
    "grub-scrub-salad-hotspots-v3";

  let savedHotspots = {};

  try {
    const saved = JSON.parse(
      localStorage.getItem(HOTSPOT_STORAGE_KEY) || "{}"
    );
    if (saved && typeof saved === "object") {
      savedHotspots = saved;
    }
  } catch (error) {
    console.warn("Hotspot storage:", error);
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

    return {
      position: positionString({
        x: center.x + preset.x * (dimensions.x || 1),
        y: center.y + preset.y * (dimensions.y || 1),
        z: center.z + preset.z * (dimensions.z || 1)
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
    ) return stored;

    return getDefaultHotspot(part);
  }

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
      "label-left", part === "cucumber"
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
      console.error("Hotspot positioning:", error);
      hideHotspot();
    }
  }

  function selectIngredient(part) {
    if (selectedIngredient === part) {
      selectedIngredient = null;
      hideHotspot();

      ingredientButtons.querySelectorAll("button")
        .forEach(button => button.classList.remove("active"));

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
    console.error("Salad model:", error);

    if (state.screen === "dish") {
      showDishStatus(
        "House Salad 3D model could not load."
      );
    }
  });

  function openHeroDish(meal) {
    if (state.restaurant !== 0 || !meal.heroAR) return;

    dishRestaurant.textContent = "P.S. Kitchen";
    dishName.textContent = "House Salad";
    ingredientButtons.replaceChildren();
    selectedIngredient = null;
    hideHotspot();

    meal.ingredients.forEach(ingredient => {
      const button = document.createElement("button");
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

  backToMenu.addEventListener("click", () => {
    hideHotspot();
    showScreen("menu");
    renderMenu();
  });

  // ==========================================
  // INITIALIZE
  // ==========================================

  // ==========================================
  // GRUB SCRUB - BACK BUTTON NAVIGATION
  // ==========================================

  function goBackFromScreen(screenName) {

    // Go back to the starting screen.
    if (screenName === "plans") {
      showScreen("title");
      return;
    }

    // Food Profiles return to the correct flow.
    if (screenName === "users") {
      if (state.selectedScanType === "analyzer") {
        showScreen("plans");
      } else {
        showScreen("scanChoice");
      }
      return;
    }

    // Leave temporary loading/result screens safely.
    if (
      screenName === "loading" ||
      screenName === "result"
    ) {
      state.flowVersion++;

      if (state.selectedScanType === "analyzer") {
        showScreen("analyzer");
        renderAnalyzerRecommendations();
      } else {
        renderUsers();
        showScreen("users");
      }
      return;
    }

    // Restaurant Menu returns to its original flow.
    if (screenName === "menu") {
      state.profileMenuOpen = false;

      if (state.selectedScanType === "analyzer") {
        showScreen("analyzer");
        renderAnalyzerRecommendations();
      } else {
        renderUsers();
        showScreen("users");
      }
      return;
    }
  }

  // Add arrows only where a back button
  // does not already exist in your HTML.

  const screensNeedingBackButtons = [
    "plans",
    "users",
    "loading",
    "result",
    "menu"
  ];

  screensNeedingBackButtons.forEach(screenName => {

    const screen = screens[screenName];

    if (!screen) return;

    // Prevent duplicate back buttons.
    if (screen.querySelector(".gs-global-back")) {
      return;
    }

    const backButton = document.createElement("button");

    backButton.type = "button";
    backButton.className = "gs-global-back";

    backButton.setAttribute(
      "aria-label",
      "Go back"
    );

    backButton.innerHTML =
      '<i class="ph ph-arrow-left"></i>';

    backButton.addEventListener("click", () => {
      goBackFromScreen(screenName);
    });

    screen.appendChild(backButton);
  });

  // ==========================================
  // STANDARDIZE EXISTING BACK ARROWS
  // ==========================================

  // These buttons already have working JavaScript.
  // We only update their appearance, not their actions.

  const existingBackButtons = [
    scannerChoiceBack,
    analyzerBack,
    menuScannerBack,
    logoScannerBack,
    menuResultsBack,
    recallBackButton,
    backToMenu
  ];

  existingBackButtons.forEach(button => {
    if (!button) return;

    button.classList.add("gs-existing-back");

    button.innerHTML =
      '<i class="ph ph-arrow-left"></i>';

    button.setAttribute(
      "aria-label",
      "Go back"
    );
  });

  // ==========================================
  // END BACK BUTTON NAVIGATION
  // ==========================================


  // ==========================================
  
  // ==========================================
  // GRUB SCRUB - ALL MEAL LABELS
  // PROJECT 2 STYLE + REAL 3D HOTSPOTS
  // ==========================================

  // Demo labels, not verified ingredient lists.
  // House Salad keeps its original hotspot logic.

  const GS_MEAL_LABELS = {
    "Sweet Potato & Red Rice Bowl": [
      "Sweet potato",
      "Red rice"
    ],
    "Salmon & Brussels Sprouts": [
      "Salmon",
      "Brussels sprouts"
    ],
    "Mac and Cheese": [
      "Pasta",
      "Cheese"
    ],
    "Pork Belly Tonkotsu Ramen": [
      "Pork belly",
      "Noodles",
      "Broth"
    ],
    "Shoyu Ramen": [
      "Noodles",
      "Shoyu-style broth"
    ],
    "Vegan Assam Fish Head": [
      "Plant-based fish alternative",
      "Assam-style sauce"
    ],
    "Vegan Hainanese Chicken Rice": [
      "Plant-based chicken alternative",
      "Rice"
    ]
  };

  const GS_HOTSPOT_KEY =
    "grub-scrub-meal-hotspots-v1";

  let gsCurrentMeal = null;
  let gsSelectedLabel = null;
  let gsWaitingForPosition = false;
  let gsPointerStart = null;

  // ------------------------------------------
  // SAVED HOTSPOT COORDINATES
  // ------------------------------------------

  function gsReadHotspots() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(GS_HOTSPOT_KEY) || "{}"
      );

      return saved && typeof saved === "object"
        ? saved
        : {};
    } catch (error) {
      return {};
    }
  }

  let gsSavedHotspots = gsReadHotspots();

  function gsHotspotKey(meal, ingredient) {
    return (
      restaurants[state.restaurant].name +
      "::" +
      meal.name +
      "::" +
      ingredient
    );
  }

  
  function gsGetSavedPosition(meal, ingredient) {
    const restaurant =
      restaurants[state.restaurant].name;

    const key = gsHotspotKey(meal, ingredient);

    // A locally edited position takes precedence
    // until you publish the approved version.
    const localPosition = gsSavedHotspots[key];

    if (localPosition) {
      return localPosition;
    }

    // Otherwise use the approved shared position
    // loaded from Supabase.
    return window.GSMealDB?.getPosition(
      restaurant,
      meal.name,
      ingredient
    ) || null;
  }


  function gsSavePosition(meal, ingredient, point) {
    const key = gsHotspotKey(meal, ingredient);

    gsSavedHotspots[key] = {
      position: point.position.toString(),
      normal: point.normal.toString()
    };

    try {
      localStorage.setItem(
        GS_HOTSPOT_KEY,
        JSON.stringify(gsSavedHotspots)
      );
    } catch (error) {
      console.warn(
        "Could not save ingredient hotspot:",
        error
      );
    }
  }

  // ------------------------------------------
  // RESTORE ORIGINAL HOTSPOT APPEARANCE
  // ------------------------------------------

  // The original HTML already contains:
  // ingredientHotspot, hotspotLabel,
  // and the circular hotspot icon.
  // We reuse those elements rather than
  // adding a floating label at the bottom.

  const gsIngredientsPanel =
    ingredientButtons.parentElement;

  const gsIngredientNote =
    document.createElement("p");

  gsIngredientNote.id = "gsIngredientNote";
  gsIngredientNote.className = "gs-ingredient-note";

  gsIngredientsPanel.appendChild(gsIngredientNote);

  function gsHideMealHotspot() {
    gsWaitingForPosition = false;
    gsSelectedLabel = null;
    hideHotspot();
  }

  function gsShowPositionedLabel(label, coordinates) {
    if (!coordinates) return;

    hotspotLabel.textContent = label;
    hotspot.classList.remove("label-left");

    detailViewer.updateHotspot({
      name: "hotspot-ingredient",
      position: coordinates.position,
      normal: coordinates.normal
    });

    hotspot.classList.remove("is-hidden");
    hotspot.setAttribute("aria-hidden", "false");
  }

  // ------------------------------------------
  
  // ------------------------------------------
  // SELECT AN INGREDIENT
  // ------------------------------------------

  function gsFindVisibleFoodPoint() {
    if (
      !detailViewer.loaded ||
      typeof detailViewer.positionAndNormalFromPoint !== "function"
    ) {
      return null;
    }

    const rect = detailViewer.getBoundingClientRect();

    const samples = [
      [0.50, 0.50],
      [0.43, 0.43],
      [0.57, 0.43],
      [0.43, 0.57],
      [0.57, 0.57],
      [0.50, 0.35],
      [0.35, 0.50],
      [0.65, 0.50],
      [0.50, 0.65]
    ];

    for (const [x, y] of samples) {
      try {
        const point = detailViewer.positionAndNormalFromPoint(
          rect.width * x,
          rect.height * y
        );

        if (point && point.position && point.normal) {
          return {
            position: point.position.toString(),
            normal: point.normal.toString()
          };
        }
      } catch (error) {
        console.warn("Model point:", error);
      }
    }

    return null;
  }

  function gsSelectMealIngredient(label, button) {
    if (!gsCurrentMeal) return;

    // Tap the same ingredient to hide its label.
    if (gsSelectedLabel === label) {
      gsHideMealHotspot();

      ingredientButtons
        .querySelectorAll(".ingredient-button")
        .forEach(item => {
          item.classList.remove("active");
          item.setAttribute("aria-pressed", "false");
        });

      gsIngredientNote.textContent =
        "Choose an ingredient to display its label.";

      detailViewer.setAttribute("auto-rotate", "");
      return;
    }

    gsSelectedLabel = label;

    ingredientButtons
      .querySelectorAll(".ingredient-button")
      .forEach(item => {
        const active = item === button;

        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

    detailViewer.removeAttribute("auto-rotate");
    hideHotspot();

    const saved = gsGetSavedPosition(gsCurrentMeal, label);
    const coordinates = saved || gsFindVisibleFoodPoint();

    if (coordinates) {
      try {
        gsShowPositionedLabel(label, coordinates);

        gsIngredientNote.textContent = saved
          ? "Label displayed. Tap the food to reposition it."
          : "Preview shown. Tap the correct ingredient on the food to save its location.";
      } catch (error) {
        console.error("Could not display label:", error);

        gsIngredientNote.textContent =
          "Tap the food to position this label.";
      }
    } else {
      gsIngredientNote.textContent =
        "Tap the ingredient's location on the 3D model to place its label.";
    }

    gsWaitingForPosition = true;
  }

  // ------------------------------------------


  // ------------------------------------------
  // OPEN ANY MEAL'S DETAIL VIEW
  // ------------------------------------------

  function gsOpenMealDetail(meal) {
    if (!meal) return;

    gsCurrentMeal = meal;
    gsHideMealHotspot();

    // House Salad retains the original
    // Project 2 positioned hotspot behavior.
    if (meal.heroAR && state.restaurant === 0) {
      gsIngredientNote.textContent =
        "Tap an ingredient to display " +
        "its label on the 3D model.";

      if (
        detailViewer.getAttribute("src") !==
        SALAD_URL
      ) {
        detailReady = false;
        detailFailed = false;

        detailViewer.removeAttribute("src");
      }

      openHeroDish(meal);
      return;
    }

    // All other meals reuse the same detail screen.
    selectedIngredient = null;
    hideHotspot();

    detailReady = false;
    detailFailed = false;

    dishRestaurant.textContent =
      restaurants[state.restaurant].name;

    dishName.textContent = meal.name;

    ingredientButtons.replaceChildren();

    const labels =
    window.GSMealDB?.getIngredients(
      restaurants[state.restaurant].name,
      meal.name
    ) ||
    GS_MEAL_LABELS[meal.name] ||
    [];


    labels.forEach(label => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "ingredient-button";
      button.textContent = label;
      button.setAttribute(
        "aria-pressed",
        "false"
      );

      button.addEventListener("click", () => {
        gsSelectMealIngredient(label, button);
      });

      ingredientButtons.appendChild(button);
    });

    if (!labels.length) {
      const message = document.createElement("p");

      message.className = "gs-ingredient-note";
      message.textContent =
        "Ingredient labels are not available " +
        "for this meal yet.";

      ingredientButtons.appendChild(message);
    }

    gsIngredientNote.textContent =
      "Select an ingredient, then tap its " +
      "location on the 3D model. " +
      "Demo ingredients are not verified " +
      "restaurant allergen information.";

    showScreen("dish");

    showDishStatus(
      meal.model
        ? "Loading " + meal.name + "..."
        : "3D model unavailable."
    );

    detailViewer.setAttribute(
      "camera-controls",
      ""
    );

    detailViewer.setAttribute(
      "interaction-prompt",
      "none"
    );

    detailViewer.setAttribute(
      "auto-rotate",
      ""
    );

    if (meal.model) {
      detailViewer.removeAttribute("src");
      detailViewer.setAttribute(
        "src",
        meal.model
      );
    } else {
      detailViewer.removeAttribute("src");
    }
  }

  // ------------------------------------------
  // POSITION LABELS ON THE ACTUAL 3D FOOD
  // ------------------------------------------

  // Ignore dragging so normal 3D rotation
  // still works. Short taps position a label.

  detailViewer.addEventListener(
    "pointerdown",
    event => {
      gsPointerStart = {
        x: event.clientX,
        y: event.clientY
      };
    }
  );

  detailViewer.addEventListener(
    "pointerup",
    event => {
      if (
        !gsCurrentMeal ||
        gsCurrentMeal.heroAR ||
        !gsSelectedLabel ||
        !detailViewer.loaded ||
        !gsPointerStart
      ) {
        gsPointerStart = null;
        return;
      }

      const distance = Math.hypot(
        event.clientX - gsPointerStart.x,
        event.clientY - gsPointerStart.y
      );

      gsPointerStart = null;

      // Dragging rotates the model.
      if (distance > 12) return;

      if (
        typeof detailViewer
          .positionAndNormalFromPoint !== "function"
      ) {
        gsIngredientNote.textContent =
          "3D positioning is unavailable.";
        return;
      }

      
      // Get the position relative to the 3D viewer.
      const rect = detailViewer.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const point = detailViewer.positionAndNormalFromPoint(
        x,
        y
      );
  
      if (!point) {
        gsIngredientNote.textContent =
          "Tap directly on the food model, " +
          "not the empty background.";
        return;
      }

      gsSavePosition(
        gsCurrentMeal,
        gsSelectedLabel,
        point
      );

      gsWaitingForPosition = false;

      gsShowPositionedLabel(
        gsSelectedLabel,
        {
          position: point.position.toString(),
          normal: point.normal.toString()
        }
      );

      gsIngredientNote.textContent =
        "Label positioned! You can rotate the " +
        "model or tap another spot to move it.";
    }
  );

  // ------------------------------------------
  // MAKE ALL MEAL CARDS OPEN DETAILS
  // ------------------------------------------

  // Event delegation keeps the existing
  // House Salad functionality and supports
  // future restaurant menus too.

  menuGrid.addEventListener(
    "click",
    event => {
      const card =
        event.target.closest(".meal-card");

      if (
        !card ||
        !menuGrid.contains(card)
      ) return;

      const name = card
        .querySelector(".meal-name")
        ?.textContent.trim();

      const meal =
        restaurants[state.restaurant].meals.find(
          item => item.name === name
        );

      if (!meal) return;

      event.preventDefault();
      event.stopPropagation();

      gsOpenMealDetail(meal);
    },
    true
  );

  menuGrid.addEventListener(
    "keydown",
    event => {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) return;

      const card =
        event.target.closest(".meal-card");

      if (
        !card ||
        !menuGrid.contains(card)
      ) return;

      const name = card
        .querySelector(".meal-name")
        ?.textContent.trim();

      const meal =
        restaurants[state.restaurant].meals.find(
          item => item.name === name
        );

      if (!meal) return;

      event.preventDefault();

      gsOpenMealDetail(meal);
    }
  );

  // Accessible meal cards.
  const gsMenuObserver =
    new MutationObserver(() => {
      menuGrid
        .querySelectorAll(".meal-card")
        .forEach(card => {
          if (card.dataset.gsDetailReady) return;

          card.dataset.gsDetailReady = "true";
          card.setAttribute("role", "button");
          card.setAttribute("tabindex", "0");

          const name = card
            .querySelector(".meal-name")
            ?.textContent.trim() || "meal";

          card.setAttribute(
            "aria-label",
            "View details for " + name
          );
        });
    });

  gsMenuObserver.observe(menuGrid, {
    childList: true,
    subtree: true
  });

  // ------------------------------------------
  // MODEL LOAD AND BACK NAVIGATION
  // ------------------------------------------

  detailViewer.addEventListener("load", () => {
    if (
      state.screen !== "dish" ||
      !gsCurrentMeal
    ) return;

    showDishStatus("");

    if (
      !gsCurrentMeal.heroAR &&
      gsSelectedLabel
    ) {
      const saved = gsGetSavedPosition(
        gsCurrentMeal,
        gsSelectedLabel
      );

      if (saved) {
        gsShowPositionedLabel(
          gsSelectedLabel,
          saved
        );
      }
    }
  });

  detailViewer.addEventListener("error", () => {
    if (
      state.screen === "dish" &&
      gsCurrentMeal
    ) {
      showDishStatus(
        gsCurrentMeal.name +
        ": 3D model could not load."
      );
    }
  });

  backToMenu.addEventListener("click", () => {
    gsCurrentMeal = null;
    gsHideMealHotspot();
  });

  // ==========================================
  // END ALL-MEAL DETAIL EXTENSION
  // ==========================================

  // Refresh ingredient buttons if Supabase finishes
  // loading while a meal detail view is already open.
  document.addEventListener(
    "grub-meal-db-loaded",
    () => {
      if (
        state.screen !== "dish" ||
        !gsCurrentMeal ||
        gsCurrentMeal.heroAR ||
        gsSelectedLabel
      ) {
        return;
      }

      const labels = window.GSMealDB?.getIngredients(
        restaurants[state.restaurant].name,
        gsCurrentMeal.name
      );

      if (!labels?.length) return;

      ingredientButtons.replaceChildren();

      labels.forEach(label => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "ingredient-button";
        button.textContent = label;
        button.setAttribute("aria-pressed", "false");

        button.addEventListener("click", () => {
          gsSelectMealIngredient(label, button);
        });

        ingredientButtons.appendChild(button);
      });
    }
  );


  // ==========================================
  // CUSTOM FOOD PROFILES FROM ONBOARDING
  // ==========================================

  const savedCustomProfiles =
    window.GrubOnboarding?.getProfiles() || [];

  savedCustomProfiles.forEach(profile => {
    if (!users.some(user => user.id === profile.id)) {
      users.push(profile);
    }
  });

  window.addEventListener("grub-profile-saved", event => {
    const newProfile = event.detail.profile;

    const existingIndex = users.findIndex(
      user => user.id === newProfile.id
    );

    if (existingIndex >= 0) {
      users[existingIndex] = newProfile;
    } else {
      users.push(newProfile);
    }

    state.activeUser = 0;
    renderUsers();
  });

  // ==========================================
  // END CUSTOM FOOD PROFILE INTEGRATION
  // ==========================================

  // Let the menu compatibility screen read the people
  // selected in Grub Scrub's Food Profiles screen.
  window.GrubScanProfiles = function () {
    return selectedUsers().map(user => ({
      id: user.id || user.name,
      name: user.name,
      filters: [...user.filters],
      restrictions: [...user.restrictions],
      requiresVerification: !!user.requiresVerification
    }));
  };

 
 
  // ==========================================
  // GRUB SCRUB COMPATIBILITY UPDATE
  // ==========================================

  // Calculate each selected person's compatibility
  // based on dietary restrictions and minimum meals.
  // The group score is the average of individual scores.

  groupCompatibility = function (restaurant) {
    const selected = selectedUsers();

    if (!selected.length) return 0;

    const total = selected.reduce((sum, user) => {
      const required = Math.max(
        1,
        Number(user.minMeals) || 1
      );

      const compatible = available(
        restaurant,
        user
      ).length;

      const individualPercentage = Math.min(
        100,
        (compatible / required) * 100
      );

      return sum + individualPercentage;
    }, 0);

    return Math.round(total / selected.length);
  };


  // ==========================================
  // RESTAURANT COMPATIBILITY RESULT
  // ==========================================

  renderResult = function () {
    const restaurant = restaurants[state.restaurant];

    const percentage = groupCompatibility(restaurant);
    const matched = groupMatch(restaurant);

    // Above 70% = positive compatibility.
    const positive = percentage > 70;

    resultTitle.textContent = `${percentage}% MATCH`;

    resultSubtitle.textContent = matched
      ? "Everyone meets their minimum meal requirement!"
      : positive
        ? "Positive match! Some profiles still need more meal options."
        : "Not everyone has enough meal options here.";

    screens.result.classList.toggle(
      "no-match",
      !positive
    );

    resultCard.classList.toggle(
      "bad-match",
      !positive
    );

    resultCard.classList.toggle(
      "positive-compatibility",
      positive
    );

    resultIcon.className =
      "ph result-icon " +
      (positive ? "ph-check-circle" : "ph-x-circle");


    // Always display dietary safety reminder.
    let note = resultCard.querySelector(
      ".gs-safety-note"
    );

    if (!note) {
      note = document.createElement("p");
      note.className = "gs-safety-note";
      resultCard.appendChild(note);
    }

    note.textContent =
      "⚠️ Compatibility is an estimate. Always confirm ingredients, allergens, and cross-contact with the restaurant.";

    playSound(positive ? "bell" : "crunch");
  };


  // ==========================================
  // POSITIVE COMPATIBILITY STYLING
  // ==========================================

 
  // ==========================================
  // ORIGINAL FULL-SCREEN RESULT LAYOUT
  // Only change colors, never the card layout.
  // ==========================================

  const compatibilityStyle = document.createElement("style");

  compatibilityStyle.textContent = `

    /* Positive scores above 70%: green full screen */
    #screen-result:not(.no-match) {
      background: #d9f5e5 !important;
    }

    /* Preserve the original centered result layout */
    #screen-result .result-card {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: #281721 !important;
    }

    /* Keep the original text sizes and positioning */
    #screen-result .result-icon,
    #screen-result .result-title,
    #screen-result .result-subtitle {
      color: inherit !important;
    }

    /* Warning stays at the bottom, not inside a box */
    #screen-result .gs-safety-note {
      position: fixed;
      left: 20px;
      right: 20px;
      bottom: 32px;
      margin: 0 auto;
      padding: 0;
      max-width: 650px;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.4;
      text-align: center;
      color: #281721;
      background: transparent;
      border: none;
    }

  `;

  document.head.appendChild(compatibilityStyle);



  // ==========================================
  // INITIALIZE EXISTING APPLICATION
  // ==========================================

  
  // ==========================================
  // BRONX RESTAURANT
  // VEGAN LATIN KITCHEN BEYOND
  // Real restaurant, simulated dietary classifications
  // ==========================================

  const bronxRestaurant = {
    name: "VEGAN Latin Kitchen Beyond",
    logo: null,
    demoFromSupabase: false,
    demoCompatibilityUnverified: true,

    meals: [
      {
        name: "Avocado Quinoa Platter",
        vegan: true,
        nutSafe: true,
        glutenFree: true,
        seafoodSafe: true,
        ingredients: [
          { name: "Quinoa" },
          { name: "Avocado" },
          { name: "Tomatoes" },
          { name: "Cucumbers" },
          { name: "Black beans" },
          { name: "Greens" }
        ]
      },
      {
        name: "Vegan Vegetables Tacos",
        vegan: true,
        nutSafe: true,
        glutenFree: true,
        seafoodSafe: true,
        ingredients: [
          { name: "Mixed vegetables" },
          { name: "Corn tortillas" },
          { name: "Pico de gallo" }
        ]
      },
      {
        name: "Vegetables Mofonguitos",
        vegan: true,
        nutSafe: true,
        glutenFree: true,
        seafoodSafe: true,
        ingredients: [
          { name: "Fried plantain cups" },
          { name: "Vegetables" },
          { name: "Additional ingredients unverified" }
        ]
      },
      {
        name: "Tofu Vegetables Stir Fry",
        vegan: true,
        nutSafe: true,
        glutenFree: true,
        seafoodSafe: true,
        ingredients: [
          { name: "Tofu" },
          { name: "Vegetables" },
          { name: "Sauce ingredients unverified" }
        ]
      },
      {
        name: "Vegan Chicken Quinoa Platter",
        vegan: true,
        nutSafe: true,
        glutenFree: true,
        seafoodSafe: true,
        ingredients: [
          { name: "Quinoa" },
          { name: "Black beans" },
          { name: "Tomatoes" },
          { name: "Vegan chicken" },
          { name: "Greens" },
          { name: "Vegan chicken ingredients unverified" }
        ]
      }
    ]
  };

  // The true values above are prototype assumptions.
  // Nut-free, gluten-free, and seafood-allergy safety
  // have NOT been established for these real dishes.

  function addBronxRestaurant() {
    const exists = restaurants.some(
      restaurant => restaurant.name === bronxRestaurant.name
    );

    if (exists) return;

    restaurants.push(bronxRestaurant);

    // Coordinates for 2618 Jerome Avenue, Bronx.
    analyzerRestaurantLocations.push({
      lat: 40.86688,
      lon: -73.897815
    });

    if (state.screen === "analyzer") {
      renderAnalyzerRecommendations();
    }

    if (state.screen === "recall") {
      renderRecallList();
    }
  }

  // Add the Bronx restaurant after the existing
  // Supabase restaurants finish loading.
  renderUsers();

  loadAdditionalRestaurants()
    .catch(error => {
      console.warn("Additional restaurant loading:", error);
    })
    .finally(() => {
      addBronxRestaurant();
    });

});



