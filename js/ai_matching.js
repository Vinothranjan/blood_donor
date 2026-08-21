/**
 * LifePulse AI - Multi-Factor AI Matching Engine
 * Implements ABO Matrix Compatibility, Haversine Distance, Tri-State Availability, 
 * Donor Eligibility (>90 days gap), and Urgency Priority Weighting.
 */

window.LifePulseAIMatching = {

    // ABO Blood Compatibility Matrix (Donor -> Recipient)
    // Returns 1.0 for perfect match, 0.9 for compatible match, 0.0 for incompatible
    compatibilityMatrix: {
        'O-':  { 'O-': 1.0, 'O+': 1.0, 'A-': 1.0, 'A+': 1.0, 'B-': 1.0, 'B+': 1.0, 'AB-': 1.0, 'AB+': 1.0 }, // Universal Donor
        'O+':  { 'O-': 0.0, 'O+': 1.0, 'A-': 0.0, 'A+': 1.0, 'B-': 0.0, 'B+': 1.0, 'AB-': 0.0, 'AB+': 1.0 },
        'A-':  { 'O-': 0.0, 'O+': 0.0, 'A-': 1.0, 'A+': 1.0, 'B-': 0.0, 'B+': 0.0, 'AB-': 1.0, 'AB+': 1.0 },
        'A+':  { 'O-': 0.0, 'O+': 0.0, 'A-': 0.0, 'A+': 1.0, 'B-': 0.0, 'B+': 0.0, 'AB-': 0.0, 'AB+': 1.0 },
        'B-':  { 'O-': 0.0, 'O+': 0.0, 'A-': 0.0, 'A+': 0.0, 'B-': 1.0, 'B+': 1.0, 'AB-': 1.0, 'AB+': 1.0 },
        'B+':  { 'O-': 0.0, 'O+': 0.0, 'A-': 0.0, 'A+': 0.0, 'B-': 0.0, 'B+': 1.0, 'AB-': 0.0, 'AB+': 1.0 },
        'AB-': { 'O-': 0.0, 'O+': 0.0, 'A-': 0.0, 'A+': 0.0, 'B-': 0.0, 'B+': 0.0, 'AB-': 1.0, 'AB+': 1.0 },
        'AB+': { 'O-': 0.0, 'O+': 0.0, 'A-': 0.0, 'A+': 0.0, 'B-': 0.0, 'B+': 0.0, 'AB-': 0.0, 'AB+': 1.0 } // Universal Recipient
    },

    // Haversine Distance Formula (Returns distance in KM between two lat/lng points)
    calculateDistanceKm: function(lat1, lon1, lat2, lon2) {
        var R = 6371; // Earth radius in KM
        var dLat = (lat2 - lat1) * (Math.PI / 180);
        var dLon = (lon2 - lon1) * (Math.PI / 180);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(2));
    },

    // Multi-Factor Match Score Calculator (0 - 100%)
    calculateMatchScore: function(donor, hospitalLat, hospitalLng, targetBloodGroup, urgencyLevel) {
        // 1. Compatibility Factor (Weight: 35%)
        var compatScore = 0;
        if (this.compatibilityMatrix[donor.bloodGroup] && this.compatibilityMatrix[donor.bloodGroup][targetBloodGroup] !== undefined) {
            compatScore = this.compatibilityMatrix[donor.bloodGroup][targetBloodGroup];
        }
        // Exact group bonus
        if (donor.bloodGroup === targetBloodGroup) {
            compatScore = 1.0;
        }

        // 2. Haversine Distance Factor (Weight: 25%)
        var distanceKm = this.calculateDistanceKm(donor.lat, donor.lng, hospitalLat, hospitalLng);
        // Distance score decays smoothly: 100% at 0km, 80% at 5km, 50% at 15km, 0% at 35km+
        var distanceScore = Math.max(0, 1 - (distanceKm / 35));

        // 3. Availability Factor (Weight: 15%)
        var availScore = 0;
        if (donor.availability === 'AVAILABLE') availScore = 1.0;
        else if (donor.availability === 'BUSY') availScore = 0.4;
        else availScore = 0.0;

        // 4. Health & Eligibility Factor (>90 Days Gap Check) (Weight: 15%)
        var eligScore = 0;
        if (donor.lastDonatedDaysAgo >= 90 && donor.weightKg >= 50) {
            eligScore = (donor.healthScore / 100);
        } else {
            eligScore = 0.0; // Ineligible
        }

        // 5. Urgency Priority Weighting (Weight: 10%)
        var urgencyWeight = 0.8;
        if (urgencyLevel === 'CRITICAL') urgencyWeight = 1.0;
        else if (urgencyLevel === 'URGENT') urgencyWeight = 0.9;
        else urgencyWeight = 0.7;

        // Final Weighted Score Calculation
        // Weights: w1=0.35, w2=0.25, w3=0.15, w4=0.15, w5=0.10
        var totalWeighted = (compatScore * 0.35) + 
                            (distanceScore * 0.25) + 
                            (availScore * 0.15) + 
                            (eligScore * 0.15) + 
                            (urgencyWeight * 0.10);

        var finalScorePercentage = Math.round(totalWeighted * 100);

        return {
            score: finalScorePercentage,
            distanceKm: distanceKm,
            isCompatible: compatScore > 0,
            isEligible: eligScore > 0,
            factors: {
                compatibility: Math.round(compatScore * 100),
                distance: Math.round(distanceScore * 100),
                availability: Math.round(availScore * 100),
                eligibility: Math.round(eligScore * 100),
                urgency: Math.round(urgencyWeight * 100)
            }
        };
    },

    // Filter and Rank Donors for a Given Request
    rankDonors: function(donors, hospitalLat, hospitalLng, targetBloodGroup, urgencyLevel, maxRadiusKm) {
        var self = this;
        var results = [];

        donors.forEach(function(donor) {
            var matchData = self.calculateMatchScore(donor, hospitalLat, hospitalLng, targetBloodGroup, urgencyLevel);
            
            // Include donors within max radius and compatible blood group
            if (matchData.isCompatible && matchData.distanceKm <= (maxRadiusKm || 50)) {
                results.push({
                    donor: donor,
                    matchData: matchData
                });
            }
        });

        // Sort descending by AI match score
        results.sort(function(a, b) {
            return b.matchData.score - a.matchData.score;
        });

        return results;
    }
};
