/**
 * ==============================================================================
 * Khedmati - Home Maintenance Web Application
 * Complete Client-Side Logic & LocalStorage Management
 * ==============================================================================
 */

// Storage Keys
const STORAGE_KEYS = {
    TECHNICIANS: 'khedmati_technicians',
    REQUESTS: 'khedmati_requests'
};

// Default Initial Sample Data (Only seeded if LocalStorage has no saved technicians)
const DEFAULT_TECHNICIANS = [
    {
        id: "TECH-101",
        name: "Ibrahim El-Sayed",
        specialty: "Electrical",
        phone: "+20 100 458 9211",
        whatsapp: "201004589211",
        experience: 8,
        areas: "Cairo (Al-Maadi, New Cairo, Nasr City)",
        hours: "Mon - Sat: 8:00 AM - 9:00 PM",
        rating: 4.9,
        reviews: 42
    },
    {
        id: "TECH-102",
        name: "Tarek Mostafa",
        specialty: "Plumbing",
        phone: "+20 111 893 4402",
        whatsapp: "201118934402",
        experience: 11,
        areas: "Cairo (Zamalek, Dokki, Downtown, Mohandessin)",
        hours: "24/7 Available for Emergencies",
        rating: 5.0,
        reviews: 67
    },
    {
        id: "TECH-103",
        name: "Omar Al-Khatib",
        specialty: "HVAC & Air Conditioning",
        phone: "+20 122 710 3390",
        whatsapp: "201227103390",
        experience: 7,
        areas: "New Cairo, Rehab City, Madinaty",
        hours: "Daily: 9:00 AM - 8:00 PM",
        rating: 4.8,
        reviews: 29
    },
    {
        id: "TECH-104",
        name: "Youssef Hassan",
        specialty: "Carpentry",
        phone: "+20 109 231 8845",
        whatsapp: "201092318845",
        experience: 14,
        areas: "Giza, Sheikh Zayed, 6th of October",
        hours: "Mon - Fri: 8:30 AM - 6:00 PM",
        rating: 4.9,
        reviews: 51
    },
    {
        id: "TECH-105",
        name: "Hassan Radwan",
        specialty: "Home Appliances",
        phone: "+20 114 550 7820",
        whatsapp: "201145507820",
        experience: 9,
        areas: "Cairo, Heliopolis, Nasr City, Sheraton",
        hours: "Sat - Thu: 9:00 AM - 7:00 PM",
        rating: 4.7,
        reviews: 35
    },
    {
        id: "TECH-106",
        name: "Sameh Nabil",
        specialty: "Electrical",
        phone: "+20 106 339 1205",
        whatsapp: "201063391205",
        experience: 5,
        areas: "Alexandria (Sidi Gaber, Smouha, Miami)",
        hours: "Daily: 8:00 AM - 8:00 PM",
        rating: 4.8,
        reviews: 22
    }
];

// Seed Requests if user wants initial demonstration
const DEFAULT_REQUESTS = [
    {
        id: "REQ-71042",
        service: "Plumbing",
        issueType: "Leakage",
        urgency: "Emergency",
        scheduledDate: "",
        city: "Cairo",
        area: "Al-Maadi",
        address: "Building 14, Road 9, Apt 3",
        details: "Major water leak beneath the kitchen sink pipe causing water accumulation on the floor.",
        customerName: "Omar Sherif",
        customerPhone: "+20 100 123 4567",
        status: "In Progress",
        photoUrl: "",
        createdAt: "2026-10-26T14:30:00.000Z"
    },
    {
        id: "REQ-58291",
        service: "HVAC & Air Conditioning",
        issueType: "Routine maintenance",
        urgency: "Within today",
        scheduledDate: "",
        city: "Cairo",
        area: "New Cairo",
        address: "Villa 22, 1st Settlement",
        details: "Split AC unit is blowing lukewarm air. Requires filter cleaning and freon level check.",
        customerName: "Nouran Adel",
        customerPhone: "+20 114 987 6543",
        status: "Pending",
        photoUrl: "",
        createdAt: "2026-10-27T08:15:00.000Z"
    }
];

// App State
let activeSpecialtyFilter = 'All';
let uploadedPhotoBase64 = '';
let currentCreatedRequest = null;

// ==============================================================================
// Initialization
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    setupNavigationEvents();
    setupFormEventListeners();
    setupUrgencyListeners();
    setupPhotoUploadListener();
    renderDirectory();
    renderRequests();
    updateBadgeCounts();
});

/**
 * Initializes LocalStorage with sample data if absent
 */
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
        localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(DEFAULT_TECHNICIANS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(DEFAULT_REQUESTS));
    }
}

function getStoredTechnicians() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error reading technicians:", e);
        return [];
    }
}

function saveStoredTechnicians(techs) {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(techs));
}

function getStoredRequests() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error reading requests:", e);
        return [];
    }
}

function saveStoredRequests(reqs) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(reqs));
}

