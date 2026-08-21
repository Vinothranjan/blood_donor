/**
 * LifePulse AI - Pan-India Interactive Map & Proximity Radar
 * Integrates Leaflet map with custom hospital pins, privacy radius overlays, and donor markers.
 */

window.LifePulseMap = {
    map: null,
    hospitalMarker: null,
    donorMarkers: [],
    radiusCircle: null,

    // Initialize Map
    initMap: function(elementId, initialLat, initialLng, zoomLevel) {
        if (typeof L === 'undefined') return;

        var container = document.getElementById(elementId);
        if (!container) return;

        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        this.map = L.map(elementId).setView([initialLat || 13.0827, initialLng || 80.2707], zoomLevel || 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 18
        }).addTo(this.map);

        return this.map;
    },

    centerMap: function(lat, lng, zoomLevel) {
        if (this.map && lat && lng) {
            this.map.setView([lat, lng], zoomLevel || 12);
        }
    },

    addHospitalMarker: function(name, lat, lng, phone) {
        if (!this.map || !lat || !lng) return;

        var hospitalIcon = L.divIcon({
            className: 'custom-map-pin hospital-pin',
            html: '<div style="background:#dc2626; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 0 10px rgba(220,38,38,0.5);">🏥</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        var marker = L.marker([lat, lng], { icon: hospitalIcon }).addTo(this.map);
        marker.bindPopup("<b>" + name + "</b><br>Phone: " + phone);
        this.donorMarkers.push(marker);
    },

    addDonorMarker: function(name, bloodGroup, lat, lng, phone) {
        if (!this.map || !lat || !lng) return;

        var donorIcon = L.divIcon({
            className: 'custom-map-pin donor-pin',
            html: '<div style="background:#D32F2F; color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px; border:2px solid #fff; box-shadow:0 0 8px rgba(211,47,47,0.5);">' + bloodGroup + '</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        var marker = L.marker([lat, lng], { icon: donorIcon }).addTo(this.map);
        marker.bindPopup("<b>👤 " + name + " (" + bloodGroup + ")</b><br>Ready to Donate<br>Phone: " + phone);
        this.donorMarkers.push(marker);
    },

    addBloodBankMarker: function(name, stockSummary, lat, lng, phone, isVerified) {
        if (!this.map || !lat || !lng) return;

        var bankIcon = L.divIcon({
            className: 'custom-map-pin bank-pin',
            html: '<div style="background:#0F2747; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; border:2px solid #1565C0; box-shadow:0 0 12px rgba(15,39,71,0.5);">🏥</div>',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
        });

        var marker = L.marker([lat, lng], { icon: bankIcon }).addTo(this.map);
        marker.bindPopup("<b>🏥 " + name + "</b> " + (isVerified ? "<span style='color:#1565C0;font-weight:700;font-size:11px;'>✓ Verified</span>" : "") + "<br>Stock: " + (stockSummary || 'Available') + "<br>Phone: " + phone);
        this.donorMarkers.push(marker);
    },

    clearMarkers: function() {
        if (this.hospitalMarker && this.map) {
            this.map.removeLayer(this.hospitalMarker);
            this.hospitalMarker = null;
        }
        if (this.radiusCircle && this.map) {
            this.map.removeLayer(this.radiusCircle);
            this.radiusCircle = null;
        }
        if (this.donorMarkers && this.map) {
            var self = this;
            this.donorMarkers.forEach(function(m) {
                if (self.map) self.map.removeLayer(m);
            });
            this.donorMarkers = [];
        }
    }
};
