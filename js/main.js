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
  const messengerUrl = fbUrl
    ? "https://m.me/" + fbUrl.replace(/\/+$/, "").split("/").pop()
    : "";
  setLink("messenger-cta", messengerUrl, "প্রথমে js/config.js ফাইলে Facebook Page URL বসান।");

  document.querySelectorAll("[data-tour]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const tourName = link.getAttribute("data-tour") || "একটি ট্যুর";
      const message = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " +
        tourName + " ট্যুর সম্পর্কে জানতে চাই। তারিখ, মূল্য ও বিস্তারিত জানাবেন।";
      const url = whatsappUrl(message);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else alert("প্রথমে js/config.js ফাইলে সঠিক WhatsApp নম্বর বসান।");
    });
  });

  function loadToursFromAPI() {
    const apiBase = (config.apiBaseUrl || "").replace(/\/+$/, "");
    const dayGrid = document.getElementById("day-tour-grid");
    const relaxGrid = document.getElementById("relax-tour-grid");
    if (!apiBase || (!dayGrid && !relaxGrid)) return;

    function showMessage(grid, message) {
      if (!grid) return;
      const status = document.createElement("p");
      status.className = "tour-loading";
      status.textContent = message;
      grid.replaceChildren(status);
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
        img.onerror = function () { imageBox.classList.add("live-tour-image-empty"); imageBox.replaceChildren(); imageBox.textContent = "RANGTULI JOURNEYS"; };
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

      const book = document.createElement("a");
      book.className = "button button-dark live-tour-book";
      const tourName = value(tour, "Tour Name") || "একটি ট্যুর";
      book.href = whatsappUrl("আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " +
        tourName + " সম্পর্কে জানতে চাই। তারিখ, মূল্য ও বিস্তারিত জানাবেন।") || "#contact";
      book.target = "_blank";
      book.rel = "noopener noreferrer";
      book.textContent = "বিস্তারিত ও বুকিং ↗";
      body.appendChild(book);

      card.appendChild(body);
      return card;
    }

    function render(grid, tours, emptyMessage) {
      if (!grid) return;
      grid.replaceChildren();
      const visibleTours = tours.filter(function (tour) {
        const status = value(tour, "Website Status").toLowerCase();
        return !status || ["published", "publish", "live", "active", "প্রকাশিত"].includes(status);
      });

      if (!visibleTours.length) {
        showMessage(grid, emptyMessage);
        return;
      }
      visibleTours.forEach(function (tour) { grid.appendChild(createTourCard(tour)); });
    }

    fetch(apiBase + "/api/tours", {
      method: "GET",
      headers: { "Accept": "application/json" }
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Tours API returned " + response.status);
        return response.json();
      })
      .then(function (data) {
        render(dayGrid, Array.isArray(data.dayTours) ? data.dayTours : [],
          "এই মুহূর্তে কোনো ডে ট্যুর প্রকাশিত নেই।");
        render(relaxGrid, Array.isArray(data.relaxTours) ? data.relaxTours : [],
          "এই মুহূর্তে কোনো রিল্যাক্স ট্যুর প্রকাশিত নেই।");
      })
      .catch(function () {
        showMessage(dayGrid, "ট্যুরের তথ্য এখন লোড করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
        showMessage(relaxGrid, "ট্যুরের তথ্য এখন লোড করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
      });
  }

  loadToursFromAPI();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
