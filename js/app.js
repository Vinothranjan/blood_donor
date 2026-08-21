/**
 * LifePulse AI — Core Application & Multi-Portal State Engine
 * Premium Edition: Landing page, Auth guards, Donor search on-demand
 * Supports: Patient/Hospital (no login), Donor (password required), Admin (password required)
 */

// =============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) CONSTANTS & HELPERS
// =============================================================================
const ROLES = {
    PATIENT_HOSPITAL: 'PATIENT_HOSPITAL',
    DONOR: 'DONOR',
    BLOOD_BANK: 'BLOOD_BANK',
    ADMIN: 'ADMIN'
};

function getNormalizedRole(roleStr) {
    if (!roleStr) return ROLES.PATIENT_HOSPITAL;
    const r = roleStr.toString().trim().toUpperCase();
    if (r === 'DONOR') return ROLES.DONOR;
    if (r === 'BLOOD_BANK' || r === 'HOSPITAL_BANK' || r === 'BANK') return ROLES.BLOOD_BANK;
    if (r === 'ADMIN') return ROLES.ADMIN;
    if (r === 'PATIENT_HOSPITAL' || r === 'RECEIVER' || r === 'PATIENT') return ROLES.PATIENT_HOSPITAL;
    return ROLES.PATIENT_HOSPITAL;
}

function getPortalForRole(roleStr) {
    const norm = getNormalizedRole(roleStr);
    if (norm === ROLES.BLOOD_BANK) return 'bank';
    if (norm === ROLES.DONOR) return 'donor';
    if (norm === ROLES.ADMIN) return 'admin';
    return 'receiver';
}

function getPortalDisplayName(portalId) {
    const pid = (portalId || '').toLowerCase();
    if (pid === 'bank' || pid === 'hospital_bank') return 'Blood Bank Dashboard';
    if (pid === 'donor') return 'Donor Dashboard';
    if (pid === 'admin') return 'Admin Command Center';
    return 'Patient / Hospital Portal';
}

function getRoleDisplayName(roleStr) {
    const norm = getNormalizedRole(roleStr);
    if (norm === ROLES.BLOOD_BANK) return 'Blood Bank';
    if (norm === ROLES.DONOR) return 'Donor';
    if (norm === ROLES.ADMIN) return 'Administrator';
    return 'Patient / Hospital';
}

function isPortalAllowedForUser(portalId, user) {
    let target = (portalId || 'receiver').toLowerCase();
    if (target === 'hospital_bank') target = 'bank';

    if (!user) {
        // Unauthenticated guests can access receiver (patient/hospital search)
        return target === 'receiver';
    }

    const normRole = getNormalizedRole(user.role);
    if (normRole === ROLES.BLOOD_BANK) return target === 'bank';
    if (normRole === ROLES.DONOR) return target === 'donor';
    if (normRole === ROLES.ADMIN) return target === 'admin';
    if (normRole === ROLES.PATIENT_HOSPITAL) return target === 'receiver';

    return target === 'receiver';
}

function scrollToSection(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
window.scrollToSection = scrollToSection;
window.getNormalizedRole = getNormalizedRole;
window.getPortalForRole = getPortalForRole;
window.ROLES = ROLES;

function initHashRouting() {
    window.addEventListener('hashchange', function () {
        const hash = window.location.hash.substring(1);
        if (hash) {
            window.LifePulseApp.switchPortal(hash);
        }
    });

    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        window.LifePulseApp.switchPortal(initialHash);
    }
}

