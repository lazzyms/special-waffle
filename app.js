// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/special-waffle/sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered successfully:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}

// Location Detection and Highlighting
function requestLocationAndHighlight() {
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      console.log(`User location: ${userLat}, ${userLon}`);
      highlightNearbyPlaces(userLat, userLon);
    },
    (error) => {
      console.error("Error getting location:", error.message);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          console.log("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          console.log("The request to get user location timed out.");
          break;
        default:
          console.log("An unknown error occurred.");
          break;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula to calculate distance in kilometers
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function highlightNearbyPlaces(userLat, userLon) {
  // Get today's date in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  console.log(`🔍 Looking for activities on: ${todayStr}`);

  // Find today's card
  const todayCard = document.querySelector(
    `.day-card[data-date="${todayStr}"]`,
  );
  if (!todayCard) {
    console.log(`❌ No activities scheduled for today (${todayStr}).`);
    console.log(
      "Available dates:",
      Array.from(document.querySelectorAll(".day-card")).map((c) =>
        c.getAttribute("data-date"),
      ),
    );
    return;
  }

  console.log(`✓ Found today's card for ${todayStr}`);

  // Get all stops in today's card
  const stops = todayCard.querySelectorAll(".stop");
  console.log(`Found ${stops.length} stops for today`);

  stops.forEach((stop, index) => {
    const mapLinks = stop.querySelectorAll(".map-btn");
    const stopName = stop.querySelector(".stop-name")?.textContent;
    console.log(`Checking stop ${index + 1}: ${stopName}`);

    // Extract location from Google Maps link
    mapLinks.forEach((link) => {
      if (link.href.includes("google.com/maps")) {
        let locationName = null;
        let coords = null;

        // Handle search URLs with query parameter
        const urlParams = new URLSearchParams(link.href.split("?")[1]);
        const query = urlParams.get("query");

        if (query) {
          locationName = query;
        } else if (link.href.includes("/place/")) {
          // Handle /place/ URLs - extract name and possibly coordinates
          const placeMatch = link.href.match(/\/place\/([^\/]+)/);
          if (placeMatch) {
            locationName = decodeURIComponent(
              placeMatch[1].replace(/\+/g, " "),
            );
          }

          // Try to extract coordinates from @lat,lon format
          const coordMatch = link.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordMatch) {
            coords = {
              lat: parseFloat(coordMatch[1]),
              lon: parseFloat(coordMatch[2]),
            };
          }
        }

        if (locationName) {
          checkLocationProximity(userLat, userLon, locationName, stop, coords);
        }
      }
    });
  });
}

// Location database for major Dubai/Abu Dhabi landmarks
const locationCoordinates = {
  Home: { lat: 21.7637, lon: 72.1315 },
  "Sheer Apartments": { lat: 54.363482, lon: 24.455676 },
  "Louvre Abu Dhabi": { lat: 24.5338, lon: 54.3984 },
  "Sheikh Zayed Grand Mosque": { lat: 24.4128, lon: 54.4747 },
  "Heritage Village Abu Dhabi": { lat: 24.4833, lon: 54.3553 },
  "Burj Khalifa": { lat: 25.1972, lon: 55.2744 },
  "Dubai Frame": { lat: 25.2356, lon: 55.3002 },
  "The Dubai Mall": { lat: 25.1972, lon: 55.2796 },
  "Dubai Mall": { lat: 25.1972, lon: 55.2796 },
  "Marina Beach Dubai": { lat: 25.0804, lon: 55.1394 },
  "The Green Planet Dubai": { lat: 25.2176, lon: 55.2601 },
  "Mall of the Emirates": { lat: 25.1182, lon: 55.2005 },
  "Bluewaters Island": { lat: 25.0803, lon: 55.1219 },
  "Ain Dubai": { lat: 25.0803, lon: 55.1219 },
  "Palm Jumeirah Monorail": { lat: 25.1124, lon: 55.139 },
  "Aya Universe": { lat: 25.2171, lon: 55.2828 },
  "Museum of the Future": { lat: 25.2195, lon: 55.2804 },
  "Ibn Battuta Mall": { lat: 25.0443, lon: 55.1173 },
  "Madame Tussauds Dubai": { lat: 25.0803, lon: 55.1219 },
  "Dubai International Airport": { lat: 25.2532, lon: 55.3657 },
};

function checkLocationProximity(
  userLat,
  userLon,
  placeName,
  stopElement,
  directCoords = null,
) {
  const normalizedPlaceName = placeName
    .replace(/\+/g, " ")
    .replace(/%26/g, "&");
  console.log(`  🔎 Searching for: "${normalizedPlaceName}"`);

  let placeCoords = directCoords;

  // If we don't have direct coordinates from URL, search in our database
  if (!placeCoords) {
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (
        normalizedPlaceName.includes(key) ||
        key.includes(normalizedPlaceName)
      ) {
        placeCoords = coords;
        console.log(
          `  ✓ Matched with: "${key}" at (${coords.lat}, ${coords.lon})`,
        );
        break;
      }
    }
  } else {
    console.log(
      `  ✓ Using coordinates from URL: (${directCoords.lat}, ${directCoords.lon})`,
    );
  }

  if (placeCoords) {
    const distance = calculateDistance(
      userLat,
      userLon,
      placeCoords.lat,
      placeCoords.lon,
    );
    console.log(
      `  📏 Distance to ${normalizedPlaceName}: ${distance.toFixed(2)} km`,
    );

    // Highlight if within 1km (adjust threshold as needed)
    if (distance <= 1.0) {
      const contentCol = stopElement.querySelector(".content-col");
      if (contentCol) {
        contentCol.classList.add("nearby");
        console.log(`  🎯 HIGHLIGHTED: ${normalizedPlaceName}`);
      }
    } else {
      console.log(`  ⚠️ Too far (${distance.toFixed(2)} km > 1.0 km)`);
    }
  } else {
    console.log(`  ❌ No coordinates found for "${normalizedPlaceName}"`);
  }
}

