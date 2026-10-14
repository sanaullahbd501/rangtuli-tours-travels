(() => {
  const cfg = window.RANGTULI_CONFIG || {};
  const api = (cfg.apiBaseUrl || '').replace(/\/$/, '') + '/api/tours';
  const wa = cfg.whatsappNumber || '8801624229692';
  const fb = cfg.facebookPageUrl || 'https://www.facebook.com/rangtulitour';
  const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]/g, '');
  const get = (o, ...keys) => {
    if (!o) return '';
    for (const key of keys) {
      if (o[key] != null && String(o[key]).trim() !== '') return o[key];
      const found = Object.keys(o).find(k => norm(k) === norm(key));
      if (found && o[found] != null && String(o[found]).trim() !== '') return o[found];
    }
    return '';
  };
  const id = t => String(get(t, 'Package ID', 'packageId', 'id', 'tourId') || '').trim();
  const name = t => get(t, 'Tour Name', 'tourName', 'name', 'title') || 'নতুন ট্যুর';
  const price = t => {
    const raw = String(get(t, 'Price Options', 'priceOptions', 'price') || '');
    const part = raw.split(';').map(x => x.trim()).find(x => /regular|রেগুলার/i.test(x));
    return part || raw.split(';').map(x => x.trim()).filter(Boolean)[0] || 'মূল্য জানতে যোগাযোগ করুন';
  };
  
