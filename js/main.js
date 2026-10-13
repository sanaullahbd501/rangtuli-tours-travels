(function () {
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
    if (!number || number.includes("XXXXXXXXX") || number.length < 10) return "";
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
  }

  function setLink(id, url) {
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
        alert("প্রথমে js/config.js ফাইলে রংতুলির সঠিক WhatsApp নম্বর বসাতে হবে।");
      });
    }
  }

  const generalMessage = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের ট্যুর সম্পর্কে জানতে চাই।";
  setLink("whatsapp-cta", whatsappUrl(generalMessage));
  setLink("whatsapp-float", whatsappUrl(generalMessage));

  const fbUrl = config.facebookPageUrl || "";
  const messengerUrl = fbUrl && !fbUrl.includes("YOUR_PAGE")
    ? "https://m.me/" + fbUrl.replace(/\/+$/, "").split("/").pop()
    : "";
  setLink("messenger-cta", messengerUrl);

  document.querySelectorAll("[data-tour]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const tourName = link.getAttribute("data-tour");
      const message = "আসসালামু আলাইকুম। আমি রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের " + tourName + " ট্যুর সম্পর্কে জানতে চাই। তারিখ, মূল্য ও বিস্তারিত জানাবেন।";
      const url = whatsappUrl(message);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else alert("প্রথমে js/config.js ফাইলে রংতুলির সঠিক WhatsApp নম্বর বসাতে হবে।");
    });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const messengerButton = document.getElementById("messenger-cta");
  if (messengerButton && !messengerUrl) {
    messengerButton.addEventListener("click", function (event) {
      event.preventDefault();
      alert("প্রথমে js/config.js ফাইলে রংতুলির Facebook Page URL বসাতে হবে।");
    });
  }
})();