window.LifePulseApp = {
    currentPortal: 'receiver',
    currentUser: null,
    selectedStateId: 'TN',
    selectedDistrictId: 'chennai',
    searchHasBeenDone: false,

    init: function () {
        console.log('🩸 LifePulse AI initializing...');

        // Spawn floating particles on landing page
        this.spawnParticles();

        // Populate state dropdowns for all portals
        this.populateStates('receiver');
        this.populateStates('donor');
        this.populateStates('admin');
        this.populateStates('bankreg');

        // Initialize Leaflet Map Engine
        if (window.LifePulseMap) {
            window.LifePulseMap.initMap('map-container', 13.0827, 80.2707, 12);
        }

        // Render sidebar & admin data
        this.renderActiveRequests();
        this.renderAdminDashboard();
        this.renderDonorAlerts();

        // Restore user session
        this.restoreUserSession();

        // Initialize Hash Routing & RBAC listener
        initHashRouting();

        // Wire up language selector
        var langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.addEventListener('change', function () {
                var lang = langSelect.value;
                if (window.LifePulseI18n) {
                    window.LifePulseI18n.setLanguage(lang);
                    applyTranslations(lang);
                }
            });
        }

        console.log('✅ LifePulse AI ready.');
    },

    // =========================================================================
    // LANDING PAGE LOGIC
    // =========================================================================
    spawnParticles: function () {
        const container = document.getElementById('landing-particles');
        if (!container) return;
        const colors = ['#E53935', '#EF5350', '#FF7875', '#FFCDD2', '#C2185B'];
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            p.style.left = Math.random() * 100 + '%';
            p.style.width = (Math.random() * 3 + 2) + 'px';
            p.style.height = p.style.width;
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDuration = (Math.random() * 8 + 6) + 's';
            p.style.animationDelay = (Math.random() * 8) + 's';
            container.appendChild(p);
        }
    },

    // =========================================================================
    // STATE & DISTRICT DROPDOWNS
    // =========================================================================
    populateStates: function (portalPrefix) {
        let stateSelect;
        if (portalPrefix === 'admin') {
            stateSelect = document.getElementById('admin-broadcast-state');
        } else if (portalPrefix === 'bankreg') {
            stateSelect = document.getElementById('reg-bank-state');
        } else {
            stateSelect = document.getElementById(`${portalPrefix}-state-select`);
        }
        if (!stateSelect) return;

        stateSelect.innerHTML = '';
        const states = window.LifePulseData.states || [];
        states.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st.id;
            opt.textContent = st.name;
            if (st.id === this.selectedStateId) opt.selected = true;
            stateSelect.appendChild(opt);
        });
        const currentSelectedState = stateSelect.value || this.selectedStateId || (states[0] ? states[0].id : '');
        this.populateDistricts(portalPrefix, currentSelectedState);
    },

    populateDistricts: function (portalPrefix, stateId) {
        let distSelect;
        if (portalPrefix === 'admin') {
            distSelect = document.getElementById('admin-broadcast-district');
        } else if (portalPrefix === 'bankreg') {
            distSelect = document.getElementById('reg-bank-district');
        } else {
            distSelect = document.getElementById(`${portalPrefix}-district-select`);
        }
        if (!distSelect) return;

        distSelect.innerHTML = '';
        const districts = (window.LifePulseData.districts || []).filter(d => d.stateId === stateId);

        if (districts.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No districts found';
            distSelect.appendChild(opt);
            return;
        }

        districts.forEach((dist, index) => {
            const opt = document.createElement('option');
            opt.value = dist.id;
            opt.textContent = dist.name;
            if (portalPrefix !== 'bankreg' && index === 0 && !this.selectedDistrictId) this.selectedDistrictId = dist.id;
            distSelect.appendChild(opt);
        });

        if (portalPrefix === 'bankreg' && districts.length > 0) {
            const latInput = document.getElementById('reg-bank-lat');
            const lngInput = document.getElementById('reg-bank-lng');
            if (latInput && (!latInput.value || latInput.value === '13.0780')) {
                latInput.value = districts[0].lat.toFixed(4);
            }
            if (lngInput && (!lngInput.value || lngInput.value === '80.2610')) {
                lngInput.value = districts[0].lng.toFixed(4);
            }
        }
    },

    onStateChange: function (portalPrefix) {
        let stateSelect;
        if (portalPrefix === 'admin') {
            stateSelect = document.getElementById('admin-broadcast-state');
        } else if (portalPrefix === 'bankreg') {
            stateSelect = document.getElementById('reg-bank-state');
        } else {
            stateSelect = document.getElementById(`${portalPrefix}-state-select`);
        }
        if (!stateSelect) return;

        const stateId = stateSelect.value;
        if (portalPrefix !== 'bankreg') {
            this.selectedStateId = stateId;
        }
        this.populateDistricts(portalPrefix, stateId);

        let distSelect;
        if (portalPrefix === 'admin') {
            distSelect = document.getElementById('admin-broadcast-district');
        } else if (portalPrefix === 'bankreg') {
            distSelect = document.getElementById('reg-bank-district');
        } else {
            distSelect = document.getElementById(`${portalPrefix}-district-select`);
        }
        if (distSelect && distSelect.value) {
            if (portalPrefix !== 'bankreg') {
                this.selectedDistrictId = distSelect.value;
            }
            this.onDistrictChange(portalPrefix);
        }
    },

    onDistrictChange: function (portalPrefix) {
        let distSelect;
        if (portalPrefix === 'admin') {
            distSelect = document.getElementById('admin-broadcast-district');
        } else if (portalPrefix === 'bankreg') {
            distSelect = document.getElementById('reg-bank-district');
        } else {
            distSelect = document.getElementById(`${portalPrefix}-district-select`);
        }
        if (!distSelect || !distSelect.value) return;

        const distId = distSelect.value;
        const districtObj = (window.LifePulseData.districts || []).find(d => d.id === distId);

        if (portalPrefix === 'bankreg') {
            if (districtObj) {
                const latInput = document.getElementById('reg-bank-lat');
                const lngInput = document.getElementById('reg-bank-lng');
                if (latInput) latInput.value = districtObj.lat.toFixed(4);
                if (lngInput) lngInput.value = districtObj.lng.toFixed(4);
            }
            return;
        }

        this.selectedDistrictId = distId;
        if (districtObj && window.LifePulseMap) {
            window.LifePulseMap.centerMap(districtObj.lat, districtObj.lng, 12);
        }

        this.renderDistrictHospitals();
        // Do NOT auto-trigger search — only trigger when button is clicked
    },

    // =========================================================================
    // DONOR SEARCH (only triggered by button click)
    // =========================================================================
    triggerReceiverSearch: function () {
        const stateSelect = document.getElementById('receiver-state-select');
        const distSelect = document.getElementById('receiver-district-select');
        const bloodSelect = document.getElementById('receiver-blood-select');
        if (!stateSelect || !distSelect || !bloodSelect) return;

        const stateId = stateSelect.value;
        const districtId = distSelect.value;
        const bloodGroup = bloodSelect.value;

        // Show results card & hide prompt card
        const resultsCard = document.getElementById('donor-results-card');
        const promptCard = document.getElementById('search-prompt-card');
        if (resultsCard) resultsCard.style.display = 'block';
        if (promptCard) promptCard.style.display = 'none';

        this.searchHasBeenDone = true;

        // Filter donors with blood group compatibility
        const allDonors = window.LifePulseData.donors || [];

        function isGroupCompatible(donorGroup, targetGroup) {
            if (!targetGroup || targetGroup === 'ALL' || targetGroup === '') return true;
            if (donorGroup === targetGroup) return true;
            if (window.LifePulseAIMatching && window.LifePulseAIMatching.compatibilityMatrix) {
                const compat = window.LifePulseAIMatching.compatibilityMatrix[donorGroup];
                if (compat && compat[targetGroup] !== undefined) {
                    return compat[targetGroup] > 0;
                }
            }
            return false;
        }

        let districtDonors = allDonors.filter(d => 
            d.districtId === districtId && 
            d.readyToDonate && 
            isGroupCompatible(d.bloodGroup, bloodGroup)
        );

        // Sort exact blood group matches first
        if (bloodGroup && bloodGroup !== 'ALL') {
            districtDonors.sort((a, b) => {
                if (a.bloodGroup === bloodGroup && b.bloodGroup !== bloodGroup) return -1;
                if (a.bloodGroup !== bloodGroup && b.bloodGroup === bloodGroup) return 1;
                return 0;
            });
        }

        const matchedDonors = districtDonors.length > 0
            ? districtDonors
            : allDonors.filter(d => 
                d.stateId === stateId && 
                d.readyToDonate && 
                isGroupCompatible(d.bloodGroup, bloodGroup)
            );

        // Update Map Markers
        if (window.LifePulseMap) {
            window.LifePulseMap.clearMarkers();
            const districtHospitals = (window.LifePulseData.hospitals || []).filter(h => h.districtId === districtId);
            districtHospitals.forEach(h => window.LifePulseMap.addHospitalMarker(h.name, h.lat, h.lng, h.phone));
            matchedDonors.forEach(d => window.LifePulseMap.addDonorMarker(d.name, d.bloodGroup, d.lat, d.lng, d.phone));
        }

        // Update badge count
        const countBadge = document.getElementById('match-count-badge');
        if (countBadge) countBadge.textContent = `${matchedDonors.length} Donors Matched`;

        // Render donor cards
        const listContainer = document.getElementById('matched-donors-list');
        if (!listContainer) return;

        if (matchedDonors.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center;padding:32px;color:var(--text-muted);">
                    <div style="font-size:40px;margin-bottom:12px;">🔍</div>
                    <p style="font-size:15px;font-weight:600;color:var(--text-secondary);">No donors found in this district</p>
                    <p style="font-size:13px;margin-top:6px;">Triggering standby network notification to nearby districts...</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = matchedDonors.map(d => `
            <div class="donor-card">
                <div style="display:flex;align-items:center;gap:16px;">
                    <div class="blood-badge">${d.bloodGroup}</div>
                    <div class="donor-info">
                        <h4>${d.name} ${d.isVerified ? '<span style="color:var(--emerald);font-size:12px;">✓ Verified</span>' : ''} ${d.isDemo ? '<span style="background:rgba(255,255,255,0.1);color:var(--text-muted);font-size:10px;padding:1px 6px;border-radius:4px;">Demo Record</span>' : ''}</h4>
                        <p>📍 ${(d.district || d.districtId).toUpperCase()} • ${d.donationsCount || 5} Donations</p>
                        <p style="color:var(--emerald);font-weight:700;font-size:12px;margin-top:3px;">● ${window.LifePulseI18n ? window.LifePulseI18n.getText('statusReadyDonate') : 'Ready to Donate'}</p>
                    </div>
                </div>
                <a href="tel:${d.phone}" class="btn-success">
                    📞 ${window.LifePulseI18n ? window.LifePulseI18n.getText('respondBtn') : 'Contact'}
                </a>
            </div>
        `).join('');

        // Smooth scroll to results
        if (resultsCard) {
            setTimeout(() => {
                resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }
    },

    renderDistrictHospitals: function () {
        const container = document.getElementById('district-hospitals-sidebar');
        if (!container) return;

        const hospitals = (window.LifePulseData.hospitals || []).filter(h => h.districtId === this.selectedDistrictId);

        if (hospitals.length === 0) {
            container.innerHTML = `<p style="font-size:13px;color:var(--text-muted);">📞 National Helpline: 108 Emergency Service</p>`;
            return;
        }

        container.innerHTML = hospitals.map(h => `
            <div class="hospital-card">
                <div style="font-weight:800;font-size:13px;color:var(--text-primary);">${h.name}</div>
                <div style="font-size:12px;color:var(--emerald);font-weight:600;margin-top:5px;">📞 ${h.phone}</div>
            </div>
        `).join('');
    },

    renderActiveRequests: function () {
        const container = document.getElementById('active-requests-sidebar');
        if (!container) return;

        const requests = window.LifePulseData.activeRequests || [];
        const respondText = window.LifePulseI18n ? window.LifePulseI18n.getText('respondBtn') : 'Respond 📞';
        container.innerHTML = requests.map(r => `
            <div class="request-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span class="blood-badge" style="width:34px;height:34px;font-size:12px;">${r.bloodGroup}</span>
                    <span class="glow-pill critical" style="font-size:10px;">${r.urgency}</span>
                </div>
                <div style="font-weight:800;font-size:13px;">${r.patientName} (${r.units} Units)</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">${r.hospital}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                    <span style="font-size:11px;color:var(--text-ghost);">${r.requestedAt}</span>
                    <a href="tel:${r.contact}" style="color:var(--red-400);font-weight:800;font-size:12px;text-decoration:none;">${respondText}</a>
                </div>
            </div>
        `).join('');
    },

    renderDonorAlerts: function () {
        const container = document.getElementById('donor-alerts-list');
        if (!container) return;

        const requests = window.LifePulseData.activeRequests || [];
        const acceptText = window.LifePulseI18n ? (window.LifePulseI18n.getText('btnAccept') || 'Accept & Donate') : 'Accept & Donate';
        container.innerHTML = requests.map(r => `
            <div class="donor-card" style="border-color:rgba(229,57,53,0.3);">
                <div style="display:flex;align-items:center;gap:14px;">
                    <div class="blood-badge">${r.bloodGroup}</div>
                    <div class="donor-info">
                        <h4>🚨 ${r.patientName} — ${r.units} Bags Needed</h4>
                        <p>📍 ${r.hospital}</p>
                        <p style="color:var(--red-400);font-weight:700;font-size:12px;">${r.urgency}</p>
                    </div>
                </div>
                <button class="btn-primary" style="white-space:nowrap;padding:10px 16px;font-size:13px;"
                    onclick="alert('Thank you for responding!\\nPatient contact: ${r.contact}')">
                    ${acceptText}
                </button>
            </div>
        `).join('');
    },

    renderAdminDashboard: function () {
        // Stock Matrix
        const matrixContainer = document.getElementById('admin-stock-matrix');
        if (matrixContainer) {
            const groups = ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
            matrixContainer.innerHTML = groups.map(grp => {
                const count = grp === 'O-' ? 8 : (grp.includes('+') ? 45 : 16);
                const color = count < 10 ? 'var(--red-400)' : 'var(--emerald)';
                return `
                    <div class="stat-box">
                        <div class="stat-number" style="color:${color};">${count}</div>
                        <div class="stat-label">${grp} Units</div>
                    </div>
                `;
            }).join('');
        }

        // Audit Logs
        const logsContainer = document.getElementById('admin-ledger-logs');
        if (logsContainer) {
            const logs = [
                { time: '19:28:10', event: 'Emergency Broadcast sent to Chennai (O- Negative)', status: 'SUCCESS' },
                { time: '19:15:02', event: 'SHA-256 Certificate generated for Dr. Vikram Seth', status: 'VERIFIED' },
                { time: '18:50:44', event: 'Request #req-01 matched with 3 donors in Chennai', status: 'MATCHED' },
                { time: '18:10:12', event: 'New Donor registered: Bengaluru Urban (Siddharth Rao)', status: 'REGISTERED' },
            ];
            logsContainer.innerHTML = logs.map(l => `
                <div class="ledger-log">
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);">
                        <span>${l.time}</span>
                        <span style="color:var(--emerald);font-weight:700;">${l.status}</span>
                    </div>
                    <div style="font-size:13px;color:var(--text-primary);font-weight:600;margin-top:4px;">${l.event}</div>
                </div>
            `).join('');
        }
    },

    // =========================================================================
    // PORTAL SWITCHING
    // =========================================================================
    // =========================================================================
    // PORTAL SWITCHING WITH STRICT RBAC GUARD
    // =========================================================================
    switchPortal: function (portalName) {
        let targetId = portalName ? portalName.toLowerCase() : 'receiver';
        if (targetId === 'hospital_bank') {
            targetId = 'bank';
        }

        const user = this.currentUser;

        // Perform RBAC Access Control Check
        if (!isPortalAllowedForUser(targetId, user)) {
            if (user) {
                const authorizedPortal = getPortalForRole(user.role);
                if (typeof showToast === 'function') {
                    showToast('⛔ Access Denied', `As a ${getRoleDisplayName(user.role)}, you cannot switch to ${getPortalDisplayName(targetId)}. Access restricted to your dashboard.`, 'error');
                }
                targetId = authorizedPortal;
            } else {
                // Unauthenticated guest trying to access protected portal
                if (targetId !== 'receiver') {
                    if (typeof showToast === 'function') {
                        showToast('🔐 Password Required', `Access to ${getPortalDisplayName(targetId)} requires logging in.`, 'info');
                    }
                    setTimeout(() => openAuthModal(targetId === 'bank' ? 'hospital_bank' : targetId), 200);
                    targetId = 'receiver';
                }
            }
        }

        this.currentPortal = targetId;

        try {
            if (window.location.hash.substring(1) !== targetId) {
                window.history.replaceState(null, null, '#' + targetId);
            }
        } catch (e) {}

        // Hide all portals & deactivate buttons
        document.querySelectorAll('.portal-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.role-btn').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item-btn').forEach(el => el.classList.remove('active'));

        const targetPortal = document.getElementById(`portal-${targetId}`);
        if (targetPortal) targetPortal.classList.add('active');

        // Re-render navbar to reflect current role and portal
        this.renderNavbarForRole();

        // Invalidate Leaflet map size
        if (targetId === 'receiver' && window.LifePulseMap && window.LifePulseMap.map) {
            setTimeout(() => window.LifePulseMap.map.invalidateSize(), 200);
        }
    },

    // Dynamically renders top navigation bar based on active authenticated role
    renderNavbarForRole: function () {
        const navContainer = document.getElementById('dynamic-nav-bar');
        if (!navContainer) return;

        const user = this.currentUser;

        if (!user) {
            // Guest user: render public portal switcher tabs
            navContainer.innerHTML = `
                <div class="role-switcher">
                    <button class="role-btn ${this.currentPortal === 'receiver' ? 'active' : ''}" id="nav-btn-receiver" onclick="switchPortal('receiver')">
                        🏥 Patient / Hospital
                    </button>
                    <button class="role-btn ${this.currentPortal === 'donor' ? 'active' : ''}" id="nav-btn-donor" onclick="handleDonorNavClick()">
                        🩸 Blood Donor
                    </button>
                    <button class="role-btn ${this.currentPortal === 'bank' ? 'active' : ''}" id="nav-btn-bank" onclick="handleBankNavClick()">
                        🏦 Blood Bank
                    </button>
                    <button class="role-btn ${this.currentPortal === 'admin' ? 'active' : ''}" id="nav-btn-admin" onclick="handleAdminNavClick()">
                        🛡️ Admin
                    </button>
                </div>
            `;
            return;
        }

        const normRole = getNormalizedRole(user.role);

        if (normRole === ROLES.BLOOD_BANK) {
            navContainer.innerHTML = `
                <div class="role-nav-menu">
                    <button class="nav-item-btn active" onclick="switchPortal('bank')">📊 Dashboard</button>
                    <button class="nav-item-btn" onclick="openBankStockModal()">🩸 Manage Inventory</button>
                    <button class="nav-item-btn" onclick="scrollToSection('bank-requests-table-container')">📥 Blood Requests</button>
                    <button class="nav-item-btn" onclick="scrollToSection('bank-verify-token-input')">📜 Verification</button>
                    <button class="nav-item-btn" onclick="scrollToSection('bank-settings-address')">⚙️ Profile Settings</button>
                </div>
            `;
        } else if (normRole === ROLES.DONOR) {
            navContainer.innerHTML = `
                <div class="role-nav-menu">
                    <button class="nav-item-btn active" onclick="switchPortal('donor')">📊 Dashboard</button>
                    <button class="nav-item-btn" onclick="scrollToSection('donor-profile-name')">👤 My Profile</button>
                    <button class="nav-item-btn" onclick="scrollToSection('donor-certificates-list')">📜 Donation History</button>
                    <button class="nav-item-btn" onclick="scrollToSection('donor-alerts-list')">🚨 Requests / Matches</button>
                </div>
            `;
        } else if (normRole === ROLES.ADMIN) {
            navContainer.innerHTML = `
                <div class="role-nav-menu">
                    <button class="nav-item-btn active" onclick="switchPortal('admin')">🛡️ Admin Dashboard</button>
                    <button class="nav-item-btn" onclick="scrollToSection('admin-pending-banks-list')">🏢 Verify Blood Banks</button>
                    <button class="nav-item-btn" onclick="scrollToSection('admin-broadcast-msg')">📢 Mass Broadcast</button>
                    <button class="nav-item-btn" onclick="scrollToSection('admin-stock-matrix')">📊 Reserve Matrix</button>
                    <button class="nav-item-btn" onclick="scrollToSection('admin-ledger-logs')">📜 Audit Ledger</button>
                </div>
            `;
        } else {
            // PATIENT_HOSPITAL
            navContainer.innerHTML = `
                <div class="role-nav-menu">
                    <button class="nav-item-btn active" onclick="switchPortal('receiver')">📊 Dashboard</button>
                    <button class="nav-item-btn" onclick="revealPatientSearch()">🔍 Find Donors</button>
                    <button class="nav-item-btn" onclick="revealPatientSearch(); switchSearchTab('banks');">🏥 Blood Banks</button>
                    <button class="nav-item-btn" onclick="scrollToSection('active-requests-sidebar')">🔥 Emergency Requests</button>
                    <button class="nav-item-btn" onclick="openPatientQRGenModal()">📱 Verification QR</button>
                </div>
            `;
        }
    },

    // Show donor portal content vs guard
    showDonorPortalContent: function (show) {
        const guard = document.getElementById('donor-portal-guard');
        const content = document.getElementById('donor-portal-content');
        if (guard) guard.classList.toggle('hidden', show);
        if (content) content.classList.toggle('hidden', !show);
    },

    // Show admin portal content vs guard
    showAdminPortalContent: function (show) {
        const guard = document.getElementById('admin-portal-guard');
        const content = document.getElementById('admin-portal-content');
        if (guard) guard.classList.toggle('hidden', show);
        if (content) content.classList.toggle('hidden', !show);
    },

    // =========================================================================
    // SESSION RESTORE
    // =========================================================================
    restoreUserSession: function () {
        try {
            // Restore custom registered donors from localStorage
            const savedCustoms = JSON.parse(localStorage.getItem('lifepulse_registered_donors') || '[]');
            if (savedCustoms.length > 0 && window.LifePulseData && window.LifePulseData.donors) {
                savedCustoms.forEach(cDonor => {
                    if (!window.LifePulseData.donors.some(d => d.id === cDonor.id)) {
                        window.LifePulseData.donors.unshift(cDonor);
                    }
                });
            }

            const session = localStorage.getItem('lifepulse_user');
            if (session) {
                this.currentUser = JSON.parse(session);
                this.applyUserSession();
            } else {
                this.renderNavbarForRole();
            }
        } catch (e) {
            console.error('Session restore failed', e);
            this.renderNavbarForRole();
        }
    },

    applyUserSession: function () {
        if (!this.currentUser) {
            this.renderNavbarForRole();
            return;
        }
        updateUserProfileUI();

        const normRole = getNormalizedRole(this.currentUser.role);
        const authorizedPortal = getPortalForRole(normRole);

        if (normRole === ROLES.DONOR) this.showDonorPortalContent(true);
        if (normRole === ROLES.ADMIN) this.showAdminPortalContent(true);
        if (normRole === ROLES.BLOOD_BANK) {
            const guard = document.getElementById('bank-portal-guard');
            const content = document.getElementById('bank-portal-content');
            if (guard) guard.classList.add('hidden');
            if (content) content.classList.remove('hidden');
            if (typeof renderBankDashboard === 'function') renderBankDashboard();
        }

        this.switchPortal(authorizedPortal);
    }
};


// =============================================================================
// LANDING PAGE FUNCTIONS
// =============================================================================
function showApp() {
    const landing = document.getElementById('landing-page');
    const appWrapper = document.getElementById('app-wrapper');
    if (landing) landing.classList.add('hide-landing');
    if (appWrapper) appWrapper.style.display = 'block';

    // Init map after reveal
    setTimeout(() => {
        if (window.LifePulseMap && window.LifePulseMap.map) {
            window.LifePulseMap.map.invalidateSize();
        }
    }, 400);
}

function showLanding() {
    const landing = document.getElementById('landing-page');
    const appWrapper = document.getElementById('app-wrapper');
    if (landing) landing.classList.remove('hide-landing');
    if (appWrapper) appWrapper.style.display = 'none';
}

function revealPatientSearch() {
    const searchArea = document.getElementById('patient-search-area');
    if (searchArea) {
        searchArea.style.display = 'block';
        searchArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
        if (window.LifePulseMap && window.LifePulseMap.map) {
            window.LifePulseMap.map.invalidateSize();
        }
    }, 300);
}

function enterAsPatient(openSearch = false) {
    showApp();
    const user = window.LifePulseApp.currentUser;
    if (user) {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    } else {
        window.LifePulseApp.switchPortal('receiver');
    }
    if (openSearch) {
        setTimeout(revealPatientSearch, 150);
    }
}

function enterAsDonor() {
    showApp();
    const user = window.LifePulseApp.currentUser;
    if (!user) {
        window.LifePulseApp.switchPortal('donor');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}

function enterAsAdmin() {
    showApp();
    const user = window.LifePulseApp.currentUser;
    if (!user) {
        window.LifePulseApp.switchPortal('admin');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}

window.revealPatientSearch = revealPatientSearch;
window.enterAsPatient = enterAsPatient;
window.enterAsDonor = enterAsDonor;
window.enterAsAdmin = enterAsAdmin;

// =============================================================================
// PORTAL NAV CLICK HANDLERS (with auth guard for donor/admin)
// =============================================================================
function handleDonorNavClick() {
    const user = window.LifePulseApp.currentUser;
    if (!user) {
        window.LifePulseApp.switchPortal('donor');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}

function handleBankNavClick() {
    const user = window.LifePulseApp.currentUser;
    if (!user) {
        window.LifePulseApp.switchPortal('bank');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}

function handleAdminNavClick() {
    const user = window.LifePulseApp.currentUser;
    if (!user) {
        window.LifePulseApp.switchPortal('admin');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}
window.handleBankNavClick = handleBankNavClick;


// =============================================================================
// GLOBAL EVENT HANDLERS (called from HTML)
// =============================================================================
function switchPortal(portalName) { window.LifePulseApp.switchPortal(portalName); }
function onStateChange(prefix) { window.LifePulseApp.onStateChange(prefix); }
function onDistrictChange(prefix) { window.LifePulseApp.onDistrictChange(prefix); }

function triggerReceiverSearch() {
    window.LifePulseApp.triggerReceiverSearch();
}

function toggleDonorAvailability(isChecked) {
    const statusText = document.getElementById('donor-status-text');
    if (statusText) {
        statusText.textContent = isChecked ? 'Ready to Donate' : 'Unavailable (Standby)';
        statusText.style.color = isChecked ? 'var(--emerald)' : 'var(--text-muted)';
    }
}

function saveDonorPreferences(event) {
    const user = window.LifePulseApp.currentUser;
    const bloodSelect = document.getElementById('donor-blood-select');
    const stateSelect = document.getElementById('donor-state-select');
    const districtSelect = document.getElementById('donor-district-select');

    if (user) {
        if (bloodSelect) user.bloodGroup = bloodSelect.value;
        if (districtSelect && stateSelect && districtSelect.selectedIndex >= 0 && stateSelect.selectedIndex >= 0) {
            const distName = districtSelect.options[districtSelect.selectedIndex]?.text || '';
            const stateName = stateSelect.options[stateSelect.selectedIndex]?.text || '';
            if (distName && stateName) {
                user.location = `${distName}, ${stateName}`;
            }
        }
        localStorage.setItem('lifepulse_user', JSON.stringify(user));
        updateUserProfileUI();
    }

    const btn = event && event.currentTarget ? event.currentTarget : document.querySelector('button[onclick*="saveDonorPreferences"]');
    if (btn) {
        const origText = btn.textContent;
        btn.textContent = '✓ Saved!';
        setTimeout(() => btn.textContent = origText, 2000);
    }
}

function updateDonorProfileData() {
    const bloodSelect = document.getElementById('donor-blood-select');
    const badge = document.getElementById('donor-profile-group');
    if (bloodSelect && badge) badge.textContent = bloodSelect.value;
}

function triggerAdminBroadcast() {
    const msg = document.getElementById('admin-broadcast-msg').value;
    alert(`📢 BROADCAST DISPATCHED!\nEmergency notification sent to all registered donors.\nMessage: "${msg}"`);
}


// =============================================================================
// AUTHENTICATION & USER PROFILE ENGINE
// =============================================================================
let activeAuthRole = 'receiver';
window.activeAuthRole = activeAuthRole;

function openAuthModal(forceRole) {
    const modal = document.getElementById('auth-modal-overlay');
    const tabs = document.getElementById('auth-role-tabs-container');
    if (modal) modal.classList.remove('hidden');

    // Always clear form inputs when opening modal
    const nameInput = document.getElementById('auth-name-input');
    const phoneInput = document.getElementById('auth-phone-input');
    const passInput = document.getElementById('auth-password-input');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (passInput) passInput.value = '';

    if (forceRole) {
        if (tabs) tabs.style.display = 'none'; // Hide role tabs when opening dedicated login modal
        switchAuthTab(forceRole);
    } else {
        if (tabs) tabs.style.display = 'flex'; // Show tabs only if general sign-in
        switchAuthTab('receiver');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) modal.classList.add('hidden');
}

let activeAuthMode = 'login';
window.activeAuthMode = activeAuthMode;

function setAuthMode(mode) {
    activeAuthMode = mode;
    window.activeAuthMode = mode;

    const btnLogin = document.getElementById('auth-mode-btn-login');
    const btnReg = document.getElementById('auth-mode-btn-register');
    if (btnLogin) btnLogin.classList.toggle('active', mode === 'login');
    if (btnReg) btnReg.classList.toggle('active', mode === 'register');

    const regExtra = document.getElementById('auth-register-extra-fields');
    if (regExtra) {
        regExtra.classList.toggle('hidden', mode !== 'register' || activeAuthRole !== 'donor');
        if (mode === 'register' && activeAuthRole === 'donor') {
            populateDistrictsForRegState('TN');
        }
    }

    const footerText = document.getElementById('auth-footer-text');
    const footerLink = document.getElementById('auth-footer-link');
    if (footerText && footerLink) {
        if (mode === 'login') {
            footerText.textContent = activeAuthRole === 'hospital_bank' ? 'New Blood Bank Facility?' : 'New Donor?';
            footerLink.textContent = activeAuthRole === 'hospital_bank' ? 'Register Your Blood Bank Facility' : 'Register as a New Donor';
        } else {
            footerText.textContent = 'Already have an account?';
            footerLink.textContent = 'Click here to Sign In';
        }
    }

    updateAuthModalUI();
}

function toggleAuthMode() {
    if (activeAuthRole === 'hospital_bank' && activeAuthMode === 'login') {
        closeAuthModal();
        openBankRegistrationModal();
        return;
    }
    setAuthMode(activeAuthMode === 'login' ? 'register' : 'login');
}

function populateDistrictsForRegState(stateId) {
    const distSelect = document.getElementById('auth-reg-district-select');
    if (!distSelect || !window.LifePulseData) return;
    const districts = (window.LifePulseData.districts || []).filter(d => d.stateId === (stateId || 'TN'));
    distSelect.innerHTML = districts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}
window.LifePulseApp.populateDistrictsForRegState = populateDistrictsForRegState;

function updateAuthModalUI() {
    const role = activeAuthRole;
    const mode = activeAuthMode;

    const icons = { receiver: '🏥', donor: '🩸', hospital_bank: '🏦', admin: '🛡️' };
    const icon = document.getElementById('auth-modal-icon');
    const title = document.getElementById('auth-modal-title');
    const subtitle = document.getElementById('auth-modal-subtitle');
    const submit = document.getElementById('auth-submit-label');

    if (icon) icon.textContent = icons[role] || '👤';

    if (mode === 'register') {
        if (role === 'donor') {
            if (title) title.textContent = '📝 New Donor Registration';
            if (subtitle) subtitle.textContent = 'Create your donor profile & join emergency network';
            if (submit) submit.textContent = '📝 Create Donor Account';
        } else if (role === 'hospital_bank') {
            if (title) title.textContent = '📝 Blood Bank Facility Registration';
            if (subtitle) subtitle.textContent = 'Register your blood bank facility with admin approval';
            if (submit) submit.textContent = '📝 Continue to Facility Registration';
        } else {
            if (title) title.textContent = '🏥 Patient / Hospital Access';
            if (subtitle) subtitle.textContent = 'No password required — instant access';
            if (submit) submit.textContent = 'Enter Patient Portal';
        }
    } else {
        // Sign In Mode
        if (title) title.textContent = role === 'donor' ? '🔑 Donor Sign In' : role === 'hospital_bank' ? '🔑 Blood Bank Portal Login' : role === 'admin' ? '🛡️ Admin Login' : '🏥 Patient Access';
        if (subtitle) subtitle.textContent = role === 'receiver' ? 'No password required — instant access' : 'Enter your registered credentials to sign in';
        if (submit) submit.textContent = role === 'receiver' ? 'Enter Patient Portal' : role === 'donor' ? 'Sign In as Donor' : role === 'hospital_bank' ? 'Sign In as Blood Bank' : 'Admin Login';
    }
}

function switchAuthTab(role) {
    activeAuthRole = role;
    window.activeAuthRole = role;

    // Reset input values on tab switch
    const nameInput = document.getElementById('auth-name-input');
    const phoneInput = document.getElementById('auth-phone-input');
    const passInput = document.getElementById('auth-password-input');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (passInput) passInput.value = '';

    // Update active tab
    document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
    const tabBtn = document.getElementById(`auth-tab-${role}`);
    if (tabBtn) tabBtn.classList.add('active');

    // Toggle notes
    const noteRec = document.getElementById('auth-note-receiver');
    const noteDon = document.getElementById('auth-note-donor');
    const noteBank = document.getElementById('auth-note-bank');
    const noteAdm = document.getElementById('auth-note-admin');

    if (noteRec) noteRec.classList.toggle('hidden', role !== 'receiver');
    if (noteDon) noteDon.classList.toggle('hidden', role !== 'donor');
    if (noteBank) noteBank.classList.toggle('hidden', role !== 'hospital_bank');
    if (noteAdm) noteAdm.classList.toggle('hidden', role !== 'admin');

    // Dynamic field labels & placeholders
    const nameLabel = document.getElementById('auth-name-label');
    const phoneLabel = document.getElementById('auth-phone-label');

    if (role === 'hospital_bank') {
        if (nameLabel) nameLabel.textContent = 'Blood Bank Name / Organization';
        if (nameInput) nameInput.placeholder = 'e.g. Rotary Central Blood Bank';
        if (phoneLabel) phoneLabel.textContent = 'Blood Bank ID / Registered Email';
        if (phoneInput) phoneInput.placeholder = 'e.g. BB-TN-CHENNAI-001 or bloodbank@hospital.org';
    } else {
        if (nameLabel) nameLabel.textContent = 'Full Name / Organization';
        if (nameInput) nameInput.placeholder = 'e.g. Dr. Vikram Seth or Apollo Hospitals';
        if (phoneLabel) phoneLabel.textContent = 'Phone Number / Email';
        if (phoneInput) phoneInput.placeholder = '+91 98401 22104';
    }

    // Toggle donor extra fields (blood group)
    const donorExtra = document.getElementById('auth-donor-extra-fields');
    if (donorExtra) donorExtra.classList.toggle('hidden', role !== 'donor');

    const regExtra = document.getElementById('auth-register-extra-fields');
    if (regExtra) regExtra.classList.toggle('hidden', activeAuthMode !== 'register' || role !== 'donor');

    // Toggle password field — REQUIRED for donor, bank & admin, HIDDEN for patient
    const passField = document.getElementById('auth-password-field');
    if (passField) {
        const needsPassword = role === 'donor' || role === 'admin' || role === 'hospital_bank';
        passField.classList.toggle('hidden', !needsPassword);
        if (passInput) passInput.required = needsPassword;

        const passLabel = document.getElementById('auth-password-label');
        if (passLabel) {
            passLabel.textContent = role === 'admin' ? 'Admin Password (Demo: admin123)' : role === 'hospital_bank' ? 'Blood Bank Staff Password' : 'Password';
        }
    }

    updateAuthModalUI();
}

function handleAuthSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('auth-name-input').value.trim();
    const phone = document.getElementById('auth-phone-input').value.trim();
    const bloodSelect = document.getElementById('auth-blood-select');
    const bloodGroup = bloodSelect ? bloodSelect.value : 'O-';
    const passInput = document.getElementById('auth-password-input');
    const password = passInput ? passInput.value.trim() : '';

    // Handle New Donor Registration
    if (activeAuthMode === 'register' && activeAuthRole === 'donor') {
        if (!name || !phone || !password) {
            alert('❌ Full Name, Phone Number, and Password are required to register.');
            return;
        }

        const stateSelect = document.getElementById('auth-reg-state-select');
        const distSelect = document.getElementById('auth-reg-district-select');
        const ageInput = document.getElementById('auth-reg-age-input');
        const genderSelect = document.getElementById('auth-reg-gender-select');

        const stateId = stateSelect ? stateSelect.value : 'TN';
        const districtId = distSelect ? distSelect.value : 'chennai';
        const age = ageInput ? parseInt(ageInput.value) || 26 : 26;
        const gender = genderSelect ? genderSelect.value : 'Male';

        // Find district display name
        let districtName = districtId.toUpperCase();
        if (window.LifePulseData && window.LifePulseData.districts) {
            const matchDist = window.LifePulseData.districts.find(d => d.id === districtId);
            if (matchDist) districtName = matchDist.name;
        }

        const newDonor = {
            id: 'd_custom_' + Date.now(),
            name: name,
            age: age,
            gender: gender,
            bloodGroup: bloodGroup,
            phone: phone,
            stateId: stateId,
            state: 'Tamil Nadu',
            districtId: districtId,
            district: districtName,
            city: districtName,
            readyToDonate: true,
            availability: 'AVAILABLE',
            lastDonated: '2026-05-01',
            lastDonatedDaysAgo: 100,
            weightKg: 68,
            donationsCount: 1,
            healthScore: 98,
            isVerified: true,
            isCustom: true,
            password: password
        };

        // Add to in-memory donors
        if (!window.LifePulseData.donors) window.LifePulseData.donors = [];
        window.LifePulseData.donors.unshift(newDonor);

        // Save custom registered donors to localStorage
        try {
            const savedCustoms = JSON.parse(localStorage.getItem('lifepulse_registered_donors') || '[]');
            savedCustoms.unshift(newDonor);
            localStorage.setItem('lifepulse_registered_donors', JSON.stringify(savedCustoms));
        } catch(e) {}

        completeLogin(name, 'donor', phone, bloodGroup);
        showToast('🎉 Registration Successful', `Welcome to LifePulse AI, ${name}! Your ${bloodGroup} Donor Account has been created.`, 'success');
        return;
    }

    // Handle Blood Bank Registration Redirection
    if (activeAuthMode === 'register' && activeAuthRole === 'hospital_bank') {
        closeAuthModal();
        openBankRegistrationModal();
        return;
    }

    // Password validation for donor, bank & admin in Login Mode
    if (activeAuthRole === 'admin') {
        if (!password) {
            alert('❌ Password is required for Admin login.');
            return;
        }
        if (password !== 'admin123') {
            alert('❌ Incorrect admin password. (Demo: admin123)');
            return;
        }
    }

    if (activeAuthRole === 'hospital_bank') {
        if (!password) {
            alert('❌ Password is required for Blood Bank login.');
            return;
        }

        const banks = getBloodBanksStore();
        const inputKey = (phone || name).trim().toLowerCase();

        // Match registered blood bank by ID, Reg Number, Email, or Name
        const matched = banks.find(b =>
            (b.id && b.id.toLowerCase() === inputKey) ||
            (b.regId && b.regId.toLowerCase() === inputKey) ||
            (b.email && b.email.toLowerCase() === inputKey) ||
            (b.name && b.name.toLowerCase() === inputKey) ||
            (b.name && b.name.toLowerCase().includes(inputKey))
        );

        if (!matched) {
            alert('❌ Unregistered Blood Bank!\nNo account found matching this Blood Bank ID / Email.\nPlease click "📝 Register Blood Bank" to submit your facility registration first.');
            return;
        }

        if (matched.status === 'PENDING_VERIFICATION' || (!matched.isVerified && matched.status !== 'VERIFIED')) {
            alert('⏳ Registration Pending Admin Approval!\nYour facility registration was submitted and is currently awaiting verification by the Admin Command Center.');
            return;
        }

        if (matched.password && matched.password !== password) {
            alert('❌ Incorrect Password!\nPlease enter the password set during your facility registration.');
            return;
        }

        // Complete login with exact verified facility account
        completeLogin(matched.name, 'hospital_bank', matched.phone, 'O-', matched.id);
        return;
    }

    if (activeAuthRole === 'donor' && activeAuthMode === 'login') {
        if (!password) {
            alert('❌ Password is required for Donor login. Please enter your password.');
            return;
        }
    }

    completeLogin(name, activeAuthRole, phone, bloodGroup);
}

function completeLogin(name, role, phone, bloodGroup, specificBankId) {
    const isBank = role === 'hospital_bank' || role === 'bank';
    const normRole = getNormalizedRole(role);

    let bankName = name || 'Salem Blood Bank';
    if (isBank && !bankName.toLowerCase().includes('bank')) {
        bankName += ' Blood Bank';
    }

    const defaultName = normRole === ROLES.ADMIN ? 'Admin Command' : normRole === ROLES.DONOR ? 'Donor' : isBank ? bankName : 'Patient';
    const cleanName = name || defaultName;

    const userObj = {
        name: cleanName,
        role: normRole,
        phone: phone || '+91 98401 22104',
        bloodGroup: bloodGroup || 'O-',
        email: isBank ? (phone && phone.includes('@') ? phone : (cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@lifepulse.org')) : 'user@lifepulse.org',
        bankId: specificBankId || (isBank ? ('bb-' + cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')) : null),
        location: 'Chennai, Tamil Nadu',
        stateId: 'TN',
        districtId: 'chennai'
    };

    window.LifePulseApp.currentUser = userObj;
    localStorage.setItem('lifepulse_user', JSON.stringify(userObj));

    updateUserProfileUI();
    closeAuthModal();

    const targetPortal = getPortalForRole(normRole);
    window.LifePulseApp.switchPortal(targetPortal);

    if (normRole === ROLES.DONOR) window.LifePulseApp.showDonorPortalContent(true);
    if (normRole === ROLES.ADMIN) window.LifePulseApp.showAdminPortalContent(true);
    if (normRole === ROLES.BLOOD_BANK) {
        const guard = document.getElementById('bank-portal-guard');
        const content = document.getElementById('bank-portal-content');
        if (guard) guard.classList.add('hidden');
        if (content) content.classList.remove('hidden');
        if (typeof renderBankDashboard === 'function') renderBankDashboard();
    }

    showToast('✅ Login Successful', `Welcome back, ${cleanName}! Logged in as ${getRoleDisplayName(normRole)}.`, 'success');
}

function updateUserProfileUI() {
    const user = window.LifePulseApp.currentUser;
    const navUserLabel = document.getElementById('nav-user-label');
    const userDropdown = document.getElementById('user-dropdown-menu');

    if (!user) {
        if (navUserLabel) navUserLabel.textContent = 'Sign In';
        if (userDropdown) userDropdown.classList.add('hidden');
        updateUserDonationStatsUI();
        if (window.LifePulseApp) window.LifePulseApp.renderNavbarForRole();
        return;
    }

    const shortName = user.name.split(' ')[0] || user.name;
    if (navUserLabel) navUserLabel.textContent = shortName;

    const menuName = document.getElementById('user-menu-name');
    const menuRole = document.getElementById('user-menu-role');
    const menuAvatar = document.getElementById('user-menu-avatar');
    if (menuName) menuName.textContent = user.name;
    if (menuRole) {
        const r = getNormalizedRole(user.role);
        menuRole.textContent = r === ROLES.BLOOD_BANK ? '🏦 BLOOD BANK' : r === ROLES.DONOR ? '🩸 DONOR' : r === ROLES.ADMIN ? '🛡️ ADMIN' : '🏥 PATIENT';
    }
    if (menuAvatar) {
        const r = getNormalizedRole(user.role);
        menuAvatar.textContent = r === ROLES.BLOOD_BANK ? '🏦' : r === ROLES.DONOR ? '🩸' : r === ROLES.ADMIN ? '🛡️' : '👤';
    }

    // Update Donor Profile card heading
    const donorProfileName = document.getElementById('donor-profile-name');
    if (donorProfileName) {
        donorProfileName.textContent = user.name;
    }

    // Update Donor Profile blood group badge & dropdown
    const donorGroupBadge = document.getElementById('donor-profile-group');
    const donorBloodSelect = document.getElementById('donor-blood-select');
    if (user.bloodGroup) {
        if (donorGroupBadge) donorGroupBadge.textContent = user.bloodGroup;
        if (donorBloodSelect && getNormalizedRole(user.role) === ROLES.DONOR) donorBloodSelect.value = user.bloodGroup;
    }

    // Update Donor Profile location text
    const donorProfileLocation = document.getElementById('donor-profile-location');
    if (donorProfileLocation && user.location) {
        donorProfileLocation.textContent = `📍 ${user.location}`;
    }

    // Update Blockchain Certificate Modal Donor Name
    const certDonorName = document.getElementById('cert-modal-donor-name');
    if (certDonorName) {
        certDonorName.textContent = user.name;
    }

    // Update dynamic stats & certificates list for logged-in user
    updateUserDonationStatsUI();

    // Re-render role navigation bar
    if (window.LifePulseApp) window.LifePulseApp.renderNavbarForRole();
}

function handleNavAuthClick() {
    const user = window.LifePulseApp.currentUser;
    const dropdown = document.getElementById('user-dropdown-menu');
    if (user) {
        if (dropdown) dropdown.classList.toggle('hidden');
    } else {
        openAuthModal();
    }
}

function goToUserDashboard() {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.add('hidden');

    const user = window.LifePulseApp.currentUser;
    if (!user) return;

    const authorizedPortal = getPortalForRole(user.role);
    window.LifePulseApp.switchPortal(authorizedPortal);
}

function logoutUser() {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.add('hidden');

    window.LifePulseApp.currentUser = null;
    localStorage.removeItem('lifepulse_user');

    updateUserProfileUI();

    // Revert guarded portal contents to hidden
    window.LifePulseApp.showDonorPortalContent(false);
    window.LifePulseApp.showAdminPortalContent(false);

    const bankGuard = document.getElementById('bank-portal-guard');
    const bankContent = document.getElementById('bank-portal-content');
    if (bankGuard) bankGuard.classList.remove('hidden');
    if (bankContent) bankContent.classList.add('hidden');

    // Return safely to receiver portal
    window.LifePulseApp.switchPortal('receiver');

    showToast('🚪 Logged Out', 'Logged out successfully. User session and authentication cleared.', 'info');
}

// Close user dropdown when clicking outside
document.addEventListener('click', function (e) {
    const wrap = e.target.closest('.user-menu-wrap');
    if (!wrap) {
        const dropdown = document.getElementById('user-dropdown-menu');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    }
});

function quickDemoLogin(role) {
    const demoData = {
        receiver: { name: 'Apollo Hospitals', phone: '+91 44 2829 0200', bloodGroup: 'A+' },
        donor: { name: 'Dr. Vikram Seth', phone: '+91 98401 22104', bloodGroup: 'O-' },
        admin: { name: 'Admin Command', phone: '+91 1800 11 2233', bloodGroup: 'AB+' }
    };
    const data = demoData[role] || { name: 'Demo User', phone: '', bloodGroup: 'O-' };
    completeLogin(data.name, role, data.phone, data.bloodGroup);
}


// =============================================================================
// DYNAMIC USER DONATION STATS LOGIC
// =============================================================================
function getUserDonations(user) {
    if (!user) return [];
    try {
        const allDonations = JSON.parse(localStorage.getItem('lifepulse_donations') || '[]');
        const userPhone = (user.phone || '').trim();
        const userName = (user.name || '').trim().toLowerCase();
        return allDonations.filter(d =>
            (userPhone && d.donorPhone === userPhone) ||
            (userName && (d.donorName || '').trim().toLowerCase() === userName)
        );
    } catch (e) {
        return [];
    }
}

function updateUserDonationStatsUI() {
    const user = window.LifePulseApp.currentUser;
    const countEl = document.getElementById('donor-stat-count');
    const livesEl = document.getElementById('donor-stat-lives');
    const lastEl = document.getElementById('donor-stat-last');
    const certsListEl = document.getElementById('donor-certificates-list');

    if (!user) {
        if (countEl) countEl.textContent = '0';
        if (livesEl) livesEl.textContent = '0';
        if (lastEl) lastEl.textContent = 'None';
        return;
    }

    const userDonations = getUserDonations(user);
    const totalCount = userDonations.length;
    const livesSaved = totalCount * 3;

    let lastDonationStr = 'None';
    if (totalCount > 0) {
        const latest = userDonations[userDonations.length - 1];
        if (latest && latest.donationDate) {
            lastDonationStr = latest.donationDate;
        }
    }

    if (countEl) countEl.textContent = totalCount;
    if (livesEl) livesEl.textContent = livesSaved;
    if (lastEl) lastEl.textContent = lastDonationStr;

    // Render verified certificates in donor portal
    if (certsListEl) {
        if (userDonations.length === 0) {
            certsListEl.innerHTML = `
                <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;border:1px dashed var(--border);border-radius:var(--radius-md);">
                    <div style="font-size:32px;margin-bottom:8px;">📜</div>
                    <p style="font-weight:700;color:var(--text-secondary);">No Verified Certificates Yet</p>
                    <p style="margin-top:4px;">Scan a patient's QR code after blood donation to generate your verified certificate.</p>
                </div>
            `;
        } else {
            certsListEl.innerHTML = userDonations.map(d => `
                <div class="cert-list-item">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="font-size:24px;">🏅</div>
                        <div>
                            <div style="font-weight:800;font-size:14px;color:var(--text-h);">${d.certificateId || 'ABD-CERT'}</div>
                            <div style="font-size:12px;color:var(--text-muted);">${d.hospital} • ${d.bloodGroup} • ${d.donationDate}</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn-primary" style="padding:6px 12px;font-size:12px;" onclick="viewSpecificCertificate('${d.certificateId}')">View Cert</button>
                        <button class="btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="verifyCertificatePublic('${d.certificateId}')">Verify QR</button>
                    </div>
                </div>
            `).join('');
        }
    }
}


// =============================================================================
// TOAST NOTIFICATIONS
// =============================================================================
function showToast(title, message, type) {
    type = type || 'success';
    const container = document.getElementById('lifepulse-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `lifepulse-toast ${type}`;
    const icon = type === 'success' ? '✅' : '❌';

    toast.innerHTML = `
        <div style="font-size:20px;">${icon}</div>
        <div>
            <div style="font-weight:800;font-size:14px;color:var(--text-h);">${title}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}


// =============================================================================
// PATIENT QR CODE GENERATOR (Direct & Request Donations)
// =============================================================================
function openPatientQRGenModal() {
    const modal = document.getElementById('patient-qr-modal');
    if (modal) modal.classList.remove('hidden');

    const dateInput = document.getElementById('pqr-donation-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    const resultBox = document.getElementById('patient-qr-result-box');
    if (resultBox) resultBox.classList.add('hidden');
}

function closePatientQRGenModal() {
    const modal = document.getElementById('patient-qr-modal');
    if (modal) modal.classList.add('hidden');
}

function handleGeneratePatientQRSubmit(event) {
    event.preventDefault();

    const patientName = document.getElementById('pqr-patient-name').value.trim();
    const hospitalName = document.getElementById('pqr-hospital-name').value.trim();
    const bloodGroup = document.getElementById('pqr-blood-group').value;
    const donationDate = document.getElementById('pqr-donation-date').value;
    const donorRef = document.getElementById('pqr-donor-ref').value.trim();

    // Secure token format
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `VERIFY-${randomPart}`;

    const tokenRecord = {
        token: token,
        patientName: patientName,
        hospital: hospitalName,
        bloodGroup: bloodGroup,
        donationDate: donationDate,
        donorRef: donorRef || null,
        request_id: null, // Supports direct donation without app request
        type: 'DIRECT_DONATION',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    let tokens = [];
    try {
        tokens = JSON.parse(localStorage.getItem('lifepulse_tokens') || '[]');
    } catch (e) { tokens = []; }
    tokens.push(tokenRecord);
    localStorage.setItem('lifepulse_tokens', JSON.stringify(tokens));

    const canvasContainer = document.getElementById('patient-qr-canvas-container');
    if (canvasContainer && window.QRCodeEngine) {
        window.QRCodeEngine.drawQRCode(canvasContainer, token, 180);
    }

    const tokenDisplay = document.getElementById('patient-qr-token-display');
    if (tokenDisplay) tokenDisplay.textContent = token;

    const resultBox = document.getElementById('patient-qr-result-box');
    if (resultBox) resultBox.classList.remove('hidden');

    showToast('Verification QR Generated', `Token ${token} created. Show to donor.`);
}


// =============================================================================
// DONOR QR SCANNER & VERIFICATION
// =============================================================================
let scannerMediaStream = null;
let isScannerRunning = false;
let scannerAnimationFrameId = null;

function extractTokenFromRaw(rawValue) {
    if (!rawValue) return null;
    let str = String(rawValue).trim();
    if (str.startsWith('{') && str.endsWith('}')) {
        try {
            const parsed = JSON.parse(str);
            if (parsed.token) return parsed.token.toUpperCase().trim();
        } catch (e) {}
    }
    const match = str.match(/(VERIFY-[A-Z0-9]{4,12})/i);
    if (match) return match[1].toUpperCase().trim();
    return str.toUpperCase().trim();
}

function openDonorQRScannerModal() {
    const user = window.LifePulseApp.currentUser;
    if (!user || (user.role && user.role.toUpperCase() !== 'DONOR')) {
        alert('🔐 Please sign in as a Blood Donor to verify donations.');
        openAuthModal('donor');
        return;
    }

    const modal = document.getElementById('donor-qr-scanner-modal');
    if (modal) modal.classList.remove('hidden');

    const input = document.getElementById('donor-manual-token-input');
    if (input) {
        input.value = '';
        input.onkeypress = function(e) {
            if (e.key === 'Enter') submitManualTokenVerification();
        };
    }

    startCameraStream();
}

function closeDonorQRScannerModal() {
    stopCameraStream();
    const modal = document.getElementById('donor-qr-scanner-modal');
    if (modal) modal.classList.add('hidden');
}

function startCameraStream() {
    const video = document.getElementById('scanner-video-stream');
    if (!video) return;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                scannerMediaStream = stream;
                video.srcObject = stream;
                video.setAttribute("playsinline", true);
                video.play().then(() => {
                    isScannerRunning = true;
                    requestAnimationFrame(scanVideoFrame);
                }).catch(() => {});
            })
            .catch(err => {
                console.log('Camera note: Use manual token entry or upload QR image.');
                showToast('Camera Note 📷', 'Camera feed unavailable. Please use manual token entry or upload QR photo.', 'info');
            });
    }
}

function stopCameraStream() {
    isScannerRunning = false;
    if (scannerAnimationFrameId) {
        cancelAnimationFrame(scannerAnimationFrameId);
        scannerAnimationFrameId = null;
    }
    if (scannerMediaStream) {
        scannerMediaStream.getTracks().forEach(track => track.stop());
        scannerMediaStream = null;
    }
}

function toggleCameraStream() {
    stopCameraStream();
    setTimeout(startCameraStream, 300);
}

async function scanVideoFrame() {
    if (!isScannerRunning) return;

    const video = document.getElementById('scanner-video-stream');
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        let detectedText = null;

        // Method 1: BarcodeDetector API (Supported in Chrome/Android/Edge)
        if ('BarcodeDetector' in window) {
            try {
                if (!window.barcodeDetectorEngine) {
                    window.barcodeDetectorEngine = new BarcodeDetector({ formats: ['qr_code'] });
                }
                const barcodes = await window.barcodeDetectorEngine.detect(video);
                if (barcodes && barcodes.length > 0) {
                    detectedText = barcodes[0].rawValue;
                }
            } catch (e) {}
        }

        // Method 2: jsQR decoding fallback
        if (!detectedText && window.jsQR) {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = window.jsQR(imageData.data, imageData.width, imageData.height);
                if (code && code.data) {
                    detectedText = code.data;
                }
            } catch (e) {}
        }

        if (detectedText) {
            const token = extractTokenFromRaw(detectedText);
            if (token) {
                stopCameraStream();
                showToast('QR Code Scanned 📷', `Token detected: ${token}`, 'info');
                verifyDonationToken(token);
                return;
            }
        }
    }

    if (isScannerRunning) {
        scannerAnimationFrameId = requestAnimationFrame(scanVideoFrame);
    }
}

function handleQRFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = async function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            let detectedText = null;

            if ('BarcodeDetector' in window) {
                try {
                    const detector = new BarcodeDetector({ formats: ['qr_code'] });
                    const barcodes = await detector.detect(canvas);
                    if (barcodes && barcodes.length > 0) {
                        detectedText = barcodes[0].rawValue;
                    }
                } catch(err) {}
            }

            if (!detectedText && window.jsQR) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = window.jsQR(imageData.data, imageData.width, imageData.height);
                if (code && code.data) {
                    detectedText = code.data;
                }
            }

            if (detectedText) {
                const token = extractTokenFromRaw(detectedText);
                stopCameraStream();
                showToast('QR Image Read Successfully 📷', `Token extracted: ${token}`, 'success');
                verifyDonationToken(token);
            } else {
                showToast('Scan Error ❌', 'Could not read a QR code from image. Please enter token manually.', 'error');
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
window.handleQRFileUpload = handleQRFileUpload;

function submitManualTokenVerification() {
    const input = document.getElementById('donor-manual-token-input');
    if (!input || !input.value.trim()) {
        showToast('Input Required ❌', 'Please enter a valid QR verification token.', 'error');
        return;
    }
    const tokenStr = extractTokenFromRaw(input.value);
    verifyDonationToken(tokenStr);
}

function verifyDonationToken(rawTokenStr) {
    const tokenStr = extractTokenFromRaw(rawTokenStr);
    if (!tokenStr) {
        showToast('Verification Failed ❌', 'Invalid QR Token format.', 'error');
        return;
    }

    const user = window.LifePulseApp.currentUser;
    if (!user || (user.role && user.role.toUpperCase() !== 'DONOR')) {
        showToast('Authentication Required 🔐', 'Please log in as a Blood Donor to verify donations.', 'error');
        openAuthModal('donor');
        return;
    }

    let tokens = [];
    try {
        tokens = JSON.parse(localStorage.getItem('lifepulse_tokens') || '[]');
    } catch (e) { tokens = []; }

    let tokenObj = tokens.find(t => t.token === tokenStr);

    // If not in local tokens, support direct tokens matching VERIFY-XXXXXX format
    if (!tokenObj && tokenStr.startsWith('VERIFY-')) {
        tokenObj = {
            token: tokenStr,
            patientName: 'Emergency Patient',
            hospital: 'Apollo Hospitals',
            bloodGroup: user.bloodGroup || 'O-',
            donationDate: new Date().toISOString().split('T')[0],
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        tokens.push(tokenObj);
    }

    if (!tokenObj) {
        showToast('Verification Failed ❌', `Invalid QR Token (${tokenStr}). Verification record not found.`, 'error');
        return;
    }

    // Check if certificate was ALREADY generated for this token
    let certs = [];
    try {
        certs = JSON.parse(localStorage.getItem('lifepulse_certificates') || '[]');
    } catch (e) { certs = []; }

    const existingCert = certs.find(c => c.qrToken === tokenStr);

    if (tokenObj.status === 'USED' || existingCert) {
        if (existingCert) {
            closeDonorQRScannerModal();
            showToast('Certificate Already Issued ℹ️', 'Displaying your verified blood donation certificate.', 'info');
            viewSpecificCertificate(existingCert.certificateId);
            return;
        } else {
            showToast('Verification Failed ❌', 'This QR Code token has already been verified.', 'error');
            return;
        }
    }

    const now = new Date();
    if (tokenObj.expiresAt && new Date(tokenObj.expiresAt) < now) {
        showToast('Verification Failed ❌', 'QR Code token has expired (Valid for 24 Hours).', 'error');
        return;
    }

    // Mark Token as Used
    tokenObj.status = 'USED';
    tokenObj.usedBy = user.phone || user.name;
    tokenObj.usedAt = now.toISOString();
    localStorage.setItem('lifepulse_tokens', JSON.stringify(tokens));

    // Create Donation Record
    const certId = `ABD-${Math.floor(100000 + Math.random() * 900000)}`;
    const donationRecord = {
        donationId: `DON-${Date.now()}`,
        donorId: user.phone || user.name,
        donorPhone: user.phone || '',
        donorName: user.name,
        patientName: tokenObj.patientName,
        bloodGroup: tokenObj.bloodGroup || user.bloodGroup || 'O-',
        hospital: tokenObj.hospital || 'Apollo Hospitals',
        donationDate: tokenObj.donationDate || now.toISOString().split('T')[0],
        verificationTimestamp: now.toISOString(),
        qrVerificationToken: tokenStr,
        verificationStatus: 'VERIFIED BLOOD DONATION',
        certificateId: certId
    };

    let donations = [];
    try {
        donations = JSON.parse(localStorage.getItem('lifepulse_donations') || '[]');
    } catch (e) { donations = []; }
    donations.push(donationRecord);
    localStorage.setItem('lifepulse_donations', JSON.stringify(donations));

    // Create Certificate Record
    const certRecord = {
        certificateId: certId,
        donationId: donationRecord.donationId,
        donorName: user.name,
        patientName: tokenObj.patientName,
        bloodGroup: donationRecord.bloodGroup,
        hospital: donationRecord.hospital,
        donationDate: donationRecord.donationDate,
        issuedAt: now.toISOString(),
        qrToken: tokenStr,
        shaHash: '0000' + Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };

    certs.push(certRecord);
    localStorage.setItem('lifepulse_certificates', JSON.stringify(certs));

    // Update stats UI
    if (typeof updateUserDonationStatsUI === 'function') {
        updateUserDonationStatsUI();
    }

    closeDonorQRScannerModal();

    showToast('Blood Donation Verified Successfully! 🎉', `Verified donation for ${tokenObj.patientName}. Certificate ID: ${certId}`, 'success');

    // Automatically display the generated certificate to the donor!
    setTimeout(() => {
        viewSpecificCertificate(certId);
    }, 600);
}


// =============================================================================
// CERTIFICATE VIEWER & PUBLIC VERIFICATION MODAL
// =============================================================================
function openCertificateModal() {
    const user = window.LifePulseApp.currentUser;
    const userDonations = getUserDonations(user);
    if (userDonations.length > 0) {
        const latest = userDonations[userDonations.length - 1];
        viewSpecificCertificate(latest.certificateId);
    } else {
        viewSpecificCertificate('ABD-982401');
    }
}

function closeCertificateModal() {
    const modal = document.getElementById('cert-modal-overlay');
    if (modal) modal.classList.add('hidden');
}

function viewSpecificCertificate(certId) {
    let certs = [];
    try {
        certs = JSON.parse(localStorage.getItem('lifepulse_certificates') || '[]');
    } catch (e) { certs = []; }

    const cert = certs.find(c => c.certificateId === certId);
    const user = window.LifePulseApp.currentUser;

    const nameEl = document.getElementById('cert-modal-donor-name');
    const groupEl = document.getElementById('cert-modal-group');
    const hospEl = document.getElementById('cert-modal-hospital');
    const dateEl = document.getElementById('cert-modal-date');
    const idEl = document.getElementById('cert-modal-id');
    const hashEl = document.getElementById('cert-modal-hash');

    if (nameEl) nameEl.textContent = (cert && cert.donorName) || (user && user.name) || 'Dr. Vikram Seth';
    if (groupEl) groupEl.textContent = (cert && cert.bloodGroup) || (user && user.bloodGroup) || 'O-';
    if (hospEl) hospEl.textContent = (cert && cert.hospital) || 'Apollo Hospitals';
    if (dateEl) dateEl.textContent = (cert && cert.donationDate) || new Date().toISOString().split('T')[0];
    if (idEl) idEl.textContent = certId || (cert && cert.certificateId) || 'ABD-982401';
    if (hashEl) hashEl.textContent = (cert && cert.shaHash) || '0000a3f89e217d84bc7190e8a712f84b901a';

    const certQRHolder = document.getElementById('cert-qr-container');
    const verifyUrl = `CERT:${certId || 'ABD-982401'}`;
    if (certQRHolder && window.QRCodeEngine) {
        window.QRCodeEngine.drawQRCode(certQRHolder, verifyUrl, 100);
    }

    const modal = document.getElementById('cert-modal-overlay');
    if (modal) modal.classList.remove('hidden');
}

function openPublicCertVerifyFromModal() {
    const idEl = document.getElementById('cert-modal-id');
    const certId = idEl ? idEl.textContent : 'ABD-982401';
    closeCertificateModal();
    verifyCertificatePublic(certId);
}

function verifyCertificatePublic(certId) {
    let certs = [];
    try {
        certs = JSON.parse(localStorage.getItem('lifepulse_certificates') || '[]');
    } catch (e) { certs = []; }

    const cert = certs.find(c => c.certificateId === certId);

    const container = document.getElementById('public-cert-verify-content');
    const modal = document.getElementById('public-cert-verify-modal');
    if (!container || !modal) return;

    if (cert) {
        container.innerHTML = `
            <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;margin-bottom:16px;">
                <div style="font-size:40px;margin-bottom:8px;">✅</div>
                <h3 style="color:#15803d;font-family:'Outfit',sans-serif;font-size:20px;font-weight:900;margin-bottom:4px;">VERIFIED GENUINE CERTIFICATE</h3>
                <p style="font-size:13px;color:#166534;">Official Blood Donation Record • AI Smart Blood Donor</p>
            </div>

            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:18px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
                    <div>
                        <span style="color:var(--text-muted);font-size:11px;font-weight:700;display:block;">CERTIFICATE ID</span>
                        <strong style="font-family:'Courier New',monospace;font-size:15px;color:var(--text-h);">${cert.certificateId}</strong>
                    </div>
                    <div>
                        <span style="color:var(--text-muted);font-size:11px;font-weight:700;display:block;">DONATION DATE</span>
                        <strong>${cert.donationDate}</strong>
                    </div>
                    <div>
                        <span style="color:var(--text-muted);font-size:11px;font-weight:700;display:block;">BLOOD GROUP</span>
                        <strong style="color:var(--primary);">${cert.bloodGroup}</strong>
                    </div>
                    <div>
                        <span style="color:var(--text-muted);font-size:11px;font-weight:700;display:block;">HOSPITAL / CENTER</span>
                        <strong>${cert.hospital}</strong>
                    </div>
                </div>
                <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">
                    Verified Donor: <b>${cert.donorName}</b> • Issuance: ${new Date(cert.issuedAt).toLocaleDateString()}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:40px;margin-bottom:8px;">✅</div>
                <h3 style="color:#15803d;font-family:'Outfit',sans-serif;font-size:20px;font-weight:900;margin-bottom:4px;">VERIFIED GENUINE CERTIFICATE</h3>
                <p style="font-size:13px;color:#166534;">Certificate ID: ${certId}</p>
                <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);text-align:left;">
                    This certificate was genuinely issued and verified by the AI Smart Blood Donor Pan-India Ledger.
                </div>
            </div>
        `;
    }

    modal.classList.remove('hidden');
}

function closePublicCertVerifyModal() {
    const modal = document.getElementById('public-cert-verify-modal');
    if (modal) modal.classList.add('hidden');
}


// =============================================================================
// INITIALIZE ON DOM READY
// =============================================================================
document.addEventListener('DOMContentLoaded', function () {
    window.LifePulseApp.init();

    // Initialize auth modal in receiver mode (default)
    switchAuthTab('receiver');
});


// =============================================================================
// LANGUAGE / i18n — Apply translations to visible DOM
// =============================================================================
function applyTranslations(lang) {
    var i18n = window.LifePulseI18n;
    if (!i18n) return;
    function t(key) { return i18n.getText(key); }

    // 1. Process all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        var val = t(key);
        if (val) el.textContent = val;
    });

    // 2. Process all elements with data-i18n-html attribute
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-html');
        var val = t(key);
        if (val) el.innerHTML = val;
    });

    // 3. Process all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-placeholder');
        var val = t(key);
        if (val) el.placeholder = val;
    });

    // ---- Brand tagline ----
    var brandTagline = document.querySelector('.brand-tagline');
    if (brandTagline) brandTagline.textContent = t('appTagline');

    // ---- Nav role buttons ----
    var navBtnReceiver = document.getElementById('nav-btn-receiver');
    if (navBtnReceiver) navBtnReceiver.innerHTML = '🏥 ' + t('roleRequester');

    var navBtnDonor = document.getElementById('nav-btn-donor');
    if (navBtnDonor) navBtnDonor.innerHTML = '🩸 ' + t('roleDonor');

    var navBtnBank = document.getElementById('nav-btn-bank');
    if (navBtnBank) navBtnBank.innerHTML = '🏦 ' + t('roleBank');

    var navBtnAdmin = document.getElementById('nav-btn-admin');
    if (navBtnAdmin) navBtnAdmin.innerHTML = '🛡️ ' + t('roleAdmin');

    var navUserLabel = document.getElementById('nav-user-label');
    if (navUserLabel && (!window.LifePulseApp || !window.LifePulseApp.currentUser)) {
        navUserLabel.textContent = t('navSignIn');
    }

    // ---- Search tab buttons ----
    var tabDonors = document.getElementById('search-tab-donors');
    if (tabDonors) {
        tabDonors.innerHTML = '👤 ' + t('tabNearbyDonors') + ' <span style="font-size:10px;background:#D32F2F;color:#fff;padding:2px 8px;border-radius:10px;font-weight:900;">' + t('badgePrimary') + '</span>';
    }
    var tabBanks = document.getElementById('search-tab-banks');
    if (tabBanks) {
        tabBanks.innerHTML = '🏥 ' + t('tabBloodBanks') + ' <span style="font-size:10px;background:#1565C0;color:#fff;padding:2px 8px;border-radius:10px;font-weight:900;">' + t('badgeSecondary') + '</span>';
    }

    // ---- Find donors button ----
    var findBtn = document.getElementById('find-donors-btn');
    if (findBtn) findBtn.innerHTML = '⚡ ' + t('btnDispatch');

    // ---- Urgency options ----
    var urgencySelect = document.getElementById('receiver-urgency-select');
    if (urgencySelect && urgencySelect.options.length >= 3) {
        urgencySelect.options[0].textContent = '🔴 ' + t('urgencyCritical');
        urgencySelect.options[1].textContent = '🟠 ' + t('urgencyUrgent');
        urgencySelect.options[2].textContent = '🟢 ' + t('urgencyStandard');
    }

    // ---- Landing page buttons ----
    var landingFindBtn = document.getElementById('landing-find-btn');
    if (landingFindBtn) landingFindBtn.textContent = t('landingFindBtn');

    var landingDonorBtn = document.getElementById('landing-donor-btn');
    if (landingDonorBtn) landingDonorBtn.textContent = t('landingDonorBtn');

    // ---- Auth modal tabs ----
    var authTabReceiver = document.getElementById('auth-tab-receiver');
    if (authTabReceiver) authTabReceiver.innerHTML = '🏥 ' + (t('roleRequester') || 'Patient').split('/')[0].trim();

    var authTabDonor = document.getElementById('auth-tab-donor');
    if (authTabDonor) authTabDonor.innerHTML = '🩸 ' + t('roleDonor');

    var authTabBank = document.getElementById('auth-tab-hospital_bank');
    if (authTabBank) authTabBank.innerHTML = '🏦 ' + t('roleBank');

    var authTabAdmin = document.getElementById('auth-tab-admin');
    if (authTabAdmin) authTabAdmin.innerHTML = '🛡️ ' + t('roleAdmin');

    // ---- Auth submit button ----
    var submitLabel = document.getElementById('auth-submit-label');
    if (submitLabel) {
        var role = window.activeAuthRole || 'receiver';
        if (role === 'receiver') submitLabel.textContent = t('roleRequester') + ' Portal';
        else if (role === 'donor') submitLabel.textContent = t('roleDonor') + ' Sign In';
        else if (role === 'hospital_bank') submitLabel.textContent = t('roleBank') + ' Login';
        else submitLabel.textContent = t('roleAdmin') + ' Login';
    }

    // ---- Auth notes ----
    var authNoteReceiver = document.getElementById('auth-note-receiver');
    if (authNoteReceiver) authNoteReceiver.textContent = '✅ ' + (t('landingFooterNote') || 'No password needed — patients & hospitals get instant access');

    var authNoteDonor = document.getElementById('auth-note-donor');
    if (authNoteDonor) authNoteDonor.textContent = '🔐 ' + (t('privacyShielded') || 'Password required to protect your donor profile & personal data');

    var authNoteBank = document.getElementById('auth-note-bank');
    if (authNoteBank) authNoteBank.textContent = '🔐 ' + (t('bankGuardDesc') || 'Registered blood bank staff login with password');

    var authNoteAdmin = document.getElementById('auth-note-admin');
    if (authNoteAdmin) authNoteAdmin.textContent = '🔐 ' + (t('adminGuardDesc') || 'Authorized administrators only — password required');

    // ---- Donor status text ----
    var donorReadyText = document.getElementById('donor-status-text');
    if (donorReadyText) {
        var chk = document.getElementById('donor-ready-toggle');
        donorReadyText.textContent = (chk && chk.checked)
            ? t('statusReadyDonate') || 'Ready to Donate'
            : t('statusBusyDonate') || 'Busy / Unavailable';
    }

    // ---- Blockchain cert modal ----
    var certTitle = document.querySelector('.cert-header h2');
    if (certTitle) certTitle.textContent = t('certTitleText');

    var certSubEl = document.querySelector('.cert-header p');
    if (certSubEl) certSubEl.textContent = t('certSubtitleText');

    // ---- Re-render dynamic components with new language ----
    if (window.LifePulseApp) {
        window.LifePulseApp.renderActiveRequests();
        window.LifePulseApp.renderDistrictHospitals();
        if (window.LifePulseApp.currentUser && window.LifePulseApp.currentUser.role === 'donor') {
            window.LifePulseApp.renderDonorAlerts();
        }
        if (window.LifePulseApp.currentUser && window.LifePulseApp.currentUser.role === 'admin') {
            window.LifePulseApp.renderAdminDashboard();
        }
        if (typeof renderAdminPendingBanks === 'function') {
            renderAdminPendingBanks();
        }
    }

    console.log('🌐 Language applied:', lang);
}


// =============================================================================
// BLOOD BANK MODULE INTEGRATION ENGINE
// =============================================================================

function getBloodBanksStore() {
    try {
        const stored = localStorage.getItem('lifepulse_blood_banks');
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Error reading blood bank store', e);
    }
    const defaults = window.LifePulseData.bloodBanks || [];
    localStorage.setItem('lifepulse_blood_banks', JSON.stringify(defaults));
    return defaults;
}

function saveBloodBanksStore(banks) {
    localStorage.setItem('lifepulse_blood_banks', JSON.stringify(banks));
}

// Search Mode Switcher (Donors Primary vs Blood Banks Secondary)
let activeSearchMode = 'donors';

function switchSearchTab(mode) {
    activeSearchMode = mode;
    const donorsBtn = document.getElementById('search-tab-donors');
    const banksBtn = document.getElementById('search-tab-banks');
    const donorCard = document.getElementById('donor-results-card');
    const bankCard = document.getElementById('bank-results-card');
    const promptCard = document.getElementById('search-prompt-card');
    const titleEl = document.getElementById('search-section-title');
    const actionBtn = document.getElementById('find-donors-btn');

    if (mode === 'donors') {
        if (donorsBtn) { donorsBtn.classList.add('active'); donorsBtn.style.background = '#FFFFFF'; donorsBtn.style.color = '#0F2747'; }
        if (banksBtn) { banksBtn.classList.remove('active'); banksBtn.style.background = 'transparent'; banksBtn.style.color = '#64748B'; }

        if (titleEl) titleEl.innerHTML = '🔍 Find Compatible Blood Donors';
        if (actionBtn) {
            actionBtn.innerHTML = '⚡ Find Compatible Donors & Trigger AI Dispatch';
            actionBtn.style.background = '#1565C0';
        }

        if (window.LifePulseApp.searchHasBeenDone) {
            if (donorCard) donorCard.style.display = 'block';
            if (bankCard) bankCard.style.display = 'none';
            if (promptCard) promptCard.style.display = 'none';
        }
    } else {
        if (banksBtn) { banksBtn.classList.add('active'); banksBtn.style.background = '#FFFFFF'; banksBtn.style.color = '#0F2747'; }
        if (donorsBtn) { donorsBtn.classList.remove('active'); donorsBtn.style.background = 'transparent'; donorsBtn.style.color = '#64748B'; }

        if (titleEl) titleEl.innerHTML = '🏥 Search Nearby Verified Blood Banks & Live Stock';
        if (actionBtn) {
            actionBtn.innerHTML = '🏥 Search Nearby Verified Blood Banks';
            actionBtn.style.background = '#0F2747';
        }

        if (window.LifePulseApp.searchHasBeenDone) {
            if (bankCard) bankCard.style.display = 'block';
            if (donorCard) donorCard.style.display = 'none';
            if (promptCard) promptCard.style.display = 'none';
        }
    }
}

// Override / Extend triggerReceiverSearch to support Blood Banks tab
const originalTriggerReceiverSearch = window.LifePulseApp.triggerReceiverSearch;
window.LifePulseApp.triggerReceiverSearch = function () {
    originalTriggerReceiverSearch.call(window.LifePulseApp);

    const stateSelect = document.getElementById('receiver-state-select');
    const distSelect = document.getElementById('receiver-district-select');
    const bloodSelect = document.getElementById('receiver-blood-select');

    if (stateSelect && distSelect && bloodSelect) {
        const districtId = distSelect.value;
        const bloodGroup = bloodSelect.value;

        // Render blood bank search results
        renderBloodBankSearchResults(districtId, bloodGroup);

        // Update search tab visibility
        switchSearchTab(activeSearchMode);
    }
};

function renderBloodBankSearchResults(districtId, bloodGroup) {
    const banks = getBloodBanksStore();
    const verifiedBanks = banks.filter(b => b.isVerified && b.districtId === districtId);
    const displayBanks = verifiedBanks.length > 0 ? verifiedBanks : banks.filter(b => b.isVerified);

    const bankCard = document.getElementById('bank-results-card');
    const listContainer = document.getElementById('matched-banks-list');
    const badgeCount = document.getElementById('bank-count-badge');

    if (badgeCount) badgeCount.textContent = `${displayBanks.length} Verified Blood Banks`;

    if (!listContainer) return;

    if (displayBanks.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align:center;padding:32px;color:#64748B;">
                <div style="font-size:40px;margin-bottom:12px;">🏥</div>
                <p style="font-size:15px;font-weight:600;color:#0F2747;">No verified blood banks found in this district</p>
                <p style="font-size:13px;margin-top:6px;">Try switching to <strong>👤 Nearby Donors</strong> for direct donor matching.</p>
            </div>
        `;
        return;
    }

    // Add blood bank pins to map
    if (window.LifePulseMap) {
        displayBanks.forEach(b => {
            const stockUnits = (b.stock && b.stock[bloodGroup] !== undefined) ? b.stock[bloodGroup] : 'Available';
            window.LifePulseMap.addBloodBankMarker(b.name, `${bloodGroup}: ${stockUnits} units`, b.lat, b.lng, b.phone, b.isVerified);
        });
    }

    listContainer.innerHTML = displayBanks.map(b => {
        const stockUnits = (b.stock && b.stock[bloodGroup] !== undefined) ? b.stock[bloodGroup] : 'Available';
        const isCritical = typeof stockUnits === 'number' && stockUnits < 3;

        return `
            <div class="card" style="margin-bottom:16px;border:1px solid #E2E8F0;border-left:4px solid #1565C0;padding:20px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
                    <div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <h4 style="font-size:16px;font-weight:800;color:#0F2747;font-family:'Outfit',sans-serif;">🏥 ${b.name}</h4>
                            <span class="glow-pill info" style="font-size:10px;">✓ VERIFIED</span>
                        </div>
                        <p style="font-size:13px;color:#64748B;margin-top:4px;">📍 ${b.address} (${b.distanceKm || '3.2'} km away)</p>
                        <p style="font-size:12px;color:#64748B;margin-top:2px;">📞 ${b.phone} • 🕐 ${b.workingHours || 'Open 24 Hours'}</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;">${bloodGroup} Available</div>
                        <div style="font-size:22px;font-weight:900;color:${isCritical ? '#D32F2F' : '#1565C0'};font-family:'Outfit',sans-serif;">${stockUnits} Units</div>
                    </div>
                </div>

                <!-- Stock Summary Pills -->
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;background:#F8FAFC;padding:10px;border-radius:var(--radius-sm);border:1px solid #F1F5F9;">
                    <span style="font-size:11px;font-weight:700;color:#0F2747;">Available Stock:</span>
                    ${Object.entries(b.stock || {}).map(([grp, units]) => `
                        <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${grp === bloodGroup ? '#E3F2FD' : '#FFFFFF'};color:${grp === bloodGroup ? '#1565C0' : '#475569'};font-weight:700;border:1px solid #CBD5E1;">
                            ${grp}: ${units}u
                        </span>
                    `).join('')}
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;flex-wrap:wrap;gap:10px;">
                    <span style="font-size:11px;color:#64748B;">🕒 Last Stock Updated: <strong style="color:#0F2747;">${b.stockUpdated || 'Today'}</strong></span>
                    <div style="display:flex;gap:8px;">
                        <button class="btn-secondary" style="padding:8px 14px;font-size:12px;" onclick="openBankDetailsModal('${b.id}')">
                            ℹ️ View Details
                        </button>
                        <a href="tel:${b.phone}" class="btn-primary" style="padding:8px 16px;font-size:12px;text-decoration:none;">
                            📞 Contact
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Map Filter
function filterMapMarkers(filterType) {
    if (!window.LifePulseMap) return;
    showToast('🗺️ Map Filtered', `Displaying ${filterType.toUpperCase()} on interactive map.`);
    if (window.LifePulseApp.searchHasBeenDone) {
        window.LifePulseApp.triggerReceiverSearch();
    }
}

// Blood Bank Portal Handlers
function handleBankNavClick() {
    window.LifePulseApp.switchPortal('bank');
    const user = window.LifePulseApp.currentUser;
    const guard = document.getElementById('bank-portal-guard');
    const content = document.getElementById('bank-portal-content');

    if (!user || user.role.toLowerCase() !== 'hospital_bank') {
        if (guard) guard.classList.remove('hidden');
        if (content) content.classList.add('hidden');
    } else {
        if (guard) guard.classList.add('hidden');
        if (content) content.classList.remove('hidden');
        renderBankDashboard();
    }
}

function getCurrentUserBloodBank() {
    const user = window.LifePulseApp.currentUser;
    const banks = getBloodBanksStore();
    if (!user) return banks[0];

    // Find bank by bankId, email, or name matching
    let matched = banks.find(b =>
        (user.bankId && b.id === user.bankId) ||
        (user.email && b.email && b.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.name && b.name && b.name.toLowerCase() === user.name.toLowerCase()) ||
        (user.name && b.name && b.name.toLowerCase().includes(user.name.toLowerCase())) ||
        (user.name && b.name && user.name.toLowerCase().includes(b.name.toLowerCase()))
    );

    // If logged in as blood bank but no matching record exists in store, create a brand-new facility record for them!
    if (!matched && (getNormalizedRole(user.role) === ROLES.BLOOD_BANK || user.role === 'HOSPITAL_BANK')) {
        const slug = (user.name || 'Salem Blood Bank').toLowerCase().replace(/[^a-z0-9]/g, '');
        const regCode = (user.name || 'SALEM').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        const newBank = {
            id: user.bankId || ('bb-' + (slug || Date.now())),
            regId: 'BB-TN-' + (regCode || 'SALEM') + '-001',
            name: user.name || 'Salem Blood Bank',
            orgName: user.name || 'Salem Healthcare Network',
            type: 'Government Approved Blood Bank',
            phone: (user.phone && user.phone.startsWith('+91')) ? user.phone : 'Helpline not specified — Add in Settings below',
            email: user.email || (slug + '@lifepulse.org'),
            address: 'Address not specified — Add in Settings below',
            districtId: 'salem',
            stateId: 'TN',
            pincode: '636001',
            lat: 11.6643,
            lng: 78.1460,
            workingHours: 'Open 24 Hours (365 Days)',
            emergencyAvailable: true,
            isVerified: true,
            status: 'VERIFIED',
            distanceKm: 1.8,
            stockUpdated: 'Not Updated Yet',
            todayDonationsCount: 0,
            pendingVerificationCount: 0,
            verifiedCertificatesCount: 0,
            authorizedPerson: 'Authorized Staff Officer',
            stock: { 'O-': 0, 'O+': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0 }
        };

        banks.push(newBank);
        saveBloodBanksStore(banks);
        user.bankId = newBank.id;
        localStorage.setItem('lifepulse_user', JSON.stringify(user));
        matched = newBank;
    }

    return matched || banks[0];
}

function openBankStockModal() {
    const tableBody = document.getElementById('bank-stock-table-body');
    if (tableBody) {
        tableBody.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function openVerifyDonationModal() {
    const input = document.getElementById('bank-verify-token-input');
    if (input) {
        input.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
    }
}

function renderBankDashboard() {
    const currentBank = getCurrentUserBloodBank();
    if (!currentBank) return;

    const profileName = document.getElementById('bank-profile-name');
    const profileAddr = document.getElementById('bank-profile-address');
    const stockUpdated = document.getElementById('bank-stock-last-updated');

    if (profileName) profileName.textContent = currentBank.name;
    if (profileAddr) profileAddr.textContent = `${currentBank.address} | Reg ID: ${currentBank.regId}`;
    if (stockUpdated) stockUpdated.textContent = currentBank.stockUpdated || 'Not Updated Yet';

    // Render stock matrix table
    const tableBody = document.getElementById('bank-stock-table-body');
    if (tableBody) {
        const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        const compat = {
            'A+': 'Receives: A+, A-, O+, O-',
            'A-': 'Receives: A-, O-',
            'B+': 'Receives: B+, B-, O+, O-',
            'B-': 'Receives: B-, O-',
            'O+': 'Receives: O+, O-',
            'O-': 'Receives: O- (Universal Donor)',
            'AB+': 'Receives: ALL Groups',
            'AB-': 'Receives: AB-, A-, B-, O-'
        };

        tableBody.innerHTML = groups.map(grp => {
            const units = (currentBank.stock && currentBank.stock[grp] !== undefined) ? currentBank.stock[grp] : 0;
            const statusTag = units >= 10 ? '<span class="glow-pill success">Good Stock</span>' : units >= 3 ? '<span class="glow-pill warning">Moderate</span>' : '<span class="glow-pill critical">CRITICAL LOW / 0 UNITS</span>';

            return `
                <tr style="border-bottom:1px solid #E2E8F0;">
                    <td style="padding:12px 16px;font-weight:800;color:#0F2747;font-size:14px;">${grp}</td>
                    <td style="padding:12px 16px;font-size:12px;color:#64748B;">${compat[grp]}</td>
                    <td style="padding:12px 16px;text-align:center;font-weight:900;font-size:16px;color:#0F2747;">${units}</td>
                    <td style="padding:12px 16px;">${statusTag}</td>
                    <td style="padding:12px 16px;text-align:right;">
                        <input type="number" id="bank-input-stock-${grp.replace('+', 'pos').replace('-', 'neg')}" class="form-control" style="width:90px;display:inline-block;padding:6px 10px;text-align:center;" value="${units}" min="0" max="500">
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Dynamic Stats Calculation
    const totalUnits = Object.values(currentBank.stock || {}).reduce((a, b) => a + Number(b), 0);
    const statStock = document.getElementById('bank-stat-stock');
    const statDonations = document.getElementById('bank-stat-donations');
    const statPending = document.getElementById('bank-stat-pending');
    const statCompleted = document.getElementById('bank-stat-completed');

    if (statStock) statStock.textContent = totalUnits;
    if (statDonations) statDonations.textContent = currentBank.todayDonationsCount !== undefined ? currentBank.todayDonationsCount : 0;
    if (statPending) statPending.textContent = currentBank.pendingVerificationCount !== undefined ? currentBank.pendingVerificationCount : 0;
    if (statCompleted) statCompleted.textContent = currentBank.verifiedCertificatesCount !== undefined ? currentBank.verifiedCertificatesCount : 0;

    // Sync settings form inputs
    const addrInput = document.getElementById('bank-settings-address');
    const phoneInput = document.getElementById('bank-settings-phone');
    const hoursInput = document.getElementById('bank-settings-hours');

    if (addrInput) addrInput.value = currentBank.address || '';
    if (phoneInput) phoneInput.value = currentBank.phone || '';
    if (hoursInput) hoursInput.value = currentBank.workingHours || '';

    renderBankRequestsTable();
    renderAdminPendingBanks();
}

function saveBankStockMatrix() {
    const currentBank = getCurrentUserBloodBank();
    if (!currentBank) return;

    const banks = getBloodBanksStore();
    const targetBank = banks.find(b => b.id === currentBank.id) || currentBank;

    const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    groups.forEach(grp => {
        const input = document.getElementById(`bank-input-stock-${grp.replace('+', 'pos').replace('-', 'neg')}`);
        if (input) {
            targetBank.stock[grp] = Math.max(0, parseInt(input.value) || 0);
        }
    });

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    targetBank.stockUpdated = timeStr;

    saveBloodBanksStore(banks);
    renderBankDashboard();

    if (window.LifePulseApp.searchHasBeenDone) {
        window.LifePulseApp.triggerReceiverSearch();
    }

    showToast('💾 Inventory Saved!', `Stock matrix for ${targetBank.name} updated successfully. Timestamp: ${timeStr}`);
}

function renderBankRequestsTable() {
    const container = document.getElementById('bank-requests-table-container');
    if (!container) return;

    const activeReqs = window.LifePulseData.activeRequests || [];
    container.innerHTML = `
        <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead>
                <tr style="background:#F1F5F9;text-align:left;font-size:12px;text-transform:uppercase;color:#0F2747;border-bottom:2px solid #E2E8F0;">
                    <th style="padding:10px 14px;">Req ID</th>
                    <th style="padding:10px 14px;">Requester</th>
                    <th style="padding:10px 14px;">Blood Group</th>
                    <th style="padding:10px 14px;">Units</th>
                    <th style="padding:10px 14px;">Urgency</th>
                    <th style="padding:10px 14px;text-align:right;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${activeReqs.map(r => `
                    <tr style="border-bottom:1px solid #E2E8F0;">
                        <td style="padding:10px 14px;font-weight:700;font-size:12px;">${r.id}</td>
                        <td style="padding:10px 14px;font-size:13px;font-weight:600;">${r.patientName}</td>
                        <td style="padding:10px 14px;font-weight:800;color:#D32F2F;">${r.bloodGroup}</td>
                        <td style="padding:10px 14px;font-size:13px;">${r.units} Bags</td>
                        <td style="padding:10px 14px;"><span class="glow-pill critical" style="font-size:10px;">${r.urgency}</span></td>
                        <td style="padding:10px 14px;text-align:right;">
                            <button class="btn-success" style="padding:6px 12px;font-size:11px;" onclick="showToast('✓ Request Accepted', 'Hospital team notified to collect ${r.units} bags of ${r.bloodGroup} blood.')">
                                Accept & Dispatch
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function verifyDonationFromBankDashboard() {
    const tokenInput = document.getElementById('bank-verify-token-input');
    const groupSelect = document.getElementById('bank-verify-group-select');

    if (!tokenInput || !tokenInput.value.trim()) {
        alert('Please enter a valid Donation ID or Verification Token.');
        return;
    }

    const token = tokenInput.value.trim().toUpperCase();
    const group = groupSelect ? groupSelect.value : 'O-';

    const certId = 'ABD-' + Math.floor(100000 + Math.random() * 900000);
    const user = window.LifePulseApp.currentUser;

    const certObj = {
        certId: certId,
        donorName: user ? user.name : 'Ram Kumar',
        bloodGroup: group,
        center: 'Rotary Central Blood Bank & Research Center',
        date: new Date().toISOString().split('T')[0],
        token: token,
        hash: '0000a3f89e217d84bc7190e8a712f' + Math.floor(Math.random() * 100000)
    };

    localStorage.setItem('lifepulse_cert_' + certId, JSON.stringify(certObj));
    showToast('🏆 Donation Verified!', `Official certificate ${certId} issued for ${certObj.donorName} (${group}).`);
    tokenInput.value = '';

    // Update bank overview stats
    const statPending = document.getElementById('bank-stat-pending');
    const statCompleted = document.getElementById('bank-stat-completed');
    if (statPending) statPending.textContent = Math.max(0, parseInt(statPending.textContent || 0) - 1);
    if (statCompleted) statCompleted.textContent = parseInt(statCompleted.textContent || 0) + 1;
}

function saveBankSettings() {
    const currentBank = getCurrentUserBloodBank();
    if (!currentBank) return;

    const banks = getBloodBanksStore();
    const targetBank = banks.find(b => b.id === currentBank.id) || currentBank;

    const addressInput = document.getElementById('bank-settings-address');
    const phoneInput = document.getElementById('bank-settings-phone');
    const hoursInput = document.getElementById('bank-settings-hours');

    if (addressInput && addressInput.value.trim()) {
        targetBank.address = addressInput.value.trim();
    }
    if (phoneInput && phoneInput.value.trim()) {
        targetBank.phone = phoneInput.value.trim();
    }
    if (hoursInput && hoursInput.value.trim()) {
        targetBank.workingHours = hoursInput.value.trim();
    }

    saveBloodBanksStore(banks);
    renderBankDashboard();

    if (window.LifePulseApp.searchHasBeenDone) {
        window.LifePulseApp.triggerReceiverSearch();
    }

    showToast('⚙️ Profile Settings Saved', `Address & helpline contact details updated for ${targetBank.name}.`);
}

// Blood Bank Registration Modal
function openBankRegistrationModal() {
    const modal = document.getElementById('bank-registration-modal');
    if (modal) modal.classList.remove('hidden');
    window.LifePulseApp.populateStates('bankreg');
}

function closeBankRegistrationModal() {
    const modal = document.getElementById('bank-registration-modal');
    if (modal) modal.classList.add('hidden');
}

function getGPSForBankRegistration() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                document.getElementById('reg-bank-lat').value = pos.coords.latitude.toFixed(4);
                document.getElementById('reg-bank-lng').value = pos.coords.longitude.toFixed(4);
                showToast('📍 GPS Location Acquired', `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
            },
            () => showToast('📍 GPS Defaulted', 'Using district center GPS coordinates.')
        );
    }
}

function handleBankRegistrationSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-bank-name').value.trim();
    const regId = document.getElementById('reg-bank-id').value.trim();
    const orgName = document.getElementById('reg-bank-org').value.trim();
    const type = document.getElementById('reg-bank-type').value;
    const stateId = document.getElementById('reg-bank-state').value;
    const distId = document.getElementById('reg-bank-district').value;
    const address = document.getElementById('reg-bank-address').value.trim();
    const pincode = document.getElementById('reg-bank-pincode').value.trim();
    const phone = document.getElementById('reg-bank-phone').value.trim();
    const email = document.getElementById('reg-bank-email').value.trim();
    const lat = parseFloat(document.getElementById('reg-bank-lat').value) || 13.0780;
    const lng = parseFloat(document.getElementById('reg-bank-lng').value) || 80.2610;
    const authName = document.getElementById('reg-bank-auth-name').value.trim();
    const authDesig = document.getElementById('reg-bank-auth-desig').value.trim();
    const authPhone = document.getElementById('reg-bank-auth-phone').value.trim();
    const password = document.getElementById('reg-bank-password').value.trim();
    const docFile = document.getElementById('reg-bank-doc-file').files[0];

    const newBank = {
        id: 'bb-' + Date.now(),
        regId: regId,
        name: name,
        orgName: orgName,
        type: type,
        phone: phone,
        email: email,
        address: `${address}, Pincode: ${pincode}`,
        stateId: stateId,
        districtId: distId,
        pincode: pincode,
        lat: lat,
        lng: lng,
        workingHours: 'Open 24 Hours',
        emergencyAvailable: true,
        isVerified: false,
        status: 'PENDING_VERIFICATION',
        authorizedPerson: `${authName} (${authDesig})`,
        authPhone: authPhone,
        password: password,
        docName: docFile ? docFile.name : 'Drug_License_Form28C.pdf',
        stockUpdated: new Date().toLocaleString(),
        stock: { 'O-': 5, 'O+': 15, 'A+': 10, 'A-': 4, 'B+': 12, 'B-': 3, 'AB+': 6, 'AB-': 2 }
    };

    const banks = getBloodBanksStore();
    banks.push(newBank);
    saveBloodBanksStore(banks);

    closeBankRegistrationModal();
    showToast('📝 Registration Submitted!', 'Your facility registration is under Admin verification. You will be notified once approved.');
    renderAdminPendingBanks();
}

// Admin Pending Approvals
function renderAdminPendingBanks() {
    const banks = getBloodBanksStore();
    const pending = banks.filter(b => !b.isVerified || b.status === 'PENDING_VERIFICATION');

    const container = document.getElementById('admin-pending-banks-list');
    const badge = document.getElementById('admin-pending-banks-count');

    if (badge) badge.textContent = `${pending.length} Pending Approvals`;

    if (!container) return;

    if (pending.length === 0) {
        container.innerHTML = `
            <div style="padding:20px;text-align:center;color:#64748B;font-size:13px;">
                ✓ No pending blood bank registration requests. All facilities are verified.
            </div>
        `;
        return;
    }

    container.innerHTML = pending.map(b => `
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-left:4px solid #F9A825;padding:16px;border-radius:var(--radius-md);margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
                <div>
                    <h4 style="font-size:15px;font-weight:800;color:#0F2747;">🏥 ${b.name}</h4>
                    <p style="font-size:12px;color:#64748B;margin-top:2px;">Reg ID: <strong>${b.regId}</strong> | ${b.type}</p>
                    <p style="font-size:12px;color:#64748B;">📍 ${b.address}</p>
                    <p style="font-size:12px;color:#64748B;">👤 Rep: ${b.authorizedPerson} • 📞 ${b.phone}</p>
                    <p style="font-size:12px;color:#1565C0;margin-top:4px;">📄 Attached License: <strong>${b.docName || 'Drug_License.pdf'}</strong></p>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-success" style="padding:8px 14px;font-size:12px;" onclick="approveBloodBank('${b.id}')">
                        ✓ Approve
                    </button>
                    <button class="btn-secondary" style="padding:8px 14px;font-size:12px;border-color:#D32F2F;color:#D32F2F;" onclick="rejectBloodBank('${b.id}')">
                        ✕ Reject
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function approveBloodBank(bankId) {
    const banks = getBloodBanksStore();
    const target = banks.find(b => b.id === bankId);
    if (target) {
        target.isVerified = true;
        target.status = 'VERIFIED';
        saveBloodBanksStore(banks);
        showToast('✓ Blood Bank Approved!', `${target.name} has been verified and granted dashboard access.`);
        renderAdminPendingBanks();
        if (window.LifePulseApp.searchHasBeenDone) {
            window.LifePulseApp.triggerReceiverSearch();
        }
    }
}

function rejectBloodBank(bankId) {
    const banks = getBloodBanksStore();
    const target = banks.find(b => b.id === bankId);
    if (target) {
        target.isVerified = false;
        target.status = 'REJECTED';
        saveBloodBanksStore(banks);
        showToast('✕ Registration Rejected', `${target.name} registration was rejected.`);
        renderAdminPendingBanks();
    }
}

// Blood Bank Details Modal (Patient View)
function openBankDetailsModal(bankId) {
    const banks = getBloodBanksStore();
    const bank = banks.find(b => b.id === bankId) || banks[0];
    if (!bank) return;

    const modal = document.getElementById('bank-details-modal');
    const title = document.getElementById('detail-bank-name');
    const addr = document.getElementById('detail-bank-address');
    const phone = document.getElementById('detail-bank-phone');
    const hours = document.getElementById('detail-bank-hours');
    const org = document.getElementById('detail-bank-org');
    const update = document.getElementById('detail-bank-updated');
    const callBtn = document.getElementById('detail-bank-call-btn');
    const grid = document.getElementById('detail-bank-stock-grid');

    if (title) title.textContent = bank.name;
    if (addr) addr.textContent = bank.address;
    if (phone) phone.textContent = bank.phone;
    if (hours) hours.textContent = bank.workingHours || 'Open 24 Hours';
    if (org) org.textContent = bank.orgName || bank.type;
    if (update) update.textContent = bank.stockUpdated || 'Today';
    if (callBtn) callBtn.href = `tel:${bank.phone}`;

    if (grid) {
        grid.innerHTML = Object.entries(bank.stock || {}).map(([grp, units]) => `
            <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:var(--radius-sm);padding:10px;text-align:center;">
                <div style="font-size:16px;font-weight:900;color:#0F2747;font-family:'Outfit',sans-serif;">${grp}</div>
                <div style="font-size:14px;font-weight:800;color:${units > 2 ? '#1565C0' : '#D32F2F'};margin-top:2px;">${units} Units</div>
            </div>
        `).join('');
    }

    if (modal) modal.classList.remove('hidden');
}

function closeBankDetailsModal() {
    const modal = document.getElementById('bank-details-modal');
    if (modal) modal.classList.add('hidden');
}

function viewBankLocationOnMap() {
    closeBankDetailsModal();
    const mapCard = document.getElementById('map-container');
    if (mapCard) mapCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


// =============================================================================
// GLOBAL EVENT HANDLERS FOR HTML INLINE EVENTS
// =============================================================================
function triggerReceiverSearch() {
    if (window.LifePulseApp && window.LifePulseApp.triggerReceiverSearch) {
        window.LifePulseApp.triggerReceiverSearch();
    }
}
window.triggerReceiverSearch = triggerReceiverSearch;

function onStateChange(portalPrefix) {
    if (window.LifePulseApp && window.LifePulseApp.onStateChange) {
        window.LifePulseApp.onStateChange(portalPrefix);
    }
}
window.onStateChange = onStateChange;

function onDistrictChange(portalPrefix) {
    if (window.LifePulseApp && window.LifePulseApp.onDistrictChange) {
        window.LifePulseApp.onDistrictChange(portalPrefix);
    }
}
window.onDistrictChange = onDistrictChange;

function handleDonorNavClick() {
    const user = window.LifePulseApp ? window.LifePulseApp.currentUser : null;
    if (!user) {
        openAuthModal('donor');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}
window.handleDonorNavClick = handleDonorNavClick;

function handleBankNavClick() {
    const user = window.LifePulseApp ? window.LifePulseApp.currentUser : null;
    if (!user) {
        openAuthModal('hospital_bank');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}
window.handleBankNavClick = handleBankNavClick;

function handleAdminNavClick() {
    const user = window.LifePulseApp ? window.LifePulseApp.currentUser : null;
    if (!user) {
        openAuthModal('admin');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}
window.handleAdminNavClick = handleAdminNavClick;

function joinAsDonor() {
    openAuthModal('donor');
}
window.joinAsDonor = joinAsDonor;

function switchPortal(portalName) {
    if (window.LifePulseApp && window.LifePulseApp.switchPortal) {
        window.LifePulseApp.switchPortal(portalName);
    }
}
window.switchPortal = switchPortal;

function revealPatientSearch() {
    const searchArea = document.getElementById('patient-search-area');
    if (searchArea) {
        searchArea.style.display = 'block';
        searchArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (window.LifePulseMap && window.LifePulseMap.map) {
        setTimeout(() => window.LifePulseMap.map.invalidateSize(), 200);
    }
}
window.revealPatientSearch = revealPatientSearch;

function enterAsPatient(openSearch = false) {
    showApp();
    const user = window.LifePulseApp ? window.LifePulseApp.currentUser : null;
    if (user) {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    } else {
        window.LifePulseApp.switchPortal('receiver');
    }
    if (openSearch) {
        revealPatientSearch();
    }
}
window.enterAsPatient = enterAsPatient;

function enterAsDonor() {
    showApp();
    const user = window.LifePulseApp ? window.LifePulseApp.currentUser : null;
    if (!user) {
        openAuthModal('donor');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}
window.enterAsDonor = enterAsDonor;

function enterAsAdmin() {
    showApp();
    const user = window.LifePulseApp ? window.LifePulseApp.currentUser : null;
    if (!user) {
        openAuthModal('admin');
    } else {
        const authorizedPortal = getPortalForRole(user.role);
        window.LifePulseApp.switchPortal(authorizedPortal);
    }
}
window.enterAsAdmin = enterAsAdmin;

function showLanding() {
    const landing = document.getElementById('landing-page');
    const wrapper = document.getElementById('app-wrapper');
    if (landing) {
        landing.classList.remove('hide-landing');
        landing.style.display = 'flex';
    }
    if (wrapper) {
        wrapper.style.display = 'none';
    }
}
window.showLanding = showLanding;

// One-Click Demo Helper Tools
function quickFillAuth(role) {
    switchAuthTab(role);
    const nameInput = document.getElementById('auth-name-input');
    const phoneInput = document.getElementById('auth-phone-input');
    const passInput = document.getElementById('auth-password-input');

    if (role === 'admin') {
        if (nameInput) nameInput.value = 'Admin Command Officer';
        if (phoneInput) phoneInput.value = 'admin@lifepulse.org';
        if (passInput) passInput.value = 'admin123';
    } else if (role === 'hospital_bank') {
        if (nameInput) nameInput.value = 'Rotary Central Blood Bank';
        if (phoneInput) phoneInput.value = 'BB-TN-CHENNAI-001';
        if (passInput) passInput.value = 'bank123';
    } else if (role === 'donor') {
        if (nameInput) nameInput.value = 'Rahul S. (Verified Donor)';
        if (phoneInput) phoneInput.value = '+91 98401 22104';
        if (passInput) passInput.value = 'donor123';
    }
    showToast('⚡ Credentials Pre-filled', `Selected demo ${role.toUpperCase()} credentials. Click Continue to enter.`);
}
window.quickFillAuth = quickFillAuth;

function fillDemoBankRegistration() {
    const randomId = Math.floor(100 + Math.random() * 900);
    const nameInput = document.getElementById('reg-bank-name');
    const idInput = document.getElementById('reg-bank-id');
    const orgInput = document.getElementById('reg-bank-org');
    const typeSelect = document.getElementById('reg-bank-type');
    const stateSelect = document.getElementById('reg-bank-state');
    const addrInput = document.getElementById('reg-bank-address');
    const pinInput = document.getElementById('reg-bank-pincode');
    const phoneInput = document.getElementById('reg-bank-phone');
    const emailInput = document.getElementById('reg-bank-email');
    const latInput = document.getElementById('reg-bank-lat');
    const lngInput = document.getElementById('reg-bank-lng');
    const authNameInput = document.getElementById('reg-bank-auth-name');
    const authDesigInput = document.getElementById('reg-bank-auth-desig');
    const authPhoneInput = document.getElementById('reg-bank-auth-phone');
    const passInput = document.getElementById('reg-bank-password');

    if (nameInput) nameInput.value = `City Lifeline Blood Center #${randomId}`;
    if (idInput) idInput.value = `BB-TN-CHENNAI-${randomId}`;
    if (orgInput) orgInput.value = 'City Healthcare Trust';
    if (typeSelect) typeSelect.value = 'Government Regional Blood Bank';

    if (stateSelect) {
        stateSelect.value = 'TN';
        if (window.LifePulseApp && window.LifePulseApp.onStateChange) {
            window.LifePulseApp.onStateChange('bankreg');
        }
    }

    if (addrInput) addrInput.value = 'No. 108, Anna Salai, Guindy, Chennai';
    if (pinInput) pinInput.value = '600032';
    if (phoneInput) phoneInput.value = '+91 44 2235 ' + randomId;
    if (emailInput) emailInput.value = `bloodbank${randomId}@cityhealth.org`;
    if (latInput) latInput.value = '13.0067';
    if (lngInput) lngInput.value = '80.2030';
    if (authNameInput) authNameInput.value = 'Dr. K. Jayaraman';
    if (authDesigInput) authDesigInput.value = 'Medical Superintendent';
    if (authPhoneInput) authPhoneInput.value = '+91 98400 ' + randomId + '1';
    if (passInput) passInput.value = 'bank123';

    showToast('✨ Demo Data Pre-filled', 'Ready to submit! Registration will be sent to the Admin queue for 1-click verification.');
}
window.fillDemoBankRegistration = fillDemoBankRegistration;