// ==============================================================================
// SPA Navigation System
// ==============================================================================
function navigateTo(pageId) {
    // Update section visibility
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(`page-${pageId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update navigation links active state
    const navLinks = document.querySelectorAll('.nav-link[data-nav]');
    navLinks.forEach(link => {
        if (link.getAttribute('data-nav') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Close mobile drawer if open
    const drawer = document.getElementById('mobileDrawer');
    if (drawer) {
        drawer.classList.remove('open');
    }

    // Context-specific re-renders
    if (pageId === 'directory') {
        renderDirectory();
    } else if (pageId === 'my-requests') {
        renderRequests();
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupNavigationEvents() {
    const menuToggle = document.getElementById('menuToggle');
    const drawer = document.getElementById('mobileDrawer');
    // Close mobile drawer when user taps outside of it
    document.addEventListener('click', (e) => {
        const drawer = document.getElementById('mobileDrawer');
        const toggle = document.getElementById('menuToggle');
        if (drawer && drawer.classList.contains('open')) {
            if (!drawer.contains(e.target) && !toggle.contains(e.target)) {
                drawer.classList.remove('open');
            }
        }
    });

    if (menuToggle && drawer) {
        menuToggle.addEventListener('click', () => {
            drawer.classList.toggle('open');
        });
    }

    // Close modal when clicking on overlay background
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeConfirmModal(false);
            }
        });
    }

    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeConfirmModal(false);
        }
    });
}

function quickEmergency() {
    navigateTo('request');
    // Check emergency radio
    const emergencyRadio = document.querySelector('input[name="urgency"][value="Emergency"]');
    if (emergencyRadio) {
        emergencyRadio.checked = true;
        toggleScheduledDatePicker();
    }
    showToast('Emergency mode selected. Fill your address for quick dispatch.', 'info');
}

function bookCategory(category) {
    navigateTo('request');
    const serviceSelect = document.getElementById('reqServiceType');
    if (serviceSelect) {
        serviceSelect.value = category;
    }
}

function updateBadgeCounts() {
    const reqs = getStoredRequests();
    const count = reqs.length;
    const navBadge = document.getElementById('nav-request-count');
    const mobBadge = document.getElementById('mobile-req-count');
    if (navBadge) navBadge.textContent = count;
    if (mobBadge) mobBadge.textContent = count;
}

// ==============================================================================
// Customer Service Request Form & Validation
// ==============================================================================
function setupUrgencyListeners() {
    const urgencyRadios = document.querySelectorAll('input[name="urgency"]');
    urgencyRadios.forEach(radio => {
        radio.addEventListener('change', toggleScheduledDatePicker);
    });
}

function toggleScheduledDatePicker() {
    const selectedUrgency = document.querySelector('input[name="urgency"]:checked')?.value;
    const scheduleWrap = document.getElementById('scheduledDateWrap');
    if (scheduleWrap) {
        if (selectedUrgency === 'Schedule for a later date') {
            scheduleWrap.style.display = 'flex';
        } else {
            scheduleWrap.style.display = 'none';
        }
    }
}

function setupPhotoUploadListener() {
    const photoInput = document.getElementById('reqPhoto');
    const previewWrap = document.getElementById('photoPreviewWrap');
    const previewImg = document.getElementById('photoPreviewImg');

    if (photoInput) {
        photoInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Image size exceeds 5MB limit.', 'error');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    uploadedPhotoBase64 = e.target.result;
                    previewImg.src = uploadedPhotoBase64;
                    previewWrap.style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function clearUploadedPhoto() {
    const photoInput = document.getElementById('reqPhoto');
    const previewWrap = document.getElementById('photoPreviewWrap');
    const previewImg = document.getElementById('photoPreviewImg');
    if (photoInput) photoInput.value = '';
    if (previewImg) previewImg.src = '';
    if (previewWrap) previewWrap.style.display = 'none';
    uploadedPhotoBase64 = '';
}

function setupFormEventListeners() {
    const customerForm = document.getElementById('customerRequestForm');
    if (customerForm) {
        customerForm.addEventListener('submit', handleCustomerRequestSubmit);
    }

    const techForm = document.getElementById('techRegistrationForm');
    if (techForm) {
        techForm.addEventListener('submit', handleTechRegistrationSubmit);
    }
}

function handleCustomerRequestSubmit(e) {
    e.preventDefault();

    const serviceType = document.getElementById('reqServiceType');
    const issueType = document.getElementById('reqIssueType');
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'Emergency';
    const scheduledDate = document.getElementById('reqScheduledDate');
    const city = document.getElementById('reqCity');
    const area = document.getElementById('reqArea');
    const address = document.getElementById('reqAddress');
    const details = document.getElementById('reqDetails');
    const custName = document.getElementById('reqCustName');
    const custPhone = document.getElementById('reqCustPhone');

    let isValid = true;

    // Validate Service Type
    if (!serviceType.value) {
        showFieldError('reqServiceType', 'errServiceType');
        isValid = false;
    } else {
        clearFieldError('reqServiceType', 'errServiceType');
    }

    // Validate Issue Type
    if (!issueType.value) {
        showFieldError('reqIssueType', 'errIssueType');
        isValid = false;
    } else {
        clearFieldError('reqIssueType', 'errIssueType');
    }

    // Validate Scheduled Date if applicable
    if (urgency === 'Schedule for a later date' && !scheduledDate.value) {
        showFieldError('reqScheduledDate', 'errScheduledDate');
        isValid = false;
    } else {
        clearFieldError('reqScheduledDate', 'errScheduledDate');
    }

    // Validate City
    if (!city.value.trim()) {
        showFieldError('reqCity', 'errCity');
        isValid = false;
    } else {
        clearFieldError('reqCity', 'errCity');
    }

    // Validate Area
    if (!area.value.trim()) {
        showFieldError('reqArea', 'errArea');
        isValid = false;
    } else {
        clearFieldError('reqArea', 'errArea');
    }

    // Validate Address
    if (!address.value.trim()) {
        showFieldError('reqAddress', 'errAddress');
        isValid = false;
    } else {
        clearFieldError('reqAddress', 'errAddress');
    }

    // Validate Details
    if (!details.value.trim()) {
        showFieldError('reqDetails', 'errDetails');
        isValid = false;
    } else {
        clearFieldError('reqDetails', 'errDetails');
    }

    // Validate Name
    if (!custName.value.trim()) {
        showFieldError('reqCustName', 'errCustName');
        isValid = false;
    } else {
        clearFieldError('reqCustName', 'errCustName');
    }

    // Validate Phone
    if (!custPhone.value.trim() || custPhone.value.trim().length < 7) {
        showFieldError('reqCustPhone', 'errCustPhone');
        isValid = false;
    } else {
        clearFieldError('reqCustPhone', 'errCustPhone');
    }

    if (!isValid) {
        showToast('Please correct the highlighted fields.', 'error');
        return;
    }

    // Generate Unique Ticket Code
    const randomTicketId = 'REQ-' + Math.floor(10000 + Math.random() * 90000);

    const newRequest = {
        id: randomTicketId,
        service: serviceType.value,
        issueType: issueType.value,
        urgency: urgency,
        scheduledDate: urgency === 'Schedule for a later date' ? scheduledDate.value : '',
        city: city.value.trim(),
        area: area.value.trim(),
        address: address.value.trim(),
        details: details.value.trim(),
        customerName: custName.value.trim(),
        customerPhone: custPhone.value.trim(),
        photoUrl: uploadedPhotoBase64,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };

    // Save to LocalStorage
    const requests = getStoredRequests();
    requests.unshift(newRequest);
    saveStoredRequests(requests);

    currentCreatedRequest = newRequest;

    // Reset form
    document.getElementById('customerRequestForm').reset();
    clearUploadedPhoto();
    toggleScheduledDatePicker();
    updateBadgeCounts();

    // Show Confirmation Modal
    openConfirmModal(newRequest);
    showToast(`Request ${newRequest.id} saved in LocalStorage!`, 'success');
}

function showFieldError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (error) error.classList.add('visible');
}

function clearFieldError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove('error');
    if (error) error.classList.remove('visible');
}

// Modal Management
function openConfirmModal(req) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('modalReqId').textContent = req.id;
    document.getElementById('modalReqService').textContent = req.service;
    document.getElementById('modalReqUrgency').textContent = req.urgency;
    document.getElementById('modalReqLocation').textContent = `${req.area}, ${req.city}`;

    // WhatsApp quick share pre-filled message
    const waBtn = document.getElementById('btnModalShareWA');
    waBtn.onclick = () => shareRequestWhatsApp(req.id);

    modal.classList.add('open');
}

function closeConfirmModal(navigate) {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('open');
    if (navigate) {
        navigateTo('my-requests');
    }
}

// ==============================================================================
// Technician Registration Logic
// ==============================================================================
function handleTechRegistrationSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('techName');
    const specialty = document.getElementById('techSpecialty');
    const phone = document.getElementById('techPhone');
    const whatsapp = document.getElementById('techWhatsApp');
    const experience = document.getElementById('techExperience');
    const hours = document.getElementById('techHours');
    const areas = document.getElementById('techAreas');

    let isValid = true;

    if (!name.value.trim()) {
        showFieldError('techName', 'errTechName');
        isValid = false;
    } else {
        clearFieldError('techName', 'errTechName');
    }

    if (!specialty.value) {
        showFieldError('techSpecialty', 'errTechSpecialty');
        isValid = false;
    } else {
        clearFieldError('techSpecialty', 'errTechSpecialty');
    }

    if (!phone.value.trim()) {
        showFieldError('techPhone', 'errTechPhone');
        isValid = false;
    } else {
        clearFieldError('techPhone', 'errTechPhone');
    }

    if (!whatsapp.value.trim()) {
        showFieldError('techWhatsApp', 'errTechWhatsApp');
        isValid = false;
    } else {
        clearFieldError('techWhatsApp', 'errTechWhatsApp');
    }

    if (!experience.value || Number(experience.value) <= 0) {
        showFieldError('techExperience', 'errTechExperience');
        isValid = false;
    } else {
        clearFieldError('techExperience', 'errTechExperience');
    }

    if (!hours.value.trim()) {
        showFieldError('techHours', 'errTechHours');
        isValid = false;
    } else {
        clearFieldError('techHours', 'errTechHours');
    }

    if (!areas.value.trim()) {
        showFieldError('techAreas', 'errTechAreas');
        isValid = false;
    } else {
        clearFieldError('techAreas', 'errTechAreas');
    }

    if (!isValid) {
        showToast('Please complete all required fields.', 'error');
        return;
    }

    // Clean WhatsApp number (digits only for wa.me URL)
    const cleanWA = whatsapp.value.replace(/[^0-9]/g, '');

    const newTech = {
        id: 'TECH-' + Math.floor(100 + Math.random() * 900),
        name: name.value.trim(),
        specialty: specialty.value,
        phone: phone.value.trim(),
        whatsapp: cleanWA || phone.value.replace(/[^0-9]/g, ''),
        experience: parseInt(experience.value, 10),
        hours: hours.value.trim(),
        areas: areas.value.trim(),
        rating: 5.0,
        reviews: 1
    };

    // Save to LocalStorage
    const technicians = getStoredTechnicians();
    technicians.unshift(newTech);
    saveStoredTechnicians(technicians);

    // Reset form
    document.getElementById('techRegistrationForm').reset();

    showToast(`Welcome ${newTech.name}! Your profile is now live.`, 'success');

    // Immediately navigate to directory with profile visible
    activeSpecialtyFilter = 'All';
    navigateTo('directory');
}

// ==============================================================================
// Technician Directory & Filtering
// ==============================================================================
function setSpecialtyFilter(specialty) {
    activeSpecialtyFilter = specialty;

    // Update filter pill UI
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        if (pill.getAttribute('data-filter') === specialty) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });

    renderDirectory();
}

function filterTechnicians() {
    renderDirectory();
}

function resetDirectoryFilters() {
    document.getElementById('directorySearchInput').value = '';
    setSpecialtyFilter('All');
}

function renderDirectory() {
    const container = document.getElementById('techniciansGrid');
    const emptyNotice = document.getElementById('noTechsFound');
    const searchInput = document.getElementById('directorySearchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (!container) return;

    const allTechs = getStoredTechnicians();

    // Apply filters
    const filtered = allTechs.filter(tech => {
        const matchesSpecialty = (activeSpecialtyFilter === 'All') || (tech.specialty === activeSpecialtyFilter);
        const matchesQuery = query === '' ||
            tech.name.toLowerCase().includes(query) ||
            tech.areas.toLowerCase().includes(query) ||
            tech.specialty.toLowerCase().includes(query);

        return matchesSpecialty && matchesQuery;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
        if (emptyNotice) emptyNotice.style.display = 'block';
        return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';

    filtered.forEach(tech => {
        // Generate Initials
        const initials = tech.name
            .split(' ')
            .map(part => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

        const waLink = `https://wa.me/${tech.whatsapp}?text=${encodeURIComponent(
            `Hello ${tech.name}, I found your contact on Khedmati for ${tech.specialty} maintenance service. Are you available for a repair?`
        )}`;

        const card = document.createElement('div');
        card.className = 'tech-card';
        card.innerHTML = `
      <div>
        <div class="tech-header">
          <div class="tech-avatar">${initials}</div>
          <div class="tech-meta">
            <h3 class="tech-name">
              ${escapeHtml(tech.name)}
              <svg class="verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" title="Verified Professional">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </h3>
            <span class="tech-specialty-badge">${escapeHtml(tech.specialty)}</span>
            <div style="font-size: 0.8rem; color: #b45309; font-weight:700; margin-top: 0.2rem;">
              ★ ${tech.rating || '5.0'} (${tech.reviews || 1} verified jobs)
            </div>
          </div>
        </div>

        <div class="tech-details">
          <div class="tech-detail-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div><strong>Experience:</strong> ${tech.experience} ${tech.experience === 1 ? 'Year' : 'Years'} Professional</div>
          </div>
          <div class="tech-detail-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div><strong>Locations:</strong> ${escapeHtml(tech.areas)}</div>
          </div>
          <div class="tech-detail-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div><strong>Hours:</strong> ${escapeHtml(tech.hours)}</div>
          </div>
        </div>
      </div>

      <div class="tech-actions">
        <a href="tel:${tech.phone}" class="btn btn-call btn-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Call
        </a>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 2C6.505 2 2 6.504 2 12.029c0 1.83.498 3.548 1.365 5.029L2 22l5.097-1.336a10.02 10.02 0 0 0 4.934 1.286h.005c5.524 0 10.029-4.505 10.029-10.03C22.065 6.504 17.556 2 12.031 2zm0 18.272a8.27 8.27 0 0 1-4.223-1.156l-.303-.18-3.136.822.837-3.058-.198-.315A8.257 8.257 0 0 1 3.766 12.03c0-4.557 3.708-8.265 8.269-8.265 4.558 0 8.266 3.708 8.266 8.267 0 4.558-3.708 8.27-8.271 8.27z"/>
          </svg>
          WhatsApp
        </a>
      </div>
    `;

        container.appendChild(card);
    });
}

// ==============================================================================
// My Requests Dashboard & Interactions
// ==============================================================================
function renderRequests() {
    const container = document.getElementById('requestsList');
    const emptyState = document.getElementById('noRequestsState');
    if (!container) return;

    const requests = getStoredRequests();

    // Update Metric Box Figures
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const inProgress = requests.filter(r => r.status === 'In Progress').length;
    const emergency = requests.filter(r => r.urgency === 'Emergency').length;

    document.getElementById('statTotalRequests').textContent = total;
    document.getElementById('statPendingRequests').textContent = pending;
    document.getElementById('statProgressRequests').textContent = inProgress;
    document.getElementById('statEmergencyRequests').textContent = emergency;

    container.innerHTML = '';

    if (requests.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    requests.forEach(req => {
        const card = document.createElement('div');
        card.className = 'request-card';

        // Urgency Badge CSS
        let urgencyBadgeClass = 'badge-today';
        if (req.urgency === 'Emergency') urgencyBadgeClass = 'badge-emergency';
        else if (req.urgency === 'Schedule for a later date') urgencyBadgeClass = 'badge-scheduled';

        // Status Badge CSS
        let statusBadgeClass = 'badge-pending';
        if (req.status === 'In Progress') statusBadgeClass = 'badge-in-progress';
        else if (req.status === 'Completed') statusBadgeClass = 'badge-completed';

        const photoHtml = req.photoUrl
            ? `<div style="text-align:center;">
           <img src="${req.photoUrl}" class="req-photo-thumb" alt="Reported issue photo" onclick="viewPhotoModal('${req.photoUrl}')" title="Click to inspect photo">
           <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:0.25rem;">Attached Photo</span>
         </div>`
            : '';

        const formattedDate = new Date(req.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
      <div class="request-card-top">
        <div class="req-id-wrap">
          <span class="req-code">${escapeHtml(req.id)}</span>
          <span class="badge ${urgencyBadgeClass}">${escapeHtml(req.urgency)}</span>
          <span class="badge ${statusBadgeClass}">${escapeHtml(req.status)}</span>
        </div>
        <div style="font-size:0.82rem; color:var(--text-muted);">
          Logged on: ${formattedDate}
        </div>
      </div>

      <div class="req-body-grid">
        <div class="req-details-col">
          <div class="req-info-line">
            <strong>Service Type:</strong>
            <span>${escapeHtml(req.service)} &bull; ${escapeHtml(req.issueType)}</span>
          </div>
          <div class="req-info-line">
            <strong>Location:</strong>
            <span>${escapeHtml(req.address)}, ${escapeHtml(req.area)}, ${escapeHtml(req.city)}</span>
          </div>
          ${req.scheduledDate ? `
          <div class="req-info-line">
            <strong>Preferred Slot:</strong>
            <span>${new Date(req.scheduledDate).toLocaleString()}</span>
          </div>` : ''}
          <div class="req-info-line">
            <strong>Client Contact:</strong>
            <span>${escapeHtml(req.customerName)} (${escapeHtml(req.customerPhone)})</span>
          </div>
          <div class="req-info-line" style="margin-top:0.4rem;">
            <strong>Issue Details:</strong>
            <span style="color:#334155;">${escapeHtml(req.details)}</span>
          </div>
        </div>

        ${photoHtml}
      </div>

      <div class="req-actions-bar">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.82rem; font-weight:600; color:var(--text-muted);">Update Status:</span>
          <select onchange="updateRequestStatus('${req.id}', this.value)" style="padding:0.35rem 0.65rem; font-size:0.82rem;">
            <option value="Pending" ${req.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${req.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${req.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>

        <div class="req-action-btns">
          <button class="btn btn-whatsapp btn-sm" onclick="shareRequestWhatsApp('${req.id}')" title="Share via WhatsApp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 2C6.505 2 2 6.504 2 12.029c0 1.83.498 3.548 1.365 5.029L2 22l5.097-1.336a10.02 10.02 0 0 0 4.934 1.286h.005c5.524 0 10.029-4.505 10.029-10.03C22.065 6.504 17.556 2 12.031 2zm0 18.272a8.27 8.27 0 0 1-4.223-1.156l-.303-.18-3.136.822.837-3.058-.198-.315A8.257 8.257 0 0 1 3.766 12.03c0-4.557 3.708-8.265 8.269-8.265 4.558 0 8.266 3.708 8.266 8.267 0 4.558-3.708 8.27-8.271 8.27z"/>
            </svg>
            Share on WhatsApp
          </button>

          <button class="btn btn-outline btn-sm" onclick="copyRequestToClipboard('${req.id}')" title="Copy summary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Details
          </button>

          <button class="btn btn-outline btn-sm" style="color:var(--danger); border-color:#fecaca;" onclick="deleteRequest('${req.id}')" title="Cancel this request">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

        container.appendChild(card);
    });
}

function updateRequestStatus(id, newStatus) {
    const reqs = getStoredRequests();
    const index = reqs.findIndex(r => r.id === id);
    if (index !== -1) {
        reqs[index].status = newStatus;
        saveStoredRequests(reqs);
        renderRequests();
        showToast(`Request ${id} status updated to: ${newStatus}`, 'success');
    }
}

function deleteRequest(id) {
    if (confirm(`Are you sure you want to cancel and remove request ${id}?`)) {
        let reqs = getStoredRequests();
        reqs = reqs.filter(r => r.id !== id);
        saveStoredRequests(reqs);
        renderRequests();
        updateBadgeCounts();
        showToast(`Request ${id} deleted from your device.`, 'info');
    }
}

function shareRequestWhatsApp(id) {
    const reqs = getStoredRequests();
    const req = reqs.find(r => r.id === id);
    if (!req) return;

    const text = `*Khedmati Service Request [${req.id}]*
