/**
 * LifePulse AI — Demo Donor Seeding Engine (Tamil Nadu Edition)
 * Automatically seeds 608 demo donor records (38 Districts x 8 Blood Groups x 2 Donors)
 * Guaranteed zero duplicate creation on application start/reload.
 */

(function () {
    'use strict';

    const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Fictional Tamil & Indian donor first names & last names for realistic demo data
    const MALE_NAMES = [
        'Karthik', 'Santhosh', 'Prakash', 'Venkatesh', 'Vijay', 'Arun', 'Saravanan',
        'Ganesh', 'Dinesh', 'Senthil', 'Ramesh', 'Manikandan', 'Prabhu', 'Siva',
        'Vignesh', 'Balaji', 'Surya', 'Manojkumar', 'Naveen', 'Deepak', 'Gokul',
        'Ashok', 'Kannan', 'Murugan', 'Kaviarasan', 'Subash', 'Gopinath', 'Rajesh'
    ];

    const FEMALE_NAMES = [
        'Anitha', 'Kavitha', 'Sangeetha', 'Meenakshi', 'Divya', 'Priya', 'Revathi',
        'Deepa', 'Sridevi', 'Pavithra', 'Nithya', 'Suganya', 'Malathi', 'Gayathri',
        'Bhavani', 'Janani', 'Karpagam', 'Lakshmi', 'Raji', 'Sowmya', 'Vidhya',
        'Archana', 'Yamuna', 'Preethi', 'Gita', 'Vaishnavi', 'Aarthi', 'Subhashini'
    ];

    const SURNAMES = [
        'Raja', 'Selvam', 'Nathan', 'Sundar', 'Moorthy', 'Bharathi', 'Kumar',
        'Dharshini', 'Raj', 'Narasimhan', 'Krishnan', 'Pillai', 'Mudaliar', 'Gounder',
        'Chettiar', 'Naicker', 'Reddy', 'Menon', 'Venkatesan', 'Natarajan', 'Subramanian',
        'Swaminathan', 'Ranganathan', 'Thangaraj', 'Palani', 'Pandian', 'Veerappan', 'Shanmugam'
    ];

    function getRandomItem(array, seed) {
        return array[seed % array.length];
    }

    function generateDemoDonorsForTN() {
        if (!window.LifePulseData) {
            console.error('❌ LifePulseData not loaded!');
            return [];
        }

        const allDistricts = window.LifePulseData.districts || [];
        const tnDistricts = allDistricts.filter(d => d.stateId === 'TN');

        if (!window.LifePulseData.donors) {
            window.LifePulseData.donors = [];
        }

        const existingDonors = window.LifePulseData.donors;
        const existingIds = new Set(existingDonors.map(d => d.id));

        let createdCount = 0;
        let seedCounter = 1000;

        tnDistricts.forEach((district, distIndex) => {
            BLOOD_GROUPS.forEach((bg, bgIndex) => {
                const bgSlug = bg.replace('+', 'pos').replace('-', 'neg').toLowerCase();

                for (let instance = 1; instance <= 2; instance++) {
                    const donorId = `demo_tn_${district.id}_${bgSlug}_${instance}`;

                    // Check idempotency - do not recreate existing demo donors
                    if (!existingIds.has(donorId)) {
                        seedCounter++;
                        const isMale = (distIndex + bgIndex + instance) % 2 === 0;
                        const firstName = isMale 
                            ? getRandomItem(MALE_NAMES, seedCounter)
                            : getRandomItem(FEMALE_NAMES, seedCounter);
                        const lastName = getRandomItem(SURNAMES, seedCounter * 3);

                        // Realistic micro lat/lng offsets so map pins spread naturally around district center
                        const latOffset = ((seedCounter % 7) - 3) * 0.008;
                        const lngOffset = (((seedCounter * 3) % 7) - 3) * 0.008;

                        const age = 21 + (seedCounter % 27); // 21 to 47
                        const donationsCount = 2 + (seedCounter % 14); // 2 to 15 donations
                        const phoneSuffix = String(10000 + (seedCounter % 89999));

                        const demoDonor = {
                            id: donorId,
                            name: `${firstName} ${lastName}`,
                            age: age,
                            gender: isMale ? 'Male' : 'Female',
                            bloodGroup: bg,
                            phone: `+91 944${isMale ? '40' : '20'} ${phoneSuffix}`,
                            stateId: 'TN',
                            state: 'Tamil Nadu',
                            districtId: district.id,
                            district: district.name,
                            city: district.name,
                            lat: parseFloat((district.lat + latOffset).toFixed(4)),
                            lng: parseFloat((district.lng + lngOffset).toFixed(4)),
                            readyToDonate: true,
                            availability: 'AVAILABLE',
                            lastDonated: '2026-03-15',
                            lastDonatedDaysAgo: 110,
                            weightKg: 58 + (seedCounter % 26),
                            donationsCount: donationsCount,
                            healthScore: 95 + (seedCounter % 5),
                            isVerified: true,
                            isDemo: true,
                            is_demo: true
                        };

                        existingDonors.push(demoDonor);
                        existingIds.add(donorId);
                        createdCount++;
                    }
                }
            });
        });

        return {
            totalTNDistricts: tnDistricts.length,
            totalDemoDonors: tnDistricts.length * 8 * 2,
            newlyAdded: createdCount,
            totalDonorsInStore: existingDonors.length
        };
    }

    // Initialize seeding engine
    window.LifePulseSeedDonors = {
        seedTN: generateDemoDonorsForTN,

        getStats: function () {
            const donors = window.LifePulseData ? (window.LifePulseData.donors || []) : [];
            const tnDemoDonors = donors.filter(d => d.stateId === 'TN' && (d.isDemo || d.is_demo));
            const districtsCovered = new Set(tnDemoDonors.map(d => d.districtId)).size;

            return {
                totalDonors: donors.length,
                tnDemoDonors: tnDemoDonors.length,
                districtsCovered: districtsCovered,
                bloodGroupsCovered: BLOOD_GROUPS.length
            };
        },

        resetDemoData: function () {
            if (!window.LifePulseData || !window.LifePulseData.donors) return;
            window.LifePulseData.donors = window.LifePulseData.donors.filter(d => !d.isDemo && !d.is_demo);
            console.log('🧹 Demo donor records cleared.');
        }
    };

    // Auto-run seed process immediately on load
    if (typeof window !== 'undefined') {
        const stats = generateDemoDonorsForTN();
        console.log(`🩸 LifePulse AI Demo Seeder: ${stats.totalDemoDonors} Tamil Nadu demo donors active (${stats.newlyAdded} new added across ${stats.totalTNDistricts} districts).`);
    }

})();
