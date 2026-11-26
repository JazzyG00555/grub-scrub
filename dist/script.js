
window.addEventListener("load", function () {
  "use strict";

  const BASE = "https://raw.githubusercontent.com/JazzyG00555/grub-scrub-ar/main/";
  const SALAD_URL = BASE + "salad%20%281%29.glb";

const RESTAURANT_LOGOS = {
  psKitchen: "https://static.wixstatic.com/media/705a3e_f84fc59012154b508d470217c567e238~mv2.png/v1/fit/w_2500%2Ch_1330%2Cal_c/705a3e_f84fc59012154b508d470217c567e238~mv2.png",

  danbo: "https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/d94dd458-30b3-45b8-81e5-45a4bf18e061.png",

  beyondSushi: "https://beyondsushi.com/wp-content/uploads/2024/08/beyond-sushi-new-logo.png",

  littleBeet: "https://a.mktgcdn.com/p/kGCIVquKE2QvdwJhk_9Wu7OyLzMLtLmvU_yqXRw0f0w/1927x1927.png",

  veganLatinKitchen: "https://media-cdn.grubhub.com/image/upload/d_search%3Abrowse-images%3Adefault.jpg/w_300%2Cq_100%2Cfl_lossy%2Cdpr_2.0%2Cc_fit%2Cf_auto%2Ch_300/dsha5dnlqokfiipf5rqn"
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
      button.id === "addAllButton" ||
      (
        button.classList.contains("profile-button") &&
        state.profileMenuOpen
      )
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


  

  const NEW_MEAL_MODELS = {
    "Beyond Sushi": {
      "Mighty Mushroom": BASE + "mighty_mushroom_sushi.glb",
      "Spicy Mang": BASE + "spicy_mang_sushi.glb",
      "Miso Soup": BASE + "miso_soup.glb",
      "Steamed Edamame": BASE + "steamed_edamame.glb",
      "Sweet Tree": BASE + "sweet_tree_sushi.glb"
    },
  
    "Little Beet": {
      "Autumn Salmon Caesar Bowl": BASE + "autumn_salmon_caesar_bowl.glb",
      "Steak & Brussels Bowl": BASE + "steak_brussels_bowl.glb",
      "Miso Tofu Salad": BASE + "miso_tofu_salad.glb",
      "Beet Falafel Bowl": BASE + "beet_falafel_bowl.glb",
      "Whole 30 Bowl": BASE + "whole_30_bowl.glb"
    },
  
    "VEGAN Latin Kitchen Beyond": {
      "Avocado Quinoa Platter": BASE + "avocado_quinoa_platter.glb",
      "Vegan Vegetables Tacos": BASE + "vegan_vegetable_tacos.glb",
      "Vegetables Mofonguitos": BASE + "vegetables_mofonguitos.glb",
      "Tofu Vegetables Stir Fry": BASE + "tofu_vegetables_stir_fry.glb",
      "Vegan Chicken Quinoa Platter": BASE + "vegan_chicken_quinoa_platter.glb"
    }
  };
  


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
      },
      {
        name: "VEGAN Latin Kitchen Beyond",
        location: null,
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
       model: NEW_MEAL_MODELS[config.name]?.[mealName] || null,


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
          
          logo: config.name === "Beyond Sushi"
          ? RESTAURANT_LOGOS.beyondSushi
          : config.name === "Little Beet"
            ? RESTAURANT_LOGOS.littleBeet
            : RESTAURANT_LOGOS.veganLatinKitchen,

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

  // ONE-SCREEN RESTAURANT DISCOVERY
  // Keep old navigation links pointing to the new screen.
  if (name === "scanChoice") name = "plans";


  if (name === "plans" && !screens.plans.dataset.discoveryReady) {
    const page = screens.plans.querySelector(".wireframe-choice-page");

    page.innerHTML = `
      <h2>How Would You Like to Discover Food Today?</h2>

      <div class="gs-discovery-options">
        <div class="gs-discovery-choice">
          <button id="gsDiscoverLogo" class="gs-discovery-button" type="button">
            <i class="ph ph-camera" aria-hidden="true"></i>
            <span>SCAN LOGO</span>
            <i class="ph ph-caret-right" aria-hidden="true"></i>
          </button>
          <p class="gs-discovery-description">Scan a restaurant’s logo to see what looks good!</p>
        </div>

        <div class="gs-discovery-choice">
          <button id="gsDiscoverMenu" class="gs-discovery-button" type="button">
            <i class="ph ph-list-bullets" aria-hidden="true"></i>
            <span>SCAN MENU</span>
            <i class="ph ph-caret-right" aria-hidden="true"></i>
          </button>
          <p class="gs-discovery-description">Scan a menu to see who can eat what!</p>
        </div>

        <div class="gs-discovery-choice">
          <button id="gsDiscoverArea" class="gs-discovery-button" type="button">
            <i class="ph ph-map-pin" aria-hidden="true"></i>
            <span>SEARCH AREA</span>
            <i class="ph ph-caret-right" aria-hidden="true"></i>
          </button>
          <p class="gs-discovery-description">Let’s search and see what’s around!</p>
        </div>
      </div>
    `;

    function selectDiscoveryFlow(type) {
      state.selectedScanType = type;
      state.activeUser = 0;
      renderUsers();
      showScreen("users");
    }

    page.querySelector("#gsDiscoverLogo")
      .addEventListener("click", () => selectDiscoveryFlow("logo"));

    page.querySelector("#gsDiscoverMenu")
      .addEventListener("click", () => selectDiscoveryFlow("menu"));

    page.querySelector("#gsDiscoverArea")
      .addEventListener("click", () => selectDiscoveryFlow("analyzer"));

    screens.plans.dataset.discoveryReady = "true";
  }

  // Move the existing search button to the left of the search bar.
  // Keep the same form, search function and distance dropdown.
  if (
    name === "analyzer" &&
    analyzerSearchForm.firstElementChild !== analyzerFindButton
  ) {
    analyzerSearchForm.prepend(analyzerFindButton);
  }


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

  const fallbackDomains = {
    "Beyond Sushi": "beyondsushi.com",
    "Little Beet": "thelittlebeet.com"
  };

  const domain = fallbackDomains[restaurant.name];

  const sources = [
    restaurant.logo,
    domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=256`
      : null
  ].filter(Boolean);

  const logo = document.createElement("img");
  logo.alt = restaurant.name + " logo";
  logo.className = "analyzer-restaurant-logo";
  logo.loading = "lazy";

  let sourceIndex = 0;

  function tryNextSource() {
    if (sourceIndex < sources.length) {
      logo.src = sources[sourceIndex++];
      return;
    }

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

  logo.onerror = tryNextSource;
  picture.appendChild(logo);
  tryNextSource();

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

  
  // ==========================================
  // PREGATHERING: LANDMARK + ADDRESS SEARCH
  // ==========================================

  async function searchAnalyzerLocation() {
    const location = analyzerLocation.value.trim();
    const request = ++analyzerSearchRequest;

    if (!location) {
      analyzerSearchCenter = null;
      analyzerLocationStatus.textContent =
        "Enter a landmark, venue, address, city, or ZIP code.";
      renderAnalyzerRecommendations();
      return;
    }

    analyzerFindButton.disabled = true;
    analyzerLocationStatus.textContent =
      "Finding " + location + "...";

    try {
      const url = new URL(
        "https://photon.komoot.io/api/"
      );

      url.searchParams.set("q", location);
      url.searchParams.set("limit", "10");
      url.searchParams.set("lang", "en");

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const data = await response.json();

      if (request !== analyzerSearchRequest) return;

      const results = (data.features || []).filter(
        feature => {
          const coordinates =
            feature.geometry?.coordinates;

          return (
            Array.isArray(coordinates) &&
            coordinates.length >= 2 &&
            coordinates.every(Number.isFinite)
          );
        }
      );

      if (!results.length) {
        analyzerSearchCenter = null;
        analyzerLocationStatus.textContent =
          "Location not found. Try adding the city and state.";
        renderAnalyzerRecommendations();
        return;
      }

      // Prioritize exact and close place-name matches.
      const normalize = value =>
        String(value || "")
          .toLowerCase()
          .replace(/[^\p{L}\p{N} ]/gu, " ")
          .replace(/\s+/g, " ")
          .trim();

      const query = normalize(location);

      const ranked = results.map(feature => {
        const p = feature.properties || {};

        const name = normalize(p.name);
        const fullAddress = normalize([
          p.name,
          p.street,
          p.housenumber,
          p.city,
          p.state,
          p.country
        ].filter(Boolean).join(" "));

        let score = 0;

        if (name === query) {
          score += 100;
        } else if (
          name &&
          (query.includes(name) || name.includes(query))
        ) {
          score += 60;
        }

        if (fullAddress.includes(query)) {
          score += 40;
        }

        return { feature, score };
      });

      ranked.sort((a, b) => b.score - a.score);

      const best = ranked[0].feature;
      const [lon, lat] = best.geometry.coordinates;
      const p = best.properties || {};

      analyzerSearchCenter = {
        lat: Number(lat),
        lon: Number(lon)
      };

      analyzerSearchLabel = [
        p.name,
        p.street,
        p.housenumber,
        p.city || p.locality,
        p.state,
        p.country
      ]
        .filter(Boolean)
        .filter((item, index, array) =>
          array.indexOf(item) === index
        )
        .join(", ");

      analyzerLocationStatus.textContent =
        "Showing Grub Scrub restaurants within " +
        analyzerRadius.value +
        " miles of " +
        analyzerSearchLabel +
        ". Distances are straight-line estimates.";

      renderAnalyzerRecommendations();

    } catch (error) {
      if (request !== analyzerSearchRequest) return;

      console.error("Landmark search:", error);

      analyzerSearchCenter = null;

      analyzerLocationStatus.textContent =
        "Location search unavailable. Please try again.";

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


  // NEW RESTAURANT LOGO TARGETS

  const additionalLogoTargets = [
    ["beyondSushiTarget", "Beyond Sushi"],
    ["littleBeetTarget", "Little Beet"],
    ["veganLatinTarget", "VEGAN Latin Kitchen Beyond"]
  ];

  additionalLogoTargets.forEach(([targetId, name]) => {
    const target = document.getElementById(targetId);

    if (!target) return;

    target.addEventListener("targetFound", () => {
      if (state.screen !== "camera") return;

      const index = restaurants.findIndex(
        restaurant => restaurant.name === name
      );

      if (index === -1) {
        trackingStatus.textContent =
          name + " menu data is not available yet.";
        return;
      }

      restaurantDetected(index);
    });
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
    captureMenuButton.textContent = "PHOTOGRAPH RESULTS";
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
        .then(async worker => {
          // Restaurant menus contain scattered text, prices and headings.
          await worker.setParameters({
            tessedit_pageseg_mode: "11",
            preserve_interword_spaces: "1"
          });
          return worker;
        })
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
      menuCameraStatus.textContent = "Loading menu text recognition...";
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
  
    function prepareImage(originalPixels, invert = false) {
      const image = context.createImageData(
        canvas.width,
        canvas.height
      );
  
      image.data.set(originalPixels);
      const pixels = image.data;
  
      for (let i = 0; i < pixels.length; i += 4) {
        const gray =
          0.299 * pixels[i] +
          0.587 * pixels[i + 1] +
          0.114 * pixels[i + 2];
  
        // Gentle contrast preserves thin letters.
        let value = Math.max(
          0,
          Math.min(255, (gray - 128) * 1.2 + 128)
        );
  
        if (invert) value = 255 - value;
  
        pixels[i] = value;
        pixels[i + 1] = value;
        pixels[i + 2] = value;
        pixels[i + 3] = 255;
      }
  
      context.putImageData(image, 0, 0);
    }
  
    function scoreOCR(result) {
      const words = getOCRWords(result.data).filter(word =>
        /[a-zA-Z]{2,}/.test(word.text || "") &&
        Number(word.confidence ?? 0) >= 35
      );
  
      const confidence = words.length
        ? words.reduce(
            (sum, word) =>
              sum + Number(word.confidence ?? 0),
            0
          ) / words.length
        : Number(result.data.confidence ?? 0);
  
      return {
        words: words.length,
        confidence,
        score: words.length * 3 + confidence * 0.7
      };
    }
  
    while (isActive()) {
      try {
        const video = menuCameraVideo;
  
        if (video.videoWidth && video.videoHeight) {
          // Enlarge small camera frames for clearer OCR.
          const scale = Math.min(
            2,
            1800 / video.videoWidth
          );
  
          canvas.width = Math.max(
            1,
            Math.round(video.videoWidth * scale)
          );
  
          canvas.height = Math.max(
            1,
            Math.round(video.videoHeight * scale)
          );
  
          context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
          );
  
          const original = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
  
          menuCameraStatus.textContent =
            "Analyzing menu text...";
  
          // First OCR pass.
          prepareImage(original.data);
  
          let bestResult = await worker.recognize(
            canvas,
            {},
            { text: true, blocks: true }
          );
  
          if (!isActive()) return;
  
          let bestScore = scoreOCR(bestResult);
  
          // Only use a second pass when recognition is unclear.
          if (
            bestScore.words < 3 ||
            bestScore.confidence < 55
          ) {
            prepareImage(original.data, true);
  
            const alternate = await worker.recognize(
              canvas,
              {},
              { text: true, blocks: true }
            );
  
            if (!isActive()) return;
  
            const alternateScore = scoreOCR(alternate);
  
            if (alternateScore.score > bestScore.score) {
              bestResult = alternate;
              bestScore = alternateScore;
            }
          }
  
          if (
            bestScore.words >= 3 &&
            bestScore.confidence >= 45
          ) {
            unclearFrames = 0;
  
            lastRecognizedMenuText =
              (bestResult.data.text || "").trim();
  
            document.dispatchEvent(
              new CustomEvent("grub-live-menu-text", {
                detail: {
                  text: lastRecognizedMenuText
                }
              })
            );
  
            // Keep existing red warning flags.
            renderMenuARFlags(
              bestResult.data,
              canvas.width,
              canvas.height
            );
  
            menuCameraStatus.textContent =
              "Detected: " +
              lastRecognizedMenuText
                .replace(/\s+/g, " ")
                .slice(0, 100);
  
          } else {
            unclearFrames++;
  
            menuCameraStatus.textContent =
              "Move closer, hold steady, or improve lighting.";
  
            if (unclearFrames >= 2) {
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
  
      if (isActive()) {
        await new Promise(resolve =>
          setTimeout(resolve, 1200)
        );
      }
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

  
  // ==========================================
  // MULTI-PROFILE ROTARY MEAL FILTER
  // ==========================================

  // null = original single-profile behavior.
  // A Set = profiles actively selected on the disc.
  let gsDiscGroup = null;

  function gsDiscGroupUsers() {
    const guests = selectedUsers();

    if (gsDiscGroup === null) {
      const current = activeUser();
      return current ? [current] : [];
    }

    // Remove anyone no longer selected for the gathering.
    for (const person of gsDiscGroup) {
      if (!guests.includes(person)) {
        gsDiscGroup.delete(person);
      }
    }

    return [...gsDiscGroup];
  }

  function renderMenu() {
    const restaurant = restaurants[state.restaurant];
    const user = activeUser();

    if (!user) {
      renderUsers();
      showScreen("users");
      return;
    }

    const group = gsDiscGroupUsers();

    // A meal must satisfy EVERY selected profile.
    const meals = group.length
      ? restaurant.meals.filter(meal =>
          group.every(person => fits(meal, person))
        )
      : [];

    restaurantName.textContent = restaurant.name;

    activeUserName.textContent = group.length
      ? group.map(person => person.name).join(" + ")
      : "No profiles selected";

    activeUserRestrictions.textContent =
      group.length === 1
        ? group[0].restrictions.join(" • ")
        : group.length > 1
          ? "Meals suitable for everyone selected"
          : "Tap profiles in the wheel to select them";

    availabilityCount.textContent =
      `${meals.length}/${restaurant.meals.length}`;

    optionsMessage.textContent = !group.length
      ? "select profiles in the wheel"
      : group.length > 1
        ? (meals.length
            ? "shared meal options available"
            : "no shared meal options available")
        : (meals.length
            ? "meal options available"
            : "no meal options available");


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


  // ==========================================
  // ROTARY PROFILE WHEEL
  // Three profiles visible at a time
  // ==========================================

  let gsRotaryOffset = 0;
  let gsRotaryGesture = null;
  let gsRotaryAnimating = false;
  let gsIgnoreProfileClickUntil = 0;

  function renderProfileDisc() {
    profileButtons.replaceChildren();

    profileDisc.classList.toggle(
      "open",
      state.profileMenuOpen
    );

    // Allow dragging around the open wheel.
    profileDisc.style.pointerEvents =
      state.profileMenuOpen ? "auto" : "none";

    profileDisc.style.touchAction =
      state.profileMenuOpen ? "none" : "auto";

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

    // Reset the rotation when the wheel closes.
    if (!state.profileMenuOpen) {
      gsRotaryOffset = 0;
    }

    if (arranged.length) {
      gsRotaryOffset =
        (gsRotaryOffset + arranged.length) %
        arranged.length;
    }

    // Preserve your three original avatar positions.
    const slots = [
      { left: "25px", top: "11px" },
      { right: "2px", top: "2px" },
      { left: "2px", bottom: "2px" }
    ];

    // Show a maximum of three profiles.
    const visible = state.profileMenuOpen
      ? Array.from(
          { length: Math.min(3, arranged.length) },
          (_, i) => arranged[
            (gsRotaryOffset + i) % arranged.length
          ]
        )
      : [active].filter(Boolean);

    visible.forEach((entry, slot) => {
      const user = entry.user;

      const isSelected =
        entry.index === state.activeUser;

      const compatible =
        available(restaurant, user).length > 0;

      const button = document.createElement("button");
      button.type = "button";

      // The first visible profile keeps the
      // larger circle from your original design.
      button.className =
        (!state.profileMenuOpen || slot === 0)
          ? "profile-button active current"
          : "profile-button small";


      // Pink = selected for shared-meal filtering.
      // Burgundy = not selected.
      const includedInGroup = gsDiscGroup === null
      ? isSelected
      : gsDiscGroup.has(user);
    
button.style.backgroundColor = includedInGroup
? "var(--wheel-pink, var(--pink, #b65c91))"
: "var(--wheel-burgundy, var(--burgundy, #591536))";

    button.setAttribute(
      "aria-pressed",
      String(includedInGroup)
    );

      if (state.profileMenuOpen) {
        Object.assign(button.style, slots[slot]);
      } else {
        button.style.right = "4px";
        button.style.bottom = "4px";
      }

      button.style.touchAction = "none";

      button.setAttribute("aria-label", user.name);

      if (isSelected) {
        button.setAttribute("aria-current", "true");
      }

      // Preserve the original profile picture
      // and compatibility indicator.
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
  // Prevent a swipe from triggering a selection.
  if (Date.now() < gsIgnoreProfileClickUntil) {
    return;
  }

  // First tap opens the rotary wheel.
  if (!state.profileMenuOpen) {
    state.profileMenuOpen = true;
    renderProfileDisc();
    return;
  }

  // Start with the currently active person.
  if (gsDiscGroup === null) {
    gsDiscGroup = new Set(gsDiscGroupUsers());
  }

  // Toggle this person independently.
  if (gsDiscGroup.has(user)) {
    gsDiscGroup.delete(user);
  } else {
    gsDiscGroup.add(user);
  }

  // Update shared meals and keep the wheel open.
  renderMenu();
});


      profileButtons.appendChild(button);
    });

    // Keep the green + button fixed in place.
    addProfileButton.style.display =
      state.profileMenuOpen ? "flex" : "none";

    profileDisc.setAttribute(
      "aria-label",
      state.profileMenuOpen && arranged.length > 3
        ? "Profile wheel. Swipe to rotate through profiles."
        : "Profile wheel"
    );
  }

  // ==========================================
  // ROTARY ANIMATION
  // ==========================================

  function gsRotateProfileDisc(direction) {
    const count = selectedUsers().length;

    if (
      count <= 3 ||
      !state.profileMenuOpen ||
      gsRotaryAnimating
    ) {
      return;
    }

    const advance = () => {
      gsRotaryOffset =
        (gsRotaryOffset + direction + count) % count;

      renderProfileDisc();
    };

    // Respect reduced-motion preferences.
    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      advance();
      return;
    }

    gsRotaryAnimating = true;

    const turn = direction > 0 ? -28 : 28;

    const outgoing = profileButtons.animate(
      [
        {
          transform: "rotate(0deg)",
          opacity: 1
        },
        {
          transform: `rotate(${turn}deg)`,
          opacity: 0.08
        }
      ],
      {
        duration: 170,
        easing: "ease-in",
        fill: "forwards"
      }
    );

    outgoing.finished.then(() => {
      advance();
      outgoing.cancel();

      const incoming = profileButtons.animate(
        [
          {
            transform: `rotate(${-turn}deg)`,
            opacity: 0.08
          },
          {
            transform: "rotate(0deg)",
            opacity: 1
          }
        ],
        {
          duration: 180,
          easing: "ease-out"
        }
      );

      incoming.finished.then(
        () => { gsRotaryAnimating = false; },
        () => { gsRotaryAnimating = false; }
      );

    }).catch(() => {
      gsRotaryAnimating = false;
    });
  }

  // ==========================================
  // TOUCH AND MOUSE DRAG SUPPORT
  // ==========================================

  profileDisc.addEventListener(
    "pointerdown",
    event => {
      if (
        !state.profileMenuOpen ||
        selectedUsers().length <= 3 ||
        gsRotaryAnimating ||
        event.target.closest?.("#addProfileButton")
      ) {
        return;
      }

      gsRotaryGesture = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        captured: false
      };
    }
  );

  profileDisc.addEventListener(
    "pointermove",
    event => {
      const gesture = gsRotaryGesture;

      if (
        !gesture ||
        gesture.id !== event.pointerId ||
        gesture.captured
      ) {
        return;
      }

      const distance = Math.hypot(
        event.clientX - gesture.x,
        event.clientY - gesture.y
      );

      if (distance > 12) {
        gesture.captured = true;

        try {
          profileDisc.setPointerCapture(
            event.pointerId
          );
        } catch (_) {
          // Dragging can still finish without capture.
        }
      }
    }
  );

  profileDisc.addEventListener(
    "pointerup",
    event => {
      const gesture = gsRotaryGesture;

      if (
        !gesture ||
        gesture.id !== event.pointerId
      ) {
        return;
      }

      gsRotaryGesture = null;

      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;

      if (Math.hypot(dx, dy) < 32) {
        return;
      }

      // Prevent a swipe from triggering a profile tap.
      gsIgnoreProfileClickUntil =
        Date.now() + 500;

      const movement =
        Math.abs(dx) >= Math.abs(dy) ? dx : dy;

      gsRotateProfileDisc(
        movement < 0 ? 1 : -1
      );
    }
  );

  profileDisc.addEventListener(
    "pointercancel",
    () => {
      gsRotaryGesture = null;
    }
  );


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
    const restaurant = restaurants[state.restaurant].name;
    const key = gsHotspotKey(meal, ingredient);

    const saved = gsSavedHotspots[key];
    if (saved?.position && saved?.normal) return saved;

    const approved = window.GSMealDB?.getPosition(
      restaurant, meal.name, ingredient
    );

    if (approved?.position && approved?.normal) {
      return approved;
    }

    // Initial visual anchors for the rice bowl.
    // Converted into 3D positions automatically.
    const referencePoints = {
      "Sweet Potato & Red Rice Bowl": {
        "Sweet potato": [0.46, 0.37],
        "Red rice": [0.44, 0.64]
      }
    };

    const screenPoint =
      referencePoints[meal.name]?.[ingredient];

    if (!screenPoint || !detailViewer.loaded) {
      return null;
    }

    if (
      typeof detailViewer.positionAndNormalFromPoint !== "function"
    ) {
      return null;
    }

    const rect = detailViewer.getBoundingClientRect();

    if (!rect.width || !rect.height) return null;

    const point = detailViewer.positionAndNormalFromPoint(
      screenPoint[0] * rect.width,
      screenPoint[1] * rect.height
    );

    return point ? {
      position: point.position.toString(),
      normal: point.normal.toString()
    } : null;
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

  gsKeepLabelVisible();
}

/* PREVENT 3D INGREDIENT LABEL CLIPPING */


let gsLabelFrame = null;

function gsKeepLabelVisible() {
  if (hotspot.classList.contains("is-hidden")) return;

  if (gsLabelFrame !== null) {
    cancelAnimationFrame(gsLabelFrame);
  }

  gsLabelFrame = requestAnimationFrame(() => {
    gsLabelFrame = null;

    const viewer = detailViewer.getBoundingClientRect();
    const margin = 12;

    // Reset previous adjustments.
    hotspot.classList.remove("gs-label-flip");
    hotspotLabel.style.setProperty("--gs-label-shift-x", "0px");
    hotspotLabel.style.setProperty("--gs-label-shift-y", "0px");

    let label = hotspotLabel.getBoundingClientRect();

    // Put the label on the left if the right side is crowded.
    if (label.right > viewer.right - margin) {
      hotspot.classList.add("gs-label-flip");
      label = hotspotLabel.getBoundingClientRect();
    }

    // Keep the complete label inside the 3D viewer.
    const shiftX = Math.max(
      viewer.left + margin - label.left,
      Math.min(0, viewer.right - margin - label.right)
    );

    const shiftY = Math.max(
      viewer.top + margin - label.top,
      Math.min(0, viewer.bottom - margin - label.bottom)
    );

    hotspotLabel.style.setProperty(
      "--gs-label-shift-x",
      `${shiftX}px`
    );

    hotspotLabel.style.setProperty(
      "--gs-label-shift-y",
      `${shiftY}px`
    );
  });
}

detailViewer.addEventListener(
  "camera-change",
  gsKeepLabelVisible
);

window.addEventListener(
  "resize",
  gsKeepLabelVisible
);

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
    const coordinates = saved || null;


    if (coordinates) {
      try {
        gsShowPositionedLabel(label, coordinates);

        
gsIngredientNote.textContent =
"Ingredient label displayed on the 3D model.";

      } catch (error) {
        console.error("Could not display label:", error);

        gsIngredientNote.textContent =
          "Tap the food to position this label.";
      }
   
} else {
  const setupMode =
    new URLSearchParams(window.location.search)
      .get("gsLabelAdmin") === "1";

  gsIngredientNote.textContent = setupMode
    ? "Tap the correct ingredient on the 3D model to save its position."
    : "This ingredient's 3D label is not positioned yet.";
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

    
const gsSetupMode =
new URLSearchParams(window.location.search)
  .get("gsLabelAdmin") === "1";

gsIngredientNote.textContent = gsSetupMode
? "SETUP MODE: Select an ingredient, then tap its location on the 3D model."
: "Select an ingredient below to display its label on the 3D model. Demo ingredients are not verified restaurant allergen information.";


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

 
  // POSITION LABELS ON THE ACTUAL 3D FOOD
  // Setup mode only. House Salad remains unchanged.

  document.addEventListener("pointerdown", event => {
    if (!event.composedPath().includes(detailViewer)) {
      return;
    }

    gsPointerStart = {
      x: event.clientX,
      y: event.clientY
    };
  }, true);

  document.addEventListener("pointerup", event => {
    const setupMode =
      new URLSearchParams(window.location.search)
        .get("gsLabelAdmin") === "1";

    if (!setupMode || !gsCurrentMeal ||
        gsCurrentMeal.heroAR || !gsSelectedLabel) {
      return;
    }

    const rect = detailViewer.getBoundingClientRect();

    const insideViewer =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!insideViewer) return;

    if (!gsPointerStart) {
      gsIngredientNote.textContent =
        "3D click detected, but pointer start is missing.";
      return;
    }

    const distance = Math.hypot(
      event.clientX - gsPointerStart.x,
      event.clientY - gsPointerStart.y
    );

    gsPointerStart = null;

    if (distance > 12) return;

    if (!detailViewer.loaded) {
      gsIngredientNote.textContent =
        "3D model is not loaded.";
      return;
    }

    try {
      const point = detailViewer.positionAndNormalFromPoint(
        event.clientX - rect.left,
        event.clientY - rect.top
      );

      if (!point?.position || !point?.normal) {
        gsIngredientNote.textContent =
          "No 3D surface detected at this location.";
        return;
      }

      gsSavePosition(gsCurrentMeal, gsSelectedLabel, point);

      gsWaitingForPosition = false;

      gsShowPositionedLabel(gsSelectedLabel, {
        position: point.position.toString(),
        normal: point.normal.toString()
      });

      gsIngredientNote.textContent =
        "Label positioned successfully!";
    } catch (error) {
      console.error("3D positioning error:", error);

      gsIngredientNote.textContent =
        "3D positioning failed. Check the console.";
    }
  }, true);


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
    logo: RESTAURANT_LOGOS.veganLatinKitchen,
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

    

bronxRestaurant.meals.forEach(meal => {
  meal.model =
    NEW_MEAL_MODELS["VEGAN Latin Kitchen Beyond"]?.[meal.name] || null;
});


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

  // ==========================================
  // MENU SCANNER IMPROVEMENTS
  // OCR, PHOTO FLAGS, LIVE MENU MATCHING
  // ==========================================

  const gsMenuAudit = {
    text: "",
    warnings: [],
    analysis: null
  };

  const gsRules = [
    {
      profile: "Jamie",
      pattern: /\b(beef|pork|chicken|bacon|ham|milk|butter|cheese|egg|eggs|honey|gelatin|shrimp|salmon|fish|steak|cream|yogurt|mayonnaise|mayo|dairy)\b/i
    },
    {
      profile: "Gus",
      pattern: /\b(peanuts?|walnuts?|almonds?|cashews?|pistachios?|pecans?|hazelnuts?|sesame|nut butter)\b/i
    },
    {
      profile: "Brad",
      pattern: /\b(wheat|barley|rye|semolina|couscous|bulgur|flour|bread|pasta|noodles|breadcrumbs|shrimp|prawns?|crab|lobster|oysters?|mussels?|clams?|salmon|tuna|anchov(?:y|ies)|fish)\b/i
    }
  ];

  // Calculate a potential match from the actual OCR text.

  // ==========================================
  // MENU-BASED COMPATIBILITY CALCULATION
  // Works with priced and unpriced menus.
  // ==========================================

  function gsAnalyzeRecognizedMenu(text) {
    const profiles = selectedUsers();

    const lines = String(text || "")
      .split(/\r?\n/)
      .map(line => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const emptyResult = {
      percentage: null,
      count: 0,
      flagged: 0,
      items: [],
      note: "Not enough identifiable dishes to estimate a menu match."
    };

    if (!profiles.length || !lines.length) {
      return emptyResult;
    }

    const ignoredHeadings = [
      /^(chef'?s? selection|our menu|main courses?|starters?|appetizers?|desserts?|drinks?|beverages?|sides?|specials?|entrees?|entrées?|lunch|dinner|breakfast|brunch)$/i,
      /^(please inform|all prices|taxes|gratuity|allergies|dietary restrictions)/i
    ];

    function cleanTitle(line) {
      return line
        .replace(/\s*(?:\$|USD)\s*\d+(?:\.\d{2})?\s*$/i, "")
        .replace(/\s+\d{1,3}\.\d{2}\s*$/, "")
        .replace(/[•·\s]+$/, "")
        .trim();
    }

    function isTitle(line) {
      const title = cleanTitle(line);

      if (title.length < 5 || title.length > 85) return false;
      if (!/[a-zA-ZÀ-ÿ]/.test(title)) return false;
      if (ignoredHeadings.some(rule => rule.test(title))) {
        return false;
      }

      // Explicit price at the end of a dish name.
      const priced =
        /(?:\$|USD)\s*\d+(?:\.\d{2})?\s*$/i.test(line) ||
        /\s+\d{1,3}\.\d{2}\s*$/.test(line);

      if (priced) return true;

      // Recognize uppercase dish headings even without prices.
      const letters = title.match(/[a-zA-ZÀ-ÿ]/g) || [];
      const uppercase = letters.filter(
        character =>
          character === character.toUpperCase() &&
          character !== character.toLowerCase()
      );

      const uppercaseRatio = letters.length
        ? uppercase.length / letters.length
        : 0;

      const words = title.split(/\s+/);

      return (
        uppercaseRatio >= 0.75 &&
        words.length <= 10 &&
        letters.length >= 7 &&
        !/[.!?]$/.test(title)
      );
    }

    // Group dish headings with the descriptions below them.
    const dishes = [];
    let current = null;

    for (const line of lines) {
      if (isTitle(line)) {
        if (current) dishes.push(current);

        current = {
          name: cleanTitle(line),
          description: []
        };
      } else if (current) {
        // Skip footer notes and section headings.
        if (
          ignoredHeadings.some(rule => rule.test(line)) ||
          /^please\b/i.test(line)
        ) {
          continue;
        }

        current.description.push(line);
      }
    }

    if (current) dishes.push(current);

    // Remove duplicate headings from repeated OCR readings.
    const uniqueDishes = [];
    const seen = new Set();

    for (const dish of dishes) {
      const key = dish.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

      if (!key || seen.has(key)) continue;

      seen.add(key);
      uniqueDishes.push(dish);
    }

    // Specific visible ingredients that may conflict with profiles.
    const rules = {
      Jamie: /\b(beef|pork|chicken|bacon|ham|milk|butter|cheese|egg|eggs|honey|gelatin|shrimp|prawns?|salmon|fish|steak|cream|yogurt|dairy|burrata|parmesan|pecorino|scallops?|mozzarella|ricotta|anchov(?:y|ies))\b/i,

      Gus: /\b(peanuts?|walnuts?|almonds?|cashews?|pistachios?|pecans?|hazelnuts?|pine nuts?|pesto)\b/i,

      Brad: /\b(wheat|barley|rye|semolina|couscous|bulgur|flour|bread|pasta|noodles|breadcrumbs|tagliatelle|spaghetti|linguine|fettuccine|shrimp|prawns?|crab|lobster|oysters?|mussels?|clams?|scallops?|salmon|tuna|anchov(?:y|ies)|fish)\b/i
    };

    const analyzed = uniqueDishes.map(dish => {
      const combined = [
        dish.name,
        ...dish.description
      ].join(" ");

      // Don't flag explicitly vegan substitutes as animal meat.
      const normalized = combined
        .replace(/\bvegan chicken\b/gi, "plant protein")
        .replace(/\bvegan cheese\b/gi, "plant cheese substitute")
        .replace(/\bplant.based milk\b/gi, "plant beverage")
        .replace(/\bcoconut milk\b/gi, "coconut beverage")
        .replace(/\bvegan mayo\b/gi, "plant dressing");

      const conflicts = profiles
        .filter(profile => {
          const pattern = rules[profile.name];

          return pattern
            ? pattern.test(normalized)
            : false;
        })
        .map(profile => profile.name);

      return {
        name: dish.name,
        description: dish.description.join(" "),
        conflicts,
        potentialMatch: conflicts.length === 0
      };
    });

    // Do not invent a percentage from insufficient OCR.
    if (analyzed.length < 2) {
      return {
        ...emptyResult,
        count: analyzed.length,
        items: analyzed
      };
    }

    const unflagged = analyzed.filter(
      dish => dish.potentialMatch
    ).length;

    const flagged = analyzed.length - unflagged;

    const percentage = Math.round(
      100 * unflagged / analyzed.length
    );

    return {
      percentage,
      count: analyzed.length,
      flagged,
      items: analyzed,
      note:
        `${unflagged} of ${analyzed.length} detected dishes ` +
        `have no recognized conflicts for the selected profiles. ` +
        `${flagged} have potential conflicts. ` +
        "This is an OCR screening estimate, not verified " +
        "ingredient or allergy safety. Confirm with the restaurant."
    };
  }


  // Update the scanned-menu percentage.
  function gsShowMenuScore(analysis) {
    if (!analysis || analysis.percentage === null) {
      menuResultsMatchLabel.textContent =
        "MENU MATCH UNAVAILABLE";

      menuResultsProgressFill.style.width = "0%";

      menuResultsProgress.setAttribute(
        "aria-valuetext",
        "Insufficient menu information"
      );

      menuResultsProgress.removeAttribute("aria-valuenow");
    } else {
      menuResultsMatchLabel.textContent =
        `${analysis.percentage}% POTENTIAL MATCH`;

      menuResultsProgressFill.style.width =
        `${analysis.percentage}%`;

      menuResultsProgress.setAttribute(
        "aria-valuenow",
        String(analysis.percentage)
      );

      menuResultsProgress.setAttribute(
        "aria-valuetext",
        analysis.note
      );
    }

    menuFlagsMessage.hidden = false;
    menuFlagsMessage.textContent =
      analysis?.note || "Menu not analyzed";
  }

  // ==========================================
  // RED FLAGS WITH PROFILE PHOTOS
  // ==========================================

  
  // ==========================================
  // INDIVIDUAL NON-OVERLAPPING AR FLAGS
  // ==========================================

  renderMenuARFlags = function (data, imageWidth, imageHeight) {
    clearMenuARFlags();

    const bounds = getMenuVideoBounds(imageWidth, imageHeight);
    const selected = selectedUsers();
    const words = getOCRWords(data);
    const warnings = [];
    const placed = [];

    const padding = 5;
    const gap = 7;
    const maxFlags = 16;

    // Convert OCR word positions to screen coordinates.
    const textBoxes = words
      .filter(word => word?.bbox && word?.text)
      .map(word => ({
        left: bounds.left + word.bbox.x0 * bounds.scale,
        right: bounds.left + word.bbox.x1 * bounds.scale,
        top: bounds.top + word.bbox.y0 * bounds.scale,
        bottom: bounds.top + word.bbox.y1 * bounds.scale
      }));

    function intersects(a, b, spacing = 0) {
      return !(
        a.right + spacing <= b.left ||
        a.left >= b.right + spacing ||
        a.bottom + spacing <= b.top ||
        a.top >= b.bottom + spacing
      );
    }

    function isFree(x, y, width, height) {
      const box = {
        left: x,
        top: y,
        right: x + width,
        bottom: y + height
      };

      // Keep every badge inside the camera view.
      if (
        box.left < padding ||
        box.top < padding ||
        box.right > bounds.width - padding ||
        box.bottom > bounds.height - padding
      ) {
        return false;
      }

      // Never overlap an existing badge.
      if (placed.some(other => intersects(box, other, gap))) {
        return false;
      }

      // Avoid covering recognized menu text.
      if (textBoxes.some(text => intersects(box, text, 3))) {
        return false;
      }

      return true;
    }

    // Find the nearest empty spot around an ingredient.
    function findPosition(anchor, width, height) {
      const preferredY = anchor.y - height / 2;

      const xCandidates = [
        anchor.right + 12,
        anchor.left - width - 12,
        bounds.width - width - 10,
        10
      ];

      // Try the same line first, then nearby rows.
      const offsets = [0];

      for (let step = 1; step <= 12; step++) {
        offsets.push(step * 12, -step * 12);
      }

      for (const offset of offsets) {
        const y = preferredY + offset;

        for (const x of xCandidates) {
          if (isFree(x, y, width, height)) {
            return { x, y };
          }
        }
      }

      // Search unused space across the camera view.
      for (
        let y = padding;
        y <= bounds.height - height - padding;
        y += 10
      ) {
        for (
          let x = bounds.width - width - padding;
          x >= padding;
          x -= 10
        ) {
          if (isFree(x, y, width, height)) {
            return { x, y };
          }
        }
      }

      // Never place a badge over text or another badge.
      return null;
    }

    const candidates = [];

    // Create a separate warning for each affected profile.
    for (const word of words) {
      if (!word?.bbox || !word?.text) continue;
      if (Number(word.confidence ?? 0) < 40) continue;

      const normalized = word.text
        .toLowerCase()
        .replace(/[^a-z]/g, "");

      if (!normalized) continue;

      const affected = selected.filter(profile =>
        gsRules.some(rule =>
          rule.profile === profile.name &&
          rule.pattern.test(normalized)
        )
      );

      if (!affected.length) continue;

      const anchor = {
        left: bounds.left + word.bbox.x0 * bounds.scale,
        right: bounds.left + word.bbox.x1 * bounds.scale,
        y:
          bounds.top +
          ((word.bbox.y0 + word.bbox.y1) / 2) *
          bounds.scale
      };

      for (const profile of affected) {
        candidates.push({
          word: normalized,
          profile,
          anchor
        });
      }
    }

    // Process top to bottom for predictable placement.
    candidates.sort((a, b) => a.anchor.y - b.anchor.y);

    for (const item of candidates) {
      if (placed.length >= maxFlags) break;

      const badge = document.createElement("div");
      badge.className = "menu-ar-warning";

      badge.style.cssText = `
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 4px 6px;
        background: rgba(20,20,20,0.9);
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 30;
        white-space: nowrap;
        visibility: hidden;
        box-sizing: border-box;
      `;

      // Red flag icon.
      const flag = document.createElement("span");
      flag.setAttribute("aria-hidden", "true");

      flag.style.cssText = `
        position: relative;
        display: inline-block;
        width: 22px;
        height: 26px;
        flex-shrink: 0;
      `;

      flag.innerHTML = `
        <span style="
          position:absolute;
          left:3px;
          top:2px;
          width:2px;
          height:22px;
          background:white;
          border-radius:2px;
        "></span>
        <span style="
          position:absolute;
          left:5px;
          top:3px;
          width:16px;
          height:14px;
          background:#f2273f;
          clip-path:polygon(
            0 0,
            100% 0,
            75% 50%,
            100% 100%,
            0 100%
          );
        "></span>
      `;

      // Profile photo.
      
const photo = document.createElement("img");

photo.crossOrigin = "anonymous";
photo.src = item.profile.image;
photo.alt = "";


      photo.style.cssText = `
        width: 27px;
        height: 27px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid white;
        box-sizing: border-box;
        flex-shrink: 0;
      `;

      badge.append(flag, photo);

      // Accessibility label, without visible text.
      badge.setAttribute("role", "img");

      badge.setAttribute(
        "aria-label",
        `Possible dietary conflict for ${item.profile.name}: ${item.word}`
      );

      menuARFlagLayer.appendChild(badge);

      const width = badge.offsetWidth || 67;
      const height = badge.offsetHeight || 35;

      const position = findPosition(
        item.anchor,
        width,
        height
      );

      if (!position) {
        // No space available: don't cover the menu.
        badge.remove();
        continue;
      }

      badge.style.left = `${position.x}px`;
      badge.style.top = `${position.y}px`;
      badge.style.visibility = "visible";

      placed.push({
        left: position.x,
        top: position.y,
        right: position.x + width,
        bottom: position.y + height
      });

      warnings.push({
        word: item.word,
        profiles: [item.profile.name]
      });
    }

    lastDetectedMenuWarnings = warnings;
    gsMenuAudit.warnings = warnings;

    return placed.length;
  };

  // ==========================================
  // MULTI-COLOR MENU OCR
  // ==========================================

  startLiveMenuOCR = async function () {
    const generation = ++menuOCRGeneration;

    const active = () =>
      generation === menuOCRGeneration &&
      state.screen === "menuScanner" &&
      !!menuCameraStream;

    let worker;

    try {
      worker = await getMenuOCRWorker();
    } catch (error) {
      console.warn("Menu OCR:", error);

      if (active()) {
        menuCameraStatus.textContent =
          "Text recognition unavailable";
      }
      return;
    }

    if (!active()) return;

    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true
    });

    if (!ctx) return;

    const score = result => {
      const words = getOCRWords(result.data).filter(w =>
        Number(w.confidence ?? 0) >= 35 &&
        /[a-z]{2}/i.test(w.text || "")
      );

      const avg = words.length
        ? words.reduce(
            (n, w) => n + Number(w.confidence),
            0
          ) / words.length
        : 0;

      return words.length * 4 + avg;
    };

    let pass = 0;

    while (active()) {
      try {
        const video = menuCameraVideo;

        if (video.videoWidth && video.videoHeight) {
          const scale = Math.min(
            2,
            1800 / video.videoWidth
          );

          canvas.width = Math.round(
            video.videoWidth * scale
          );

          canvas.height = Math.round(
            video.videoHeight * scale
          );

          ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const original = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

          const run = async mode => {
            const pixels = new Uint8ClampedArray(
              original.data
            );

            for (
              let i = 0;
              i < pixels.length;
              i += 4
            ) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];

              const light = Math.max(r, g, b);
              const dark = Math.min(r, g, b);

              let v = mode === 1
                ? light
                : mode === 2
                ? dark
                : 0.299 * r +
                  0.587 * g +
                  0.114 * b;

              if (mode === 3) {
                v = 255 - v;
              }

              v = Math.max(
                0,
                Math.min(
                  255,
                  (v - 128) * 1.22 + 128
                )
              );

              pixels[i] = v;
              pixels[i + 1] = v;
              pixels[i + 2] = v;
            }

            ctx.putImageData(
              new ImageData(
                pixels,
                canvas.width,
                canvas.height
              ),
              0,
              0
            );

            return worker.recognize(
              canvas,
              {},
              { text: true, blocks: true }
            );
          };

          menuCameraStatus.textContent =
            "Reading menu...";

          const primary = await run(pass % 4);

          if (!active()) return;

          let best = primary;

          if (score(primary) < 90) {
            const alternate = await run(
              (pass + 2) % 4
            );

            if (!active()) return;

            if (
              score(alternate) > score(best)
            ) {
              best = alternate;
            }
          }

          const found = getOCRWords(
            best.data
          ).filter(w =>
            Number(w.confidence ?? 0) >= 35
          );

          if (found.length >= 3) {
            gsMenuAudit.text = String(
              best.data.text || ""
            ).trim();

            lastRecognizedMenuText =
              gsMenuAudit.text;

            gsMenuAudit.analysis =
              gsAnalyzeRecognizedMenu(
                gsMenuAudit.text
              );

            document.dispatchEvent(
              new CustomEvent(
                "grub-live-menu-text",
                {
                  detail: {
                    text: gsMenuAudit.text
                  }
                }
              )
            );

            renderMenuARFlags(
              best.data,
              canvas.width,
              canvas.height
            );

            menuCameraStatus.textContent =
  `Detected ${gsMenuAudit.analysis.count} menu dishes. ` +
  (gsMenuAudit.analysis.percentage === null
    ? "Match unavailable."
    : `${gsMenuAudit.analysis.percentage}% with no detected conflicts.`);
          } else {
            clearMenuARFlags();

            menuCameraStatus.textContent =
              "Move closer and hold the menu steady";
          }

          pass++;
        }
      } catch (error) {
        console.warn(
          "Menu OCR frame:",
          error
        );

        if (active()) {
          menuCameraStatus.textContent =
            "Try another angle or brighter lighting";
        }
      }

      if (active()) {
        await new Promise(resolve =>
          setTimeout(resolve, 1200)
        );
      }
    }
  };

  // ==========================================
  // SAVE SCANNED MENU ANALYSIS
  // ==========================================

  const gsOriginalSaveMenu =
    saveCapturedMenu;

  saveCapturedMenu = function () {
    lastRecognizedMenuText =
      gsMenuAudit.text ||
      lastRecognizedMenuText;

    lastDetectedMenuWarnings =
      gsMenuAudit.warnings;

    const saved = gsOriginalSaveMenu();

    if (saved) {
      try {
        const items = getSavedMenuScans();

        if (items.length) {
          items[0].menuAnalysis =
            gsMenuAudit.analysis ||
            gsAnalyzeRecognizedMenu(
              gsMenuAudit.text
            );

          items[0].potentialWarnings =
            gsMenuAudit.warnings;

          items[0].recognizedText =
            gsMenuAudit.text;

          localStorage.setItem(
            MENU_SCAN_STORAGE_KEY,
            JSON.stringify(items)
          );

          renderRecallList();
        }
      } catch (error) {
        console.warn(
          "Menu analysis save:",
          error
        );
      }
    }

    return saved;
  };

  const gsOriginalOpenResults =
    openMenuResults;

  openMenuResults = function (
    photo,
    fromRecall = false
  ) {
    gsOriginalOpenResults(
      photo,
      fromRecall
    );

    const item = getSavedMenuScans().find(
      entry => entry.photo === photo
    );

    gsShowMenuScore(
      item?.menuAnalysis ||
      gsAnalyzeRecognizedMenu(
        item?.recognizedText || ""
      )
    );
  };

  const gsOriginalRecall =
    renderRecallList;

  renderRecallList = function () {
    gsOriginalRecall();

    const items = getSavedMenuScans();

    const cards = [
      ...recallList.querySelectorAll(
        ".menu-photo-recall"
      )
    ];

    cards.forEach((card, index) => {
      const analysis =
        items[index]?.menuAnalysis;

      const score = card.querySelector(
        ".recall-score"
      );

      if (score && analysis) {
        score.textContent =
          analysis.percentage === null
            ? "Match unavailable"
            : `${analysis.percentage}% potential match`;
      }
    });
  };

  // Reset menu findings before a new scan.
  const gsOriginalStartMenuCamera =
    startMenuCamera;

  startMenuCamera = async function () {
    gsMenuAudit.text = "";
    gsMenuAudit.warnings = [];
    gsMenuAudit.analysis = null;

    return gsOriginalStartMenuCamera();
  };


  // ==========================================
  // UNIFIED MENU COMPATIBILITY + GROUPED FLAGS
  // ==========================================

  const gsScreeningPatterns = {
    vegan: /\b(beef|pork|chicken|bacon|ham|milk|butter|cheese|eggs?|honey|gelatin|shrimp|salmon|fish|steak|cream|yogurt|dairy|burrata|parmesan|pecorino|scallops?|mozzarella|ricotta|anchov(?:y|ies))\b/i,

    nutSafe: /\b(peanuts?|walnuts?|almonds?|cashews?|pistachios?|pecans?|hazelnuts?|pine\s+nuts?|macadamia|brazil\s+nuts?)\b/i,

    glutenFree: /\b(wheat|barley|rye|semolina|couscous|bulgur|flour|bread|pasta|noodles|breadcrumbs|tagliatelle|spaghetti|linguine|fettuccine)\b/i,

    seafoodSafe: /\b(shrimp|prawns?|crab|lobster|oysters?|mussels?|clams?|scallops?|salmon|tuna|anchov(?:y|ies)|fish)\b/i
  };

  // Analyze complete dishes, including their descriptions.
  gsAnalyzeRecognizedMenu = function (text) {
    const profiles = selectedUsers().filter(person =>
      !window.GrubLiveScan ||
      window.GrubLiveScan.includesUser(person.name)
    );

    const lines = String(text || "")
      .split(/\r?\n/)
      .map(s => s.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const dishes = [];

    const heading =
      /^(chef'?s? selection|our menu|menu|maison sauce|mains?|entrees?|entrées?|starters?|appetizers?|desserts?|sides?|drinks?|beverages?|specials?|please inform|allergies|dietary restrictions|all prices|taxes|gratuity)$/i;

    const clean = s =>
      s.replace(
        /\s*(?:\$\s*\d+(?:\.\d{2})?|\d+\.\d{2})\s*$/,
        ""
      ).trim();

    const isTitle = s => {
      const t = clean(s);

      if (
        t.length < 5 ||
        t.length > 90 ||
        heading.test(t) ||
        /^please\b/i.test(t)
      ) {
        return false;
      }

      const letters = t.match(/[a-zA-ZÀ-ÿ]/g) || [];
      if (letters.length < 6) return false;

      const upper =
        letters.filter(c => c === c.toUpperCase()).length /
        letters.length;

      const priced =
        /(?:\$\s*\d+(?:\.\d{2})?|\d+\.\d{2})\s*$/.test(s);

      return priced || (
        upper > 0.78 &&
        t.split(/\s+/).length <= 10
      );
    };

    // Group descriptions beneath their dish titles.
    for (const line of lines) {
      if (isTitle(line)) {
        dishes.push({
          name: clean(line),
          description: []
        });
      } else if (
        dishes.length &&
        !heading.test(line) &&
        !/^please\b/i.test(line)
      ) {
        dishes[dishes.length - 1].description.push(line);
      }
    }

    // Eliminate duplicate recognized dishes.
    const unique = [
      ...new Map(
        dishes.map(d => [d.name.toLowerCase(), d])
      ).values()
    ];

    // Unknown profile restrictions cannot be verified.
    const unsupported = profiles.some(p =>
      p.requiresVerification ||
      !p.filters?.length ||
      p.filters.some(f => !gsScreeningPatterns[f])
    );

    const items = unique.map(d => {
      const phrase = (
        d.name + " " + d.description.join(" ")
      )
        .replace(
          /\bvegan\s+(chicken|cheese|beef|fish)\b/gi,
          "plant substitute"
        )
        .replace(
          /\bcoconut milk\b/gi,
          "coconut beverage"
        )
        .replace(
          /\bplant.based milk\b/gi,
          "plant beverage"
        );

      const profilesAffected = profiles.filter(p =>
        p.filters.some(f =>
          gsScreeningPatterns[f]?.test(phrase)
        )
      );

      return {
        name: d.name,
        description: d.description.join(" "),
        conflicts: profilesAffected.map(p => p.name),
        potentialMatch: profilesAffected.length === 0
      };
    });

    const eligible =
      items.length >= 2 &&
      profiles.length > 0 &&
      !unsupported;

    const unflagged = items.filter(
      item => item.potentialMatch
    ).length;

    return {
      percentage: eligible
        ? Math.round(100 * unflagged / items.length)
        : null,

      count: items.length,
      flagged: items.length - unflagged,
      items,

      note: eligible
        ? `${unflagged} of ${items.length} recognized dishes ` +
          "have no detected conflicts. This does not verify " +
          "ingredient safety or cross-contact."
        : "Not enough identifiable dishes or unsupported " +
          "profile restrictions. Match unavailable."
    };
  };

  // ==========================================
  // SAME ANALYSIS DRIVES SCORE AND AR FLAGS
  // ==========================================

  renderMenuARFlags = function (
    data,
    imageWidth,
    imageHeight
  ) {
    clearMenuARFlags();

    const analysis = gsAnalyzeRecognizedMenu(
      data?.text || ""
    );

    gsMenuAudit.analysis = analysis;
    gsMenuAudit.text = String(data?.text || "");
    lastRecognizedMenuText = gsMenuAudit.text;

    // Update the existing results percentage.
    gsShowMenuScore(analysis);

    // Update the live compatibility display.
    const label = analysis.percentage === null
      ? "Match unavailable"
      : `${analysis.percentage}% POTENTIAL MATCH · ${analysis.count} dishes`;

    const scanner = screens.menuScanner;

    const leaves = scanner
      ? [...scanner.querySelectorAll("*")].filter(el =>
          el.children.length === 0 &&
          /^(not enough menu data|\d+%\s*(?:potential\s*)?match|match unavailable)$/i.test(
            el.textContent.trim()
          )
        )
      : [];

    if (leaves.length) {
      
      leaves[0].textContent = label;

      const percent = analysis.percentage;

      const matchColor =
        percent > 70 ? "#d9f5e5" : "#f2273f";

      const bar = leaves[0].parentElement || leaves[0];

      bar.style.background = percent === null
        ? "#808080"
        : `linear-gradient(to right,
            ${matchColor} 0%,
            ${matchColor} ${percent}%,
            #808080 ${percent}%,
            #808080 100%)`;

      bar.style.borderRadius = "30px";
      bar.style.color = percent > 70 ? "#111" : "#fff";

    } else if (scanner) {
      let indicator = scanner.querySelector(
        "#gs-camera-match-score"
      );

      if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "gs-camera-match-score";

        indicator.style.cssText = `
          padding: 10px 16px;
          margin: 8px;
          border-radius: 12px;
          background: #777;
          color: white;
          font-weight: 700;
          text-align: center;
        `;

        const camera = scanner.querySelector(
          ".menu-camera-container"
        );

        if (camera) camera.before(indicator);
        else scanner.prepend(indicator);
      }

      indicator.textContent = label;
    }

    // ==========================================
    // NON-OVERLAPPING BADGE PLACEMENT
    // ==========================================

    const bounds = getMenuVideoBounds(
      imageWidth,
      imageHeight
    );

    const words = getOCRWords(data).filter(
      w => w?.bbox && w?.text
    );

    const boxes = words.map(w => ({
      l: bounds.left + w.bbox.x0 * bounds.scale,
      r: bounds.left + w.bbox.x1 * bounds.scale,
      t: bounds.top + w.bbox.y0 * bounds.scale,
      b: bounds.top + w.bbox.y1 * bounds.scale
    }));

    const occupied = [];
    const warnings = [];

    const overlaps = (a, b, gap = 0) =>
      a.l < b.r + gap &&
      a.r + gap > b.l &&
      a.t < b.b + gap &&
      a.b + gap > b.t;

    const free = (x, y, w, h) => {
      const b = {
        l: x,
        r: x + w,
        t: y,
        b: y + h
      };

      return (
        x >= 4 &&
        y >= 4 &&
        b.r <= bounds.width - 4 &&
        b.b <= bounds.height - 4 &&
        !occupied.some(o => overlaps(b, o, 7)) &&
        !boxes.some(o => overlaps(b, o, 3))
      );
    };

    // One badge per dish, with every affected profile.
    for (const dish of analysis.items) {
      if (
        !dish.conflicts.length ||
        warnings.length >= 10
      ) {
        continue;
      }

      const profiles = selectedUsers().filter(p =>
        dish.conflicts.includes(p.name) &&
        (
          !window.GrubLiveScan ||
          window.GrubLiveScan.includesUser(p.name)
        )
      );

      if (!profiles.length) continue;

      // Find the dish title in the live OCR positions.
      const titleWords = dish.name
        .toLowerCase()
        .match(/[a-zà-ÿ]{4,}/g) || [];

      const anchor = words.find(w =>
        titleWords.includes(
          w.text
            .toLowerCase()
            .replace(/[^a-zà-ÿ]/g, "")
        )
      );

      if (!anchor) continue;

      const badge = document.createElement("div");
      badge.className = "menu-ar-warning";

      badge.style.cssText = `
        position: absolute;
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 4px 6px;
        border-radius: 22px;
        background: rgba(15,15,15,.9);
        white-space: nowrap;
        visibility: hidden;
        z-index: 30;
        box-sizing: border-box;
      `;

      // Single red flag.
      const flag = document.createElement("span");
      flag.setAttribute("aria-hidden", "true");

      flag.style.cssText = `
        display: inline-block;
        width: 21px;
        height: 26px;
        position: relative;
        flex-shrink: 0;
      `;

      flag.innerHTML = `
        <span style="
          position:absolute;
          left:3px;
          top:2px;
          width:2px;
          height:22px;
          background:white;
        "></span>
        <span style="
          position:absolute;
          left:5px;
          top:3px;
          width:16px;
          height:14px;
          background:#f2273f;
          clip-path:polygon(
            0 0,100% 0,75% 50%,100% 100%,0 100%
          );
        "></span>
      `;

      badge.append(flag);

      // Add all affected profile photos beside the flag.
      for (const profile of profiles) {
        
const img = document.createElement("img");

img.crossOrigin = "anonymous";
img.src = profile.image;
img.alt = "";


        img.style.cssText = `
          width: 27px;
          height: 27px;
          object-fit: cover;
          border: 2px solid white;
          border-radius: 50%;
          box-sizing: border-box;
        `;

        badge.append(img);
      }

      badge.setAttribute("role", "img");

      badge.setAttribute(
        "aria-label",
        `Possible conflict: ${dish.name} for ${dish.conflicts.join(", ")}`
      );

      menuARFlagLayer.append(badge);

      const width =
        badge.offsetWidth || 60 + profiles.length * 32;

      const height = badge.offsetHeight || 35;

      const ax =
        bounds.left + anchor.bbox.x1 * bounds.scale;

      const ay =
        bounds.top +
        (anchor.bbox.y0 + anchor.bbox.y1) /
          2 * bounds.scale;

      let position = null;

      // Search nearby available spaces without covering text.
      for (
        let step = 0;
        step <= 18 && !position;
        step++
      ) {
        for (
          const dy of step
            ? [step * 13, -step * 13]
            : [0]
        ) {
          const y = ay - height / 2 + dy;

          for (
            const x of [
              ax + 10,
              bounds.width - width - 8,
              8
            ]
          ) {
            if (free(x, y, width, height)) {
              position = { x, y };
              break;
            }
          }

          if (position) break;
        }
      }

      if (!position) {
        badge.remove();
        continue;
      }

      badge.style.left = position.x + "px";
      badge.style.top = position.y + "px";
      badge.style.visibility = "visible";

      occupied.push({
        l: position.x,
        r: position.x + width,
        t: position.y,
        b: position.y + height
      });

      warnings.push({
        word: dish.name,
        profiles: dish.conflicts
      });
    }

    lastDetectedMenuWarnings = warnings;
    gsMenuAudit.warnings = warnings;

    return warnings.length;
  };


  // ==========================================
  // FIX MENU SAVE -> RECALL COMPATIBILITY
  // ==========================================

  let gsBestMenuScan = null;

  document.addEventListener(
    "grub-live-profile-filter-change",
    () => {
      if (state.screen !== "menuScanner") return;

      clearMenuARFlags();

      gsBestMenuScan = null;

      const analysis = gsAnalyzeRecognizedMenu(
        gsMenuAudit.text || ""
      );

      gsMenuAudit.analysis = analysis;
      gsMenuAudit.warnings = [];
      lastDetectedMenuWarnings = [];

      gsShowMenuScore(analysis);
    }
  );

  // Keep the most complete valid scan while the camera runs.
  const gsPreviousFlagRenderer = renderMenuARFlags;

  renderMenuARFlags = function (...args) {
    const result = gsPreviousFlagRenderer(...args);
    const analysis = gsMenuAudit.analysis;

    if (
      analysis &&
      Number.isFinite(analysis.percentage) &&
      analysis.count >= 2
    ) {
      if (
        !gsBestMenuScan ||
        analysis.count >= gsBestMenuScan.analysis.count
      ) {
        gsBestMenuScan = {
          analysis: JSON.parse(JSON.stringify(analysis)),
          text: gsMenuAudit.text,
          warnings: JSON.parse(
            JSON.stringify(gsMenuAudit.warnings || [])
          )
        };
      }
    }

    return result;
  };

  // Start a new scan with no previous menu data.
  const gsPreviousCameraStart = startMenuCamera;

  startMenuCamera = function (...args) {
    gsBestMenuScan = null;
    return gsPreviousCameraStart(...args);
  };

  // Preserve the recognized percentage when saving.
  const gsPreviousMenuSave = saveCapturedMenu;

  saveCapturedMenu = function (...args) {
    if (gsBestMenuScan) {
      gsMenuAudit.analysis = gsBestMenuScan.analysis;
      gsMenuAudit.text = gsBestMenuScan.text;
      gsMenuAudit.warnings = gsBestMenuScan.warnings;

      lastRecognizedMenuText = gsBestMenuScan.text;
      lastDetectedMenuWarnings =
        gsBestMenuScan.warnings;
    }

    const saved = gsPreviousMenuSave(...args);

    if (saved) {
      try {
        const scans = getSavedMenuScans();

        if (scans.length) {
          const analysis =
            gsBestMenuScan?.analysis ||
            gsMenuAudit.analysis ||
            gsAnalyzeRecognizedMenu(
              scans[0].recognizedText || ""
            );

          scans[0].menuAnalysis = analysis;
          scans[0].recognizedText =
            gsBestMenuScan?.text ||
            scans[0].recognizedText ||
            "";

          scans[0].potentialWarnings =
            gsBestMenuScan?.warnings ||
            scans[0].potentialWarnings ||
            [];

          localStorage.setItem(
            MENU_SCAN_STORAGE_KEY,
            JSON.stringify(scans)
          );
        }

        renderRecallList();
      } catch (error) {
        console.warn(
          "Could not preserve scanned menu score:",
          error
        );
      }
    }

    return saved;
  };

  // Display the saved score on each Recall card.
  const gsPreviousRecallRender = renderRecallList;

  renderRecallList = function (...args) {
    const result = gsPreviousRecallRender(...args);

    const scans = getSavedMenuScans();

    const cards = recallList.querySelectorAll(
      ".menu-photo-recall"
    );

    cards.forEach((card, index) => {
      const scan = scans[index];
      if (!scan) return;

      const analysis =
        scan.menuAnalysis &&
        Number.isFinite(scan.menuAnalysis.percentage)
          ? scan.menuAnalysis
          : gsAnalyzeRecognizedMenu(
              scan.recognizedText || ""
            );

      const score = card.querySelector(".recall-score");

      if (score) {
        score.textContent =
          Number.isFinite(analysis.percentage)
            ? `${analysis.percentage}% POTENTIAL MATCH`
            : "Match unavailable";
      }

      // Preserve the analysis for the detail screen.
      if (
        !scan.menuAnalysis &&
        Number.isFinite(analysis.percentage)
      ) {
        scan.menuAnalysis = analysis;
      }
    });

    return result;
  };

  // END MENU SAVE -> RECALL FIX

 
  // ==========================================
  // RESTAURANT NAME + COLORED RECALL CARDS
  // ==========================================

  function gsDetectRestaurantName(ocrText) {
    const lines = String(ocrText || "")
      .split(/\r?\n/)
      .map(line => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const section =
      /\b(chef'?s? selection|appetizers?|starters?|entr[eé]es?|main courses?|desserts?|drinks?|beverages?|sides?|breakfast|brunch|lunch|dinner|specials?|our menu|food menu)\b/i;

    const generic =
      /\b(menu|restaurant|welcome|please|allergen|allergies|dietary|selection|course|kitchen hours|tax|prices?|sauce)\b/i;

    const firstSection = lines.findIndex(line =>
      section.test(line)
    );

    // Only infer names appearing before a menu section.
    if (firstSection <= 0) {
      return "Restaurant name unavailable";
    }

    const header = lines.slice(0, firstSection).slice(0, 5);

    for (const line of header) {
      const candidate = line
        .replace(/[^a-zA-ZÀ-ÿ0-9 &'’.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const letters =
        candidate.match(/[a-zA-ZÀ-ÿ]/g) || [];

      const uppercase = letters.filter(letter =>
        letter === letter.toUpperCase()
      ).length;

      const words = candidate.split(/\s+/).filter(Boolean);

      if (
        letters.length >= 6 &&
        words.length >= 2 &&
        words.length <= 5 &&
        candidate.length <= 45 &&
        uppercase / letters.length >= 0.75 &&
        !generic.test(candidate) &&
        !/\d/.test(candidate)
      ) {
        return candidate
          .toLowerCase()
          .replace(/\b[a-zà-ÿ]/g, char =>
            char.toUpperCase()
          );
      }
    }

    return "Restaurant name unavailable";
  }

  // Save restaurant name with menu scan.
  const gsSaveBeforeRestaurantNames = saveCapturedMenu;

  saveCapturedMenu = function (...args) {
    const saved = gsSaveBeforeRestaurantNames(...args);

    if (!saved) return saved;

    try {
      const scans = getSavedMenuScans();

      if (scans.length) {
        const scan = scans[0];

        const text =
          gsBestMenuScan?.text ||
          scan.recognizedText ||
          gsMenuAudit.text ||
          "";

        let inferredName = gsDetectRestaurantName(text);


        const lettersOnly = inferredName.replace(
          /[^a-z]/gi, ""
        );

        if (
          lettersOnly.length < 5 ||
          !/[aeiouy]/i.test(lettersOnly)
        ) {
          inferredName = "Restaurant name unavailable";
        }


        // Let the user identify an unreadable restaurant.
        if (inferredName === "Restaurant name unavailable") {
          const entered = window.prompt(
            "Restaurant name not recognized. Enter the restaurant name:",
            ""
          );

          if (entered && entered.trim()) {
            inferredName = entered.trim().slice(0, 80);
          }
        }

        scan.name = inferredName;

        localStorage.setItem(
          MENU_SCAN_STORAGE_KEY,
          JSON.stringify(scans)
        );

        renderRecallList();
      }
    } catch (error) {
      console.warn(
        "Could not save restaurant name:",
        error
      );
    }

    return saved;
  };

  // Apply restaurant names and compatibility colors.
  const gsRecallBeforeRestaurantColors = renderRecallList;

  renderRecallList = function (...args) {
    const result =
      gsRecallBeforeRestaurantColors(...args);

    const scans = getSavedMenuScans();

    const cards = recallList.querySelectorAll(
      ".menu-photo-recall"
    );

    cards.forEach((card, index) => {
      const scan = scans[index];

      if (!scan) return;

      const name = card.querySelector(
        ".recall-restaurant-name"
      );

      const score = card.querySelector(
        ".recall-score"
      );

      const inferred = gsDetectRestaurantName(
        scan.recognizedText || ""
      );

      if (name) {
        name.textContent =
          scan.name && scan.name !== "Scanned Menu"
            ? scan.name
            : inferred;
      }

      const percent = scan.menuAnalysis?.percentage;

      const valid = Number.isFinite(percent);
      const good = valid && percent > 70;

      // Red = lower potential match.
      // Green = higher potential match.
      // Gray = unavailable.
      card.style.background = !valid
        ? "#e8e0e6"
        : good
          ? "#d9f5e5"
          : "#ffe1e5";

      card.style.borderLeft = `6px solid ${
        !valid
          ? "#808080"
          : good
            ? "#268653"
            : "#f2273f"
      }`;

      if (score) {
        score.textContent = valid
          ? `${percent}% POTENTIAL MATCH`
          : "Match unavailable";

        score.style.color = !valid
          ? "#454545"
          : good
            ? "#17663d"
            : "#a7142e";

        score.style.fontWeight = "800";
      }
    });

    return result;
  };

  // END RESTAURANT NAME + RECALL COLORS
 

  // ==========================================
  // SAVED MENU -> RESTAURANT-STYLE MEALS SCREEN
  // ==========================================

  let gsOpenedScan = null;
  let gsOpenedScanRestaurantIndex = -1;

  // Read the colors from the EXISTING result screen CSS.
  function gsExistingMatchColor(positive) {
    const screen = screens.result;
    const oldScreen = screen.className;
    const oldCard = resultCard.className;
    const oldIcon = resultIcon.className;
    const read = () => [
      getComputedStyle(resultCard).backgroundColor,
      getComputedStyle(screen).backgroundColor,
      getComputedStyle(resultIcon).color
    ];
    const meaningful = color =>
      color && color !== "transparent" &&
      !/rgba\([^)]*,\s*0\s*\)/.test(color);

    function sample(isPositive) {
      screen.classList.toggle("no-match", !isPositive);
      resultCard.classList.toggle("bad-match", !isPositive);
      resultCard.classList.toggle("positive-compatibility", isPositive);
      resultIcon.className = "ph result-icon " +
        (isPositive ? "ph-check-circle" : "ph-x-circle");
      return read();
    }

    const negative = sample(false);
    const affirmative = sample(true);
    screen.className = oldScreen;
    resultCard.className = oldCard;
    resultIcon.className = oldIcon;

    const desired = positive ? affirmative : negative;
    const other = positive ? negative : affirmative;
    const contrasting = desired.find((value, index) =>
      meaningful(value) && value !== other[index]
    );
    return contrasting || desired.find(meaningful) ||
      (positive ? "#268653" : "#f2273f");
  }

  // Save selected profiles with new menu scans.
  const gsSaveWithProfiles = saveCapturedMenu;
  saveCapturedMenu = function (...args) {
    const success = gsSaveWithProfiles(...args);
    if (success) {
      try {
        const scans = getSavedMenuScans();
        if (scans[0]) {
          scans[0].profileNames = selectedUsers().map(u => u.name);
          localStorage.setItem(MENU_SCAN_STORAGE_KEY, JSON.stringify(scans));
        }
        renderRecallList();
      } catch (error) {
        console.warn("Could not save scan profiles", error);
      }
    }
    return success;
  };

  // Match saved-menu card colors to the existing result screen.
  const gsRenderRecallWithResultColors = renderRecallList;
  renderRecallList = function (...args) {
    const result = gsRenderRecallWithResultColors(...args);
    const scans = getSavedMenuScans();

    recallList.querySelectorAll(".menu-photo-recall").forEach((card, i) => {
      const scan = scans[i];
      if (!scan) return;

      const percent = scan.menuAnalysis?.percentage;
      const valid = Number.isFinite(percent);
      const color = valid
        ? gsExistingMatchColor(percent > 70)
        : "#808080";

      card.style.backgroundColor = color;
      card.style.borderLeft = `6px solid ${color}`;
      card.style.color = "#111";

      const title = card.querySelector(".recall-restaurant-name");
      const score = card.querySelector(".recall-score");

      if (title) title.style.color = "#111";

      if (score) {
        score.style.color = "#111";
        score.textContent = valid
          ? `${percent}% POTENTIAL MATCH`
          : "Match unavailable";
      }
    });

    return result;
  };

  function gsOpenSavedMenuAsRestaurant(scan) {
    if (!scan) return;

    const analysis = scan.menuAnalysis;

    if (!Array.isArray(analysis?.items) || !analysis.items.length) {
      // Older scans without dish data still open their photo.
      openMenuResults(scan.photo, true);
      return;
    }

    gsOpenedScan = scan;

    const storedProfiles = scan.profileNames;

    if (Array.isArray(storedProfiles) && storedProfiles.length) {
      users.forEach(u => {
        u.selected = storedProfiles.includes(u.name);
      });
    }

    if (!selectedUsers().length) users[0].selected = true;

    state.activeUser = 0;
    state.profileMenuOpen = false;

    const meals = analysis.items.map(dish => {
      const text = `${dish.name} ${dish.description || ""}`
        .replace(
          /\bvegan\s+(chicken|cheese|beef|fish)\b/gi,
          "plant substitute"
        )
        .replace(
          /\bcoconut milk\b/gi,
          "coconut beverage"
        );

      const meal = {
        name: dish.name,
        model: null,
        scanDescription: dish.description || "",
        ingredients: []
      };

      for (const filter of Object.keys(gsScreeningPatterns)) {
        meal[filter] = !gsScreeningPatterns[filter].test(text);
      }

      return meal;
    });

    const entry = {
      name: scan.name && scan.name !== "Scanned Menu"
        ? scan.name
        : "Scanned Restaurant Menu",
      meals,
      scannedMenu: true
    };

    if (gsOpenedScanRestaurantIndex < 0) {
      gsOpenedScanRestaurantIndex = restaurants.length;
      restaurants.push(entry);
    } else {
      restaurants[gsOpenedScanRestaurantIndex] = entry;
    }

    state.restaurant = gsOpenedScanRestaurantIndex;

    showScreen("menu");
    renderMenu();
  }

  // Open the restaurant-style screen instead of the saved photo.
  recallList.addEventListener("click", event => {
    const card = event.target.closest(".menu-photo-recall");

    if (!card || !recallList.contains(card)) return;

    const cards = [
      ...recallList.querySelectorAll(".menu-photo-recall")
    ];

    const scan = getSavedMenuScans()[cards.indexOf(card)];

    if (!scan) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    gsOpenSavedMenuAsRestaurant(scan);
  }, true);

  // Reuse the existing meals screen with scanned descriptions.
  const gsRenderMenuBeforeSavedScan = renderMenu;

  renderMenu = function (...args) {
    const result = gsRenderMenuBeforeSavedScan(...args);

    if (
      state.restaurant !== gsOpenedScanRestaurantIndex ||
      !gsOpenedScan
    ) {
      return result;
    }

    const analysis = gsOpenedScan.menuAnalysis;

    let notice = screens.menu.querySelector(
      "#gs-saved-scan-notice"
    );

    if (!notice) {
      notice = document.createElement("p");
      notice.id = "gs-saved-scan-notice";

      notice.style.cssText = `
        margin: 12px 18px;
        color: #555;
        font-size: 13px;
        line-height: 1.5;
      `;

      menuGrid.before(notice);
    }

    notice.textContent =
      (Number.isFinite(analysis?.percentage)
        ? `${analysis.percentage}% potential match. `
        : "Match unavailable. ") +
      "Only items with no detected conflict are shown for " +
      "the active profile. Ingredients and cross-contact " +
      "are unverified.";

    const dishMap = new Map(
      (analysis?.items || []).map(d => [d.name, d])
    );

    menuGrid.querySelectorAll(".meal-card").forEach(card => {
      const dish = dishMap.get(
        card.querySelector(".meal-name")?.textContent.trim()
      );

      if (!dish) return;

      const detail = document.createElement("p");

      detail.textContent =
        dish.description || "Ingredients not listed on menu";

      detail.style.cssText = `
        padding: 8px 12px;
        font-size: 12px;
        line-height: 1.4;
        color: #555;
      `;

      card.append(detail);
    });

    return result;
  };

  // Back arrow returns to Recall instead of restarting a scan.
  screens.menu.addEventListener("click", event => {
    if (
      state.restaurant !== gsOpenedScanRestaurantIndex ||
      !gsOpenedScan
    ) return;

    const back = event.target.closest(".gs-global-back");
    if (!back) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    renderRecallList();
    showScreen("recall");
  }, true);

  // END SAVED MENU -> RESTAURANT-STYLE SCREEN

  // ==========================================
  // MATCH-SCREEN COLORS + NO-3D PLACEHOLDERS
  // ==========================================

  // Sample the actual styles used by the existing match screen.
  function gsSampleResultTheme(positive) {
    const screen = screens.result;
    const previousScreenClass = screen.className;
    const previousCardClass = resultCard.className;
    const previousIconClass = resultIcon.className;

    try {
      screen.classList.toggle("no-match", !positive);
      resultCard.classList.toggle("bad-match", !positive);
      resultIcon.className = "ph result-icon " +
        (positive ? "ph-check-circle" : "ph-x-circle");

      const candidates = [resultCard, screen, resultIcon];

      return candidates.map(element => {
        const style = getComputedStyle(element);
        const before = getComputedStyle(element, "::before");

        return [
          { background: style.backgroundImage, type: "image" },
          { background: style.backgroundColor, type: "color" },
          { background: before.backgroundImage, type: "image" },
          { background: before.backgroundColor, type: "color" },
          { background: style.color, type: "text" }
        ];
      }).flat();

    } finally {
      screen.className = previousScreenClass;
      resultCard.className = previousCardClass;
      resultIcon.className = previousIconClass;
    }
  }

  function gsGetMatchingResultBackground(isPositive) {
    const yes = gsSampleResultTheme(true);
    const no = gsSampleResultTheme(false);
    const wanted = isPositive ? yes : no;
    const types = ["color", "image", "text"];

    for (const type of types) {
      for (let i = 0; i < wanted.length; i++) {
        const item = wanted[i];

        if (
          item.type !== type ||
          item.background === no[i]?.background &&
          item.background === yes[i]?.background
        ) continue;

        if (
          !item.background ||
          item.background === "none" ||
          item.background === "transparent" ||
          item.background === "rgba(0, 0, 0, 0)"
        ) continue;

        return item.background;
      }
    }

    return null;
  }

  const gsRecallBeforeExactResultColors = renderRecallList;

  renderRecallList = function (...args) {
    const output = gsRecallBeforeExactResultColors(...args);
    const scans = getSavedMenuScans();

    const red = gsGetMatchingResultBackground(false);
    const green = gsGetMatchingResultBackground(true);

    recallList.querySelectorAll(".menu-photo-recall")
      .forEach((card, index) => {

        const score = scans[index]?.menuAnalysis?.percentage;

        if (!Number.isFinite(score)) return;

        const shade = score > 70 ? green : red;
        if (!shade) return;

        card.style.background = shade;
        card.style.borderLeft = "0";
        card.style.color = "#111";

        card.querySelectorAll(
          ".recall-score, .recall-restaurant-name"
        ).forEach(label => {
          label.style.color = "#111";
        });
      });

    return output;
  };

  // ==========================================
  // PHOTO PLACEHOLDER FOR MISSING GLB MODELS
  // ==========================================

  const gsNoModelPhoto =
    BASE + "pexels-asphotography-172491.jpg";

  const gsRenderMenuBeforeNoModelPhotos = renderMenu;

  renderMenu = function (...args) {
    const output = gsRenderMenuBeforeNoModelPhotos(...args);

    const restaurant = restaurants[state.restaurant];
    if (!restaurant) return output;

    menuGrid.querySelectorAll(".meal-card")
      .forEach(card => {

        const mealName = card
          .querySelector(".meal-name")
          ?.textContent.trim();

        const meal = restaurant.meals.find(
          item => item.name === mealName
        );

        // Preserve every meal with an existing 3D model.
        if (!meal || meal.model) return;

        const picture = card.querySelector(".meal-picture");
        if (!picture) return;

        picture.replaceChildren();

        picture.style.position = "relative";
        picture.style.overflow = "hidden";
        picture.style.minHeight = "145px";
        picture.style.background = "#e8e8e8";

        const photo = document.createElement("img");

        photo.src = gsNoModelPhoto;
        photo.alt = "";
        photo.loading = "lazy";

        photo.style.cssText = `
          display: block;
          width: 100%;
          height: 100%;
          min-height: 145px;
          object-fit: cover;
        `;

        const message = document.createElement("div");

        message.textContent =
          "No 3D model currently available";

        message.style.cssText = `
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
          text-align: center;
          background: rgba(0,0,0,.56);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.3;
          pointer-events: none;
        `;

        picture.append(photo, message);
      });

    return output;
  };

  // END MATCH-SCREEN COLORS + NO-3D PLACEHOLDERS

  // ==========================================
  // REVIEW SAVED MENU DISH NAMES
  // ==========================================

  function gsReviewSavedMenu() {
    if (!gsOpenedScan) return;

    const scan = gsOpenedScan;
    const existing = scan.menuAnalysis?.items || [];

    const startingText = existing.map(item =>
      item.name + " | " + (item.description || "")
    ).join("\n");

    const edited = window.prompt(
      "Correct the dishes using one line per meal:\n" +
      "DISH NAME | INGREDIENT DESCRIPTION\n\n" +
      "Please include the ingredients shown on the menu.",
      startingText
    );

    if (edited === null) return;

    const rows = edited.split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    const profiles = selectedUsers();

    const items = rows.map(line => {
      const separator = line.indexOf("|");

      const name = (
        separator < 0
          ? line
          : line.slice(0, separator)
      ).trim();

      const description = (
        separator < 0
          ? ""
          : line.slice(separator + 1)
      ).trim();

      const combined = (name + " " + description)
        .replace(
          /\bvegan\s+(chicken|cheese|beef|fish)\b/gi,
          "plant substitute"
        )
        .replace(
          /\bcoconut milk\b/gi,
          "coconut beverage"
        );

      const conflicts = profiles
        .filter(user =>
          user.filters.some(filter =>
            gsScreeningPatterns[filter]?.test(combined)
          )
        )
        .map(user => user.name);

      return {
        name,
        description,
        conflicts,
        potentialMatch: conflicts.length === 0,
        needsVerification: !description
      };
    }).filter(item => item.name.length >= 3);

    const complete = items.length >= 2 &&
      items.every(item => !item.needsVerification);

    const unflagged = items.filter(item =>
      item.potentialMatch
    ).length;

    const percentage = complete
      ? Math.round(100 * unflagged / items.length)
      : null;

    scan.menuAnalysis = {
      percentage,
      count: items.length,
      flagged: items.length - unflagged,
      items,
      note: complete
        ? `${unflagged} of ${items.length} recognized dishes ` +
          "have no detected conflicts. Ingredients and " +
          "cross-contact remain unverified."
        : "Enter descriptions for every dish before " +
          "calculating the potential match."
    };

    scan.recognizedText = items.map(item =>
      item.name.toUpperCase() + "\n" + item.description
    ).join("\n");

    scan.menuReviewed = true;

    try {
      const saved = getSavedMenuScans();
      const index = saved.findIndex(item =>
        item.id === scan.id
      );

      if (index >= 0) {
        saved[index] = scan;

        localStorage.setItem(
          MENU_SCAN_STORAGE_KEY,
          JSON.stringify(saved)
        );
      }
    } catch (error) {
      console.warn("Could not save menu corrections:", error);
    }

    gsOpenSavedMenuAsRestaurant(scan);
  }

  // Disable the manual menu review popup.
gsReviewSavedMenu = function () {
  return;
};

  // Add the review button to the existing meals screen.
  const gsRenderBeforeOCRReview = renderMenu;

  renderMenu = function (...args) {
    const result = gsRenderBeforeOCRReview(...args);

    if (
      state.restaurant !== gsOpenedScanRestaurantIndex ||
      !gsOpenedScan
    ) {
      return result;
    }

    const notice = screens.menu.querySelector(
      "#gs-saved-scan-notice"
    );

    if (notice) {
      // Clear misleading scores until the text is reviewed.
      if (!gsOpenedScan.menuReviewed) {
        notice.firstChild.textContent =
          "OCR dish names are unverified. " +
          "Review the menu text before relying on " +
          "the compatibility estimate. ";
      }

      let button = screens.menu.querySelector(
        "#gs-review-menu-button"
      );

      if (!button) {
        button = document.createElement("button");
        button.id = "gs-review-menu-button";
        button.type = "button";
        button.textContent = "REVIEW MENU TEXT";
button.hidden = true;

        button.style.cssText = `
          display: inline-block;
          margin: 8px 0;
          padding: 10px 14px;
          background: #53142f;
          color: white;
          border: 0;
          font-weight: 700;
          cursor: pointer;
        `;

        button.addEventListener(
          "click",
          gsReviewSavedMenu
        );

        // Manual review button disabled.
      }
    }

    // Hide broken-image icons when the placeholder
    // photo has not been uploaded successfully.
    menuGrid.querySelectorAll(".meal-picture img")
      .forEach(img => {
        if (img.src.includes(
          "pexels-asphotography-172491.jpg"
        )) {
          img.addEventListener("error", () => {
            img.style.display = "none";
          }, { once: true });
        }
      });

    return result;
  };

  // END OCR MENU REVIEW

  // ==========================================
  
  // ==========================================
  // FINAL PHOTO OCR V2: ISOLATED + CONSERVATIVE
  // ==========================================

  function gsPhotoLines(data) {
    const lines = [];

    for (const block of data?.blocks || []) {
      for (const paragraph of block.paragraphs || []) {
        for (const line of paragraph.lines || []) {
          const words = (line.words || []).filter(
            w => w.text?.trim()
          );

          if (!words.length) continue;

          const text = words
            .map(w => w.text)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

          const conf = words
            .map(w => Number(w.confidence))
            .filter(Number.isFinite);

          const boxes = words
            .map(w => w.bbox)
            .filter(Boolean);

          if (!boxes.length) continue;

          lines.push({
            text,
            confidence: conf.length
              ? conf.reduce((a, b) => a + b, 0) /
                conf.length
              : 0,
            x: Math.min(...boxes.map(b => b.x0)),
            y: Math.min(...boxes.map(b => b.y0)),
            bottom: Math.max(...boxes.map(b => b.y1)),
            height:
              Math.max(...boxes.map(b => b.y1)) -
              Math.min(...boxes.map(b => b.y0))
          });
        }
      }
    }

    return lines.sort(
      (a, b) => a.y - b.y || a.x - b.x
    );
  }

  function gsExtractPhotoDishes(lines) {
    const ignored =
      /^(?:menu|our menu|chef'?s? selection|maison sauce|starters?|appetizers?|entr[eé]es?|mains?|desserts?|sides?|drinks?|beverages?|specials?|please inform|dietary restrictions|allergies|prices?|taxes|gratuity)(?:\b|\s|$)/i;

    const priced =
      /(?:\s|^)(?:\$\s*)?\d{1,3}(?:[.,]\d{2})?\s*$/;

    const clean = s =>
      s.replace(priced, "")
        .replace(/[.·•\s]+$/, "")
        .trim();

    const heights = lines
      .filter(l => l.confidence >= 55)
      .map(l => l.height)
      .sort((a, b) => a - b);

    const median =
      heights[Math.floor(heights.length / 2)] || 14;

    const dishes = [];
    let current = null;

    for (const line of lines) {
      const title = clean(line.text);

      const letters =
        title.match(/[A-Za-zÀ-ÿ]/g) || [];

      const words = title
        .split(/\s+/)
        .filter(Boolean);

      const upperRatio = letters.length
        ? letters.filter(c =>
            c === c.toUpperCase()
          ).length / letters.length
        : 0;

      const isSection =
        ignored.test(title) ||
        /^(?:please|ask your server|all prices)/i.test(title);

      if (isSection) {
        if (current && /^please\b/i.test(title)) {
          current = null;
        }
        continue;
      }

      const plausible =
        letters.length >= 7 &&
        title.length <= 90 &&
        words.length <= 12 &&
        (title.match(/[aeiouàèéêëîïôùûüy]/gi) || [])
          .length >= 2 &&
        !/[^A-Za-zÀ-ÿ0-9&'’()\-,.\/ ]/.test(title);

      const highConfidence =
        line.confidence >= 68;

      const looksTitle =
        upperRatio >= 0.80 ||
        (
          priced.test(line.text) &&
          words.length <= 10
        ) ||
        (
          line.height > median * 1.35 &&
          words.length <= 8
        );

      if (
        plausible &&
        highConfidence &&
        looksTitle
      ) {
        if (current) dishes.push(current);

        current = {
          name: title,
          description: [],
          titleConfidence: line.confidence,
          y: line.y
        };

      } else if (
        current &&
        line.confidence >= 52 &&
        title.length >= 6
      ) {
        current.description.push(title);
      }
    }

    if (current) dishes.push(current);

    const seen = new Set();

    return dishes.filter(d => {
      const key = d.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }

  function gsScorePhotoDishes(dishes) {
    const profiles = selectedUsers();

    const items = dishes.map(d => {
      const description = d.description.join(" ");

      const phrase = (
        d.name + " " + description
      )
        .replace(
          /\bvegan\s+(chicken|cheese|beef|fish)\b/gi,
          "plant substitute"
        )
        .replace(
          /\bcoconut milk\b/gi,
          "coconut beverage"
        );

      const conflicts = profiles
        .filter(p =>
          (p.filters || []).some(f =>
            gsScreeningPatterns[f]?.test(phrase)
          )
        )
        .map(p => p.name);

      return {
        name: d.name,
        description,
        conflicts,
        potentialMatch: conflicts.length === 0,
        needsVerification:
          !description || d.titleConfidence < 68
      };
    });

    const sufficient =
      items.length >= 2 &&
      profiles.length > 0 &&
      profiles.every(p =>
        !p.requiresVerification &&
        p.filters?.length &&
        p.filters.every(f =>
          gsScreeningPatterns[f]
        )
      ) &&
      items.every(i => !i.needsVerification);

    const unflagged = items.filter(
      i => i.potentialMatch
    ).length;

    return {
      percentage: sufficient
        ? Math.round(
            100 * unflagged / items.length
          )
        : null,

      count: items.length,
      flagged: items.length - unflagged,
      items,

      note: sufficient
        ? `${unflagged} of ${items.length} recognized dishes have no detected conflicts. Ingredients and cross-contact remain unverified.`
        : "Some menu items could not be read confidently. Match unavailable; try a clearer photo."
    };
  }

  async function gsScanStillPhoto(source) {
    // Use a separate OCR worker for the final photo.
    const worker =
      await window.Tesseract.createWorker("eng");

    const canvas =
      document.createElement("canvas");

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true
    });

    if (!ctx) {
      await worker.terminate();
      throw new Error("Canvas unavailable");
    }

    const factor = Math.min(
      2,
      2200 / source.width
    );

    canvas.width = Math.round(
      source.width * factor
    );

    canvas.height = Math.round(
      source.height * factor
    );

    ctx.drawImage(
      source,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const original = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const candidates = [];

    try {
      for (const mode of [
        "color",
        "grayscale",
        "invert"
      ]) {
        ctx.putImageData(original, 0, 0);

        if (mode !== "color") {
          const copy = new ImageData(
            new Uint8ClampedArray(original.data),
            canvas.width,
            canvas.height
          );

          for (
            let i = 0;
            i < copy.data.length;
            i += 4
          ) {
            const v =
              0.299 * copy.data[i] +
              0.587 * copy.data[i + 1] +
              0.114 * copy.data[i + 2];

            const contrast = Math.max(
              0,
              Math.min(
                255,
                (v - 128) * 1.15 + 128
              )
            );

            const next = mode === "invert"
              ? 255 - contrast
              : contrast;

            copy.data[i] = next;
            copy.data[i + 1] = next;
            copy.data[i + 2] = next;
          }

          ctx.putImageData(copy, 0, 0);
        }

        await worker.setParameters({
          tessedit_pageseg_mode:
            mode === "color" ? "3" : "11"
        });

        const result = await worker.recognize(
          canvas,
          {},
          {
            text: true,
            blocks: true
          }
        );

        const lines =
          gsPhotoLines(result.data);

        const dishes =
          gsExtractPhotoDishes(lines);

        const analysis =
          gsScorePhotoDishes(dishes);

        const average = lines.length
          ? lines.reduce(
              (s, l) => s + l.confidence,
              0
            ) / lines.length
          : 0;

        candidates.push({
          text:
            result.data.text ||
            lines.map(l => l.text).join("\n"),

          analysis,
          dishes,

          quality:
            average +
            Math.min(lines.length, 30) +
            dishes.filter(
              d => d.description.length
            ).length * 12 -
            dishes.filter(
              d => !d.description.length
            ).length * 15
        });
      }

    } finally {
      await worker.terminate();
    }

    // Reward dish headings confirmed in
    // more than one image-processing pass.
    const normalize = s =>
      s.toLowerCase()
        .replace(/[^a-z0-9à-ÿ]/g, "");

    for (const candidate of candidates) {
      const others = candidates.filter(
        c => c !== candidate
      );

      const agreed = candidate.dishes.filter(
        d => others.some(other =>
          other.dishes.some(e =>
            normalize(e.name) ===
            normalize(d.name)
          )
        )
      ).length;

      candidate.quality += agreed * 30;
    }

    candidates.sort(
      (a, b) => b.quality - a.quality
    );

    const best = candidates[0];

    if (!best) {
      return {
        text: "",
        analysis: gsScorePhotoDishes([])
      };
    }

    // Don't calculate a numeric score
    // when OCR passes disagree completely.
    const agreement = best.dishes.filter(
      d => candidates.slice(1).some(other =>
        other.dishes.some(e =>
          normalize(e.name) ===
          normalize(d.name)
        )
      )
    ).length;

    if (agreement < 2) {
      best.analysis.percentage = null;

      best.analysis.note =
        "Menu text could not be confirmed across OCR passes. Try better lighting or a steadier image.";
    }

    return best;
  }

  // ==========================================
  // REPLACE FINAL SAVE BUTTON BEHAVIOR
  // ==========================================

 
  // ==========================================
  // TWO-STEP MENU PHOTO REVIEW AND SAVE
  // ==========================================

  let gsReviewRawMenuCanvas = null;
  let gsReviewLiveBackup = null;

  function gsDrawReviewFlags(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const overlayRect =
      menuARFlagLayer.getBoundingClientRect();

    const bounds = getMenuVideoBounds(
      canvas.width,
      canvas.height
    );

    if (!bounds.scale) return;

    const unit = 1 / bounds.scale;

    const badges = [
      ...menuARFlagLayer.querySelectorAll(
        ".menu-ar-warning"
      )
    ];

    for (const badge of badges) {
      if (
        getComputedStyle(badge).visibility === "hidden"
      ) continue;

      const rect = badge.getBoundingClientRect();

      if (!rect.width || !rect.height) continue;

      const x =
        (rect.left - overlayRect.left - bounds.left) *
        unit;

      const y =
        (rect.top - overlayRect.top - bounds.top) *
        unit;

      const w = rect.width * unit;
      const h = rect.height * unit;

      // Dark badge background.
      ctx.fillStyle = "rgba(15,15,15,0.9)";
      ctx.beginPath();

      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, 10 * unit);
      } else {
        ctx.rect(x, y, w, h);
      }

      ctx.fill();

      // White flagpole.
      ctx.fillStyle = "white";
      ctx.fillRect(
        x + 9 * unit,
        y + 6 * unit,
        2 * unit,
        22 * unit
      );

      // Red warning flag.
      ctx.fillStyle = "#f2273f";
      ctx.beginPath();
      ctx.moveTo(x + 11 * unit, y + 6 * unit);
      ctx.lineTo(x + 27 * unit, y + 6 * unit);
      ctx.lineTo(x + 23 * unit, y + 13 * unit);
      ctx.lineTo(x + 27 * unit, y + 20 * unit);
      ctx.lineTo(x + 11 * unit, y + 20 * unit);
      ctx.closePath();
      ctx.fill();

     
      // Draw the affected users' circular profile pictures.
      const photos = [...badge.querySelectorAll("img")]
        .filter(img => img.complete && img.naturalWidth > 0);

      const count = photos.length;

      if (count) {
        const availableWidth = Math.max(20, w / unit - 36);
        const size = Math.min(
          27,
          availableWidth / (1 + 0.6 * (count - 1))
        );

        const step = size * 0.6;
        const totalWidth = size + step * (count - 1);
        const startX = x + w - (6 + totalWidth) * unit;

        photos.forEach((photo, index) => {
          const px = startX + index * step * unit;
          const py = y + (h - size * unit) / 2;
          const radius = size * unit / 2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(
            px + radius,
            py + radius,
            radius,
            0,
            Math.PI * 2
          );
          ctx.clip();

          ctx.drawImage(
            photo,
            px,
            py,
            size * unit,
            size * unit
          );

          ctx.restore();

          ctx.beginPath();
          ctx.arc(
            px + radius,
            py + radius,
            radius,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2 * unit;
          ctx.stroke();
        });
      }
    }
  }

  // STEP 1: TAKE A PICTURE

  captureMenuButton.addEventListener(
    "click",
    event => {
      if (
        state.screen !== "menuScanner" ||
        !menuCameraStream ||
        !menuCameraVideo.videoWidth ||
        !menuCameraVideo.videoHeight ||
        captureMenuButton.disabled
      ) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      // Capture an unmarked image for accurate OCR.
      const raw = document.createElement("canvas");

      raw.width = menuCameraVideo.videoWidth;
      raw.height = menuCameraVideo.videoHeight;

      const rawCtx = raw.getContext("2d");
      const previewCtx =
        menuCaptureCanvas.getContext("2d");

      if (!rawCtx || !previewCtx) return;

      rawCtx.drawImage(
        menuCameraVideo,
        0,
        0,
        raw.width,
        raw.height
      );

      // Create the photograph users will see and save.
      menuCaptureCanvas.width = raw.width;
      menuCaptureCanvas.height = raw.height;

      previewCtx.drawImage(raw, 0, 0);

      // Add visible red flags before the camera stops.
      gsDrawReviewFlags(menuCaptureCanvas);

      capturedMenuPhoto = createMenuPhotoDataURL(
        menuCaptureCanvas,
        1100,
        0.82
      );

      if (!capturedMenuPhoto) return;

      gsReviewRawMenuCanvas = raw;

      gsReviewLiveBackup =
        Number.isFinite(
          gsBestMenuScan?.analysis?.percentage
        ) &&
        gsBestMenuScan.analysis.count >= 2
          ? JSON.parse(JSON.stringify(gsBestMenuScan))
          : null;

      menuPhotoCaptured = true;

      // Existing camera cleanup remains unchanged.
      stopMenuCamera();

      menuCameraVideo.hidden = true;
      menuCaptureCanvas.hidden = false;

      // Open the existing photo review screen.
      openMenuResults(capturedMenuPhoto, false);

      menuResultsMatchLabel.textContent =
        "Photo captured. Review before analyzing.";

      saveMenuResultsButton.disabled = false;

      saveMenuResultsButton.textContent =
        "SAVE RESULTS FOR REFERENCE";
    },
    true
  );

  // STEP 2: FIND COMPATIBILITY AND SAVE

  saveMenuResultsButton.addEventListener(
    "click",
    async event => {
      if (
        state.screen !== "menuResults" ||
        state.menuResultFromRecall ||
        !menuPhotoCaptured ||
        !gsReviewRawMenuCanvas
      ) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      saveMenuResultsButton.disabled = true;

      menuSaveStatus.textContent =
        "Checking compatibility and saving...";

      gsBestMenuScan = null;

      try {
        const recognized = await gsScanStillPhoto(
          gsReviewRawMenuCanvas
        );

        if (state.screen !== "menuResults") return;

        gsBestMenuScan = {
          text: recognized.text,
          analysis: recognized.analysis,
          warnings: (
            recognized.analysis?.items || []
          )
            .filter(item => item.conflicts.length)
            .map(item => ({
              word: item.name,
              profiles: item.conflicts
            }))
        };

      } catch (error) {
        console.warn("Final menu OCR:", error);

        gsBestMenuScan = {
          text: "",
          analysis: gsScorePhotoDishes([]),
          warnings: []
        };
      }

      // Save only when the captured photo produces
      // a sufficiently verified compatibility result.
      const photoAnalysis = gsBestMenuScan?.analysis;

      const readableMenu =
        Number.isFinite(photoAnalysis?.percentage) &&
        photoAnalysis.count >= 2 &&
        Array.isArray(photoAnalysis.items) &&
        photoAnalysis.items.length >= 2 &&
        photoAnalysis.items.every(item =>
          item.name?.trim() &&
          item.description?.trim() &&
          !item.needsVerification
        );

      if (!readableMenu) {
        gsBestMenuScan = null;

        menuSaveStatus.textContent =
          "Grub Scrub could not reliably read the menu. " +
          "Nothing has been saved. Please retake " +
          "a clearer photo.";

        // Leave only Retake Photo available.
        saveMenuResultsButton.hidden = true;
        return;
      }

      gsMenuAudit.text = gsBestMenuScan.text;
      gsMenuAudit.analysis = gsBestMenuScan.analysis;
      gsMenuAudit.warnings = gsBestMenuScan.warnings;

      lastRecognizedMenuText = gsBestMenuScan.text;
      lastDetectedMenuWarnings =
        gsBestMenuScan.warnings;

      try {
        if (!saveCapturedMenu()) {
          throw new Error("Could not save menu");
        }

        gsReviewRawMenuCanvas = null;

      } catch (error) {
        console.error("Menu save:", error);

        menuSaveStatus.textContent =
          "Could not save menu. Please try again.";

        saveMenuResultsButton.disabled = false;
      }
    },
    true
  );


  // Prevent uncertain OCR from appearing
  // as fully compatible restaurant meals.
  const gsOpenBeforeStillPhotoV2 =
    gsOpenSavedMenuAsRestaurant;

  gsOpenSavedMenuAsRestaurant = function (scan) {
    if (
      !Number.isFinite(
        scan?.menuAnalysis?.percentage
      )
    ) {
      openMenuResults(scan.photo, true);

      gsShowMenuScore(
        scan.menuAnalysis ||
        gsScorePhotoDishes([])
      );

      return;
    }

    return gsOpenBeforeStillPhotoV2(scan);
  };

  // END FINAL PHOTO OCR V2


  // END MENU SCANNER IMPROVEMENTS

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



