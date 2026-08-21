/**
 * LifePulse AI - Cryptographic SHA-256 Micro-Blockchain Ledger
 * Maintains an immutable hash-linked chain for verified blood donations
 */

window.LifePulseBlockchain = {
    chain: [],
    difficulty: 2, // SHA-256 mining difficulty

    // Fallback JavaScript SHA-256 implementation for standalone reliability
    sha256Simple: function(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }
        var mathPow = Math.pow;
        var maxWord = mathPow(2, 32);
        var lengthProperty = 'length';
        var i, j;
        var result = '';
        var words = [];
        var asciiBitLength = ascii[lengthProperty] * 8;
        var hash = this._sha256Hash = this._sha256Hash || [];
        var k = this._sha256K = this._sha256K || [];
        var primeCounter = k[lengthProperty];

        var isPrime = function(n) {
            for (var factor = 2; factor * factor <= n; factor++) {
                if (n % factor === 0) return false;
            }
            return true;
        };

        var candidate = 2;
        while (primeCounter < 64) {
            if (isPrime(candidate)) {
                if (primeCounter < 8) {
                    hash[primeCounter] = (mathPow(candidate, 1/2) * maxWord) | 0;
                }
                k[primeCounter] = (mathPow(candidate, 1/3) * maxWord) | 0;
                primeCounter++;
            }
            candidate++;
        }

        ascii += '\x80';
        while (ascii[lengthProperty] % 64 !== 56) ascii += '\x00';
        for (i = 0; i < ascii[lengthProperty]; i++) {
            j = ascii.charCodeAt(i);
            if (j >> 8) return; // ASCII only
            words[i >> 2] |= j << ((3 - i % 4) * 8);
        }
        words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
        words[words[lengthProperty]] = asciiBitLength;

        for (j = 0; j < words[lengthProperty];) {
            var w = words.slice(j, j += 16);
            var oldHash = hash.slice(0);

            for (i = 0; i < 64; i++) {
                var w15 = w[i - 15], w2 = w[i - 2];
                var a = hash[0], e = hash[4];
                var temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                    + ((e & hash[5]) ^ ((~e) & hash[6]))
                    + k[i]
                    + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                    ) | 0);

                var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                    + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

                hash = [(temp1 + temp2) | 0].concat(hash);
                hash[4] = (hash[4] + temp1) | 0;
                hash.pop();
            }

            for (i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }

        for (i = 0; i < 8; i++) {
            for (j = 3; j >= 0; j--) {
                var b = (hash[i] >> (j * 8)) & 255;
                result += (b < 16 ? 0 : '') + b.toString(16);
            }
        }
        return result;
    },

    // Calculate Block SHA-256 Hash
    calculateHash: function(index, previousHash, timestamp, data, nonce) {
        var stringToHash = index + previousHash + timestamp + JSON.stringify(data) + nonce;
        return this.sha256Simple(stringToHash);
    },

    // Initialize Genesis Block
    initChain: function() {
        if (this.chain.length === 0) {
            var genesisBlock = {
                index: 0,
                timestamp: '2026-01-01T00:00:00.000Z',
                data: {
                    event: 'GENESIS_BLOCK',
                    network: 'LifePulse Pan-India Blood Network',
                    creator: 'LifePulse AI Smart Contract'
                },
                previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
                nonce: 42,
                hash: '0000a3f89e217d84bc7102a45c928e119b405527a201c107e321528c11223344'
            };
            this.chain.push(genesisBlock);
            
            // Add a pre-seeded verified donation block
            this.addVerifiedDonation({
                donorId: 'DON-1002',
                donorName: 'Priya Sharma',
                bloodGroup: 'O-',
                units: 2,
                hospitalName: 'Apollo Hospitals, Greams Road',
                city: 'Chennai',
                patientId: 'PAT-9082'
            });
        }
    },

    // Add & Mine new Donation Block
    addVerifiedDonation: function(donationData) {
        var previousBlock = this.chain[this.chain.length - 1];
        var newIndex = this.chain.length;
        var timestamp = new Date().toISOString();
        var nonce = 0;
        var hash = '';

        // Simple Proof-of-Work Mining Loop (looking for leading zeros)
        do {
            nonce++;
            hash = this.calculateHash(newIndex, previousBlock.hash, timestamp, donationData, nonce);
        } while (hash.substring(0, this.difficulty) !== '0'.repeat(this.difficulty) && nonce < 10000);

        var newBlock = {
            index: newIndex,
            timestamp: timestamp,
            data: donationData,
            previousHash: previousBlock.hash,
            nonce: nonce,
            hash: hash
        };

        this.chain.push(newBlock);
        return newBlock;
    },

    // Validate entire chain integrity
    isChainValid: function() {
        for (var i = 1; i < this.chain.length; i++) {
            var currentBlock = this.chain[i];
            var previousBlock = this.chain[i - 1];

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            var recomputedHash = this.calculateHash(
                currentBlock.index,
                currentBlock.previousHash,
                currentBlock.timestamp,
                currentBlock.data,
                currentBlock.nonce
            );

            if (currentBlock.hash !== recomputedHash) {
                return false;
            }
        }
        return true;
    },

    // Get all verified certificate records
    getCertificates: function() {
        var certs = [];
        for (var i = 1; i < this.chain.length; i++) {
            var block = this.chain[i];
            certs.push({
                certId: 'CERT-' + block.hash.substring(0, 10).toUpperCase(),
                blockIndex: block.index,
                timestamp: block.timestamp,
                donorName: block.data.donorName || 'Verified Donor',
                bloodGroup: block.data.bloodGroup || 'O+',
                units: block.data.units || 1,
                hospital: block.data.hospitalName || 'National Health Center',
                hash: block.hash,
                previousHash: block.previousHash
            });
        }
        return certs;
    }
};

// Initialize chain immediately
window.LifePulseBlockchain.initChain();
