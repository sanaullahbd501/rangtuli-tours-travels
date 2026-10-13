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
    const v = tour && tour[key];
    return v == null ? "" : String(v).trim();
  }
  function waUrl(message) {
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
    const el = document.getElementById(id);
    if (!el) return;
    if (url) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    } else {
      el.href = "#contact";
      el.addEventListener("click", function (e) {
        e.preventDefault();
        alert(fallback || "যোগাযোগের তথ্য পাওয়া যায়নি।");
      });
    }
  }
  const generalMessage = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের ট্যুর সম্পর্কে জানতে চাই।";
  setLink("whatsapp-cta", waUrl(generalMessage), "js/config.js ফাইলে WhatsApp নম্বর যাচাই করুন।");
  setLink("whatsapp-float", waUrl(generalMessage), "js/config.js ফাইলে WhatsApp নম্বর যাচাই করুন।");
  setLink("messenger-cta", messengerUrl(), "js/config.js ফাইলে Facebook Page URL যাচাই করুন।");

  function make(tag, cls, content) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (content !== undefined) el.textContent = content;
    return el;
  }
  function addDetails(parent, label, key, tour) {
    const value = text(tour, key);
    if (!value) return;
    const item = make("div", "tour-inline-detail-item");
    item.append(make("h4", "", label), make("p", "", value));
    parent.appendChild(item);
  }
  function openDetails(card, tour) {
    const existing = card.querySelector(".tour-expanded-details");
    if (existing) {
      existing.remove();
      const trigger = card.querySelector(".live-tour-details");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
        trigger.querySelector(".detail-label").textContent = "বিস্তারিত দেখুন";
        trigger.querySelector(".detail-arrow").textContent = "↗";
      }
      return;
    }
    const panel = make("div", "tour-expanded-details");
    const title = make("h3", "tour-expanded-title", "প্যাকেজের বিস্তারিত");
    panel.appendChild(title);
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
    ].forEach(pair => addDetails(panel, pair[0], pair[1], tour));

    const name = text(tour, "Tour Name") || "একটি ট্যুর";
    const price = text(tour, "Price Options");
    const message = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " + name +
      " সম্পর্কে জানতে চাই।" + (price ? "\nপ্যাকেজের মূল্য: " + price : "") +
      "\nদয়া করে তারিখ, প্রাপ্যতা ও বুকিংয়ের নিয়ম জানাবেন।";
    const actions = make("div", "tour-expanded-actions");
    const wa = make("a", "tour-detail-wa", "WhatsApp-এ বুকিং ↗");
    wa.href = waUrl(message) || "#contact";
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    const ms = make("a", "tour-detail-messenger", "Messenger-এ যোগাযোগ ↗");
    ms.href = messengerUrl() || "#contact";
    ms.target = "_blank";
    ms.rel = "noopener noreferrer";
    if (!messengerUrl()) ms.addEventListener("click", function (e) {
      e.preventDefault();
      alert("js/config.js ফাইলে সঠিক Facebook Page URL বসান।");
    });
    actions.append(wa, ms);
    panel.appendChild(actions);

    const trigger = card.querySelector(".live-tour-details");
    trigger.insertAdjacentElement("afterend", panel);
    trigger.setAttribute("aria-expanded", "true");
    trigger.querySelector(".detail-label").textContent = "বিস্তারিত বন্ধ করুন";
    trigger.querySelector(".detail-arrow").textContent = "↑";
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function imageUrl(tour) {
    return text(tour, "Image URLs (comma-separated)").split(",").map(s => s.trim())
      .find(s => /^https?:\/\//i.test(s)) || "";
  }
  function createCard(tour, index) {
    const card = make("article", "live-tour-card live-tour-photo-card");
    const image = make("div", "live-tour-image");
    const src = imageUrl(tour);
    if (src) {
      const img = make("img");
      img.src = src;
      img.alt = text(tour, "Tour Name") || "Rangtuli tour";
      img.loading = "lazy";
      img.onerror = function () {
        image.classList.add("live-tour-image-empty");
        image.replaceChildren();
        image.appendChild(make("span", "", "RANGTULI JOURNEYS"));
      };
      image.appendChild(img);
    } else {
      image.classList.add("live-tour-image-empty");
      image.appendChild(make("span", "", "RANGTULI JOURNEYS"));
    }
    const shade = make("div", "live-tour-image-shade");
    image.appendChild(shade);
    card.appendChild(image);

    const content = make("div", "live-tour-photo-content");
    content.appendChild(make("span", "live-tour-photo-kicker",
      String(index + 1).padStart(2, "0") + " / " + (text(tour, "Tour Category") || "JOURNEY").toUpperCase()));
    content.appendChild(make("h3", "live-tour-title", text(tour, "Tour Name") || "নতুন ট্যুর"));
    const destination = text(tour, "Destinations");
    if (destination) content.appendChild(make("p", "live-tour-destination", destination));
    const price = text(tour, "Price Options");
    if (price) content.appendChild(make("p", "live-tour-price", price));

    const details = make("button", "live-tour-details");
    details.type = "button";
    details.setAttribute("aria-expanded", "false");
    details.append(make("span", "detail-label", "বিস্তারিত দেখুন"), make("span", "detail-arrow", "↗"));
    details.addEventListener("click", function () { openDetails(card, tour); });
    content.appendChild(details);
    card.appendChild(content);
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
    grid.replaceChildren(make("p", "tour-loading" + (error ? " tour-error" : ""), message));
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
      const card = createCard(tour, index);
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
