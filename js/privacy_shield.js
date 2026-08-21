/**
 * LifePulse AI - Anonymized Geolocation Privacy Shield
 * Obfuscates exact donor coordinates and phone numbers until 2-way consent is granted.
 */

window.LifePulsePrivacyShield = {

    // Active consent sessions registry: { requestId_donorId: true }
    activeConsents: {},

    // Mask phone number (e.g. "+91 98401 23456" -> "+91 98401 XXXXX")
    maskPhone: function (phone) {
        if (!phone) return '+91 XXXXX XXXXX';
        var parts = phone.split(' ');
        if (parts.length >= 3) {
            return parts[0] + ' ' + parts[1] + ' XXXXX';
        }
        return phone.substring(0, 6) + 'XXXXX';
    },

    // Mask name (e.g. "Karthik Subramanian" -> "Donor #1001 (Verified)")
    maskName: function (donor) {
        return "Donor #" + donor.id.replace('DON-', '') + " (Verified)";
    },

    // Check if consent has been unlocked for a given request & donor
    isConsentUnlocked: function (requestId, donorId) {
        var key = requestId + '_' + donorId;
        return !!this.activeConsents[key];
    },

    // Grant 2-way consent
    grantConsent: function (requestId, donorId) {
        var key = requestId + '_' + donorId;
        this.activeConsents[key] = {
            unlockedAt: new Date().toISOString(),
            status: 'GRANTED'
        };
        return true;
    },

    // Return displayable location description (Exact vs Shielded Radius)
    getDisplayLocation: function (donor, requestId, distanceKm) {
        if (this.isConsentUnlocked(requestId, donor.id)) {
            return {
                isUnlocked: true,
                badgeClass: 'badge-unlocked',
                text: "Exact Location Unlocked (" + distanceKm + " KM away)",
                phone: donor.phone,
                name: donor.name
            };
        } else {
            return {
                isUnlocked: false,
                badgeClass: 'badge-shielded',
                text: "Shielded: Approx " + (distanceKm || 2.1) + " KM away",
                phone: this.maskPhone(donor.phone),
                name: this.maskName(donor)
            };
        }
    }
};
