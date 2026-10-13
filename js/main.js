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

  function whatsappUrl(message) {
    const number = (config.whatsappNumber || "").replace(/\D/g, "");
    return number.length >= 10 ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message) : "";
  }
  function setLink(id, url, fallback) {
    const el = document.getElementById(id);
    if (!el) return;
    if (url) { el.href = url; el.target = "_blank"; el.rel = "noopener noreferrer"; }
    else {
      el.href = "#contact";
      el.addEventListener("click", function (e) {
        e.preventDefault(); alert(fallback || "যোগাযোগের তথ্য পাওয়া যায়নি।");
      });
    }
  }
  const generalMessage = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের ট্যুর সম্পর্কে জানতে চাই।";
  setLink("whatsapp-cta", whatsappUrl(generalMessage), "js/config.js ফাইলে WhatsApp নম্বর যাচাই করুন।");
  setLink("whatsapp-float", whatsappUrl(generalMessage), "js/config.js ফাইলে WhatsApp নম্বর যাচাই করুন।");
  const fbUrl = config.facebookPageUrl || "";
  setLink("messenger-cta", fbUrl ? "https://m.me/" + fbUrl.replace(/\/+$/, "").split("/").pop() : "", "js/config.js ফাইলে Facebook Page URL যাচাই করুন।");

  const modal = document.createElement("div");
  modal.className = "tour-modal";
  modal.id = "tour-detail-modal";
  modal.hidden = true;
  modal.innerHTML = '<div class="tour-modal-backdrop" data-modal-close></div><section class="tour-modal-panel" role="dialog" aria-modal="true" aria-labelledby="tour-modal-title"><button class="tour-modal-close" type="button" aria-label="বন্ধ করুন" data-modal-close>×</button><div class="tour-modal-content"></div></section>';
  document.body.appendChild(modal);
  const modalContent = modal.querySelector(".tour-modal-content");
  let lastFocused = null;

  function text(tour, key) {
    const v = tour && tour[key];
    return v == null ? "" : String(v).trim();
  }
  function addDetail(parent, label, key, tour) {
    const val = text(tour, key);
    if (!val) return;
    const section = document.createElement("div");
    section.className = "tour-detail-item";
    const heading = document.createElement("h4");
    heading.textContent = label;
    const content = document.createElement("p");
    content.textContent = val;
    section.append(heading, content);
    parent.appendChild(section);
  }
  function showDetails(tour) {
    lastFocused = document.activeElement;
    modalContent.replaceChildren();
    const name = text(tour, "Tour Name") || "ট্যুরের বিস্তারিত";
    const title = document.createElement("h2");
    title.id = "tour-modal-title";
    title.textContent = name;
    modalContent.appendChild(title);

    const price = text(tour, "Price Options");
    if (price) {
      const p = document.createElement("p");
      p.className = "tour-modal-price";
      p.textContent = price;
      modalContent.appendChild(p);
    }
    [
      ["গন্তব্য", "Destinations"],
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
    ].forEach(function (pair) { addDetail(modalContent, pair[0], pair[1], tour); });

    const actions = document.createElement("div");
    actions.className = "tour-modal-actions";
    const booking = document.createElement("a");
    booking.className = "button button-dark";
    booking.textContent = "WhatsApp-এ বুকিং / জিজ্ঞাসা ↗";
    booking.href = whatsappUrl("আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " + name + " সম্পর্কে জানতে চাই।\n\n" +
      (price ? "প্যাকেজের মূল্য: " + price + "\n" : "") +
      "দয়া করে তারিখ, আসন/রুমের প্রাপ্যতা ও বুকিংয়ের নিয়ম জানাবেন।") || "#contact";
    booking.target = "_blank";
    booking.rel = "noopener noreferrer";
    actions.appendChild(booking);
    modalContent.appendChild(actions);
    modal.hidden = false;
    document.body.classList.add("tour-modal-open");
    modal.querySelector(".tour-modal-close").focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("tour-modal-open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }
  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-modal-close]")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  function value(tour, key) { return text(tour, key); }
  function imageUrl(tour) {
    return value(tour, "Image URLs (comma-separated)").split(",").map(s => s.trim())
      .find(s => /^https?:\/\//i.test(s)) || "";
  }
  function makeText(tag, cls, content) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    el.textContent = content;
    return el;
  }
  function createCard(tour) {
    const card = document.createElement("article");
    card.className = "live-tour-card";
    const imageWrap = document.createElement("div");
    imageWrap.className = "live-tour-image";
    const src = imageUrl(tour);
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = value(tour, "Tour Name") || "Rangtuli tour";
      img.loading = "lazy";
      img.onerror = function () {
        imageWrap.classList.add("live-tour-image-empty");
        imageWrap.replaceChildren();
        imageWrap.textContent = "RANGTULI JOURNEYS";
      };
      imageWrap.appendChild(img);
    } else {
      imageWrap.classList.add("live-tour-image-empty");
      imageWrap.textContent = "RANGTULI JOURNEYS";
    }
    card.appendChild(imageWrap);

    const body = document.createElement("div");
    body.className = "live-tour-body";
    const category = value(tour, "Tour Category");
    if (category) body.appendChild(makeText("span", "live-tour-tag", category));
    body.appendChild(makeText("h3", "live-tour-title", value(tour, "Tour Name") || "নতুন ট্যুর"));
    const destination = value(tour, "Destinations");
    if (destination) body.appendChild(makeText("p", "live-tour-destination", destination));
    const desc = value(tour, "Description");
    if (desc) body.appendChild(makeText("p", "live-tour-description", desc));
    const duration = value(tour, "Duration");
    const schedule = value(tour, "Schedule");
    const meta = document.createElement("div");
    meta.className = "live-tour-meta";
    [duration, schedule].filter(Boolean).forEach(s => meta.appendChild(makeText("span", "", s)));
    if (meta.childElementCount) body.appendChild(meta);
    const price = value(tour, "Price Options");
    if (price) body.appendChild(makeText("p", "live-tour-price", price));

    const actions = document.createElement("div");
    actions.className = "live-tour-actions";
    const details = document.createElement("button");
    details.type = "button";
    details.className = "button button-outline live-tour-details";
    details.textContent = "বিস্তারিত দেখুন";
    details.addEventListener("click", function () { showDetails(tour); });
    const book = document.createElement("a");
    book.className = "button button-dark live-tour-book";
    book.href = whatsappUrl("আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " +
      (value(tour, "Tour Name") || "একটি ট্যুর") + " সম্পর্কে জানতে চাই।") || "#contact";
    book.target = "_blank";
    book.rel = "noopener noreferrer";
    book.textContent = "বুকিং ↗";
    actions.append(details, book);
    body.appendChild(actions);
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
  function showMessage(grid, message, error) {
    if (!grid) return;
    const p = makeText("p", "tour-loading" + (error ? " tour-error" : ""), message);
    grid.replaceChildren(p);
  }
  function render(grid, tours, emptyMessage, moreButton) {
    if (!grid) return;
    grid.replaceChildren();
    const visible = shuffle(tours.filter(function (tour) {
      const status = value(tour, "Website Status").toLowerCase();
      return !status || ["published", "publish", "live", "active", "প্রকাশিত"].includes(status);
    }));
    if (!visible.length) {
      showMessage(grid, emptyMessage, false);
      if (moreButton) moreButton.hidden = true;
      return;
    }
    const initialCount = 3;
    visible.forEach(function (tour, index) {
      const card = createCard(tour);
      if (index >= initialCount) card.classList.add("is-hidden-by-more");
      grid.appendChild(card);
    });
    if (moreButton) {
      moreButton.hidden = visible.length <= initialCount;
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
      .catch(function (err) {
        console.error("Rangtuli API error:", err);
        showMessage(dayGrid, "ট্যুর লোড হয়নি। API সংযোগ পরীক্ষা করুন।", true);
        showMessage(relaxGrid, "ট্যুর লোড হয়নি। API সংযোগ পরীক্ষা করুন।", true);
        if (dayMore) dayMore.hidden = true;
        if (relaxMore) relaxMore.hidden = true;
      });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
