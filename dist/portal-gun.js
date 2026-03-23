(function () {
    'use strict';

    var portals = [null, null]; // [orange, blue]
    var portalNextIndex = 0;

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

    // Create a stationary portal ring
    function createPortal(pos, idx, layerRef) {
        var cooldown = 0;
        var portal = {
            position: { x: pos.x, y: pos.y },
            body: { width: 16, height: 48 },
            trackable: false,
            layer: layerRef,
            velocity: { x: 0, y: 0 },
            render: function (ctx) {
                var color = idx === 0 ? '#ff6600' : '#0066ff';
                var cx = portal.position.x + portal.body.width / 2 + window.camera.x;
                var cy = 768 - portal.position.y - portal.body.height / 2;

                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 5;
                ctx.shadowColor = color;
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.ellipse(cx, cy, portal.body.width / 2, portal.body.height / 2, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // Cooldown ticks
                if (cooldown > 0) { cooldown--; return; }

                // Check other portal exists
                var other = portals[1 - idx];
                if (!other) return;

                // Find Mario
                var mario = getMario();
                if (!mario) return;

                // AABB overlap
                var mx = mario.position.x, my = mario.position.y;
                var mw = mario.body.width, mh = mario.body.height;
                var px = portal.position.x, py = portal.position.y;
                var pw = portal.body.width, ph = portal.body.height;

                if (mx < px + pw && mx + mw > px && my < py + ph && my + mh > py) {
                    // Teleport Mario out the other portal (above it)
                    mario.position.x = other.position.x;
                    mario.position.y = other.position.y + other.body.height;
                    mario.velocity.y = 0;
                    cooldown = 60;
                    if (other._setCooldown) other._setCooldown(60);
                }
            }
        };

        // Allow the other portal to set this portal's cooldown
        portal._setCooldown = function (v) { cooldown = v; };

        portals[idx] = portal;
        return portal;
    }

    // Create a flying portal bullet
    function createBullet(startPos, vectorX, idx, layerRef) {
        var speed = 32 * 14;
        var maxFrames = 240; // ~4s safety timeout
        var frame = 0;
        var placed = false;

        var bullet = {
            position: { x: startPos.x, y: startPos.y },
            body: { width: 10, height: 10 },
            trackable: true, // participates in game's collision detection
            velocity: { x: vectorX * speed / 60, y: 0 },
            layer: layerRef,
            collisions: {},
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

                // Check collision — game loop sets velocity.x=0 on wall hit before render
                var hitWall = bullet.collisions[90] || bullet.collisions[270];
                var hitFloor = bullet.collisions[180];
                var hitCeiling = bullet.collisions[0];
                var hit = hitWall || hitFloor || hitCeiling;

                if (hit || frame > maxFrames) {
                    placed = true;
                    doPlace();
                    return;
                }

                // Keep bullet moving (velocity reset after collision check)
                var fr = window.framerate || 60;
                bullet.velocity.x = vectorX * speed / fr;

                // Draw bullet
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

        function doPlace() {
            // Remove old portal of same index
            if (portals[idx] && portals[idx].layer) {
                portals[idx].layer.deleteObject(portals[idx]);
            }
            portals[idx] = null;

            var portal = createPortal(
                { x: bullet.position.x, y: bullet.position.y },
                idx,
                layerRef
            );
            layerRef.addObject(portal);
            layerRef.deleteObject(bullet);
        }

        return bullet;
    }

    // Fire a portal bullet from Mario's position
    function firePortal() {
        var mario = getMario();
        if (!mario || !mario.layer) return;

        var pIdx = portalNextIndex;
        portalNextIndex = 1 - portalNextIndex;

        var sx = mario.position.x + (mario.vector.x > 0 ? mario.body.width : -20);
        var sy = mario.position.y + 8;

        var bullet = createBullet(
            { x: sx, y: sy },
            mario.vector.x,
            pIdx,
            mario.layer
        );

        mario.layer.addObject(bullet);
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
            origLoad(level);
        };
    }

    // Keyboard listener
    document.addEventListener('keydown', function (e) {
        if (e.code !== 'KeyE' || e.repeat) return;
        if (window.game && window.game.paused) return;
        firePortal();
    });

    // Wait for gameManager to be set (it's created synchronously in index.ts, but just in case)
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
