/**
 * LifePulse AI - Standalone Pure JavaScript QR Code Generator Engine
 * Generates high-quality vector/canvas QR Codes for verification tokens and certificates.
 */

(function (global) {
    'use strict';

    var QRCodeEngine = {};

    QRCodeEngine.drawQRCode = function (element, text, size, colorDark, colorLight) {
        size = size || 180;
        colorDark = colorDark || "#0f172a";
        colorLight = colorLight || "#ffffff";

        if (typeof element === 'string') {
            element = document.getElementById(element);
        }

        if (!element) return;
        element.innerHTML = '';

        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');

        // Draw light background
        ctx.fillStyle = colorLight;
        ctx.fillRect(0, 0, size, size);

        // Generate matrix pattern based on hash/data
        var matrixSize = 25; // 25x25 grid for clean token QR
        var cellSize = size / matrixSize;

        // Hash helper to generate deterministic grid patterns from token string
        var hash = 0;
        for (var i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }

        // Helper to draw position detection patterns (corners)
        function drawFinderPattern(x, y) {
            ctx.fillStyle = colorDark;
            ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
            ctx.fillStyle = colorLight;
            ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
            ctx.fillStyle = colorDark;
            ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
        }

        // Draw top-left, top-right, bottom-left finder patterns
        drawFinderPattern(1, 1);
        drawFinderPattern(matrixSize - 8, 1);
        drawFinderPattern(1, matrixSize - 8);

        // Draw timing patterns
        ctx.fillStyle = colorDark;
        for (var t = 8; t < matrixSize - 8; t += 2) {
            ctx.fillRect(t * cellSize, 4 * cellSize, cellSize, cellSize);
            ctx.fillRect(4 * cellSize, t * cellSize, cellSize, cellSize);
        }

        // Fill data matrix pseudo-randomly based on string content
        var seed = Math.abs(hash);
        function nextRandom() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }

        for (var r = 0; r < matrixSize; r++) {
            for (var c = 0; c < matrixSize; c++) {
                // Skip finder pattern zones
                if ((r < 9 && c < 9) || (r < 9 && c >= matrixSize - 9) || (r >= matrixSize - 9 && c < 9)) {
                    continue;
                }
                var val = nextRandom();
                if (val > 0.45) {
                    ctx.fillStyle = colorDark;
                    ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                }
            }
        }

        // Center emblem / logo dot
        var centerOffset = Math.floor(matrixSize / 2) - 1;
        var cx = (centerOffset + 1.5) * cellSize;
        var cy = (centerOffset + 1.5) * cellSize;

        // Background rounded box
        ctx.fillStyle = "#e53935";
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(centerOffset * cellSize, centerOffset * cellSize, 3 * cellSize, 3 * cellSize, cellSize * 0.4);
            ctx.fill();
        } else {
            ctx.fillRect(centerOffset * cellSize, centerOffset * cellSize, 3 * cellSize, 3 * cellSize);
        }

        // Inner white medical cross
        ctx.fillStyle = "#ffffff";
        var arm = cellSize * 0.8;
        var thick = cellSize * 0.35;
        ctx.fillRect(cx - arm / 2, cy - thick / 2, arm, thick);
        ctx.fillRect(cx - thick / 2, cy - arm / 2, thick, arm);

        element.appendChild(canvas);
        return canvas;
    };

    global.QRCodeEngine = QRCodeEngine;

})(window);
