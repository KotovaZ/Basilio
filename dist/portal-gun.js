(function () {
    'use strict';

    var portals = [null, null]; // [orange, blue]
    var portalNextIndex = 0;

    // Mouse position tracking (in canvas coordinates)
    var mouseCanvas = { x: 640, y: 384 };
    var canvas = null;

    function getCanvas() {
        if (canvas) return canvas;
        canvas = document.querySelector('canvas');
        return canvas;
    }

    document.addEventListener('mousemove', function (e) {
        var c = getCanvas();
        if (!c) return;
        var rect = c.getBoundingClientRect();
        var scaleX = c.width / rect.width;
        var scaleY = c.height / rect.height;
        mouseCanvas.x = (e.clientX - rect.left) * scaleX;
        mouseCanvas.y = (e.clientY - rect.top) * scaleY;
    });

    // Find Mario in any layer
    function getMario() {
        if (!window.game || !window.game.layers) return null;
        for (var i = 0; i < window.game.layers.length; i++) {
            var layer = window.game.layers[i];
            if (!layer.objects) continue;
            for (var j = 0; j < layer.objects.length; j++) {
                if (layer.objects[j].name === 'Mario') return layer.objects[j];
            }
        }
        return null;
    }

    // Draw aiming reticle (crosshair) at mouse position each frame
    // Injected as a non-trackable overlay object
    var aimOverlay = null;
    function createAimOverlay(layerRef) {
        if (aimOverlay) return;
        aimOverlay = {
            position: { x: 0, y: 0 },
            body: { width: 1, height: 1 },
            trackable: false,
            velocity: { x: 0, y: 0 },
            layer: layerRef,
            render: function (ctx) {
                var mx = mouseCanvas.x;
                var my = mouseCanvas.y;

                // Determine active portal color for aiming
                var color = portalNextIndex === 0 ? '#ff6600' : '#0066ff';

                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.8;
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;

                // Outer circle
                ctx.beginPath();
                ctx.arc(mx, my, 16, 0, Math.PI * 2);
                ctx.stroke();

                // Cross lines
                ctx.beginPath();
                ctx.moveTo(mx - 22, my);
                ctx.lineTo(mx - 10, my);
                ctx.moveTo(mx + 10, my);
                ctx.lineTo(mx + 22, my);
                ctx.moveTo(mx, my - 22);
                ctx.lineTo(mx, my - 10);
                ctx.moveTo(mx, my + 10);
                ctx.lineTo(mx, my + 22);
                ctx.stroke();

                ctx.restore();
            }
        };
        layerRef.addObject(aimOverlay);
    }

    // Create a stationary portal ring
    function createPortal(pos, angle, idx, layerRef) {
        var cooldown = 0;

        // Portal orientation: vertical (on walls) vs horizontal (on floor/ceiling)
        // angle: 0=floor, 180=ceiling, 90=right wall, 270=left wall
        // For floor/ceiling: wide ellipse. For walls: tall ellipse.
        var isHorizontal = (angle === 0 || angle === 180);
        var pW = isHorizontal ? 48 : 16;
        var pH = isHorizontal ? 16 : 48;

        var portal = {
            position: { x: pos.x - pW / 2, y: pos.y - pH / 2 },
            body: { width: pW, height: pH },
            trackable: false,
            layer: layerRef,
            velocity: { x: 0, y: 0 },
            _setCooldown: null,
            render: function (ctx) {
                var color = idx === 0 ? '#ff6600' : '#0066ff';
                var cx = portal.position.x + pW / 2 + window.camera.x;
                var cy = 768 - portal.position.y - pH / 2;

                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 5;
                ctx.shadowColor = color;
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.ellipse(cx, cy, pW / 2, pH / 2, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                if (cooldown > 0) { cooldown--; return; }

                var other = portals[1 - idx];
                if (!other) return;

                var mario = getMario();
                if (!mario) return;

                var mx = mario.position.x, my = mario.position.y;
                var mw = mario.body.width, mh = mario.body.height;
                var px = portal.position.x, py = portal.position.y;

                if (mx < px + pW && mx + mw > px && my < py + pH && my + mh > py) {
                    mario.position.x = other.position.x + other.body.width / 2 - mw / 2;
                    mario.position.y = other.position.y + other.body.height;
                    mario.velocity.y = 0;
                    cooldown = 60;
                    if (other._setCooldown) other._setCooldown(60);
                }
            }
        };

        portal._setCooldown = function (v) { cooldown = v; };
        portals[idx] = portal;
        return portal;
    }

    // Create a flying portal bullet aimed toward mouse position
    function createBullet(startPos, dirX, dirY, speed, idx, layerRef) {
        var maxFrames = 300;
        var frame = 0;
        var placed = false;

        // Normalize direction
        var len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        dirX /= len;
        dirY /= len;

        var bullet = {
            position: { x: startPos.x, y: startPos.y },
            body: { width: 10, height: 10 },
            trackable: true,
            velocity: { x: dirX * speed / 60, y: -dirY * speed / 60 }, // game Y is flipped
            layer: layerRef,
            collisions: {},
            _dirX: dirX,
            _dirY: dirY,
            clearCollisions: function () { bullet.collisions = {}; },
            setCollision: function (angle, elem) {
                if (!bullet.collisions[angle]) bullet.collisions[angle] = [];
                bullet.collisions[angle].push(elem);
            },
            getAABB: function () {
                return {
                    min: {
                        x: bullet.position.x + bullet.velocity.x,
                        y: bullet.position.y + bullet.velocity.y
                    },
                    max: {
                        x: bullet.position.x + bullet.body.width + bullet.velocity.x,
                        y: bullet.position.y + bullet.body.height
                    }
                };
            },
            render: function (ctx) {
                if (placed) return;
                frame++;

                var hitWall = bullet.collisions[90] || bullet.collisions[270];
                var hitFloor = bullet.collisions[180];
                var hitCeiling = bullet.collisions[0];
                var hit = hitWall || hitFloor || hitCeiling;

                if (hit || frame > maxFrames) {
                    placed = true;
                    var angle = hitFloor ? 0 : hitCeiling ? 180 : hitWall === bullet.collisions[90] ? 90 : 270;
                    if (hit) doPlace(angle); else doPlace(0);
                    return;
                }

                var fr = window.framerate || 60;
                bullet.velocity.x = dirX * speed / fr;
                bullet.velocity.y = -dirY * speed / fr; // game Y inverted

                var color = idx === 0 ? '#ff6600' : '#0066ff';
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.arc(
                    bullet.position.x + bullet.body.width / 2 + window.camera.x,
                    768 - bullet.position.y - bullet.body.height / 2,
                    bullet.body.width / 2, 0, Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
            }
        };

        function doPlace(angle) {
            if (portals[idx] && portals[idx].layer) {
                portals[idx].layer.deleteObject(portals[idx]);
            }
            portals[idx] = null;

            var portal = createPortal(
                { x: bullet.position.x + bullet.body.width / 2, y: bullet.position.y + bullet.body.height / 2 },
                angle,
                idx,
                layerRef
            );
            layerRef.addObject(portal);
            layerRef.deleteObject(bullet);
        }

        return bullet;
    }

    // Fire a portal bullet toward the mouse cursor
    function firePortal() {
        var mario = getMario();
        if (!mario || !mario.layer) return;

        var c = getCanvas();
        if (!c) return;

        // Mario screen position
        var marioScreenX = mario.position.x + mario.body.width / 2 + window.camera.x;
        var marioScreenY = 768 - mario.position.y - mario.body.height / 2;

        // Direction from Mario to mouse (in canvas pixels)
        var dx = mouseCanvas.x - marioScreenX;
        var dy = mouseCanvas.y - marioScreenY;

        var speed = 32 * 14;

        var pIdx = portalNextIndex;
        portalNextIndex = 1 - portalNextIndex;

        // Start position: Mario center in world coords
        var sx = mario.position.x + mario.body.width / 2 - 5;
        var sy = mario.position.y + mario.body.height / 2 - 5;

        var bullet = createBullet(
            { x: sx, y: sy },
            dx, -dy, // dy inverted because game Y is bottom-up
            speed,
            pIdx,
            mario.layer
        );

        mario.layer.addObject(bullet);

        // Create aim overlay if not yet added
        createAimOverlay(mario.layer);
    }

    // Hook reload/loadLevel to reset portal state
    function hookGameManager() {
        if (!window.gameManager) return;

        var origReload = window.gameManager.reload.bind(window.gameManager);
        window.gameManager.reload = function () {
            portals = [null, null];
            portalNextIndex = 0;
            origReload();
        };

        var origLoad = window.gameManager.loadLevel.bind(window.gameManager);
        window.gameManager.loadLevel = function (level) {
            portals = [null, null];
            portalNextIndex = 0;
            aimOverlay = null;
            origLoad(level);
        };
    }

    // E key or left mouse button fires portal
    document.addEventListener('keydown', function (e) {
        if (e.code !== 'KeyE' || e.repeat) return;
        if (window.game && window.game.paused) return;
        firePortal();
    });

    document.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return; // left click
        if (window.game && window.game.paused) return;
        // Don't fire if clicking on UI elements outside canvas
        var c = getCanvas();
        if (!c) return;
        var rect = c.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom) return;
        firePortal();
    });

    if (window.gameManager) {
        hookGameManager();
    } else {
        var waitTimer = setInterval(function () {
            if (window.gameManager) {
                clearInterval(waitTimer);
                hookGameManager();
            }
        }, 100);
    }
})();
