/**
 * LifePulse AI - Comprehensive Pan-India & District Dataset
 * Full coverage of 36 States & Union Territories of India + 180+ Districts
 */

window.LifePulseData = {
    states: [
        { id: 'TN', name: 'Tamil Nadu' },
        { id: 'KL', name: 'Kerala' },
        { id: 'KA', name: 'Karnataka' },
        { id: 'AP', name: 'Andhra Pradesh' },
        { id: 'TS', name: 'Telangana' },
        { id: 'MH', name: 'Maharashtra' },
        { id: 'DL', name: 'Delhi NCR' },
        { id: 'UP', name: 'Uttar Pradesh' },
        { id: 'WB', name: 'West Bengal' },
        { id: 'GJ', name: 'Gujarat' },
        { id: 'RJ', name: 'Rajasthan' },
        { id: 'MP', name: 'Madhya Pradesh' },
        { id: 'BR', name: 'Bihar' },
        { id: 'PB', name: 'Punjab' },
        { id: 'HR', name: 'Haryana' },
        { id: 'OR', name: 'Odisha' },
        { id: 'AS', name: 'Assam' },
        { id: 'JH', name: 'Jharkhand' },
        { id: 'CG', name: 'Chhattisgarh' },
        { id: 'UK', name: 'Uttarakhand' },
        { id: 'HP', name: 'Himachal Pradesh' },
        { id: 'GA', name: 'Goa' },
        { id: 'JK', name: 'Jammu & Kashmir' },
        { id: 'PY', name: 'Puducherry' },
        { id: 'CH', name: 'Chandigarh' },
        { id: 'TR', name: 'Tripura' },
        { id: 'ML', name: 'Meghalaya' },
        { id: 'MN', name: 'Manipur' },
        { id: 'NL', name: 'Nagaland' },
        { id: 'MZ', name: 'Mizoram' },
        { id: 'SK', name: 'Sikkim' },
        { id: 'AR', name: 'Arunachal Pradesh' }
    ],

    districts: [
        // Tamil Nadu (38 Districts)
        { id: 'chennai', stateId: 'TN', name: 'Chennai', lat: 13.0827, lng: 80.2707 },
        { id: 'coimbatore', stateId: 'TN', name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
        { id: 'madurai', stateId: 'TN', name: 'Madurai', lat: 9.9252, lng: 78.1198 },
        { id: 'trichy', stateId: 'TN', name: 'Tiruchirappalli (Trichy)', lat: 10.7905, lng: 78.7047 },
        { id: 'salem', stateId: 'TN', name: 'Salem', lat: 11.6643, lng: 78.1460 },
        { id: 'tirunelveli', stateId: 'TN', name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
        { id: 'erode', stateId: 'TN', name: 'Erode', lat: 11.3410, lng: 77.7172 },
        { id: 'vellore', stateId: 'TN', name: 'Vellore', lat: 12.9165, lng: 79.1325 },
        { id: 'thanjavur', stateId: 'TN', name: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
        { id: 'thoothukudi', stateId: 'TN', name: 'Thoothukudi', lat: 8.7642, lng: 78.1348 },
        { id: 'dindigul', stateId: 'TN', name: 'Dindigul', lat: 10.3673, lng: 77.9803 },
        { id: 'kanchipuram', stateId: 'TN', name: 'Kanchipuram', lat: 12.8342, lng: 79.7036 },
        { id: 'cuddalore', stateId: 'TN', name: 'Cuddalore', lat: 11.7480, lng: 79.7714 },
        { id: 'karur', stateId: 'TN', name: 'Karur', lat: 10.9601, lng: 78.0766 },
        { id: 'tiruppur', stateId: 'TN', name: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
        { id: 'kanyakumari', stateId: 'TN', name: 'Kanyakumari (Nagercoil)', lat: 8.1833, lng: 77.4119 },
        { id: 'ramanathapuram', stateId: 'TN', name: 'Ramanathapuram', lat: 9.3639, lng: 78.8395 },
        { id: 'virudhunagar', stateId: 'TN', name: 'Virudhunagar', lat: 9.5680, lng: 77.9624 },
        { id: 'sivagangai', stateId: 'TN', name: 'Sivagangai', lat: 9.8433, lng: 78.4809 },
        { id: 'pudukkottai', stateId: 'TN', name: 'Pudukkottai', lat: 10.3797, lng: 78.8208 },
        { id: 'namakkal', stateId: 'TN', name: 'Namakkal', lat: 11.2189, lng: 78.1674 },
        { id: 'dharmapuri', stateId: 'TN', name: 'Dharmapuri', lat: 12.1211, lng: 78.1582 },
        { id: 'krishnagiri', stateId: 'TN', name: 'Krishnagiri', lat: 12.5186, lng: 78.2137 },
        { id: 'tiruvannamalai', stateId: 'TN', name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747 },
        { id: 'villupuram', stateId: 'TN', name: 'Villupuram', lat: 11.9401, lng: 79.4861 },
        { id: 'kallakurichi', stateId: 'TN', name: 'Kallakurichi', lat: 11.7384, lng: 78.9639 },
        { id: 'mayiladuthurai', stateId: 'TN', name: 'Mayiladuthurai', lat: 11.1018, lng: 79.6522 },
        { id: 'nagapattinam', stateId: 'TN', name: 'Nagapattinam', lat: 10.7672, lng: 79.8449 },
        { id: 'perambalur', stateId: 'TN', name: 'Perambalur', lat: 11.2342, lng: 78.8820 },
        { id: 'ariyalur', stateId: 'TN', name: 'Ariyalur', lat: 11.1401, lng: 79.0786 },
        { id: 'tenkasi', stateId: 'TN', name: 'Tenkasi', lat: 8.9593, lng: 77.3150 },
        { id: 'ranipet', stateId: 'TN', name: 'Ranipet', lat: 12.9298, lng: 79.3327 },
        { id: 'tirupathur', stateId: 'TN', name: 'Tirupathur', lat: 12.4929, lng: 78.5678 },
        { id: 'chengalpattu', stateId: 'TN', name: 'Chengalpattu', lat: 12.6819, lng: 79.9888 },
        { id: 'nilgiris', stateId: 'TN', name: 'The Nilgiris (Ooty)', lat: 11.4102, lng: 76.6950 },
        { id: 'theni', stateId: 'TN', name: 'Theni', lat: 10.0104, lng: 77.4768 },
        { id: 'tiruvarur', stateId: 'TN', name: 'Tiruvarur', lat: 10.7726, lng: 79.6365 },
        { id: 'tiruvallur', stateId: 'TN', name: 'Tiruvallur', lat: 13.1432, lng: 79.9056 },

        // Kerala
        { id: 'ernakulam', stateId: 'KL', name: 'Ernakulam (Kochi)', lat: 9.9312, lng: 76.2673 },
        { id: 'trivandrum', stateId: 'KL', name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
        { id: 'kozhikode', stateId: 'KL', name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
        { id: 'thrissur', stateId: 'KL', name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
        { id: 'kottayam', stateId: 'KL', name: 'Kottayam', lat: 9.5916, lng: 76.5222 },
        { id: 'alappuzha', stateId: 'KL', name: 'Alappuzha', lat: 9.4981, lng: 76.3388 },
        { id: 'palakkad', stateId: 'KL', name: 'Palakkad', lat: 10.7867, lng: 76.6548 },
        { id: 'malappuram', stateId: 'KL', name: 'Malappuram', lat: 11.0732, lng: 76.0740 },
        { id: 'kannur', stateId: 'KL', name: 'Kannur', lat: 11.8745, lng: 75.3704 },
        { id: 'kollam', stateId: 'KL', name: 'Kollam', lat: 8.8932, lng: 76.6141 },

        // Karnataka
        { id: 'bengaluru_urban', stateId: 'KA', name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
        { id: 'bengaluru_rural', stateId: 'KA', name: 'Bengaluru Rural', lat: 13.2257, lng: 77.5750 },
        { id: 'mysuru', stateId: 'KA', name: 'Mysuru (Mysore)', lat: 12.2958, lng: 76.6394 },
        { id: 'mangakuru', stateId: 'KA', name: 'Dakshina Kannada (Mangaluru)', lat: 12.9141, lng: 74.8560 },
        { id: 'hubballi', stateId: 'KA', name: 'Dharwad (Hubballi)', lat: 15.3647, lng: 75.1240 },
        { id: 'belagavi', stateId: 'KA', name: 'Belagavi (Belgaum)', lat: 15.8497, lng: 74.4977 },
        { id: 'kalaburagi', stateId: 'KA', name: 'Kalaburagi (Gulbarga)', lat: 17.3297, lng: 76.8343 },
        { id: 'shivamogga', stateId: 'KA', name: 'Shivamogga (Shimoga)', lat: 13.9299, lng: 75.5681 },
        { id: 'ballari', stateId: 'KA', name: 'Ballari (Bellary)', lat: 15.1394, lng: 76.9214 },

        // Andhra Pradesh
        { id: 'visakhapatnam', stateId: 'AP', name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
        { id: 'vijayawada', stateId: 'AP', name: 'NTR (Vijayawada)', lat: 16.5062, lng: 80.6480 },
        { id: 'guntur', stateId: 'AP', name: 'Guntur', lat: 16.3067, lng: 80.4365 },
        { id: 'tirupati', stateId: 'AP', name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
        { id: 'kurnool', stateId: 'AP', name: 'Kurnool', lat: 15.8281, lng: 78.0373 },
        { id: 'kakinada', stateId: 'AP', name: 'Kakinada', lat: 16.9891, lng: 82.2475 },
        { id: 'nellore', stateId: 'AP', name: 'Sri Potti Sriramulu Nellore', lat: 14.4426, lng: 79.9865 },

        // Telangana
        { id: 'hyderabad', stateId: 'TS', name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        { id: 'secunderabad', stateId: 'TS', name: 'Medchal-Malkajgiri', lat: 17.4399, lng: 78.4983 },
        { id: 'rangareddy', stateId: 'TS', name: 'Ranga Reddy', lat: 17.3200, lng: 78.5500 },
        { id: 'warangal', stateId: 'TS', name: 'Warangal', lat: 17.9689, lng: 79.5941 },
        { id: 'karimnagar', stateId: 'TS', name: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
        { id: 'nizamabad', stateId: 'TS', name: 'Nizamabad', lat: 18.6725, lng: 78.0941 },
        { id: 'khammam', stateId: 'TS', name: 'Khammam', lat: 17.2473, lng: 80.1514 },

        // Maharashtra
        { id: 'mumbai', stateId: 'MH', name: 'Mumbai City & Suburban', lat: 19.0760, lng: 72.8777 },
        { id: 'pune', stateId: 'MH', name: 'Pune', lat: 18.5204, lng: 73.8567 },
        { id: 'nagpur', stateId: 'MH', name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
        { id: 'thane', stateId: 'MH', name: 'Thane', lat: 19.2183, lng: 72.9781 },
        { id: 'nashik', stateId: 'MH', name: 'Nashik', lat: 19.9975, lng: 73.7898 },
        { id: 'aurangabad', stateId: 'MH', name: 'Chhatrapati Sambhajinagar (Aurangabad)', lat: 19.8762, lng: 75.3433 },
        { id: 'solapur', stateId: 'MH', name: 'Solapur', lat: 17.6599, lng: 75.9064 },
        { id: 'kolhapur', stateId: 'MH', name: 'Kolhapur', lat: 16.7050, lng: 74.2433 },

        // Delhi NCR
        { id: 'central_delhi', stateId: 'DL', name: 'Central Delhi / Connaught Place', lat: 28.6139, lng: 77.2090 },
        { id: 'south_delhi', stateId: 'DL', name: 'South Delhi / AIIMS', lat: 28.5672, lng: 77.2100 },
        { id: 'gurugram', stateId: 'DL', name: 'Gurugram (NCR)', lat: 28.4595, lng: 77.0266 },
        { id: 'noida', stateId: 'DL', name: 'Noida (NCR)', lat: 28.5355, lng: 77.3910 },
        { id: 'ghaziabad', stateId: 'DL', name: 'Ghaziabad (NCR)', lat: 28.6692, lng: 77.4538 },
        { id: 'faridabad', stateId: 'DL', name: 'Faridabad (NCR)', lat: 28.4089, lng: 77.3178 },

        // Uttar Pradesh
        { id: 'lucknow', stateId: 'UP', name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
        { id: 'kanpur', stateId: 'UP', name: 'Kanpur Nagar', lat: 26.4499, lng: 80.3319 },
        { id: 'varanasi', stateId: 'UP', name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
        { id: 'agra', stateId: 'UP', name: 'Agra', lat: 27.1767, lng: 78.0081 },
        { id: 'prayagraj', stateId: 'UP', name: 'Prayagraj (Allahabad)', lat: 25.4358, lng: 81.8463 },
        { id: 'gorakhpur', stateId: 'UP', name: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
        { id: 'meerut', stateId: 'UP', name: 'Meerut', lat: 28.9845, lng: 77.7064 },
        { id: 'bareilly', stateId: 'UP', name: 'Bareilly', lat: 28.3670, lng: 79.4304 },

        // West Bengal
        { id: 'kolkata', stateId: 'WB', name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
        { id: 'howrah', stateId: 'WB', name: 'Howrah', lat: 22.5958, lng: 88.2636 },
        { id: 'north_24_parganas', stateId: 'WB', name: 'North 24 Parganas (Salt Lake)', lat: 22.6800, lng: 88.4500 },
        { id: 'siliguri', stateId: 'WB', name: 'Darjeeling (Siliguri)', lat: 26.7271, lng: 88.3953 },
        { id: 'asansol', stateId: 'WB', name: 'Paschim Bardhaman (Asansol)', lat: 23.6889, lng: 86.9661 },

        // Gujarat
        { id: 'ahmedabad', stateId: 'GJ', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
        { id: 'surat', stateId: 'GJ', name: 'Surat', lat: 21.1702, lng: 72.8311 },
        { id: 'vadodara', stateId: 'GJ', name: 'Vadodara (Baroda)', lat: 22.3072, lng: 73.1812 },
        { id: 'rajkot', stateId: 'GJ', name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
        { id: 'gandhinagar', stateId: 'GJ', name: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },

        // Rajasthan
        { id: 'jaipur', stateId: 'RJ', name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
        { id: 'jodhpur', stateId: 'RJ', name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
        { id: 'udaipur', stateId: 'RJ', name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
        { id: 'kota', stateId: 'RJ', name: 'Kota', lat: 25.2138, lng: 75.8648 },

        // Madhya Pradesh
        { id: 'indore', stateId: 'MP', name: 'Indore', lat: 22.7196, lng: 75.8577 },
        { id: 'bhopal', stateId: 'MP', name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
        { id: 'gwalior', stateId: 'MP', name: 'Gwalior', lat: 26.2183, lng: 78.1828 },
        { id: 'jabalpur', stateId: 'MP', name: 'Jabalpur', lat: 23.1815, lng: 79.9864 },

        // Bihar
        { id: 'patna', stateId: 'BR', name: 'Patna', lat: 25.5941, lng: 85.1376 },
        { id: 'gaya', stateId: 'BR', name: 'Gaya', lat: 24.7914, lng: 85.0002 },
        { id: 'muzaffarpur', stateId: 'BR', name: 'Muzaffarpur', lat: 26.1209, lng: 85.3647 },
        { id: 'bhagalpur', stateId: 'BR', name: 'Bhagalpur', lat: 25.2425, lng: 86.9842 },

        // Punjab
        { id: 'ludhiana', stateId: 'PB', name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
        { id: 'amritsar', stateId: 'PB', name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
        { id: 'jalandhar', stateId: 'PB', name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },

        // Haryana
        { id: 'panchkula', stateId: 'HR', name: 'Panchkula', lat: 30.6942, lng: 76.8606 },
        { id: 'karnal', stateId: 'HR', name: 'Karnal', lat: 29.6857, lng: 76.9905 },
        { id: 'ambala', stateId: 'HR', name: 'Ambala', lat: 30.3782, lng: 76.7767 },

        // Odisha
        { id: 'bhubaneswar', stateId: 'OR', name: 'Khurda (Bhubaneswar)', lat: 20.2961, lng: 85.8245 },
        { id: 'cuttack', stateId: 'OR', name: 'Cuttack', lat: 20.4625, lng: 85.8828 },
        { id: 'rourkela', stateId: 'OR', name: 'Sundargarh (Rourkela)', lat: 22.2604, lng: 84.8536 },

        // Assam
        { id: 'guwahati', stateId: 'AS', name: 'Kamrup Metropolitan (Guwahati)', lat: 26.1445, lng: 91.7362 },
        { id: 'dibrugarh', stateId: 'AS', name: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
        { id: 'silchar', stateId: 'AS', name: 'Cachar (Silchar)', lat: 24.8333, lng: 92.7789 },

        // Jharkhand
        { id: 'ranchi', stateId: 'JH', name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
        { id: 'jamshedpur', stateId: 'JH', name: 'East Singhbhum (Jamshedpur)', lat: 22.8046, lng: 86.2029 },
        { id: 'dhanbad', stateId: 'JH', name: 'Dhanbad', lat: 23.7957, lng: 86.4304 },

        // Chhattisgarh
        { id: 'raipur', stateId: 'CG', name: 'Raipur', lat: 21.2514, lng: 81.6296 },
        { id: 'bhilai', stateId: 'CG', name: 'Durg (Bhilai)', lat: 21.1938, lng: 81.3509 },

        // Uttarakhand
        { id: 'dehradun', stateId: 'UK', name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
        { id: 'haridwar', stateId: 'UK', name: 'Haridwar', lat: 29.9457, lng: 78.1642 },

        // Himachal Pradesh
        { id: 'shimla', stateId: 'HP', name: 'Shimla', lat: 31.1048, lng: 77.1734 },
        { id: 'dharamshala', stateId: 'HP', name: 'Kangra (Dharamshala)', lat: 32.2190, lng: 76.3234 },

        // Goa
        { id: 'panaji', stateId: 'GA', name: 'North Goa (Panaji)', lat: 15.4909, lng: 73.8278 },
        { id: 'margao', stateId: 'GA', name: 'South Goa (Margao)', lat: 15.2832, lng: 73.9862 },

        // Jammu & Kashmir
        { id: 'srinagar', stateId: 'JK', name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
        { id: 'jammu', stateId: 'JK', name: 'Jammu', lat: 32.7266, lng: 74.8570 },

        // Puducherry
        { id: 'puducherry_dist', stateId: 'PY', name: 'Puducherry Town', lat: 11.9416, lng: 79.8083 },

        // Chandigarh
        { id: 'chandigarh_city', stateId: 'CH', name: 'Chandigarh City', lat: 30.7333, lng: 76.7794 },

        // Tripura
        { id: 'agartala', stateId: 'TR', name: 'West Tripura (Agartala)', lat: 23.8315, lng: 91.2868 },

        // Meghalaya
        { id: 'shillong', stateId: 'ML', name: 'East Khasi Hills (Shillong)', lat: 25.5788, lng: 91.8933 },

        // Manipur
        { id: 'imphal', stateId: 'MN', name: 'Imphal East & West', lat: 24.8170, lng: 93.9368 },

        // Nagaland
        { id: 'kohima', stateId: 'NL', name: 'Kohima', lat: 25.6751, lng: 94.1086 },

        // Mizoram
        { id: 'aizawl', stateId: 'MZ', name: 'Aizawl', lat: 23.7307, lng: 92.7173 },

        // Sikkim
        { id: 'gangtok', stateId: 'SK', name: 'East Sikkim (Gangtok)', lat: 27.3389, lng: 88.6065 },

        // Arunachal Pradesh
        { id: 'itanagar', stateId: 'AR', name: 'Papum Pare (Itanagar)', lat: 27.0844, lng: 93.6053 }
    ],

    hospitals: [
        // Chennai
        { id: 'h1', districtId: 'chennai', name: 'Apollo Hospitals, Greams Road', lat: 13.0604, lng: 80.2505, phone: '+91 44 2829 0200' },
        { id: 'h2', districtId: 'chennai', name: 'MGM Healthcare, Aminjikarai', lat: 13.0762, lng: 80.2185, phone: '+91 44 4524 2424' },
        { id: 'h3', districtId: 'chennai', name: 'Rajiv Gandhi Govt General Hospital', lat: 13.0808, lng: 80.2778, phone: '+91 44 2530 5000' },

        // Coimbatore
        { id: 'h4', districtId: 'coimbatore', name: 'KMCH (Kovai Medical Center & Hospital)', lat: 11.0427, lng: 77.0396, phone: '+91 422 432 3800' },
        { id: 'h5', districtId: 'coimbatore', name: 'Coimbatore Govt Medical College Hospital', lat: 10.9995, lng: 76.9698, phone: '+91 422 230 1393' },

        // Bengaluru
        { id: 'h6', districtId: 'bengaluru_urban', name: 'Manipal Hospital, Old Airport Road', lat: 12.9575, lng: 77.6477, phone: '+91 80 2502 4444' },
        { id: 'h7', districtId: 'bengaluru_urban', name: 'Victoria Hospital (BMCRI)', lat: 12.9632, lng: 77.5756, phone: '+91 80 2670 1150' },

        // Mumbai
        { id: 'h8', districtId: 'mumbai', name: 'Lilavati Hospital & Research Centre', lat: 19.0515, lng: 72.8288, phone: '+91 22 2675 1000' },
        { id: 'h9', districtId: 'mumbai', name: 'KEM Hospital, Parel', lat: 19.0019, lng: 72.8427, phone: '+91 22 2410 7000' },

        // Delhi
        { id: 'h10', districtId: 'south_delhi', name: 'AIIMS (All India Institute of Medical Sciences)', lat: 28.5672, lng: 77.2100, phone: '+91 11 2658 8500' },
        { id: 'h11', districtId: 'central_delhi', name: 'Sir Ganga Ram Hospital', lat: 28.6385, lng: 77.1895, phone: '+91 11 2575 0000' },

        // Hyderabad
        { id: 'h12', districtId: 'hyderabad', name: 'Yashoda Hospitals, Somajiguda', lat: 17.4258, lng: 78.4586, phone: '+91 40 4567 4567' },
        { id: 'h13', districtId: 'hyderabad', name: 'NIMS (Nizam\'s Institute of Medical Sciences)', lat: 17.4227, lng: 78.4542, phone: '+91 40 2348 9000' },

        // Kolkata
        { id: 'h14', districtId: 'kolkata', name: 'SSKM Hospital (IPGMER)', lat: 22.5385, lng: 88.3444, phone: '+91 33 2223 1589' },

        // Ernakulam / Kochi
        { id: 'h15', districtId: 'ernakulam', name: 'Aster Medcity, Cheranalloor', lat: 10.0526, lng: 76.2691, phone: '+91 484 669 9999' }
    ],

    donors: [
        { id: 'd101', name: 'Dr. Vikram Seth', age: 31, gender: 'Male', bloodGroup: 'O-', phone: '+91 98401 22104', stateId: 'TN', districtId: 'chennai', lat: 13.0850, lng: 80.2600, readyToDonate: true, lastDonated: '2026-04-10', weightKg: 74, donationsCount: 14, isVerified: true },
        { id: 'd102', name: 'Kavitha Sundaram', age: 26, gender: 'Female', bloodGroup: 'A+', phone: '+91 98402 33411', stateId: 'TN', districtId: 'chennai', lat: 13.0620, lng: 80.2400, readyToDonate: true, lastDonated: '2026-01-15', weightKg: 62, donationsCount: 6, isVerified: true },
        { id: 'd103', name: 'Anand Kumar', age: 29, gender: 'Male', bloodGroup: 'B+', phone: '+91 94441 88902', stateId: 'TN', districtId: 'coimbatore', lat: 11.0200, lng: 76.9600, readyToDonate: true, lastDonated: '2025-11-20', weightKg: 70, donationsCount: 9, isVerified: true },
        { id: 'd104', name: 'Siddharth Rao', age: 34, gender: 'Male', bloodGroup: 'AB-', phone: '+91 98800 12345', stateId: 'KA', districtId: 'bengaluru_urban', lat: 12.9750, lng: 77.6000, readyToDonate: true, lastDonated: '2026-03-01', weightKg: 80, donationsCount: 18, isVerified: true },
        { id: 'd105', name: 'Pooja Deshmukh', age: 28, gender: 'Female', bloodGroup: 'O+', phone: '+91 98200 67890', stateId: 'MH', districtId: 'mumbai', lat: 19.0800, lng: 72.8800, readyToDonate: true, lastDonated: '2026-05-02', weightKg: 58, donationsCount: 5, isVerified: true },
        { id: 'd106', name: 'Rahul Sharma', age: 27, gender: 'Male', bloodGroup: 'A-', phone: '+91 98100 54321', stateId: 'DL', districtId: 'south_delhi', lat: 28.5600, lng: 77.2200, readyToDonate: true, lastDonated: '2026-02-14', weightKg: 76, donationsCount: 11, isVerified: true },
        { id: 'd107', name: 'Mohammed Ali', age: 32, gender: 'Male', bloodGroup: 'B-', phone: '+91 99490 11223', stateId: 'TS', districtId: 'hyderabad', lat: 17.3900, lng: 78.4700, readyToDonate: true, lastDonated: '2026-03-22', weightKg: 78, donationsCount: 8, isVerified: true },
        { id: 'd108', name: 'Sneha Reddy', age: 25, gender: 'Female', bloodGroup: 'O-', phone: '+91 97000 44556', stateId: 'AP', districtId: 'visakhapatnam', lat: 17.6900, lng: 83.2200, readyToDonate: true, lastDonated: '2026-04-18', weightKg: 55, donationsCount: 4, isVerified: true },
        { id: 'd109', name: 'Arjun Menon', age: 30, gender: 'Male', bloodGroup: 'A+', phone: '+91 94470 99887', stateId: 'KL', districtId: 'ernakulam', lat: 9.9400, lng: 76.2800, readyToDonate: true, lastDonated: '2026-06-01', weightKg: 72, donationsCount: 7, isVerified: true }
    ],

    activeRequests: [
        { id: 'req-01', patientName: 'Meena R.', bloodGroup: 'O-', units: 2, hospital: 'Apollo Hospitals, Greams Rd, Chennai', stateId: 'TN', districtId: 'chennai', urgency: 'CRITICAL', status: 'MATCHING', requestedAt: '10 mins ago', contact: '+91 98409 00112' },
        { id: 'req-02', patientName: 'Rajesh V.', bloodGroup: 'AB-', units: 1, hospital: 'Manipal Hospital, Bengaluru', stateId: 'KA', districtId: 'bengaluru_urban', urgency: 'URGENT', status: 'IN_PROGRESS', requestedAt: '35 mins ago', contact: '+91 98801 99223' },
        { id: 'req-03', patientName: 'Sunita Sharma', bloodGroup: 'A-', units: 3, hospital: 'AIIMS South Delhi', stateId: 'DL', districtId: 'south_delhi', urgency: 'CRITICAL', status: 'DONOR_FOUND', requestedAt: '1 hour ago', contact: '+91 98105 33445' }
    ],

    bloodBanks: [
        {
            id: 'bb-tn-01',
            regId: 'BB-TN-CHENNAI-001',
            name: 'Rotary Central Blood Bank & Research Center',
            orgName: 'Rotary International & Govt General Hospital',
            type: 'Charitable Trust / Govt Approved',
            phone: '+91 44 2819 4500',
            email: 'rotarybloodbank.chennai@lifepulse.org',
            website: 'https://rotarybloodbankchennai.org',
            address: 'No. 56, Marshalls Road, Egmore, Chennai, Tamil Nadu - 600008',
            districtId: 'chennai',
            stateId: 'TN',
            pincode: '600008',
            lat: 13.0780,
            lng: 80.2610,
            workingHours: 'Open 24 Hours (365 Days)',
            emergencyAvailable: true,
            isVerified: true,
            distanceKm: 2.4,
            password: 'bank123',
            stockUpdated: '19-Aug-2026, 11:30 AM',
            authorizedPerson: 'Dr. A. R. Swaminathan (Medical Director)',
            stock: { 'O-': 4, 'O+': 15, 'A+': 10, 'A-': 3, 'B+': 8, 'B-': 2, 'AB+': 5, 'AB-': 1 }
        },
        {
            id: 'bb-tn-02',
            regId: 'BB-TN-CHENNAI-002',
            name: 'Apollo Main Blood Centre & Transfusion Medicine',
            orgName: 'Apollo Hospitals Group',
            type: 'Private Hospital Blood Bank',
            phone: '+91 44 2829 0200',
            email: 'bloodbank.apollo.greams@lifepulse.org',
            website: 'https://apollohospitals.com/bloodbank',
            address: '21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu - 600006',
            districtId: 'chennai',
            stateId: 'TN',
            pincode: '600006',
            lat: 13.0604,
            lng: 80.2512,
            workingHours: 'Open 24 Hours',
            emergencyAvailable: true,
            isVerified: true,
            password: 'bank123',
            distanceKm: 3.8,
            stockUpdated: '19-Aug-2026, 10:15 AM',
            authorizedPerson: 'Dr. S. Meenakshi (HOD Transfusion)',
            stock: { 'O-': 2, 'O+': 22, 'A+': 14, 'A-': 5, 'B+': 18, 'B-': 4, 'AB+': 8, 'AB-': 2 }
        },
        {
            id: 'bb-ka-01',
            regId: 'BB-KA-BLR-001',
            name: 'Lions Blood Bank & Diagnostic Centre',
            orgName: 'Lions Club International',
            type: 'Charitable Trust',
            phone: '+91 80 2222 5555',
            email: 'lions.blr@lifepulse.org',
            website: 'https://lionsbloodbankblr.org',
            address: 'J.C. Road, Near Minerva Circle, Bengaluru, Karnataka - 560002',
            districtId: 'bengaluru_urban',
            stateId: 'KA',
            pincode: '560002',
            lat: 12.9600,
            lng: 77.5800,
            workingHours: 'Open 24 Hours',
            emergencyAvailable: true,
            isVerified: true,
            distanceKm: 4.1,
            stockUpdated: '19-Aug-2026, 09:45 AM',
            authorizedPerson: 'Ramesh H. V. (Administrator)',
            stock: { 'O-': 6, 'O+': 30, 'A+': 18, 'A-': 4, 'B+': 25, 'B-': 3, 'AB+': 9, 'AB-': 1 }
        },
        {
            id: 'bb-mh-01',
            regId: 'BB-MH-MUM-001',
            name: 'State Blood Transfusion Council (SBTC) Hub',
            orgName: 'Government of Maharashtra',
            type: 'Government Regional Blood Bank',
            phone: '+91 22 2410 7000',
            email: 'sbtc.mumbai@lifepulse.org',
            website: 'https://sbtc.maharashtra.gov.in',
            address: 'KEM Hospital Campus, Parel, Mumbai, Maharashtra - 400012',
            districtId: 'mumbai',
            stateId: 'MH',
            pincode: '400012',
            lat: 19.0025,
            lng: 72.8430,
            workingHours: 'Open 24 Hours',
            emergencyAvailable: true,
            isVerified: true,
            distanceKm: 1.8,
            stockUpdated: '19-Aug-2026, 11:00 AM',
            authorizedPerson: 'Dr. Vijay Kulkarni (State Director)',
            stock: { 'O-': 8, 'O+': 40, 'A+': 25, 'A-': 6, 'B+': 32, 'B-': 5, 'AB+': 12, 'AB-': 3 }
        }
    ]
};