// Install prompt functionality
let deferredPrompt;
const installBanner = document.getElementById("install-banner");
const installBtn = document.getElementById("install-btn");
const dismissBtn = document.getElementById("dismiss-btn");
const INSTALL_DISMISSED_KEY = "pwa_install_dismissed";

// Check if already running as PWA or if user dismissed the banner
const isPWAInstalled =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone ||
  document.referrer.includes("android-app://");

const isInstallDismissed =
  localStorage.getItem(INSTALL_DISMISSED_KEY) === "true";

// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// For iOS devices, show install instructions if not installed
if (isIOS && isSafari && !isPWAInstalled && !isInstallDismissed) {
  // Delay showing banner slightly for better UX
  setTimeout(() => {
    installBanner.classList.add("show");
    installBanner.classList.add("ios-mode");
    // Update the text for iOS
    const installText = installBanner.querySelector(".install-text");
    installText.innerHTML = `
      <h3>Add to Home Screen</h3>
      <p>Tap <span style="font-size: 18px; vertical-align: middle;">⎙</span> (Share) then "Add to Home Screen"</p>
    `;
    // Hide the install button for iOS, only show dismiss
    installBtn.style.display = "none";
  }, 1000);
}

// For Android/Chrome
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Only show banner if not installed and not dismissed
  if (!isPWAInstalled && !isInstallDismissed) {
    // Delay showing banner slightly for better UX
    setTimeout(() => {
      installBanner.classList.add("show");
    }, 1000);
  }

  console.log("PWA install prompt ready");
});

// Install button click handler
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) {
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user's response
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to install prompt: ${outcome}`);

  // Hide the banner
  installBanner.classList.remove("show");

  // Clear the deferred prompt
  deferredPrompt = null;
});

// Dismiss button click handler
dismissBtn.addEventListener("click", () => {
  installBanner.classList.remove("show");
  // Save dismissal to localStorage
  localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
  console.log("Install banner dismissed by user");
});

// Listen for successful installation
window.addEventListener("appinstalled", () => {
  console.log("PWA was installed successfully");
  installBanner.classList.remove("show");
  localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
});

// Date-based collapsible functionality
document.addEventListener("DOMContentLoaded", () => {
  const dayCards = document.querySelectorAll(".day-card");
  const STORAGE_KEY = "trip_collapsed_state";

  // Get stored collapse states
  let savedStates = {};
  try {
    savedStates = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (e) {
    console.error("Error parsing saved states:", e);
  }

  // Initialize cards based on date and saved state
  dayCards.forEach((card) => {
    const cardDate = card.getAttribute("data-date");
    if (!cardDate) return;

    // Get current date at midnight for comparison (dynamically checked each time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayDate = new Date(cardDate + "T00:00:00");
    const isPastDay = dayDate < today;

    // Check if user manually toggled this card
    const cardId = cardDate;
    const hasUserPreference = savedStates.hasOwnProperty(cardId);

    // Determine collapsed state:
    // - If user has toggled it before, use their preference
    // - Otherwise, collapse if it's a past day
    const shouldBeCollapsed = hasUserPreference
      ? savedStates[cardId]
      : isPastDay;

    if (shouldBeCollapsed) {
      card.classList.add("collapsed");
    }

    // Add click handler to day header
    const header = card.querySelector(".day-header");
    header.addEventListener("click", () => {
      const isCollapsed = card.classList.toggle("collapsed");

      // Save user's preference
      savedStates[cardId] = isCollapsed;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStates));
      } catch (e) {
        console.error("Error saving state:", e);
      }
    });
  });

  // Request location on page load
  requestLocationAndHighlight();

  // Detect if running as PWA (standalone mode)
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone ||
    document.referrer.includes("android-app://");

  // Hide splash screen on first launch of PWA (not on refresh or background return)
  const SPLASH_SHOWN_KEY = "splash_shown_in_session";
  const splashAlreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY);

  if (isPWA) {
    const splashScreen = document.getElementById("splash-screen");

    // If splash already shown in this session, hide it immediately
    if (splashAlreadyShown) {
      splashScreen.style.display = "none";
    } else {
      // Mark splash as shown for this session
      sessionStorage.setItem(SPLASH_SHOWN_KEY, "true");

      // Hide splash after load
      window.addEventListener("load", () => {
        setTimeout(() => {
          splashScreen.classList.add("fade-out");
          setTimeout(() => {
            splashScreen.style.display = "none";
          }, 500);
        }, 2500);
      });
    }
  }
});
