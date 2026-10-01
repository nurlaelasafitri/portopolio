/* ============================================================
   KINI ESOK DAN NANTI — script.js
   ============================================================ */

// ── Header scroll effect ──────────────────────────────────────
const header = document.getElementById('mainHeader');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Active nav on scroll ──────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.pageYOffset >= section.offsetTop - 160) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// ── Mobile menu toggle ────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
});

mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
});

// ── Scroll fade-in animation ──────────────────────────────────
const fadeTargets = document.querySelectorAll('.service-card, .gallery-item, .contact-info-item');
fadeTargets.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

fadeTargets.forEach(el => observer.observe(el));

// ── Gallery: Upload ───────────────────────────────────────────
const uploadBtn   = document.getElementById('uploadBtn');
const photoInput  = document.getElementById('photoInput');
const uploadZone  = document.getElementById('uploadZone');
const galleryGrid = document.getElementById('galleryGrid');

let galleryImages = []; // [{src, category, name}]
let activeFilter  = 'all';

uploadBtn.addEventListener('click', () => photoInput.click());
uploadZone.addEventListener('click', (e) => {
    if (e.target !== uploadBtn) photoInput.click();
});

photoInput.addEventListener('change', (e) => {
    handleFiles(Array.from(e.target.files));
    photoInput.value = '';
});

// Drag & Drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
});

function handleFiles(files) {
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            alert(`File "${file.name}" melebihi batas 10MB.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            galleryImages.push({
                src: e.target.result,
                category: 'uploaded',
                name: file.name
            });
            renderGallery();
        };
        reader.readAsDataURL(file);
    });
}

// ── Gallery: Filter tabs ──────────────────────────────────────
const galleryTabs = document.querySelectorAll('.gallery-tab');
galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        galleryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.dataset.filter;
        renderGallery();
    });
});

// ── Gallery: Render ───────────────────────────────────────────
function renderGallery() {
    // Keep placeholder items (no image src) and uploaded items
    const placeholders = Array.from(galleryGrid.querySelectorAll('.gallery-item--placeholder'));

    // Remove only uploaded items (not placeholders)
    galleryGrid.querySelectorAll('.gallery-item--uploaded').forEach(el => el.remove());

    // Filter placeholders by active tab
    placeholders.forEach(p => {
        const cat = p.dataset.category;
        const show = activeFilter === 'all' || cat === activeFilter;
        p.style.display = show ? '' : 'none';
    });

    // Add uploaded images
    const filtered = activeFilter === 'all' || activeFilter === 'uploaded'
        ? galleryImages
        : galleryImages.filter(img => img.category === activeFilter);

    filtered.forEach((imgData, idx) => {
        const item = document.createElement('div');
        item.className = 'gallery-item gallery-item--uploaded fade-up';
        item.dataset.category = imgData.category;
        item.dataset.index = idx;

        const img = document.createElement('img');
        img.src = imgData.src;
        img.alt = imgData.name;
        img.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'gallery-item-overlay';
        overlay.innerHTML = '<i class="fa-solid fa-expand"></i>';

        const delBtn = document.createElement('button');
        delBtn.className = 'gallery-item-delete';
        delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        delBtn.title = 'Hapus foto';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            galleryImages.splice(idx, 1);
            renderGallery();
        });

        item.appendChild(img);
        item.appendChild(overlay);
        item.appendChild(delBtn);
        item.addEventListener('click', () => openLightbox(imgData.src, idx));
        galleryGrid.appendChild(item);

        // Trigger fade-in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => item.classList.add('visible'));
        });
    });
}

// ── Lightbox ──────────────────────────────────────────────────
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let currentLightboxIdx = 0;

function openLightbox(src, idx) {
    lightboxImg.src = src;
    currentLightboxIdx = idx;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateLightboxArrows();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

function updateLightboxArrows() {
    lightboxPrev.style.display = currentLightboxIdx > 0 ? '' : 'none';
    lightboxNext.style.display = currentLightboxIdx < galleryImages.length - 1 ? '' : 'none';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

lightboxPrev.addEventListener('click', () => {
    if (currentLightboxIdx > 0) {
        currentLightboxIdx--;
        lightboxImg.src = galleryImages[currentLightboxIdx].src;
        updateLightboxArrows();
    }
});

lightboxNext.addEventListener('click', () => {
    if (currentLightboxIdx < galleryImages.length - 1) {
        currentLightboxIdx++;
        lightboxImg.src = galleryImages[currentLightboxIdx].src;
        updateLightboxArrows();
    }
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
});

// ── Contact Form → WhatsApp ───────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name    = document.getElementById('fullName').value;
        const email   = document.getElementById('email').value;
        const phone   = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        let text = `*Booking Sesi — Kini Esok dan Nanti*\n\n`;
        text += `*Nama:* ${name}\n`;
        text += `*Email:* ${email}\n`;
        if (phone)   text += `*No. HP:* ${phone}\n`;
        if (subject) text += `*Jenis Sesi:* ${subject}\n`;
        text += `\n*Pesan:*\n${message}`;

        const waNumber = '6281222628052'; // Ganti dengan nomor WA studio
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
        contactForm.reset();
    });

    function showBooking(){

    openForm("booking");

    document
        .getElementById("contact")
        .scrollIntoView({
            behavior:"smooth"
        });

    }    

    function showPricelist(){

    openForm("pricelist");

    document
        .getElementById("contact")
        .scrollIntoView({
            behavior:"smooth"
        });

    }

    
}
