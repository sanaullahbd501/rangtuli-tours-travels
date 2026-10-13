(function () {
  "use strict";
  const config = window.RANGTULI_CONFIG || {};
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      menuButton.setAttribute("aria-label", open ? "মেনু খুলুন" : "মেনু বন্ধ করুন");
      nav.classList.toggle("open", !open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "মেনু খুলুন");
      });
    });
  }

  function text(tour, key) {
    const value = tour && tour[key];
    return value == null ? "" : String(value).trim();
  }
  function whatsappUrl(message) {
    const number = (config.whatsappNumber || "").replace(/\D/g, "");
    return number.length >= 10 ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message) : "";
  }
  function messengerUrl() {
    const page = config.facebookPageUrl || "";
    if (!page) return "";
    const slug = page.replace(/\/+$/, "").split("/").pop();
    return slug ? "https://m.me/" + slug : "";
  }
  function setLink(id, url, fallback) {
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
        alert(fallback || "যোগাযোগের তথ্য পাওয়া যায়নি।");
      });
    }
  }

  const generalMessage = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের ট্যুর সম্পর্কে জানতে চাই।";
  setLink("whatsapp-cta", whatsappUrl(generalMessage), "js/config.js ফাইলে WhatsApp নম্বর যাচাই করুন।");
  setLink("whatsapp-float", whatsappUrl(generalMessage), "js/config.js ফাইলে WhatsApp নম্বর যাচাই করুন।");
  setLink("messenger-cta", messengerUrl(), "js/config.js ফাইলে Facebook Page URL যাচাই করুন।");

  // Inline details panel: expands within the existing card, preserving the homepage theme.
  function addDetail(parent, label, key, tour) {
    const value = text(tour, key);
    if (!value) return;
    const item = document.createElement("div");
    item.className = "tour-inline-detail-item";
    const heading = document.createElement("h4");
    heading.textContent = label;
    const content = document.createElement("p");
    content.textContent = value;
    item.append(heading, content);
    parent.appendChild(item);
  }

  function renderDetails(card, tour) {
    const existing = card.querySelector(".tour-inline-details");
    if (existing) {
      existing.remove();
      const button = card.querySelector(".live-tour-details");
      if (button) {
        button.textContent = "বিস্তারিত দেখুন";
        button.setAttribute("aria-expanded", "false");
      }
      return;
    }

    const panel = document.createElement("section");
    panel.className = "tour-inline-details";
    panel.setAttribute("aria-label", "ট্যুর প্যাকেজের বিস্তারিত");
    const heading = document.createElement("h4");
    heading.className = "tour-inline-heading";
    heading.textContent = "প্যাকেজের বিস্তারিত";
    panel.appendChild(heading);

    [
      ["বিস্তারিত", "Description"],
      ["সময়সূচি", "Schedule"],
      ["সময়কাল", "Duration"],
      ["ভ্রমণ পরিকল্পনা", "Itinerary"],
      ["প্যাকেজে যা অন্তর্ভুক্ত", "Included"],
      ["প্যাকেজে যা অন্তর্ভুক্ত নয়", "Excluded"],
      ["থাকা / রুমের ব্যবস্থা", "Room/Stay Options"],
      ["পিকআপ পয়েন্ট", "Pickup Points (comma-separated)"],
      ["বিশেষ নির্দেশনা", "Special Occasion Notes"],
      ["বুকিং অ্যামাউন্ট", "Booking Amount"],
      ["বুকিং পেমেন্টের তথ্য", "Booking Payment Details"],
      ["যোগাযোগ", "Contact Numbers (comma-separated)"]
    ].forEach(function (pair) { addDetail(panel, pair[0], pair[1], tour); });

    const name = text(tour, "Tour Name") || "একটি ট্যুর";
    const price = text(tour, "Price Options");
    const message = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " + name +
      " সম্পর্কে জানতে চাই।" + (price ? "\nপ্যাকেজের মূল্য: " + price : "") +
      "\nদয়া করে তারিখ, প্রাপ্যতা ও বুকিংয়ের নিয়ম জানাবেন।";

    const actions = document.createElement("div");
    actions.className = "tour-inline-actions";
    const wa = document.createElement("a");
    wa.className = "button button-dark";
    wa.textContent = "WhatsApp-এ বুকিং ↗";
    wa.href = whatsappUrl(message) || "#contact";
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    actions.appendChild(wa);

    const messenger = document.createElement("a");
    messenger.className = "button button-outline";
    messenger.textContent = "Messenger-এ যোগাযোগ ↗";
    messenger.href = messengerUrl() || "#contact";
    messenger.target = "_blank";
    messenger.rel = "noopener noreferrer";
    if (!messengerUrl()) messenger.addEventListener("click", function (e) {
      e.preventDefault();
      alert("js/config.js ফাইলে সঠিক Facebook Page URL বসান।");
    });
    actions.appendChild(messenger);
    panel.appendChild(actions);

    const button = card.querySelector(".live-tour-details");
    if (button) {
      button.textContent = "বিস্তারিত বন্ধ করুন ↑";
      button.setAttribute("aria-expanded", "true");
      button.insertAdjacentElement("afterend", panel);
    } else {
      card.querySelector(".live-tour-body").appendChild(panel);
    }
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function imageUrl(tour) {
    return text(tour, "Image URLs (comma-separated)").split(",").map(s => s.trim())
      .find(s => /^https?:\/\//i.test(s)) || "";
  }
  function makeText(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    return element;
  }
  function createCard(tour) {
    const card = document.createElement("article");
    card.className = "live-tour-card";
    const image = document.createElement("div");
    image.className = "live-tour-image";
    const src = imageUrl(tour);
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = text(tour, "Tour Name") || "Rangtuli tour";
      img.loading = "lazy";
      img.onerror = function () {
        image.classList.add("live-tour-image-empty");
        image.replaceChildren();
        image.textContent = "RANGTULI JOURNEYS";
      };
      image.appendChild(img);
    } else {
      image.classList.add("live-tour-image-empty");
      image.textContent = "RANGTULI JOURNEYS";
    }
    card.appendChild(image);

    const body = document.createElement("div");
    body.className = "live-tour-body";
    const category = text(tour, "Tour Category");
    if (category) body.appendChild(makeText("span", "live-tour-tag", category));
    body.appendChild(makeText("h3", "live-tour-title", text(tour, "Tour Name") || "নতুন ট্যুর"));
    const destinations = text(tour, "Destinations");
    if (destinations) body.appendChild(makeText("p", "live-tour-destination", destinations));
    const description = text(tour, "Description");
    if (description) body.appendChild(makeText("p", "live-tour-description", description));

    const meta = document.createElement("div");
    meta.className = "live-tour-meta";
    [text(tour, "Duration"), text(tour, "Schedule")].filter(Boolean)
      .forEach(function (value) { meta.appendChild(makeText("span", "", value)); });
    if (meta.childElementCount) body.appendChild(meta);
    const price = text(tour, "Price Options");
    if (price) body.appendChild(makeText("p", "live-tour-price", price));

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "button button-outline live-tour-details";
    detailsButton.textContent = "বিস্তারিত দেখুন ↓";
    detailsButton.setAttribute("aria-expanded", "false");
    detailsButton.addEventListener("click", function () { renderDetails(card, tour); });
    body.appendChild(detailsButton);

    const actions = document.createElement("div");
    actions.className = "live-tour-actions";
    const name = text(tour, "Tour Name") || "একটি ট্যুর";
    const message = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " + name + " সম্পর্কে জানতে চাই।";
    const wa = document.createElement("a");
    wa.className = "button button-dark live-tour-book";
    wa.textContent = "WhatsApp বুকিং ↗";
    wa.href = whatsappUrl(message) || "#contact";
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    actions.appendChild(wa);
    const msgr = document.createElement("a");
    msgr.className = "button button-outline live-tour-messenger";
    msgr.textContent = "Messenger ↗";
    msgr.href = messengerUrl() || "#contact";
    msgr.target = "_blank";
    msgr.rel = "noopener noreferrer";
    if (!messengerUrl()) msgr.addEventListener("click", function (e) {
      e.preventDefault();
      alert("js/config.js ফাইলে সঠিক Facebook Page URL বসান।");
    });
    actions.appendChild(msgr);
    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function showMessage(grid, message, error) {
    if (!grid) return;
    grid.replaceChildren(makeText("p", "tour-loading" + (error ? " tour-error" : ""), message));
  }
  function render(grid, tours, emptyMessage, moreButton) {
    if (!grid) return;
    grid.replaceChildren();
    const published = shuffle(tours.filter(function (tour) {
      const status = text(tour, "Website Status").toLowerCase();
      return !status || ["published", "publish", "live", "active", "প্রকাশিত"].includes(status);
    }));
    if (!published.length) {
      showMessage(grid, emptyMessage, false);
      if (moreButton) moreButton.hidden = true;
      return;
    }
    const initialCount = 3;
    published.forEach(function (tour, index) {
      const card = createCard(tour);
      if (index >= initialCount) card.classList.add("is-hidden-by-more");
      grid.appendChild(card);
    });
    if (moreButton) {
      moreButton.hidden = published.length <= initialCount;
      moreButton.textContent = "সব ট্যুর দেখুন ↓";
      moreButton.onclick = function () {
        const hidden = grid.querySelectorAll(".is-hidden-by-more");
        if (hidden.length) {
          hidden.forEach(el => el.classList.remove("is-hidden-by-more"));
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

  const apiBase = (config.apiBaseUrl || "").replace(/\/+$/, "");
  const dayGrid = document.getElementById("day-tour-grid");
  const relaxGrid = document.getElementById("relax-tour-grid");
  const dayMore = document.getElementById("day-tour-more");
  const relaxMore = document.getElementById("relax-tour-more");
  if (apiBase && (dayGrid || relaxGrid)) {
    fetch(apiBase + "/api/tours", { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("API HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        render(dayGrid, Array.isArray(data.dayTours) ? data.dayTours : [],
          "ডে ট্যুরের তথ্য পাওয়া যায়নি। Google Sheet-এর Website Status ও sync যাচাই করুন।", dayMore);
        render(relaxGrid, Array.isArray(data.relaxTours) ? data.relaxTours : [],
          "রিল্যাক্স ট্যুরের তথ্য পাওয়া যায়নি। Google Sheet-এর Website Status ও sync যাচাই করুন।", relaxMore);
      })
      .catch(function (error) {
        console.error("Rangtuli API error:", error);
        showMessage(dayGrid, "ট্যুর লোড হয়নি। API সংযোগ পরীক্ষা করুন।", true);
        showMessage(relaxGrid, "ট্যুর লোড হয়নি। API সংযোগ পরীক্ষা করুন।", true);
        if (dayMore) dayMore.hidden = true;
        if (relaxMore) relaxMore.hidden = true;
      });
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