• *Service:* ${req.service} (${req.issueType})
• *Urgency:* ${req.urgency}
• *Client Name:* ${req.customerName}
• *Contact:* ${req.customerPhone}
• *Location:* ${req.address}, ${req.area}, ${req.city}
• *Problem Details:* ${req.details}
• *Status:* ${req.status}`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
}

function copyRequestToClipboard(id) {
    const reqs = getStoredRequests();
    const req = reqs.find(r => r.id === id);
    if (!req) return;

    const text = `Khedmati Maintenance Request [${req.id}]
Service: ${req.service} - ${req.issueType}
Urgency: ${req.urgency}
Client: ${req.customerName} (${req.customerPhone})
Address: ${req.address}, ${req.area}, ${req.city}
Details: ${req.details}
Status: ${req.status}`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Request details copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy. Please allow clipboard permissions.', 'error');
    });
}

function viewPhotoModal(url) {
    const win = window.open();
    if (win) {
        win.document.write(`<img src="${url}" style="max-width:100%; height:auto; display:block; margin:20px auto; border-radius:8px;" alt="Issue Photo"/>`);
    }
}

// ==============================================================================
// Notification Toast System
// ==============================================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Utility: XSS prevention
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
// ==============================================================================
// Theme & Language Settings Management
// ==============================================================================

const SETTINGS_STORAGE_KEYS = {
    THEME: 'khedmati_theme',
    LANG: 'khedmati_lang'
};

// Full Bilingual Dictionary
const TRANSLATIONS = {
    en: {
        // Brand & Nav
        brand_tagline: "Home Maintenance Platform",
        nav_home: "Home",
        nav_request: "Request a Service",
        nav_directory: "Technician Directory",
        nav_register: "Register as Technician",
        nav_my_requests: "My Requests",
        emergency_btn: "Emergency Service",
        contact_wa: "Contact us on WhatsApp",

        // Home Hero
        hero_badge: "100% Certified Local Handymen & Specialists",
        hero_title: "Reliable Home Repairs Made Effortless.",
        hero_desc: "From sudden plumbing leaks and electrical faults to AC overhauls and appliance repairs—Khedmati connects you instantly with verified local technicians across your city.",
        book_service_btn: "Book a Maintenance Service",
        browse_dir_btn: "Browse Technician Directory",
        no_commission: "Zero Middleman Commissions",
        direct_wa_call: "Direct WhatsApp & Call",
        safe_local_storage: "Safe Local Storage",

        // Services
        services_title: "Maintenance Services We Cover",
        services_sub: "Select a category to pre-fill your service ticket and match with specialized local technicians.",
        srv_electrical: "Electrical",
        srv_plumbing: "Plumbing",
        srv_carpentry: "Carpentry",
        srv_hvac: "HVAC & Air Conditioning",
        srv_appliances: "Home Appliances",
        srv_other: "General Maintenance",

        // Request Form
        request_form_title: "Request Home Maintenance",
        request_form_sub: "Fill in the details below to log your request and contact available technicians.",
        lbl_service_type: "Service Type",
        lbl_issue_type: "Issue Type",
        lbl_urgency: "Urgency Level",
        urgency_emergency: "🚨 Emergency",
        urgency_today: "⚡ Within Today",
        urgency_schedule: "📅 Schedule Later",
        lbl_city: "City",
        lbl_area: "Area / District",
        lbl_address: "Full Address",
        lbl_details: "Additional Details About Problem",
        lbl_cust_name: "Customer Name",
        lbl_cust_phone: "Phone or WhatsApp Number",
        btn_submit_request: "Confirm & Save Request",
        btn_clear_form: "Clear Form",

        // Technician Form
        tech_form_title: "Register as a Technician",
        tech_form_sub: "Offer your maintenance skills to clients in your district. Once registered, your profile appears immediately in the directory.",
        lbl_tech_name: "Full Name",
        lbl_tech_specialty: "Main Specialization",
        lbl_tech_phone: "Phone Number for Calls",
        lbl_tech_whatsapp: "WhatsApp Number for Work",
        lbl_tech_exp: "Years of Experience",
        lbl_tech_hours: "Working Days & Hours",
        lbl_tech_areas: "Cities & Neighborhoods Served",
        btn_publish_profile: "Publish Profile to Directory",

        // Directory
        dir_title: "Verified Technician Directory",
        dir_sub: "Search licensed technicians by specialty or location and reach out directly through WhatsApp or phone call.",
        search_placeholder: "Search by city, area, or technician name...",
        filter_all: "All Specializations",
        call_btn: "Call",
        whatsapp_btn: "WhatsApp",

        // Dashboard
        my_requests_title: "My Service Requests",
        my_requests_sub: "Track submitted maintenance requests, update their status, or share their details with technicians.",
        btn_new_request: "Create New Request",
        stat_total: "Total Requests",
        stat_pending: "Pending Review",
        stat_in_progress: "In Progress",
        stat_emergencies: "Emergencies",
        share_wa_btn: "Share on WhatsApp",
        copy_details_btn: "Copy Details"
    },
    ar: {
        // Brand & Nav
        brand_tagline: "منصة الصيانة المنزلية",
        nav_home: "الرئيسية",
        nav_request: "طلب خدمة",
        nav_directory: "دليل الفنيين",
        nav_register: "تسجيل كفني",
        nav_my_requests: "طلباتي",
        emergency_btn: "خدمة طوارئ",
        contact_wa: "تواصل معنا عبر واتساب",

        // Home Hero
        hero_badge: "فنيون معتمدون ومحترفون محلياً 100%",
        hero_title: "صيانة منزلية موثوقة بكل سهولة وبدون عناء.",
        hero_desc: "من تسريبات السباكة وأعطال الكهرباء الطارئة إلى صيانة التكييف والأجهزة المنزلية—تطبيق خدمتي يربطك مباشرة بأفضل الفنيين المعتمدين في منطقتك.",
        book_service_btn: "طلب خدمة صيانة",
        browse_dir_btn: "تصفح دليل الفنيين",
        no_commission: "بدون أي عمولات وسيط",
        direct_wa_call: "تواصل مباشر هاتفياً وواتساب",
        safe_local_storage: "حفظ آمن ومحلي في جهازك",

        // Services
        services_title: "خدمات الصيانة المتاحة",
        services_sub: "اختر نوع الخدمة لتجهيز طلبك والتواصل الفوري مع الفني المختص.",
        srv_electrical: "كهرباء",
        srv_plumbing: "سباكة",
        srv_carpentry: "نجارة",
        srv_hvac: "تكييف وتبريد",
        srv_appliances: "أجهزة منزلية",
        srv_other: "صيانة عامة",

        // Request Form
        request_form_title: "طلب صيانة منزلية",
        request_form_sub: "أدخل تفاصيل المشكلة لحفظ طلبك والتواصل المباشر مع الفنيين المتاحين.",
        lbl_service_type: "نوع الخدمة",
        lbl_issue_type: "نوع العطل",
        lbl_urgency: "مستوى الأهمية",
        urgency_emergency: "🚨 طوارئ عاجلة",
        urgency_today: "⚡ خلال اليوم",
        urgency_schedule: "📅 موعد لاحق",
        lbl_city: "المدينة",
        lbl_area: "الحي / المنطقة",
        lbl_address: "العنوان بالتفصيل",
        lbl_details: "تفاصيل إضافية عن المشكلة",
        lbl_cust_name: "اسم العميل",
        lbl_cust_phone: "رقم الهاتف أو الواتساب",
        btn_submit_request: "تأكيد وحفظ الطلب",
        btn_clear_form: "مسح النموذج",

        // Technician Form
        tech_form_title: "تسجيل كفني معتمد",
        tech_form_sub: "قدم مهاراتك وخبرتك للعملاء في منطقتك. بعد التسجيل سيظهر ملفك في الدليل مباشرة.",
        lbl_tech_name: "الاسم بالكامل",
        lbl_tech_specialty: "التخصص الأساسي",
        lbl_tech_phone: "رقم الهاتف للمكالمات",
        lbl_tech_whatsapp: "رقم الواتساب للعمل",
        lbl_tech_exp: "سنوات الخبرة",
        lbl_tech_hours: "أيام وساعات العمل",
        lbl_tech_areas: "المناطق والأحياء المخدومة",
        btn_publish_profile: "نشر الملف في الدليل",

        // Directory
        dir_title: "دليل الفنيين المعتمدين",
        dir_sub: "ابحث عن الفنيين حسب التخصص أو المنطقة وتواصل معهم مباشرة عبر الاتصال أو الواتساب.",
        search_placeholder: "ابحث بالمدينة أو الحي أو اسم الفني...",
        filter_all: "جميع التخصصات",
        call_btn: "اتصال",
        whatsapp_btn: "واتساب",

        // Dashboard
        my_requests_title: "طلبات الصيانة الخاصة بي",
        my_requests_sub: "تابع الطلبات السابقة، حدّث الحالة، أو شارك تفاصيل التذكرة مع الفني.",
        btn_new_request: "إنشاء طلب جديد",
        stat_total: "إجمالي الطلبات",
        stat_pending: "قيد المراجعة",
        stat_in_progress: "جاري التنفيذ",
        stat_emergencies: "حالات الطوارئ",
        share_wa_btn: "مشاركة عبر واتساب",
        copy_details_btn: "نسخ التفاصيل"
    }
};

// Current active settings
let currentTheme = localStorage.getItem(SETTINGS_STORAGE_KEYS.THEME) || 'light';
let currentLang = localStorage.getItem(SETTINGS_STORAGE_KEYS.LANG) || 'en';

// Initialize Theme & Language on Page Load
function initThemeAndLanguage() {
    applyTheme(currentTheme);
    applyLanguage(currentLang);
}

// Toggle Theme (Light <-> Dark)
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(SETTINGS_STORAGE_KEYS.THEME, currentTheme);
    applyTheme(currentTheme);
    showToast(
        currentLang === 'ar'
            ? `تم التبديل إلى الوضع ${currentTheme === 'dark' ? 'الليلي' : 'النهاري'}`
            : `Switched to ${currentTheme} mode`,
        'info'
    );
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const mobThemeText = document.querySelector('.mobThemeText');
    if (mobThemeText) {
        mobThemeText.textContent = theme === 'dark'
            ? (currentLang === 'ar' ? 'الوضع النهاري' : 'Light Mode')
            : (currentLang === 'ar' ? 'الوضع الليلي' : 'Dark Mode');
    }
}

// Toggle Language (English <-> Arabic)
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem(SETTINGS_STORAGE_KEYS.LANG, currentLang);
    applyLanguage(currentLang);
    showToast(
        currentLang === 'ar' ? 'تم تحويل الواجهة إلى العربية' : 'Switched interface to English',
        'success'
    );
}

function applyLanguage(lang) {
    const isRTL = lang === 'ar';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Update header label
    const langLabel = document.getElementById('langLabel');
    const mobLangLabel = document.querySelector('.mobLangLabel');
    if (langLabel) langLabel.textContent = isRTL ? 'English' : 'عربي';
    if (mobLangLabel) mobLangLabel.textContent = isRTL ? 'English' : 'عربي';

    // Update Nav links
    const navMap = {
        home: isRTL ? 'الرئيسية' : 'Home',
        request: isRTL ? 'طلب خدمة' : 'Request a Service',
        directory: isRTL ? 'دليل الفنيين' : 'Technician Directory',
        register: isRTL ? 'تسجيل كفني' : 'Register as Technician',
        'my-requests': isRTL ? 'طلباتي' : 'My Requests'
    };

    document.querySelectorAll('.nav-link[data-nav]').forEach(link => {
        const key = link.getAttribute('data-nav');
        if (navMap[key]) {
            const badge = link.querySelector('.nav-badge');
            link.childNodes[0].nodeValue = navMap[key] + ' ';
            if (badge) link.appendChild(badge);
        }
    });

    // Update floating WhatsApp button label
    const waLabel = document.querySelector('.wa-label-text');
    if (waLabel) {
        waLabel.textContent = isRTL ? 'تواصل معنا عبر واتساب' : 'Contact us on WhatsApp';
    }

    // Update Search input placeholder
    const searchInput = document.getElementById('directorySearchInput');
    if (searchInput) {
        searchInput.placeholder = TRANSLATIONS[lang].search_placeholder;
    }

    // Update All Specializations Filter Pill
    const allFilterPill = document.querySelector('.filter-pill[data-filter="All"]');
    if (allFilterPill) {
        allFilterPill.textContent = TRANSLATIONS[lang].filter_all;
    }

    // Re-render dynamic components with translated action buttons
    if (typeof renderDirectory === 'function') renderDirectory();
    if (typeof renderRequests === 'function') renderRequests();
}

// Make sure initThemeAndLanguage runs when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    initThemeAndLanguage();
});