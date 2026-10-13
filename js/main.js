(function () {
  "use strict";

  const config = window.RANGTULI_CONFIG || {};
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "মেনু খুলুন" : "মেনু বন্ধ করুন");
      nav.classList.toggle("open", !isOpen);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "মেনু খুলুন");
      });
    });
  }

  function whatsappUrl(message) {
    const number = (config.whatsappNumber || "").replace(/\D/g, "");
    if (!number || number.length < 10) return "";
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
  }

  function setLink(id, url, fallbackMessage) {
    const element = document.getElementById(id);
    if (!element) return;
    if (url) {
      element.href = url;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    } else {
      element.href = "#contact";
      element.addEventListener("click", function (event) {
        event.preventDefault();
        alert(fallbackMessage || "যোগাযোগের তথ্য এখন পাওয়া যাচ্ছে না।");
      });
    }
  }

  const generalMessage = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের ট্যুর সম্পর্কে জানতে চাই।";
  setLink("whatsapp-cta", whatsappUrl(generalMessage), "প্রথমে js/config.js ফাইলে সঠিক WhatsApp নম্বর বসান।");
  setLink("whatsapp-float", whatsappUrl(generalMessage), "প্রথমে js/config.js ফাইলে সঠিক WhatsApp নম্বর বসান।");

  const fbUrl = config.facebookPageUrl || "";
  const messengerUrl = fbUrl ? "https://m.me/" + fbUrl.replace(/\/+$/, "").split("/").pop() : "";
  setLink("messenger-cta", messengerUrl, "প্রথমে js/config.js ফাইলে Facebook Page URL বসান।");

  document.querySelectorAll("[data-tour]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const tourName = link.getAttribute("data-tour") || "একটি ট্যুর";
      const url = whatsappUrl("আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " +
        tourName + " ট্যুর সম্পর্কে জানতে চাই। তারিখ, মূল্য ও বিস্তারিত জানাবেন।");
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else alert("প্রথমে js/config.js ফাইলে সঠিক WhatsApp নম্বর বসান।");
    });
  });

  function loadToursFromAPI() {
    const apiBase = (config.apiBaseUrl || "").replace(/\/+$/, "");
    const dayGrid = document.getElementById("day-tour-grid");
    const relaxGrid = document.getElementById("relax-tour-grid");
    if (!apiBase || (!dayGrid && !relaxGrid)) return;

    function showMessage(grid, message, error) {
      if (!grid) return;
      const node = document.createElement("p");
      node.className = "tour-loading" + (error ? " tour-error" : "");
      node.textContent = message;
      grid.replaceChildren(node);
    }

    function value(tour, key) {
      const item = tour && tour[key];
      return item == null ? "" : String(item).trim();
    }

    function imageUrl(tour) {
      const raw = value(tour, "Image URLs (comma-separated)");
      return raw.split(",").map(function (item) { return item.trim(); })
        .find(function (item) { return /^https?:\/\//i.test(item); }) || "";
    }

    function makeText(tagName, className, text) {
      const node = document.createElement(tagName);
      if (className) node.className = className;
      node.textContent = text;
      return node;
    }

    function createTourCard(tour) {
      const card = document.createElement("article");
      card.className = "live-tour-card";
      const imgUrl = imageUrl(tour);
      const imageBox = document.createElement("div");
      imageBox.className = "live-tour-image" + (imgUrl ? "" : " live-tour-image-empty");
      if (imgUrl) {
        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = value(tour, "Tour Name") || "Rangtuli tour";
        img.loading = "lazy";
        img.onerror = function () {
          imageBox.classList.add("live-tour-image-empty");
          imageBox.replaceChildren();
          imageBox.textContent = "RANGTULI JOURNEYS";
        };
        imageBox.appendChild(img);
      } else {
        imageBox.textContent = "RANGTULI JOURNEYS";
      }
      card.appendChild(imageBox);

      const body = document.createElement("div");
      body.className = "live-tour-body";
      const category = value(tour, "Tour Category");
      if (category) body.appendChild(makeText("span", "live-tour-tag", category));
      body.appendChild(makeText("h3", "", value(tour, "Tour Name") || "নতুন ট্যুর"));

      const destinations = value(tour, "Destinations");
      if (destinations) body.appendChild(makeText("p", "live-tour-destination", destinations));
      const description = value(tour, "Description");
      if (description) body.appendChild(makeText("p", "live-tour-description", description));

      const meta = document.createElement("div");
      meta.className = "live-tour-meta";
      ["Duration", "Schedule"].forEach(function (key) {
        const text = value(tour, key);
        if (text) meta.appendChild(makeText("span", "", text));
      });
      if (meta.childElementCount) body.appendChild(meta);

      const price = value(tour, "Price Options");
      if (price) body.appendChild(makeText("p", "live-tour-price", price));

      const name = value(tour, "Tour Name") || "একটি ট্যুর";
      const book = document.createElement("a");
      book.className = "button button-dark live-tour-book";
      book.href = whatsappUrl("আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " +
        name + " সম্পর্কে জানতে চাই। তারিখ, মূল্য ও বিস্তারিত জানাবেন।") || "#contact";
      book.target = "_blank";
      book.rel = "noopener noreferrer";
      book.textContent = "বিস্তারিত ও বুকিং ↗";
      body.appendChild(book);
      card.appendChild(body);
      return card;
    }

    function shuffle(items) {
      const arr = items.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function render(grid, tours, emptyMessage, moreButton) {
      if (!grid) return;
      grid.replaceChildren();
      const visibleTours = shuffle(tours.filter(function (tour) {
        const status = value(tour, "Website Status").toLowerCase();
        return !status || ["published", "publish", "live", "active", "প্রকাশিত"].includes(status);
      }));

      if (!visibleTours.length) {
        showMessage(grid, emptyMessage, false);
        if (moreButton) moreButton.hidden = true;
        return;
      }

      const initialCount = 3;
      visibleTours.forEach(function (tour, index) {
        const card = createTourCard(tour);
        if (index >= initialCount) card.classList.add("is-hidden-by-more");
        grid.appendChild(card);
      });

      if (moreButton) {
        moreButton.hidden = visibleTours.length <= initialCount;
        moreButton.textContent = "সব ট্যুর দেখুন ↓";
        moreButton.onclick = function () {
          const hiddenCards = grid.querySelectorAll(".is-hidden-by-more");
          if (hiddenCards.length) {
            hiddenCards.forEach(function (card) { card.classList.remove("is-hidden-by-more"); });
            moreButton.textContent = "কম দেখুন ↑";
          } else {
            Array.from(grid.children).forEach(function (card, index) {
              if (index >= initialCount) card.classList.add("is-hidden-by-more");
            });
            moreButton.textContent = "সব ট্যুর দেখুন ↓";
            grid.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        };
      }
    }

    const dayMore = document.getElementById("day-tour-more");
    const relaxMore = document.getElementById("relax-tour-more");

    fetch(apiBase + "/api/tours", { method: "GET", headers: { "Accept": "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data || typeof data !== "object") throw new Error("Invalid API data");
        render(dayGrid, Array.isArray(data.dayTours) ? data.dayTours : [],
          "ডে ট্যুরের তথ্য পাওয়া যায়নি। Google Sheet থেকে সিঙ্ক ও Website Status যাচাই করুন।", dayMore);
        render(relaxGrid, Array.isArray(data.relaxTours) ? data.relaxTours : [],
          "রিল্যাক্স ট্যুরের তথ্য পাওয়া যায়নি। Google Sheet থেকে সিঙ্ক ও Website Status যাচাই করুন।", relaxMore);
      })
      .catch(function (error) {
        console.error("Rangtuli tour API error:", error);
        showMessage(dayGrid, "ট্যুর লোড হয়নি। API/Worker সংযোগ পরীক্ষা করুন।", true);
        showMessage(relaxGrid, "ট্যুর লোড হয়নি। API/Worker সংযোগ পরীক্ষা করুন।", true);
        if (dayMore) dayMore.hidden = true;
        if (relaxMore) relaxMore.hidden = true;
      });
  }

  loadToursFromAPI();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