const images = t => String(get(t, 'Image URLs (comma-separated)', 'Image URLs', 'imageUrls', 'images', 'imageUrl') || '').split(/[;,\n]/).map(x => x.trim()).filter(x => /^https?:\/\//i.test(x));

  const published = t => !/^(no|false|0|draft|unpublished|hidden|বন্ধ)$/i.test(String(get(t, 'Website Status', 'websiteStatus', 'status') || '').trim());
  const text = v => String(v ?? '').trim();
  const safe = s => text(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tourUrl = (t, type) => `tour.html?id=${encodeURIComponent(id(t))}&type=${encodeURIComponent(type)}`;

  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function card(t, type, index = 0) {
    const pic = images(t)[0];
    const image = pic
      ? `<img src="${safe(pic)}" alt="${safe(name(t))}" loading="lazy" onerror="this.onerror=null;this.style.display='none';this.parentElement.classList.add('tour-image-fallback')">`
      : '';
    const label = type === 'day' ? 'DAY TOUR' : 'RELAX TOUR';
    return `<a class="destination-card tour-destination-card" href="${tourUrl(t,type)}" aria-label="${safe(name(t))} — বিস্তারিত দেখুন">${image}<div class="card-overlay"></div><div class="card-content"><span class="card-number">${String(index+1).padStart(2,'0')} / ${label}</span><h3>${safe(name(t))}</h3><p>${safe(price(t))}</p><span class="book-link">এ ট্যুর সম্পর্কে জানুন <span>↗</span></span></div></a>`;
  }
  function homeGrid(gridId, moreId, tours, type) {
    const grid = document.getElementById(gridId); if (!grid) return;
    const btn = document.getElementById(moreId);
    const list = shuffle(tours.filter(published));
    if (!list.length) {
      grid.innerHTML = '<p class="tour-loading">নতুন ট্যুরের তথ্য শিগগিরই যোগ করা হবে।</p>';
      if (btn) btn.hidden = true;
      return;
    }
    const first = list.slice(0, 3), rest = list.slice(3);
    grid.innerHTML = first.map((t,i) => card(t,type,i)).join('');
    if (rest.length) {
      const peek = document.createElement('div');
      peek.className = 'rt-more-card';
      peek.innerHTML = card(rest[0],type,3) + `<div class="rt-more-shade"><a class="rt-more-circle" href="tours.html?type=${type}" aria-label="সব ${type==='day'?'ডে':'রিল্যাক্স'} ট্যুর দেখুন">আরও<br>দেখুন <span>↗</span></a></div>`;
      grid.appendChild(peek);
    }
    if (btn) btn.hidden = true;
  }
  async function load() {
    try {
      const r = await fetch(api, {cache:'no-store'}); if (!r.ok) throw new Error('API');
      const data = await r.json();
      const day = data.dayTours || data.day_tours || [];
      const relax = data.relaxTours || data.relax_tours || [];
      homeGrid('day-tour-grid','day-tour-more',day,'day');
      homeGrid('relax-tour-grid','relax-tour-more',relax,'relax');
      renderTourPage(day, relax);
    } catch(e) {
      ['day-tour-grid','relax-tour-grid'].forEach(k => { const el=document.getElementById(k); if(el) el.innerHTML='<p class="tour-loading">ট্যুরের তথ্য লোড করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।</p>'; });
      const detail=document.getElementById('tour-detail'); if(detail) detail.innerHTML='<p class="tour-loading">ট্যুরের তথ্য লোড করা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>';
    }
  }
  function section(label, value, multiline=true) {
    const v = text(value); if(!v) return '';
    const html = v.split(/;|\n/).map(s=>s.trim()).filter(Boolean).map(s=>`<li>${safe(s)}</li>`).join('');
    return `<section class="rt-detail-section"><h2>${safe(label)}</h2>${multiline ? `<ul>${html}</ul>` : `<p>${safe(v)}</p>`}</section>`;
  }

  function initSlideshows(root = document) {
  root.querySelectorAll('[data-slideshow]').forEach(gallery => {
    if (gallery.dataset.initialized === 'true') return;
    gallery.dataset.initialized = 'true';

    const slides = [...gallery.querySelectorAll('.rt-slide')];
    const dots = [...gallery.querySelectorAll('.rt-slide-dot')];

    if (slides.length < 2) return;

    let current = 0;
    let timer;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;
      
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === current);
        });
      
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === current);
          dot.setAttribute(
            'aria-current',
            i === current ? 'true' : 'false'
          );
        });
      }
        
            function startAutoPlay() {
              clearInterval(timer);
              timer = setInterval(() => showSlide(current + 1), 2000);
            }
        
            gallery.querySelector('.rt-slide-prev')
              ?.addEventListener('click', () => {
                showSlide(current - 1);
                startAutoPlay();
              });
        
            gallery.querySelector('.rt-slide-next')
              ?.addEventListener('click', () => {
                showSlide(current + 1);
                startAutoPlay();
              });
        
            dots.forEach(dot => {
              dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.slide));
                startAutoPlay();
              });
            });
        
            gallery.addEventListener('mouseenter', () => clearInterval(timer));
            gallery.addEventListener('mouseleave', startAutoPlay);
        
            showSlide(0);
            startAutoPlay();
          });
        }
  function renderTourPage(day, relax) {
    const detail = document.getElementById('tour-detail');
    const all = [...day.map(t=>({...t,__type:'day'})),...relax.map(t=>({...t,__type:'relax'}))];
    if (detail) {
      const params = new URLSearchParams(location.search); const wantedId = params.get('id') || ''; const type = params.get('type') || '';
      const tour = all.find(t => id(t) === wantedId && (!type || t.__type === type)) || all.find(t=>id(t)===wantedId);
      if (!tour || !published(tour)) { detail.innerHTML='<div class="rt-not-found"><h1>ট্যুরটি পাওয়া যায়নি</h1><p>ট্যুরটি সরানো হয়ে থাকতে পারে অথবা লিংকটি সঠিক নয়।</p><a class="rt-primary-btn" href="tours.html?type=day">সব ট্যুর দেখুন</a></div>'; return; }
      const t=tour, pics=images(t), tourName=name(t), kind=t.__type;
      const gallery = pics.length
        ? `<div class="rt-gallery rt-slideshow" data-slideshow>
             <div class="rt-slides">
               ${pics.map((p, i) => `
                 <img
                   class="rt-slide ${i === 0 ? 'active' : ''}"
                   src="${safe(p)}"
                   alt="${safe(tourName)} — ছবি ${i + 1}"
                   loading="${i === 0 ? 'eager' : 'lazy'}"
                   
                 >
               `).join('')}
             </div>
             ${pics.length > 1 ? `
               <button class="rt-slide-btn rt-slide-prev"
                 type="button" aria-label="আগের ছবি">‹</button>
               <button class="rt-slide-btn rt-slide-next"
                 type="button" aria-label="পরের ছবি">›</button>
               <div class="rt-slide-dots">
                 ${pics.map((_, i) => `
                   <button type="button"
                     class="rt-slide-dot ${i === 0 ? 'active' : ''}"
                     data-slide="${i}"
                     aria-label="ছবি ${i + 1}"
                     aria-current="${i === 0 ? 'true' : 'false'}">
                   </button>
                 `).join('')}
               </div>
             ` : ''}
           </div>`
        : '<div class="rt-gallery rt-no-image">ছবি শিগগিরই যোগ করা হবে</div>';
      const booking = `আমি ${tourName} (${id(t)}) ট্যুরের বুকিং ও বিস্তারিত জানতে চাই।`;
      const waUrl = `https://wa.me/${encodeURIComponent(wa)}?text=${encodeURIComponent(booking)}`;
      const details = `<div class="rt-detail-layout"><div>${section('গন্তব্য',get(t,'Destinations','destinations'),false)}${section('ট্যুরের বিবরণ',get(t,'Description','description'),false)}${section('সময়সূচি',get(t,'Schedule','schedule'),false)}${section('সময়কাল',get(t,'Duration','duration'),false)}${section('ভ্রমণ পরিকল্পনা / Itinerary',get(t,'Itinerary','itinerary'))}${section('প্যাকেজে যা অন্তর্ভুক্ত',get(t,'Included','included'))}${section('প্যাকেজে যা অন্তর্ভুক্ত নয়',get(t,'Excluded','excluded'))}${section('রুম / থাকার ব্যবস্থা',get(t,'Room/Stay Options','roomStayOptions','roomOptions'))}${section('পিকআপ পয়েন্ট',get(t,'Pickup Points','pickupPoints'))}${section('বিশেষ নির্দেশনা',get(t,'Special Occasion Notes','specialOccasionNotes'))}</div><aside class="rt-booking-box"><span class="rt-card-tag">${kind==='day'?'ডে ট্যুর':'রিল্যাক্স ট্যুর'}</span><h2>মূল্য ও বুকিং</h2>${section('প্যাকেজ মূল্য',get(t,'Price Options','priceOptions','price'))}${section('বুকিং অ্যামাউন্ট',get(t,'Booking Amount','bookingAmount'),false)}${section('পেমেন্টের তথ্য',get(t,'Booking Payment Details','bookingPaymentDetails'),false)}${section('যোগাযোগ',get(t,'Contact Numbers','contactNumbers'))}<a class="rt-primary-btn" href="${waUrl}" target="_blank" rel="noopener">WhatsApp-এ বুকিং করুন</a><a class="rt-secondary-btn" href="${fb}" target="_blank" rel="noopener">Messenger-এ যোগাযোগ</a></aside></div>`;
      detail.innerHTML = `<div class="rt-detail-hero">${gallery}<div class="rt-detail-heading"><a class="rt-back-link" href="tours.html?type=${kind}">← সব ${kind==='day'?'ডে':'রিল্যাক্স'} ট্যুর</a><h1>${safe(tourName)}</h1><p>${safe(get(t,'Destinations','destinations'))}</p><div class="rt-hero-actions"><a class="rt-primary-btn" href="${waUrl}" target="_blank" rel="noopener">WhatsApp-এ বুকিং করুন</a><a class="rt-secondary-btn" href="${fb}" target="_blank" rel="noopener">Messenger</a></div></div></div>${details}`;
      initSlideshows(detail);
      const others = (kind==='day'?day:relax).filter(published).filter(x=>id(x)!==id(t));
      const opposite = kind==='day'?'relax':'day';
      const related = document.getElementById('tour-related');
      if(related) related.innerHTML=`<div class="rt-related-head"><h2>আরও ${kind==='day'?'ডে':'রিল্যাক্স'} ট্যুর</h2><a href="tours.html?type=${kind}">সব দেখুন ↗</a></div><div class="rt-card-grid">${others.slice(0,3).map((x,i)=>card(x,kind,i)).join('') || '<p>এই মুহূর্তে অন্য ট্যুর নেই।</p>'}</div><p class="rt-opposite-link"><a href="tours.html?type=${opposite}">সব ${opposite==='day'?'ডে':'রিল্যাক্স'} ট্যুর দেখুন →</a></p>`;
    }
    const listing = document.getElementById('all-tours-grid');
    if (listing) {
      const type = new URLSearchParams(location.search).get('type')==='relax'?'relax':'day';
      const items=(type==='day'?day:relax).filter(published);
      const title=document.getElementById('all-tours-title'); if(title) title.textContent=type==='day'?'সব ডে ট্যুর':'সব রিল্যাক্স ট্যুর';
      listing.innerHTML=items.length?items.map((t,i)=>card(t,type,i)).join(''):'<p>এই ক্যাটাগরিতে এখনো কোনো ট্যুর প্রকাশ করা হয়নি।</p>';
      const opposite=document.getElementById('opposite-tours-link'); if(opposite) opposite.href=`tours.html?type=${type==='day'?'relax':'day'}`;
      const oppositeText=document.getElementById('opposite-tours-text'); if(oppositeText) oppositeText.textContent=`সব ${type==='day'?'রিল্যাক্স':'ডে'} ট্যুর দেখুন →`;
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const toggle=document.querySelector('.nav-toggle'), nav=document.querySelector('.nav-links');
    if(toggle && nav) toggle.addEventListener('click',()=>{nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',nav.classList.contains('is-open')?'true':'false');});
    load();
    // WhatsApp and Messenger CTA links
      const whatsappMessage =
        'আসসালামু আলাইকুম, রংতুলি ট্যুরস অ্যান্ড ট্রাভেলসের ট্যুর প্যাকেজ সম্পর্কে জানতে চাই।';
      
      const whatsappUrl =
        `https://wa.me/${encodeURIComponent(wa)}?text=${encodeURIComponent(whatsappMessage)}`;
      
      const messengerUrl = 'https://m.me/rangtulitour';
      
      ['whatsapp-cta', 'whatsapp-float'].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.href = whatsappUrl;
      });
      
      const messengerButton = document.getElementById('messenger-cta');
      if (messengerButton) messengerButton.href = messengerUrl;
  });
})();
