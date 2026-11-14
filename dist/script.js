
window.addEventListener("load", function () {
  "use strict";

  /* ==========================================
     GRUB SCRUB V02
     ASSETS AND AUDIO
     ========================================== */

  const BASE =
    "https://raw.githubusercontent.com/JazzyG00555/grub-scrub-ar/main/";

  const SALAD_URL = BASE + "salad%20%281%29.glb";

  const SOUNDS = {
    click: BASE + "683099__florianreichelt__computer-mouse-click.mp3",
    profile: BASE + "320549__debsound__pop-19.wav",
    bell: BASE + "restaurantbellisamatch.mp3",
    crunch: BASE + "crunchnotamatch.wav"
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
      const buffer = audioContext.createBuffer(
        1,
        1,
        22050
      );

      const source = audioContext.createBufferSource();

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

      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();

      source.buffer = soundBuffers[name];
      gain.gain.value = name === "click" ? 0.9 : 0.75;

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

    const profileClick =
      button.classList.contains("user-add-button") ||
      button.id === "addAllButton";

    playSound(profileClick ? "profile" : "click");
  }, true);


  /* ==========================================
     FOOD PROFILES
     ========================================== */

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
      restrictions: [
        "Gluten Free",
        "Seafood Allergy"
      ],
      filters: [
        "glutenFree",
        "seafoodSafe"
      ],
      minMeals: 3,
      selected: false
    }
  ];


  /* ==========================================
     PROTOTYPE RESTAURANT DATA

     This data is for demonstration.
     Dietary compatibility has not been
     verified with the restaurants.
     ========================================== */

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
            {
              name: "Lettuce",
              part: "lettuce"
            },
            {
              name: "Tomatoes",
              part: "tomato"
            },
            {
              name: "Cucumbers",
              part: "cucumber"
            }
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
            BASE +
            "salmon_and_brussel_sprouts.glb",
          vegan: false,
          nutSafe: true,
          glutenFree: true,
          seafoodSafe: false
        },
        {
          name: "Mac and Cheese",
          model:
            BASE +
            "mac_and_cheese_bowl.glb",
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
            BASE +
            "pork_belly_tonkotsu_ramen.glb",
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


  /* ==========================================
     APP STATE
     ========================================== */

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


  /* ==========================================
     HTML REFERENCES
     ========================================== */

  const $ = selector =>
    document.querySelector(selector);

  const mobile = () =>
    window.matchMedia("(max-width:767px)").matches ||
    /iPhone|iPad|iPod|Android/i.test(
      navigator.userAgent
    );

  const screens = {
    title: $("#screen-title"),
    plans: $("#screen-plans"),
    scanChoice: $("#screen-scan-choice"),
    users: $("#screen-users"),
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

  const menuScannerBack = $("#menuScannerBack");
  const menuCameraVideo = $("#menuCameraVideo");
  const menuCameraStatus = $("#menuCameraStatus");
  const captureMenuButton = $("#captureMenuButton");
  const menuCaptureCanvas = $("#menuCaptureCanvas");
  const menuARFlagLayer = $("#menuARFlagLayer");

  const menuResultsPhoto = $("#menuResultsPhoto");
  const menuResultsBack = $("#menuResultsBack");

  const menuResultsMatchLabel =
    $("#menuResultsMatchLabel");

  const menuResultsProgress =
    $("#menuResultsProgress");

  const menuResultsProgressFill =
    $("#menuResultsProgressFill");

  const filterFlagsButton = $("#filterFlagsButton");
  const menuFlagsMessage = $("#menuFlagsMessage");

  const retakeMenuResultsButton =
    $("#retakeMenuResultsButton");

  const saveMenuResultsButton =
    $("#saveMenuResultsButton");

  const menuSaveStatus = $("#menuSaveStatus");

  const trackingStatus = $("#trackingStatus");
  const scene = $("#arScene");
  const psTarget = $("#psTarget");
  const danboTarget = $("#danboTarget");

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


  /* ==========================================
     CAMERA AND OCR STATE
     ========================================== */

  let menuCameraStream = null;
  let menuCameraRequest = 0;

  let menuPhotoCaptured = false;
  let capturedMenuPhoto = "";

  let lastRecognizedMenuText = "";
  let lastDetectedMenuWarnings = [];

  let menuOCRGeneration = 0;
  let menuOCRWorkerPromise = null;


  /* ==========================================
     SCREEN NAVIGATION
     ========================================== */

  function showScreen(name) {
    if (!screens[name]) {
      console.error("Screen missing:", name);
      return;
    }

    Object.values(screens).forEach(screen => {
      if (screen) {
        screen.classList.remove("active");
      }
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

    if (name !== "menuScanner") {
      stopMenuCamera();
    }
  }


  /* ==========================================
     FOOD MATCHING
     ========================================== */

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
        available(restaurant, user).length >=
        user.minMeals
      )
    );
  }

  function groupCompatibility(restaurant) {
    const selected = selectedUsers();

    if (!selected.length) return 0;

    const meetingMinimum = selected.filter(user =>
      available(restaurant, user).length >=
      user.minMeals
    ).length;

    return Math.round(
      meetingMinimum / selected.length * 100
    );
  }


  /* ==========================================
     TITLE AND SCANNER CHOICE
     ========================================== */

  startButton.addEventListener("click", () => {
    showScreen("plans");
  });

  lastMinuteButton.addEventListener("click", () => {
    showScreen("scanChoice");
  });

  pregatheringButton.addEventListener("click", () => {
    alert("Pregathering Menu Analyzer coming next!");
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

  scannerChoiceBack.addEventListener("click", () => {
    showScreen("plans");
  });


  /* ==========================================
     FOOD PROFILE SELECTION
     ========================================== */

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


  /* ==========================================
     START SELECTED SCANNER
     ========================================== */

  scanButton.addEventListener("click", async () => {
    if (!selectedUsers().length) return;

    if (state.selectedScanType === "logo") {
      state.activeUser = 0;
      state.scanComplete = false;
      state.profileMenuOpen = false;

      state.flowVersion++;

      trackingStatus.textContent =
        "Looking for logo...";

      showScreen("camera");

      if (state.mindARStarted) {
        await restartAR();
      } else {
        await startAR();
      }

    } else if (
      state.selectedScanType === "menu"
    ) {
      showScreen("menuScanner");
      await startMenuCamera();

    } else {
      showScreen("scanChoice");
    }
  });


  /* ==========================================
     LIVE AR DIETARY WARNING RULES

     These detect visible ingredient terms only.
     They do not verify food safety.
     ========================================== */

  const dietaryFlagRules = [
    {
      profile: "Gus",
      filter: "nutSafe",
      label: "Nut warning",
      pattern:
        /\b(peanut|peanuts|walnut|walnuts|almond|almonds|cashew|cashews|pistachio|pistachios|pecan|pecans|hazelnut|hazelnuts)\b/i
    },
    {
      profile: "Brad",
      filter: "seafoodSafe",
      label: "Seafood warning",
      pattern:
        /\b(shrimp|prawn|prawns|crab|lobster|oyster|oysters|mussel|mussels|clam|clams|salmon|tuna|anchovy|anchovies|fish)\b/i
    },
    {
      profile: "Brad",
      filter: "glutenFree",
      label: "Gluten warning",
      pattern:
        /\b(wheat|barley|rye|semolina|couscous|bulgur)\b/i
    },
    {
      profile: "Jamie",
      filter: "vegan",
      label: "Animal ingredient",
      pattern:
        /\b(beef|pork|chicken|bacon|ham|milk|butter|cheese|egg|eggs|honey|gelatin|shrimp|salmon|fish)\b/i
    }
  ];


  /* ==========================================
     CLEAR AR FLAGS
     ========================================== */

  function clearMenuARFlags() {
    if (menuARFlagLayer) {
      menuARFlagLayer.replaceChildren();
    }
  }


  /* ==========================================
     EXTRACT OCR WORDS WITH POSITIONS
     ========================================== */

  function getOCRWords(data) {
    if (
      Array.isArray(data.words) &&
      data.words.length
    ) {
      return data.words;
    }

    if (!Array.isArray(data.blocks)) {
      return [];
    }

    return data.blocks.flatMap(block =>
      (block.paragraphs || []).flatMap(paragraph =>
        (paragraph.lines || []).flatMap(line =>
          line.words || []
        )
      )
    );
  }


  /* ==========================================
     CAMERA IMAGE → SCREEN COORDINATES
     ========================================== */

  function getMenuVideoBounds(
    imageWidth,
    imageHeight
  ) {
    const container =
      document.querySelector(
        ".menu-camera-container"
      );

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scale = Math.min(
      width / imageWidth,
      height / imageHeight
    );

    return {
      scale,
      left:
        (width - imageWidth * scale) / 2,
      top:
        (height - imageHeight * scale) / 2,
      width,
      height
    };
  }


  /* ==========================================
     RENDER FLOATING 3D-STYLE AR FLAGS
     ========================================== */

     function renderMenuARFlags(data, imageWidth, imageHeight) {
      if (!menuARFlagLayer) return 0;
    
      clearMenuARFlags();
    
      const words = getOCRWords(data);
      const selected = selectedUsers();
      const bounds = getMenuVideoBounds(imageWidth, imageHeight);
    
      const warnings = [];
      const maxFlags = 8;
      const gap = 18; // space between word and flag
    
      let flagsShown = 0;
    
      words.forEach((word, index) => {
        if (flagsShown >= maxFlags) return;
        if (!word.bbox || !word.text) return;
    
        const rawText = word.text.trim();
        const text = rawText.replace(/[^a-zA-Z]/g, "").toLowerCase();
    
        if (!text) return;
    
        const confidence = Number(word.confidence ?? 100);
        if (confidence < 40) return;
    
        const conflicts = dietaryFlagRules.filter(rule =>
          selected.some(user =>
            user.name === rule.profile &&
            user.filters.includes(rule.filter)
          ) &&
          rule.pattern.test(text)
        );
    
        if (!conflicts.length) return;
    
        const bbox = word.bbox;
    
        // word box on the displayed camera preview
        const wordLeft = bounds.left + bbox.x0 * bounds.scale;
        const wordRight = bounds.left + bbox.x1 * bounds.scale;
        const wordTop = bounds.top + bbox.y0 * bounds.scale;
        const wordBottom = bounds.top + bbox.y1 * bounds.scale;
        const wordCenterY = (wordTop + wordBottom) / 2;
    
        const flag = document.createElement("div");
        flag.className = "menu-ar-warning";
    
        const symbol = document.createElement("span");
        symbol.className = "menu-ar-flag-symbol";
        symbol.innerHTML = `
          <span class="menu-ar-flag-pole"></span>
          <span class="menu-ar-flag-cloth"></span>
        `;
    
        const label = document.createElement("span");
        label.className = "menu-ar-flag-label";
        label.textContent = conflicts
          .map(conflict => `${conflict.profile}: ${conflict.label}`)
          .join(" / ");
    
        flag.append(symbol, label);
    
        // temporarily render invisibly so we can measure it
        flag.style.visibility = "hidden";
        flag.style.left = "0px";
        flag.style.top = "0px";
        menuARFlagLayer.appendChild(flag);
    
        const flagWidth = flag.offsetWidth || 170;
        const flagHeight = flag.offsetHeight || 44;
    
        // prefer placing to the RIGHT of the detected word
        let x = wordRight + gap;
    
        // if too close to right edge, place to the LEFT instead
        if (x + flagWidth > bounds.width - 12) {
          x = wordLeft - flagWidth - gap;
        }
    
        // if still too far left, clamp
        if (x < 12) {
          x = 12;
        }
    
        // center vertically beside the word
        let y = wordCenterY - flagHeight / 2;
    
        // tiny stagger so multiple flags don't sit directly on top of each other
        y += (flagsShown % 2) * 10;
    
        // keep inside visible frame
        const minY = 12;
        const maxY = bounds.height - flagHeight - 12;
    
        if (y < minY) y = minY;
        if (y > maxY) y = maxY;
    
        flag.style.left = `${x}px`;
        flag.style.top = `${y}px`;
        flag.style.visibility = "visible";
    
        warnings.push({
          word: text,
          profiles: conflicts.map(conflict => conflict.profile),
          warnings: conflicts.map(conflict => conflict.label)
        });
    
        flagsShown++;
      });
    
      lastDetectedMenuWarnings = warnings;
      return flagsShown;
    }


  /* ==========================================
     STOP MENU CAMERA AND OCR
     ========================================== */

  function stopMenuCamera(
    invalidate = true
  ) {
    menuOCRGeneration++;

    clearMenuARFlags();

    if (invalidate) {
      menuCameraRequest++;
    }

    if (menuCameraStream) {
      menuCameraStream.getTracks().forEach(track => {
        track.stop();
      });

      menuCameraStream = null;
    }

    menuCameraVideo.pause();
    menuCameraVideo.srcObject = null;
  }


  /* ==========================================
     START MENU CAMERA
     ========================================== */

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
    captureMenuButton.textContent =
      "SAVE MENU RESULTS";

    menuCameraStatus.textContent =
      "Starting camera...";

    if (!navigator.mediaDevices?.getUserMedia) {
      menuCameraStatus.textContent =
        "Camera unavailable. Use HTTPS or localhost.";

      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "environment"
            }
          }
        });

      if (
        request !== menuCameraRequest ||
        state.screen !== "menuScanner"
      ) {
        stream.getTracks().forEach(track =>
          track.stop()
        );

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

      console.error(
        "Menu camera error:",
        error
      );

      stopMenuCamera();

      menuCameraStatus.textContent =
        "Camera could not start. Check camera permissions.";

      captureMenuButton.disabled = true;
    }
  }


  /* ==========================================
     CREATE REUSABLE OCR WORKER
     ========================================== */

  async function getMenuOCRWorker() {
    if (!window.Tesseract) {
      throw new Error(
        "Tesseract.js did not load"
      );
    }

    if (!menuOCRWorkerPromise) {
      menuOCRWorkerPromise =
        window.Tesseract.createWorker("eng")
          .catch(error => {
            menuOCRWorkerPromise = null;
            throw error;
          });
    }

    return menuOCRWorkerPromise;
  }


  /* ==========================================
     LIVE OCR WITH AR FLAG POSITIONING
     ========================================== */

  async function startLiveMenuOCR() {
    const generation = ++menuOCRGeneration;

    const isActive = () =>
      generation === menuOCRGeneration &&
      state.screen === "menuScanner" &&
      !!menuCameraStream;

    if (!isActive()) return;

    menuCameraStatus.textContent =
      "Loading menu text recognition...";

    let worker;

    try {
      worker = await getMenuOCRWorker();
    } catch (error) {
      console.error(
        "OCR initialization error:",
        error
      );

      if (isActive()) {
        menuCameraStatus.textContent =
          "Text recognition unavailable. You can still save the menu.";
      }

      return;
    }

    if (!isActive()) return;

    const ocrCanvas =
      document.createElement("canvas");

    const context =
      ocrCanvas.getContext("2d");

    if (!context) return;

    while (isActive()) {
      try {
        if (
          menuCameraVideo.videoWidth &&
          menuCameraVideo.videoHeight
        ) {
          const width = Math.min(
            1800,
            menuCameraVideo.videoWidth
          );

          const scale =
            width /
            menuCameraVideo.videoWidth;

          ocrCanvas.width = Math.round(width);

          ocrCanvas.height = Math.round(
            menuCameraVideo.videoHeight *
            scale
          );

          context.drawImage(
            menuCameraVideo,
            0,
            0,
            ocrCanvas.width,
            ocrCanvas.height
          );

          menuCameraStatus.textContent =
            "Reading restaurant menu...";

          // Request text and word bounding boxes.
          const result = await worker.recognize(
            ocrCanvas,
            {},
            {
              text: true,
              blocks: true
            }
          );

          if (!isActive()) return;

          const recognizedText =
            (result.data.text || "").trim();

          const flagCount = renderMenuARFlags(
            result.data,
            ocrCanvas.width,
            ocrCanvas.height
          );

          if (recognizedText) {
            lastRecognizedMenuText =
              recognizedText;

            const preview = recognizedText
              .replace(/\s+/g, " ")
              .slice(0, 95);

            menuCameraStatus.textContent =
              "Detected: " + preview;

            console.log(
              "Grub Scrub menu OCR:",
              recognizedText
            );

            if (flagCount > 0) {
              console.log(
                `Grub Scrub: ${flagCount} potential dietary warnings`
              );
            }
          } else {
            menuCameraStatus.textContent =
              "Looking for readable menu text...";
          }
        }
      } catch (error) {
        console.warn(
          "OCR frame error:",
          error
        );

        if (isActive()) {
          menuCameraStatus.textContent =
            "Could not read text. Try brighter lighting.";
        }
      }

      // Recognition runs periodically.
      // This limits mobile processor usage.
      await new Promise(resolve => {
        setTimeout(resolve, 2500);
      });
    }
  }


  /* ==========================================
     COMPRESS MENU PHOTOGRAPH
     ========================================== */

  function createMenuPhotoDataURL(
    sourceCanvas,
    maxWidth = 720,
    quality = 0.65
  ) {
    if (
      !sourceCanvas.width ||
      !sourceCanvas.height
    ) {
      return "";
    }

    const scale = Math.min(
      1,
      maxWidth / sourceCanvas.width
    );

    const output =
      document.createElement("canvas");

    output.width = Math.max(
      1,
      Math.round(
        sourceCanvas.width * scale
      )
    );

    output.height = Math.max(
      1,
      Math.round(
        sourceCanvas.height * scale
      )
    );

    const context =
      output.getContext("2d");

    if (!context) return "";

    context.drawImage(
      sourceCanvas,
      0,
      0,
      output.width,
      output.height
    );

    return output.toDataURL(
      "image/jpeg",
      quality
    );
  }


  /* ==========================================
     ONE-TAP SAVE MENU RESULTS
     ========================================== */

  captureMenuButton.addEventListener(
    "click",
    () => {
      if (
        !menuCameraStream ||
        !menuCameraVideo.videoWidth ||
        !menuCameraVideo.videoHeight
      ) {
        menuCameraStatus.textContent =
          "Camera is not ready yet.";

        return;
      }

      captureMenuButton.disabled = true;

      const canvas = menuCaptureCanvas;
      const context = canvas.getContext("2d");

      if (!context) {
        captureMenuButton.disabled = false;

        menuCameraStatus.textContent =
          "Could not save the menu image.";

        return;
      }

      canvas.width =
        menuCameraVideo.videoWidth;

      canvas.height =
        menuCameraVideo.videoHeight;

      context.drawImage(
        menuCameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
      );

      capturedMenuPhoto =
        createMenuPhotoDataURL(
          canvas,
          1100,
          0.82
        );

      if (!capturedMenuPhoto) {
        captureMenuButton.disabled = false;

        menuCameraStatus.textContent =
          "Could not process this image.";

        return;
      }

      menuPhotoCaptured = true;

      stopMenuCamera();

      menuCameraVideo.hidden = true;
      menuCaptureCanvas.hidden = false;

      // Immediately save without a second click.
      saveMenuResultsButton.click();
    }
  );


  /* ==========================================
     MENU SCANNER BACK BUTTON
     ========================================== */

  menuScannerBack.addEventListener(
    "click",
    () => {
      stopMenuCamera();

      renderUsers();
      showScreen("users");
    }
  );


  /* ==========================================
     SAVED MENU RESULTS SCREEN
     ========================================== */

  function openMenuResults(
    photo,
    fromRecall = false
  ) {
    state.menuResultFromRecall = fromRecall;

    menuResultsPhoto.src = photo;

    menuResultsMatchLabel.textContent =
      "Analysis pending";

    menuResultsProgressFill.style.width =
      "0%";

    menuResultsProgress.removeAttribute(
      "aria-valuenow"
    );

    menuResultsProgress.setAttribute(
      "aria-valuetext",
      "Not analyzed"
    );

    menuFlagsMessage.hidden = true;
    menuSaveStatus.textContent = "";

    retakeMenuResultsButton.hidden =
      fromRecall;

    saveMenuResultsButton.hidden =
      fromRecall;

    showScreen("menuResults");
  }

  filterFlagsButton.addEventListener(
    "click",
    () => {
      menuFlagsMessage.hidden =
        !menuFlagsMessage.hidden;
    }
  );

  retakeMenuResultsButton.addEventListener(
    "click",
    async () => {
      showScreen("menuScanner");
      await startMenuCamera();
    }
  );

  menuResultsBack.addEventListener(
    "click",
    async () => {
      if (state.menuResultFromRecall) {
        renderRecallList();
        showScreen("recall");

      } else {
        showScreen("menuScanner");
        await startMenuCamera();
      }
    }
  );


  /* ==========================================
     SAVE SCANNED MENUS
     ========================================== */

  const MENU_SCAN_STORAGE_KEY =
    "grub-scrub-menu-scans-v1";

  function getSavedMenuScans() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          MENU_SCAN_STORAGE_KEY
        ) || "[]"
      );

      return Array.isArray(saved)
        ? saved
        : [];

    } catch (error) {
      console.warn(
        "Saved menus unavailable:",
        error
      );

      return [];
    }
  }

  saveMenuResultsButton.addEventListener(
    "click",
    () => {
      if (
        !menuPhotoCaptured ||
        !menuCaptureCanvas.width
      ) {
        menuSaveStatus.textContent =
          "Please scan a menu first.";

        return;
      }

      try {
        const photo =
          createMenuPhotoDataURL(
            menuCaptureCanvas,
            640,
            0.55
          );

        if (!photo) {
          throw new Error(
            "Photo unavailable"
          );
        }

        const existing =
          getSavedMenuScans();

        const entry = {
          id: Date.now(),
          name: "Scanned Menu",
          photo,
          savedAt:
            new Date().toISOString(),
          recognizedText:
            lastRecognizedMenuText,
          potentialWarnings:
            lastDetectedMenuWarnings,
          analyzed: false
        };

        const updated = [
          entry,
          ...existing
        ].slice(0, 5);

        localStorage.setItem(
          MENU_SCAN_STORAGE_KEY,
          JSON.stringify(updated)
        );

        state.recallOrigin = "scanChoice";

        renderRecallList();
        showScreen("recall");

      } catch (error) {
        console.error(
          "Menu save error:",
          error
        );

        captureMenuButton.disabled = false;

        menuCameraStatus.textContent =
          "Could not save the menu. Browser storage may be full.";

        menuSaveStatus.textContent =
          "Could not save menu.";
      }
    }
  );


  /* ==========================================
     LOGO SCANNER: MINDAR
     ========================================== */

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
    ) {
      return;
    }

    state.mindARStarting = true;

    try {
      await waitForScene();

      const system =
        scene.systems[
          "mindar-image-system"
        ];

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
      scene.systems[
        "mindar-image-system"
      ];

    if (
      state.mindARStarted &&
      system
    ) {
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


  /* ==========================================
     LOGO RECOGNITION
     ========================================== */

  function restaurantDetected(index) {
    if (
      state.scanComplete ||
      state.screen !== "camera"
    ) {
      return;
    }

    state.restaurant = index;
    state.scanComplete = true;
    state.profileMenuOpen = false;

    saveRestaurantToRecall(index);

    const version = ++state.flowVersion;

    trackingStatus.textContent =
      "Logo found";

    setTimeout(() => {
      if (
        version !== state.flowVersion
      ) {
        return;
      }

      showScreen("loading");

      setTimeout(() => {
        if (
          version !== state.flowVersion
        ) {
          return;
        }

        renderResult();
        showScreen("result");

        setTimeout(() => {
          if (
            version !== state.flowVersion
          ) {
            return;
          }

          showScreen("menu");
          renderMenu();

        }, 3500);

      }, 850);

    }, 250);
  }

  psTarget.addEventListener(
    "targetFound",
    () => {
      if (state.screen === "camera") {
        restaurantDetected(0);
      }
    }
  );

  danboTarget.addEventListener(
    "targetFound",
    () => {
      if (state.screen === "camera") {
        restaurantDetected(1);
      }
    }
  );


  /* ==========================================
     LOGO GROUP COMPATIBILITY RESULT
     ========================================== */

  function renderResult() {
    const restaurant =
      restaurants[state.restaurant];

    const percentage =
      groupCompatibility(restaurant);

    const matched =
      groupMatch(restaurant);

    resultTitle.textContent =
      `${percentage}% MATCH`;

    resultSubtitle.textContent = matched
      ? "Everyone meets their minimum meal requirement!"
      : "Not everyone has enough meal options here.";

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
      (
        matched
          ? "ph-check-circle"
          : "ph-x-circle"
      );

    playSound(
      matched ? "bell" : "crunch"
    );
  }


  /* ==========================================
     RESTAURANT RECALL STORAGE
     ========================================== */

  const RECALL_STORAGE_KEY =
    "grub-scrub-recall-v1";

  function getRecallList() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          RECALL_STORAGE_KEY
        ) || "[]"
      );

      if (!Array.isArray(saved)) {
        return [];
      }

      return saved.filter(index =>
        Number.isInteger(index) &&
        index >= 0 &&
        index < restaurants.length
      );

    } catch (error) {
      console.warn(
        "Recall unavailable:",
        error
      );

      return [];
    }
  }

  function saveRestaurantToRecall(index) {
    try {
      const existing =
        getRecallList();

      const updated = [
        index,
        ...existing.filter(
          savedIndex =>
            savedIndex !== index
        )
      ];

      localStorage.setItem(
        RECALL_STORAGE_KEY,
        JSON.stringify(updated)
      );

    } catch (error) {
      console.warn(
        "Could not save restaurant:",
        error
      );
    }
  }


  /* ==========================================
     COMBINED RECALL LIST
     ========================================== */

  function renderRecallList() {
    recallList.innerHTML = "";

    const savedRestaurants =
      getRecallList();

    const savedMenus =
      getSavedMenuScans();

    recallEmpty.style.display =
      savedRestaurants.length ||
      savedMenus.length
        ? "none"
        : "block";

    const sortedRestaurants =
      [...savedRestaurants].sort(
        (a, b) =>
          groupCompatibility(
            restaurants[b]
          ) -
          groupCompatibility(
            restaurants[a]
          )
      );

    sortedRestaurants.forEach(index => {
      const restaurant =
        restaurants[index];

      const percentage =
        groupCompatibility(restaurant);

      const card =
        document.createElement("button");

      card.type = "button";
      card.className = "recall-card";

      card.classList.toggle(
        "full-match",
        percentage === 100
      );

      const name =
        document.createElement("span");

      name.className =
        "recall-restaurant-name";

      name.textContent =
        restaurant.name;

      const score =
        document.createElement("span");

      score.className =
        "recall-score";

      score.textContent =
        `${percentage}% MATCH`;

      card.append(name, score);

      card.addEventListener(
        "click",
        () => {
          state.restaurant = index;
          state.activeUser = 0;
          state.profileMenuOpen = false;

          showScreen("menu");
          renderMenu();
        }
      );

      recallList.appendChild(card);
    });

    savedMenus.forEach(item => {
      if (
        !item ||
        !item.photo
      ) {
        return;
      }

      const card =
        document.createElement("button");

      card.type = "button";

      card.className =
        "recall-card menu-photo-recall";

      const name =
        document.createElement("span");

      name.className =
        "recall-restaurant-name";

      name.textContent =
        item.name || "Scanned Menu";

      const status =
        document.createElement("span");

      status.className =
        "recall-score";

      const warningCount =
        Array.isArray(
          item.potentialWarnings
        )
          ? item.potentialWarnings.length
          : 0;

      status.textContent =
        warningCount
          ? `${warningCount} possible warning${warningCount === 1 ? "" : "s"}`
          : "Not analyzed";

      card.append(name, status);

      card.addEventListener(
        "click",
        () => {
          openMenuResults(
            item.photo,
            true
          );
        }
      );

      recallList.appendChild(card);
    });
  }

  openRecallButton.addEventListener(
    "click",
    () => {
      state.recallOrigin = "menu";

      renderRecallList();
      showScreen("recall");
    }
  );

  recallBackButton.addEventListener(
    "click",
    () => {
      if (
        state.recallOrigin === "menu"
      ) {
        showScreen("menu");
        renderMenu();

      } else {
        showScreen("scanChoice");
      }
    }
  );


  /* ==========================================
     3D MEAL VIEWERS
     ========================================== */

  function createViewer(meal) {
    const viewer =
      document.createElement("model-viewer");

    viewer.setAttribute(
      "alt",
      "3D model of " + meal.name
    );

    viewer.setAttribute(
      "camera-controls",
      ""
    );

    viewer.setAttribute(
      "interaction-prompt",
      "none"
    );

    viewer.setAttribute(
      "loading",
      "eager"
    );

    viewer.setAttribute(
      "shadow-intensity",
      "0.8"
    );

    viewer.setAttribute(
      "exposure",
      "1"
    );

    if (!mobile()) {
      viewer.setAttribute(
        "auto-rotate",
        ""
      );

      viewer.setAttribute(
        "rotation-per-second",
        "15deg"
      );
    }

    return viewer;
  }

  async function loadModel(
    entry,
    version
  ) {
    if (
      version !== state.menuVersion ||
      state.screen !== "menu"
    ) {
      return;
    }

    await customElements.whenDefined(
      "model-viewer"
    );

    if (
      version !== state.menuVersion ||
      state.screen !== "menu"
    ) {
      return;
    }

    return new Promise(resolve => {
      const {
        viewer,
        status,
        meal
      } = entry;

      let finished = false;
      let timeout;

      function finish(
        success,
        reason
      ) {
        if (finished) return;

        finished = true;

        clearTimeout(timeout);

        viewer.removeEventListener(
          "load",
          onLoad
        );

        viewer.removeEventListener(
          "error",
          onError
        );

        if (
          version === state.menuVersion
        ) {
          if (success) {
            status.remove();
          } else {
            viewer.removeAttribute(
              "src"
            );

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

      const onLoad = () =>
        finish(true);

      const onError = event =>
        finish(false, event);

      status.textContent =
        "Loading 3D food...";

      viewer.addEventListener(
        "load",
        onLoad
      );

      viewer.addEventListener(
        "error",
        onError
      );

      timeout = setTimeout(
        () => finish(
          false,
          "60-second timeout"
        ),
        60000
      );

      viewer.setAttribute(
        "src",
        meal.model
      );
    });
  }

  async function loadMobileModels(
    entries,
    version
  ) {
    for (const entry of entries) {
      if (
        version !== state.menuVersion ||
        state.screen !== "menu"
      ) {
        return;
      }

      await loadModel(
        entry,
        version
      );
    }
  }


  /* ==========================================
     DISPLAY RESTAURANT MENU
     ========================================== */

  function renderMenu() {
    const restaurant =
      restaurants[state.restaurant];

    const user = activeUser();

    if (!user) {
      renderUsers();
      showScreen("users");
      return;
    }

    const meals =
      available(restaurant, user);

    restaurantName.textContent =
      restaurant.name;

    activeUserName.textContent =
      user.name;

    activeUserRestrictions.innerHTML =
      user.restrictions
        .map(
          text =>
            `<span>${text}</span>`
        )
        .join(
          "<span> • </span>"
        );

    availabilityCount.textContent =
      `${meals.length}/${restaurant.meals.length}`;

    optionsMessage.textContent =
      meals.length
        ? "meal options available"
        : "no meal options available";

    const version =
      ++state.menuVersion;

    const entries = [];

    menuGrid.innerHTML = "";

    meals.forEach(meal => {
      const card =
        document.createElement("div");

      card.className =
        "meal-card";

      const picture =
        document.createElement("div");

      picture.className =
        "meal-picture";

      const label =
        document.createElement("div");

      label.className =
        "meal-name";

      label.textContent =
        meal.name;

      card.append(picture, label);

      if (meal.model) {
        const viewer =
          createViewer(meal);

        const status =
          document.createElement("div");

        Object.assign(
          status.style,
          {
            position: "absolute",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            boxSizing: "border-box",
            background: "#e8e8e8",
            color: "#666",
            fontSize: "12px",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: "1"
          }
        );

        status.textContent =
          mobile()
            ? "Waiting to load 3D..."
            : "Loading 3D food...";

        picture.append(
          viewer,
          status
        );

        entries.push({
          viewer,
          status,
          meal
        });
      }

      if (meal.heroAR) {
        const infoButton =
          document.createElement("button");

        infoButton.type = "button";
        infoButton.className = "ar-label";

        infoButton.innerHTML =
          '<i class="ph ph-info"></i>';

        infoButton.setAttribute(
          "aria-label",
          "View detailed House Salad"
        );

        infoButton.addEventListener(
          "click",
          event => {
            event.stopPropagation();
            openHeroDish(meal);
          }
        );

        card.appendChild(
          infoButton
        );
      }

      menuGrid.appendChild(
        card
      );
    });

    renderProfileDisc();

    if (mobile()) {
      loadMobileModels(
        entries,
        version
      );
    } else {
      entries.forEach(entry =>
        loadModel(entry, version)
      );
    }
  }


  /* ==========================================
     PROFILE DISC NAVIGATION
     ========================================== */

  function renderProfileDisc() {
    profileButtons.innerHTML = "";

    profileDisc.classList.toggle(
      "open",
      state.profileMenuOpen
    );

    const restaurant =
      restaurants[state.restaurant];

    const ordered =
      selectedUsers().map(
        (user, index) => ({
          user,
          index
        })
      );

    const active =
      ordered[state.activeUser];

    const arranged = [
      active,
      ...ordered.filter(
        item =>
          item.index !== state.activeUser
      )
    ].filter(Boolean);

    const slots = [
      {
        left: "25px",
        top: "11px"
      },
      {
        right: "2px",
        top: "2px"
      },
      {
        left: "2px",
        bottom: "2px"
      }
    ];

    arranged.forEach(
      (entry, slot) => {
        const user =
          entry.user;

        const isActive =
          entry.index === state.activeUser;

        const compatible =
          available(
            restaurant,
            user
          ).length > 0;

        const button =
          document.createElement("button");

        button.type = "button";

        button.className = isActive
          ? "profile-button active current"
          : "profile-button small";

        if (state.profileMenuOpen) {
          Object.assign(
            button.style,
            slots[slot]
          );
        } else if (isActive) {
          button.style.right =
            "4px";

          button.style.bottom =
            "4px";
        }

        button.setAttribute(
          "aria-label",
          user.name +
          (
            compatible
              ? ", options available"
              : ", no options available"
          )
        );

        button.innerHTML = `
          <span class="profile-main-icon ${
            compatible
              ? "profile-has-options"
              : "profile-no-options"
          }">

            <img class="profile-nav-image"
                 src="${user.image}"
                 alt="${user.name}">

          </span>

          <span class="profile-status-icon ${
            compatible ? "ok" : "bad"
          }">

            <i class="ph ${
              compatible
                ? "ph-check"
                : "ph-x"
            }"></i>

          </span>
        `;

        button.addEventListener(
          "click",
          () => {
            if (
              !state.profileMenuOpen
            ) {
              state.profileMenuOpen = true;
              renderProfileDisc();
              return;
            }

            state.activeUser =
              entry.index;

            state.profileMenuOpen =
              false;

            renderMenu();
          }
        );

        profileButtons.appendChild(
          button
        );
      }
    );

    addProfileButton.style.display =
      state.profileMenuOpen
        ? "flex"
        : "none";
  }

  addProfileButton.addEventListener(
    "click",
    () => {
      state.profileMenuOpen = false;

      renderUsers();
      showScreen("users");
    }
  );


  /* ==========================================
     SCAN LOGO AGAIN
     ========================================== */

  scanAgainButton.addEventListener(
    "click",
    async event => {
      event.preventDefault();

      state.selectedScanType = "logo";
      state.scanComplete = false;
      state.profileMenuOpen = false;

      state.flowVersion++;

      trackingStatus.textContent =
        "Looking for logo...";

      showScreen("camera");

      await restartAR();
    }
  );


  /* ==========================================
     HOUSE SALAD 3D INGREDIENTS
     ========================================== */

  let detailReady = false;
  let detailFailed = false;

  let selectedIngredient = null;

  const INGREDIENT_NAMES = {
    lettuce: "Lettuce",
    tomato: "Tomatoes",
    cucumber: "Cucumbers"
  };

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
      localStorage.getItem(
        HOTSPOT_STORAGE_KEY
      ) || "{}"
    );

    if (
      stored &&
      typeof stored === "object"
    ) {
      savedHotspots = stored;
    }

  } catch (error) {
    console.warn(
      "Hotspot storage unavailable:",
      error
    );
  }

  function showDishStatus(message) {
    dishLoading.textContent =
      message;

    dishLoading.hidden =
      !message;
  }

  function hideHotspot() {
    hotspot.classList.add(
      "is-hidden"
    );

    hotspot.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  function positionString(point) {
    return (
      point.x.toFixed(5) + "m " +
      point.y.toFixed(5) + "m " +
      point.z.toFixed(5) + "m"
    );
  }

  function getDefaultHotspot(part) {
    const preset =
      HOTSPOT_DEFAULTS[part];

    if (
      !preset ||
      !detailReady
    ) {
      return null;
    }

    const dimensions =
      detailViewer.getDimensions();

    const center =
      detailViewer.getBoundingBoxCenter();

    const width =
      dimensions.x || 1;

    const height =
      dimensions.y || 1;

    const depth =
      dimensions.z || 1;

    return {
      position: positionString({
        x:
          center.x +
          preset.x * width,
        y:
          center.y +
          preset.y * height,
        z:
          center.z +
          preset.z * depth
      }),
      normal: "0m 1m 0m"
    };
  }

  function getHotspotPosition(part) {
    const stored =
      savedHotspots[part];

    if (
      stored &&
      typeof stored.position === "string" &&
      typeof stored.normal === "string"
    ) {
      return stored;
    }

    return getDefaultHotspot(part);
  }


  /* ==========================================
     DISPLAY INGREDIENT HOTSPOT
     ========================================== */

  function showIngredientHotspot(part) {
    selectedIngredient = part;

    if (
      !detailReady ||
      !part
    ) {
      hideHotspot();
      return;
    }

    const coordinates =
      getHotspotPosition(part);

    if (!coordinates) {
      hideHotspot();
      return;
    }

    hotspotLabel.textContent =
      INGREDIENT_NAMES[part];

    hotspot.classList.toggle(
      "label-left",
      part === "cucumber"
    );

    try {
      detailViewer.updateHotspot({
        name: "hotspot-ingredient",
        position:
          coordinates.position,
        normal:
          coordinates.normal
      });

      hotspot.classList.remove(
        "is-hidden"
      );

      hotspot.setAttribute(
        "aria-hidden",
        "false"
      );

    } catch (error) {
      console.error(
        "Hotspot positioning error:",
        error
      );

      hideHotspot();
    }
  }

  function selectIngredient(part) {
    if (
      selectedIngredient === part
    ) {
      selectedIngredient = null;

      hideHotspot();

      ingredientButtons
        .querySelectorAll("button")
        .forEach(button => {
          button.classList.remove(
            "active"
          );
        });

      detailViewer.setAttribute(
        "auto-rotate",
        ""
      );

      return;
    }

    selectedIngredient = part;

    ingredientButtons
      .querySelectorAll("button")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.part === part
        );
      });

    detailViewer.removeAttribute(
      "auto-rotate"
    );

    showIngredientHotspot(part);
  }

  detailViewer.addEventListener(
    "load",
    () => {
      detailReady = true;
      detailFailed = false;

      showDishStatus("");

      if (selectedIngredient) {
        showIngredientHotspot(
          selectedIngredient
        );
      }
    }
  );

  detailViewer.addEventListener(
    "error",
    error => {
      detailReady = false;
      detailFailed = true;

      hideHotspot();

      console.error(
        "Salad model error:",
        error
      );

      if (state.screen === "dish") {
        showDishStatus(
          "House Salad 3D model could not load."
        );
      }
    }
  );


  /* ==========================================
     OPEN HOUSE SALAD DETAILS
     ========================================== */

  function openHeroDish(meal) {
    if (
      state.restaurant !== 0 ||
      !meal.heroAR
    ) {
      return;
    }

    state.profileMenuOpen = false;

    dishRestaurant.textContent =
      "P.S. Kitchen";

    dishName.textContent =
      "House Salad";

    ingredientButtons.innerHTML = "";

    selectedIngredient = null;
    hideHotspot();

    meal.ingredients.forEach(
      ingredient => {
        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "ingredient-button";

        button.textContent =
          ingredient.name;

        button.dataset.part =
          ingredient.part;

        button.addEventListener(
          "click",
          () => {
            selectIngredient(
              ingredient.part
            );
          }
        );

        ingredientButtons.appendChild(
          button
        );
      }
    );

    showScreen("dish");

    showDishStatus(
      detailReady
        ? ""
        : detailFailed
          ? "House Salad 3D model could not load."
          : "Loading House Salad..."
    );

    detailViewer.setAttribute(
      "auto-rotate",
      ""
    );

    if (
      !detailViewer.getAttribute(
        "src"
      )
    ) {
      detailViewer.setAttribute(
        "src",
        SALAD_URL
      );
    }
  }

  backToMenu.addEventListener(
    "click",
    () => {
      state.profileMenuOpen = false;

      hideHotspot();

      showScreen("menu");
      renderMenu();
    }
  );


  /* ==========================================
     INITIALIZATION
     ========================================== */

  renderUsers();

});
