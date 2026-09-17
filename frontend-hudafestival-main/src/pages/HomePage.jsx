import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  useEffect(() => {
    // Inject custom styles
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
    * {
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #14031c;
      color: #fff7ed;
      cursor: none;
    }

    /* Architectural Arch Framing Aperture */
    .arch-portal-mask {
      clip-path: ellipse(48% 54% at 50% 50%);
      border: 1px solid rgba(255, 193, 116, 0.35);
      box-shadow: inset 0 0 80px rgba(20, 3, 28, 0.9), 0 0 60px rgba(0,0,0,0.85);
    }
    @media (min-width: 1024px) {
      .arch-portal-mask {
        clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%);
        border-radius: 420px 420px 24px 24px;
      }
    }

    /* 2.5D Viewport Parallax */
    .viewport-3d {
      perspective: 1400px;
      perspective-origin: 50% 50%;
      position: absolute;
      inset: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    .parallax-plane {
      position: absolute;
      inset: -6%;
      width: 112%;
      height: 112%;
      will-change: transform;
      backface-visibility: hidden;
    }

    /* Dial & Astrological Ring Rotation */
    @keyframes dialSpinSlow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes dialSpinReverse {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }
    .spin-dial {
      animation: dialSpinSlow 75s linear infinite;
    }
    .spin-dial-reverse {
      animation: dialSpinReverse 60s linear infinite;
    }

    /* Refined Gallery Monograph Glass */
    .archival-glass {
      background: linear-gradient(135deg, rgba(32, 10, 40, 0.78) 0%, rgba(20, 3, 28, 0.92) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 215, 140, 0.2);
      box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(245, 158, 11, 0.08);
    }

    /* Shockwave Shock Rings */
    @keyframes ringPulse {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.9; }
      100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
    }
    .energy-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 9999px;
      pointer-events: none;
      animation: ringPulse 1.3s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    }

    /* Screen shake */
    @keyframes screenShake {
      0% { transform: translate(0, 0); }
      20% { transform: translate(-5px, 4px); }
      40% { transform: translate(4px, -4px); }
      60% { transform: translate(-3px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0, 0); }
    }
    .shake-active {
      animation: screenShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }

    /* Chromatic Aberration RGB Shift */
    .logo-chromatic {
      filter: drop-shadow(-4px -2px 0px rgba(220, 38, 38, 0.65)) drop-shadow(4px 2px 0px rgba(127, 225, 146, 0.7));
    }

    /* Custom Star-Brush Cursor */
    #brush-cursor {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      will-change: transform;
    }
  `;
    document.head.appendChild(styleEl);

    // Run the animation scripts
    const runScripts = () => {
      
    

      /* ----------------------------------------------------
         1. WEB AUDIO SYNTHESIS ENGINE
         ---------------------------------------------------- */
      let audioMuted = false;
      const AudioController = {
        ctx: null,
        init() {
          if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
          }
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
          }
        },
        playPop(freq = 440, duration = 0.12) {
          if (audioMuted) return;
          this.init();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.6, this.ctx.currentTime + duration);
          gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        },
        playChime(stage) {
          if (audioMuted) return;
          this.init();
          if (!this.ctx) return;
          const chords = [
            [523.25, 659.25],                   // Ignition
            [587.33, 739.99, 880.00],           // Energy
            [659.25, 830.61, 987.77, 1318.51],  // Festival Burst
            [783.99, 987.77, 1174.66, 1567.98]  // Gateway Open
          ];
          const freqs = chords[stage - 1] || chords[0];
          freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = i % 2 === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(f, this.ctx.currentTime + (i * 0.03));
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime + (i * 0.03));
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6 + (i * 0.08));
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + (i * 0.03));
            osc.stop(this.ctx.currentTime + 0.7 + (i * 0.08));
          });
        },
        playFireworkBoom(isBig = false) {
          if (audioMuted) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;

          // Low thud/burst
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          const startF = isBig ? 180 : 240;
          osc.frequency.setValueAtTime(startF, now);
          osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);
          gain.gain.setValueAtTime(isBig ? 0.22 : 0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.42);

          // Crackle burst noise
          const bufferSize = this.ctx.sampleRate * 0.25;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.07));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseFilter = this.ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.value = 1800;
          noiseFilter.Q.value = 1.2;
          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.08, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.ctx.destination);
          noise.start(now);
        }
      };

      // Sound synthesizer toggle
      const audioBtn = document.getElementById('btn-audio-toggle');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          audioMuted = !audioMuted;
          audioBtn.classList.toggle('opacity-50', audioMuted);
          if (!audioMuted) AudioController.playPop(660, 0.1);
        });
      }

      /* ----------------------------------------------------
         2. MOUSE TRACKING & PARALLAX LERP SYSTEM
         ---------------------------------------------------- */
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let targetX = 0;
      let targetY = 0;
      let curX = 0;
      let curY = 0;

      const planeSky = document.getElementById('plane-sky');
      const planeArch = document.getElementById('plane-arch');
      const planeFoliage = document.getElementById('plane-foliage');
      const planeLogo = document.getElementById('plane-logo');
      const planeParticles = document.getElementById('plane-particles');

      const cursor = document.getElementById('brush-cursor');
      const cursorHalo = document.getElementById('cursor-halo');
      const cursorBadge = document.getElementById('cursor-badge');

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        targetX = (mouseX / window.innerWidth) - 0.5;
        targetY = (mouseY / window.innerHeight) - 0.5;

        if (cursor) {
          cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        }
      });

      /* ----------------------------------------------------
         3. LIVING LOGO STATE MACHINE & MAGNETIC PHYSICS
         ---------------------------------------------------- */
      const logoEntity = document.getElementById('logo-interactive-entity');
      const logoTilt = document.getElementById('logo-tilt-frame');
      const logoBadge = document.getElementById('festival-badge-img');
      const logoBacklight = document.getElementById('logo-backlight');
      const energyAnchor = document.getElementById('energy-anchor');
      const igniteLabel = document.getElementById('ignite-label');
      const gatewayPortal = document.getElementById('gateway-portal');

      let logoState = 0; // 0: Idle, 1: Ignition, 2: Energy, 3: Burst, 4: World Gateway
      let idleTimer = null;
      let isHoveredLogo = false;

      let magX = 0;
      let magY = 0;
      let magTargetX = 0;
      let magTargetY = 0;
      let tiltX = 0;
      let tiltY = 0;

      function updatePipIndicators() {
        for (let i = 1; i <= 4; i++) {
          const pip = document.getElementById(`pip-${i}`);
          if (!pip) continue;
          if (i <= logoState) {
            pip.className = 'pip-dot w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300 shadow-[0_0_10px_#f59e0b] scale-110 transition-all duration-300';
          } else {
            pip.className = 'pip-dot w-2 h-2 rounded-full border border-amber-400/30 bg-white/10 transition-all duration-300';
          }
        }
      }

      function resetLogoStateMachine() {
        logoState = 0;
        updatePipIndicators();
        if (igniteLabel) igniteLabel.textContent = "Click to Ignite Emblem";
        if (logoBadge) {
          logoBadge.style.transform = "scale(1)";
          logoBadge.classList.remove('logo-chromatic');
        }
        if (gatewayPortal) {
          gatewayPortal.classList.add('opacity-0');
          gatewayPortal.classList.add('pointer-events-none');
        }
      }

      function touchActivity() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (logoState > 0) {
            resetLogoStateMachine();
          }
        }, 5000);
      }

      function emitShockwaves(color = 'rgba(245, 158, 11, 0.6)', count = 2) {
        if (!energyAnchor) return;
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const ring = document.createElement('div');
            ring.className = 'energy-ring border border-amber-400 shadow-[0_0_22px_#f59e0b]';
            ring.style.borderColor = color;
            ring.style.width = '200px';
            ring.style.height = '200px';
            energyAnchor.appendChild(ring);
            setTimeout(() => ring.remove(), 1300);
          }, i * 160);
        }
      }

      const brandColors = ['#f59e0b', '#fbbf24', '#10b981', '#7fe192', '#dc2626', '#ef4444', '#f97316', '#fff7ed', '#e2b8ec', '#ffffff'];

      function detonateSparks(burstCount = 35) {
        if (!logoEntity) return;
        const rect = logoEntity.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        launchFireworks(centerX, centerY, burstCount, 1.2);
      }

      /* ----------------------------------------------------
         CELEBRATORY FESTIVE SPARKLER & FIREWORKS ENGINE
         ---------------------------------------------------- */
      const fireworksParticles = [];

      function launchFireworks(x, y, count = 45, intensity = 1.0) {
        AudioController.playFireworkBoom(intensity > 1.3);

        const festivalPalettes = [
          // Radiant Gold & Amber
          { primary: '#f59e0b', secondary: '#fbbf24', highlight: '#fffbeb' },
          // Emerald & Laurel Green
          { primary: '#10b981', secondary: '#7fe192', highlight: '#d1fae5' },
          // Crimson & Vibrant Coral
          { primary: '#ef4444', secondary: '#f97316', highlight: '#fee2e2' },
          // White-Gold Starlight
          { primary: '#ffdd99', secondary: '#fcd34d', highlight: '#ffffff' }
        ];

        const palette = festivalPalettes[Math.floor(Math.random() * festivalPalettes.length)];

        // Core burst flash ring
        fireworksParticles.push({
          x: x,
          y: y,
          vx: 0,
          vy: 0,
          drag: 1,
          gravity: 0,
          radius: 12 * intensity,
          maxRadius: 40 * intensity,
          color: palette.highlight,
          alpha: 0.9,
          decay: 0.08,
          isRing: true,
          flicker: false,
          trail: []
        });

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 8.5 + 2.5) * intensity;
          const pColor = Math.random() < 0.25 ? palette.highlight : (Math.random() < 0.6 ? palette.primary : palette.secondary);
          const hasTrail = Math.random() < 0.85;

          fireworksParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            drag: 0.962 + Math.random() * 0.02,
            gravity: 0.12 + Math.random() * 0.06,
            radius: Math.random() * 2.8 + 1.2,
            color: pColor,
            alpha: 1,
            decay: Math.random() * 0.016 + 0.012,
            isSparkler: hasTrail,
            trail: [],
            flicker: Math.random() > 0.4,
            flickerSpeed: Math.random() * 0.3 + 0.15
          });
        }
      }

      // Launch fireworks on click anywhere across the document/canvas
      // except when clicking navigation, buttons or links
      window.addEventListener('pointerdown', (e) => {
        // Allow normal interactive elements to handle their own actions
        const target = e.target;
        const interactiveEl = target.closest('button, a, input, select, textarea, #brand-crest, nav, #btn-audio-toggle, #btn-register-cta');
        if (interactiveEl && !target.closest('#world-stage')) {
          return;
        }

        // Slight offset check if clicking directly inside logo entity
        const isEmblem = target.closest('#logo-interactive-entity');
        if (isEmblem) {
          // Handled specifically in emblem click listener
          return;
        }

        launchFireworks(e.clientX, e.clientY, Math.floor(Math.random() * 25 + 40), 1.0);
      });

      if (logoEntity) {
        logoEntity.addEventListener('mouseenter', () => {
          isHoveredLogo = true;
          if (cursorBadge) {
            cursorBadge.textContent = logoState === 0 ? "IGNITE" : "BOOST";
            cursorBadge.style.opacity = '1';
          }
          if (cursorHalo) cursorHalo.style.transform = 'scale(1.7)';
        });

        logoEntity.addEventListener('mouseleave', () => {
          isHoveredLogo = false;
          magTargetX = 0;
          magTargetY = 0;
          if (cursorBadge) cursorBadge.style.opacity = '0';
          if (cursorHalo) cursorHalo.style.transform = 'scale(1)';
        });

        logoEntity.addEventListener('click', (e) => {
          e.stopPropagation();
          touchActivity();
          AudioController.init();
          logoState++;

          if (logoState === 1) {
            // Stage 1: Ignition
            AudioController.playChime(1);
            if (igniteLabel) igniteLabel.textContent = "Stage 01: Archival Ignition";
            emitShockwaves('#f59e0b', 1);
            detonateSparks(28);
            if (logoBadge) {
              logoBadge.style.transform = 'scale(1.04)';
              setTimeout(() => logoBadge.style.transform = 'scale(1.02)', 200);
            }
          }
          else if (logoState === 2) {
            // Stage 2: Energy Surge
            AudioController.playChime(2);
            if (igniteLabel) igniteLabel.textContent = "Stage 02: Harmonic Energy";
            emitShockwaves('#7fe192', 3);
            detonateSparks(50);
            document.body.classList.add('shake-active');
            setTimeout(() => document.body.classList.remove('shake-active'), 400);
          }
          else if (logoState === 3) {
            // Stage 3: Festival Burst
            AudioController.playChime(3);
            if (igniteLabel) igniteLabel.textContent = "Stage 03: Festival Burst";
            emitShockwaves('#dc2626', 4);
            detonateSparks(85);
            if (logoBadge) logoBadge.classList.add('logo-chromatic');
            document.body.classList.add('shake-active');
            setTimeout(() => document.body.classList.remove('shake-active'), 400);
          }
          else if (logoState >= 4) {
            // Stage 4: World Gateway
            AudioController.playChime(4);
            if (igniteLabel) igniteLabel.textContent = "Stage 04: World Gateway";
            emitShockwaves('#ffc174', 6);
            detonateSparks(140);

            if (logoBadge) {
              logoBadge.style.transform = 'scale(2.4)';
              logoBadge.style.opacity = '0';
            }

            if (gatewayPortal) {
              gatewayPortal.classList.remove('opacity-0');
              gatewayPortal.classList.remove('pointer-events-none');
            }

            setTimeout(() => {
              resetLogoStateMachine();
            }, 4500);
          }

          updatePipIndicators();
        });
      }

      /* ----------------------------------------------------
         4. TEXT SCRAMBLE CYPHIR ENGINE
         ---------------------------------------------------- */
      const scrambleEl = document.getElementById('scramble-tagline');
      if (scrambleEl) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ*+~#@&";
        let scrambleInterval = null;
        scrambleEl.addEventListener('mouseenter', () => {
          AudioController.playPop(780, 0.06);
          let iteration = 0;
          const original = scrambleEl.dataset.original;
          clearInterval(scrambleInterval);
          scrambleInterval = setInterval(() => {
            scrambleEl.innerText = original
              .split("")
              .map((letter, index) => {
                if (index < iteration) {
                  return original[index];
                }
                return letters[Math.floor(Math.random() * letters.length)];
              })
              .join("");

            if (iteration >= original.length) {
              clearInterval(scrambleInterval);
            }
            iteration += 1 / 2;
          }, 28);
        });
      }

      /* ----------------------------------------------------
         5. CANVAS 1: STARDUST SKY CANVAS
         ---------------------------------------------------- */
      const skyCanvas = document.getElementById('sky-stars-canvas');
      if (skyCanvas) {
        const sCtx = skyCanvas.getContext('2d');
        let sw = skyCanvas.width = window.innerWidth;
        let sh = skyCanvas.height = window.innerHeight;

        const stars = Array.from({ length: 80 }, () => ({
          x: Math.random() * sw,
          y: Math.random() * (sh * 0.7),
          size: Math.random() * 1.6 + 0.3,
          alpha: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.02 + 0.005
        }));

        function drawSky() {
          sCtx.clearRect(0, 0, sw, sh);
          stars.forEach(st => {
            st.alpha += st.speed;
            if (st.alpha > 1 || st.alpha < 0.2) st.speed = -st.speed;
            sCtx.beginPath();
            sCtx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
            sCtx.fillStyle = `rgba(255, 235, 180, ${Math.max(0.1, st.alpha)})`;
            sCtx.shadowBlur = 4;
            sCtx.shadowColor = 'rgba(245, 158, 11, 0.8)';
            sCtx.fill();
          });
          requestAnimationFrame(drawSky);
        }
        drawSky();

        window.addEventListener('resize', () => {
          sw = skyCanvas.width = window.innerWidth;
          sh = skyCanvas.height = window.innerHeight;
        });
      }

      /* ----------------------------------------------------
         6. CANVAS 2: PARTICLES, SPARKLER TRAILS & FIREWORKS
         ---------------------------------------------------- */
      const particleCanvas = document.getElementById('particles-canvas');
      const pCtx = particleCanvas ? particleCanvas.getContext('2d') : null;
      let pw = particleCanvas ? (particleCanvas.width = window.innerWidth) : 0;
      let ph = particleCanvas ? (particleCanvas.height = window.innerHeight) : 0;

      const embers = Array.from({ length: 45 }, () => ({
        x: Math.random() * pw,
        y: Math.random() * ph,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.7 - 0.2,
        radius: Math.random() * 2.2 + 0.5,
        color: Math.random() > 0.5 ? 'rgba(255, 193, 116,' : 'rgba(245, 158, 11,',
        life: Math.random() * 0.8 + 0.2,
        osc: Math.random() * Math.PI * 2
      }));

      function renderParticleLoop() {
        if (!pCtx) return;
        pCtx.clearRect(0, 0, pw, ph);

        // Ambient golden floating embers
        embers.forEach(p => {
          p.y += p.vy;
          p.osc += 0.02;
          p.x += p.vx + Math.sin(p.osc) * 0.25;

          if (p.y < -10) {
            p.y = ph + 10;
            p.x = Math.random() * pw;
          }
          if (p.x < -10) p.x = pw + 10;
          if (p.x > pw + 10) p.x = -10;

          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          pCtx.fillStyle = `${p.color} ${p.life})`;
          pCtx.shadowBlur = 5;
          pCtx.shadowColor = 'rgba(245, 158, 11, 0.7)';
          pCtx.fill();
        });

        // Festive fireworks sparkler particles & ember trails
        for (let i = fireworksParticles.length - 1; i >= 0; i--) {
          const pt = fireworksParticles[i];

          // Flash Shockwave Ring
          if (pt.isRing) {
            pt.radius += 2.2;
            pt.alpha -= pt.decay;
            if (pt.alpha <= 0) {
              fireworksParticles.splice(i, 1);
              continue;
            }
            pCtx.save();
            pCtx.beginPath();
            pCtx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            pCtx.strokeStyle = pt.color;
            pCtx.lineWidth = 2;
            pCtx.globalAlpha = pt.alpha * 0.7;
            pCtx.shadowBlur = 10;
            pCtx.shadowColor = pt.color;
            pCtx.stroke();
            pCtx.restore();
            continue;
          }

          // Physics: velocity, air drag and gravity falloff arc
          pt.vx *= pt.drag;
          pt.vy = (pt.vy * pt.drag) + pt.gravity;

          // Store trail history
          if (pt.isSparkler) {
            pt.trail.push({ x: pt.x, y: pt.y, alpha: pt.alpha });
            if (pt.trail.length > 5) pt.trail.shift();
          }

          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= pt.decay;

          if (pt.alpha <= 0) {
            fireworksParticles.splice(i, 1);
            continue;
          }

          // Render glowing sparkler ember trail
          if (pt.trail.length > 1) {
            pCtx.save();
            pCtx.beginPath();
            pCtx.moveTo(pt.trail[0].x, pt.trail[0].y);
            for (let t = 1; t < pt.trail.length; t++) {
              pCtx.lineTo(pt.trail[t].x, pt.trail[t].y);
            }
            pCtx.strokeStyle = pt.color;
            pCtx.lineWidth = pt.radius * 0.85;
            pCtx.lineCap = 'round';
            pCtx.globalAlpha = Math.max(0, pt.alpha * 0.5);
            pCtx.shadowBlur = 6;
            pCtx.shadowColor = pt.color;
            pCtx.stroke();
            pCtx.restore();
          }

          // Twinkling flicker effect
          let renderAlpha = pt.alpha;
          if (pt.flicker) {
            renderAlpha = pt.alpha * (0.55 + Math.sin(Date.now() * pt.flickerSpeed) * 0.45);
          }

          pCtx.save();
          pCtx.beginPath();
          pCtx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          pCtx.fillStyle = pt.color;
          pCtx.globalAlpha = Math.max(0, renderAlpha);
          pCtx.shadowBlur = 12;
          pCtx.shadowColor = pt.color;
          pCtx.fill();
          pCtx.restore();
        }

        requestAnimationFrame(renderParticleLoop);
      }
      renderParticleLoop();

      window.addEventListener('resize', () => {
        if (particleCanvas) {
          pw = particleCanvas.width = window.innerWidth;
          ph = particleCanvas.height = window.innerHeight;
        }
      });

      /* ----------------------------------------------------
         7. 60FPS MULTI-PLANE PARALLAX & MAGNETIC SPRING
         ---------------------------------------------------- */
      const lerp = (start, end, factor) => start + (end - start) * factor;

      function mainPhysicsLoop() {
        curX = lerp(curX, targetX, 0.05);
        curY = lerp(curY, targetY, 0.05);

        const px = curX;
        const py = curY;

        // Plane 0: Sky
        if (planeSky) planeSky.style.transform = `translate3d(${(px * 16).toFixed(2)}px, ${(py * 10).toFixed(2)}px, 0) scale(1.04)`;

        // Plane 1: Arch Frame
        if (planeArch) planeArch.style.transform = `translate3d(${(px * 50).toFixed(2)}px, ${(py * 25).toFixed(2)}px, 0) scale(1.02)`;

        // Plane 2: Foliage
        if (planeFoliage) planeFoliage.style.transform = `translate3d(${(px * 130).toFixed(2)}px, ${(py * 70).toFixed(2)}px, 0) scale(1.05)`;

        // Plane 3: Particles
        if (planeParticles) planeParticles.style.transform = `translate3d(${(px * 180).toFixed(2)}px, ${(py * 95).toFixed(2)}px, 0)`;

        // Living Logo: Magnetic Spring Attraction
        if (logoEntity) {
          if (isHoveredLogo) {
            const rect = logoEntity.getBoundingClientRect();
            const centerLX = rect.left + rect.width / 2;
            const centerLY = rect.top + rect.height / 2;
            magTargetX = Math.max(-14, Math.min(14, (mouseX - centerLX) * 0.12));
            magTargetY = Math.max(-10, Math.min(10, (mouseY - centerLY) * 0.12));
            tiltX = -magTargetY * 1.2;
            tiltY = magTargetX * 1.2;
          } else {
            magTargetX = 0;
            magTargetY = 0;
            tiltX = 0;
            tiltY = 0;
          }

          magX = lerp(magX, magTargetX, 0.1);
          magY = lerp(magY, magTargetY, 0.1);

          if (planeLogo) {
            planeLogo.style.transform = `translate3d(${(px * 90).toFixed(2)}px, ${(py * 45).toFixed(2)}px, 0)`;
          }

          if (logoTilt) {
            logoTilt.style.transform = `translate3d(${magX.toFixed(2)}px, ${magY.toFixed(2)}px, 0) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
          }

          if (logoBacklight) {
            logoBacklight.style.transform = `translate3d(${(magX * 1.4).toFixed(2)}px, ${(magY * 1.4).toFixed(2)}px, 0)`;
          }
        }

        requestAnimationFrame(mainPhysicsLoop);
      }
      requestAnimationFrame(mainPhysicsLoop);

      /* ----------------------------------------------------
         8. GALLERY COUNTDOWN TIMER
         ---------------------------------------------------- */
      const targetDate = new Date(Date.now() + (12 * 86400000) + (8 * 3600000) + (24 * 60000) + (16 * 1000));
      const dEl = document.getElementById('clock-days');
      const hEl = document.getElementById('clock-hours');
      const mEl = document.getElementById('clock-minutes');
      const sEl = document.getElementById('clock-seconds');

      function updateClock() {
        const diff = targetDate.getTime() - Date.now();
        if (diff <= 0) return;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        if (dEl) dEl.textContent = String(d).padStart(2, '0');
        if (hEl) hEl.textContent = String(h).padStart(2, '0');
        if (mEl) mEl.textContent = String(m).padStart(2, '0');
        if (sEl) sEl.textContent = String(s).padStart(2, '0');
      }
      setInterval(updateClock, 1000);
      updateClock();

      /* ----------------------------------------------------
         9. CURSOR HOVER STATES
         ---------------------------------------------------- */
      const interactiveElements = document.querySelectorAll('button, a, #scroll-prompt, #brand-crest');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (cursorHalo) {
            cursorHalo.style.borderColor = '#ffc174';
            cursorHalo.style.transform = 'scale(1.5)';
          }
          if (cursorBadge) {
            cursorBadge.textContent = "SELECT ↗";
            cursorBadge.style.opacity = '1';
          }
        });
        el.addEventListener('mouseleave', () => {
          if (cursorHalo) {
            cursorHalo.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            cursorHalo.style.transform = 'scale(1)';
          }
          if (cursorBadge) cursorBadge.style.opacity = '0';
        });
      });

    
    };
    
    // We wrap it in a setTimeout to ensure DOM elements are fully available 
    // to getElementById after the first render.
    const timerId = setTimeout(() => {
      runScripts();
    }, 100);

    return () => {
      clearTimeout(timerId);
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
      document.body.classList.remove('shake-active');
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#14031c] text-[#fff7ed]">
      

<div className="flex items-center justify-center pointer-events-none" id="brush-cursor" style={{"transform":"translate3d(115px, 323px, 0px)"}}>
<div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 shadow-[0_0_15px_#f59e0b] flex items-center justify-center transition-all duration-150" id="cursor-dot">
<span className="text-[9px] text-amber-950 font-black scale-75">✦</span>
</div>
<div className="absolute w-9 h-9 rounded-full border border-amber-300/40 opacity-70 transition-all duration-300" id="cursor-halo" style={{"transform":"scale(1)","borderColor":"rgba(255, 255, 255, 0.4)"}}></div>
<span className="absolute left-6 top-1 text-[8px] font-mono tracking-[0.2em] uppercase text-amber-200 bg-[#1a0522]/90 px-2 py-0.5 rounded-full border border-amber-500/40 shadow-xl opacity-0 scale-90 transition-all" id="cursor-badge" style={{"opacity":"0"}}>SELECT ↗</span>
</div>

<aside className="fixed left-3 md:left-5 top-28 bottom-28 z-40 hidden sm:flex flex-col justify-between items-center pointer-events-none select-none text-[9px] font-mono tracking-[0.3em] uppercase text-amber-200/50">
<div className="rotate-180 [writing-mode:vertical-rl] flex items-center space-x-4">
<span className="">SHAMSUL HUDA ARTS FESTIVAL</span>
<span className="text-amber-400/80">✦</span>
<span className="text-white/40">EDITION MMXXVI</span>
</div>
<div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent"></div>
<div className="rotate-180 [writing-mode:vertical-rl] text-white/30 tracking-[0.35em]">
      REF: SH-AF/2026-ARCHIVE
    </div>
</aside>
<aside className="fixed right-3 md:right-5 top-28 bottom-28 z-40 hidden sm:flex flex-col justify-between items-center pointer-events-none select-none text-[9px] font-mono tracking-[0.3em] uppercase text-amber-200/50">
<div className="[writing-mode:vertical-rl] flex items-center space-x-4">
<span className="font-amiri text-xs text-amber-300/70 tracking-widest font-normal">شمس الهدى — مهرجان الفنون</span>
<span className="text-amber-400/80">✦</span>
<span className="">ÉCRIS LE MONDE</span>
</div>
<div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent"></div>
<div className="[writing-mode:vertical-rl] text-white/30 tracking-[0.25em]">
      STAGE: APERTURE 2.5D
    </div>
</aside>

<div className="viewport-3d" id="world-stage">

<div className="parallax-plane z-0 pointer-events-none overflow-hidden" id="plane-sky" style={{"transform":"translate3d(-6.56px, -1.85px, 0px) scale(1.04)"}}>

<div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
<iframe allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" src="https://player.vimeo.com/video/1227698865?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1&amp;muted=1&amp;loop=1&amp;background=1" style={{"position":"absolute","top":"50%","left":"50%","width":"100vw","height":"56.25vw","minHeight":"100vh","minWidth":"177.77vh","transform":"translate(-50%, -50%)","pointerEvents":"none","border":"none","objectFit":"cover"}} title="L'Intervention background"></iframe>
</div>

<div className="absolute inset-0 bg-gradient-to-b from-[#14031c]/75 via-[#200a28]/40 to-[#14031c]/85 mix-blend-multiply pointer-events-none"></div>
<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.12)_0%,rgba(16,2,23,0.75)_75%,#100217_100%)] pointer-events-none"></div>
<canvas className="absolute inset-0 w-full h-full opacity-60" height="1024" id="sky-stars-canvas" width="1280"></canvas>
</div>

<div className="parallax-plane z-10 flex items-center justify-center pointer-events-none" id="plane-arch" style={{"transform":"translate3d(-20.51px, -4.61px, 0px) scale(1.02)"}}>

<div className="relative w-[92vw] max-w-[1240px] h-[72vh] max-h-[720px] mx-auto mt-6 md:mt-2 flex items-center justify-center overflow-hidden arch-portal-mask shadow-[0_30px_100px_rgba(0,0,0,0.95)]">

<img alt="Twilight Moorish River Landscape" className="absolute inset-0 w-full h-full object-cover object-center filter contrast-[1.06] brightness-95 scale-[1.04] transition-transform duration-700" id="landscape-view-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVXFnR9AptqT5HlJ-1j7D0yIzqfzNVE685PJ_FcXFgkwssxLs9AhJ75ORw_s2OmKh7tz3r2t2I83IGmwK83PpQMzp6-F_i-UP09GhhPrmbS1HevDTXT0txg97jrUjJGxTnKaSMuhv56RGy4hk1tTJuCdxy8b9WXLK43EoIPpY472fIxsxNBbnR9sTsg6yZl-hNycUeDApZkHx0uH4N4MHgZoSEbxh9nwHItkL309KKYSfggnGzVzIJOz9f10uhwTuJy4o"/>

<div className="absolute inset-0 bg-gradient-to-t from-[#14031c] via-transparent to-[#1a0522]/60 mix-blend-multiply pointer-events-none"></div>
<div className="absolute inset-0 bg-radial from-transparent via-[#1a0522]/30 to-[#14031c]/75 pointer-events-none"></div>

<div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-35">
<div className="w-[580px] h-[580px] rounded-full border border-amber-400/40 spin-dial border-dashed"></div>
<div className="w-[720px] h-[720px] rounded-full border border-amber-300/20 spin-dial-reverse"></div>
<div className="w-[860px] h-[860px] rounded-full border border-amber-100/10"></div>
<div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
<div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-amber-400/30 to-transparent"></div>
</div>

<div className="absolute bottom-10 left-12 right-12 hidden lg:flex items-end justify-between pointer-events-none z-10 text-white/70">
<div className="flex flex-col">
<span className="font-mono text-[9px] tracking-[0.3em] uppercase text-amber-300">EXHIBITION PLATE 01</span>
<span className="font-newsreader italic text-lg text-parchment/90">The Twilight Sanctuary over Wadi al-Huda</span>
</div>
<div className="font-mono text-[10px] tracking-[0.25em] uppercase text-amber-300/70">
            N 24° 28' 12" • E 54° 22' 04"
          </div>
</div>
</div>
</div>

<div className="parallax-plane z-20 pointer-events-none" id="plane-foliage" style={{"transform":"translate3d(-53.32px, -12.92px, 0px) scale(1.05)"}}>

<div className="absolute -top-8 -left-8 w-64 md:w-96 opacity-90">
<svg fill="#0d0213" viewBox="0 0 500 350">
<path d="M0,0 C120,40 250,120 290,260 C260,210 220,170 160,150 C220,130 280,130 330,190 C300,140 240,100 170,90 C250,80 340,100 400,160 C360,100 290,60 190,50 C290,40 400,60 480,120 C420,60 320,20 180,15 Z"></path>
</svg>
</div>

<div className="absolute -top-10 -right-8 w-64 md:w-96 opacity-90 scale-x-[-1]">
<svg fill="#0d0213" viewBox="0 0 500 350">
<path d="M0,0 C120,40 250,120 290,260 C260,210 220,170 160,150 C220,130 280,130 330,190 C300,140 240,100 170,90 C250,80 340,100 400,160 C360,100 290,60 190,50 C290,40 400,60 480,120 C420,60 320,20 180,15 Z"></path>
</svg>
</div>

<div className="absolute -bottom-6 -left-12 w-80 md:w-[460px] opacity-95">
<svg fill="#0b0110" viewBox="0 0 400 500">
<path d="M-40,500 C20,440 80,360 120,250 C60,280 10,320 -20,380 C30,300 70,240 140,180 C80,190 20,230 -30,280 C40,200 100,160 180,130 C120,120 50,150 -10,180 C70,120 140,100 240,90 C160,80 90,100 20,120 C110,70 200,60 310,80 C220,50 140,60 60,80 C170,30 280,40 380,75 L-40,500 Z"></path>
</svg>
</div>

<div className="absolute -bottom-6 -right-12 w-80 md:w-[460px] opacity-95 scale-x-[-1]">
<svg fill="#0b0110" viewBox="0 0 400 500">
<path d="M-40,500 C20,440 80,360 120,250 C60,280 10,320 -20,380 C30,300 70,240 140,180 C80,190 20,230 -30,280 C40,200 100,160 180,130 C120,120 50,150 -10,180 C70,120 140,100 240,90 C160,80 90,100 20,120 C110,70 200,60 310,80 C220,50 140,60 60,80 C170,30 280,40 380,75 L-40,500 Z"></path>
</svg>
</div>
</div>

<div className="parallax-plane z-30 pointer-events-none flex flex-col items-center justify-center" id="plane-logo" style={{"transform":"translate3d(-36.91px, -8.31px, 0px)"}}>

<div className="pointer-events-auto relative cursor-pointer select-none group flex flex-col items-center mt-[-20px] md:mt-[-35px]" id="logo-interactive-entity">

<div className="absolute -inset-16 md:-inset-24 bg-gradient-to-r from-amber-500/0 via-amber-400/25 to-rose-500/0 rounded-full blur-3xl opacity-70 transition-all duration-500 pointer-events-none" id="logo-backlight" style={{"transform":"translate3d(0px, 0px, 0px)"}}></div>

<div className="absolute inset-0 pointer-events-none flex items-center justify-center -translate-y-2">

<svg className="w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px] spin-dial opacity-40 group-hover:opacity-80 transition-opacity duration-500" viewBox="0 0 500 500">
<defs>
<path d="M 250, 250 m -210, 0 a 210,210 0 1,1 420,0 a 210,210 0 1,1 -420,0" id="circle-text-path"></path>
</defs>
<circle cx="250" cy="250" fill="none" r="210" stroke="rgba(255, 193, 116, 0.35)" strokeDasharray="4 8" strokeWidth="1.5"></circle>
<text className="text-[10.5px] font-mono tracking-[0.32em] fill-amber-300 font-semibold uppercase">
<textPath href="#circle-text-path" startOffset="0%">
                2026 • SHAMSUL HUDA ARTS FEST • L'INTERVENTION • ÉCRIS LE MONDE •
              </textPath>
</text>
</svg>

<div className="w-[380px] h-[380px] sm:w-[520px] sm:h-[520px] md:w-[620px] md:h-[620px] rounded-full border border-amber-400/25 spin-dial-reverse border-dotted pointer-events-none"></div>

<div className="absolute w-2 h-2 rounded-full bg-amber-400/80 -top-4 shadow-[0_0_8px_#f59e0b]"></div>
<div className="absolute w-2 h-2 rounded-full bg-amber-400/80 -bottom-4 shadow-[0_0_8px_#f59e0b]"></div>
</div>

<div className="absolute inset-0 pointer-events-none flex items-center justify-center" id="energy-anchor"></div>

<div className="relative transition-transform duration-150 ease-out will-change-transform z-10" id="logo-tilt-frame" style={{"transform":"translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)"}}>
<img alt="L'Intervention 2026 Official Festival Emblem" className="w-[84vw] max-w-[500px] sm:max-w-[580px] md:max-w-[650px] lg:max-w-[720px] h-auto object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.92)] filter contrast-[1.05] transition-all duration-300" id="festival-badge-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTB_UyPVDWBtYk5S6vVyZg6V6M5yhZSz7c38LFPI7qq85K7rXC_0Wn2snwqkVIv4oW7AJyOy6kB_wLgV0PI4PKbMc-SLrAqhYdOkYN4xYJQMVh55JBFfe-ZYXjMwIrN9Q6FVTNor6-3s6us9AAhDhWKE60f2P7GpLyQJ7aFmbIFsBz7d0FxlsZm6WNShbRmFdG0ItKjlq1WpokcttNfZ5D-pr1HxNgjIVRIstGeOJfQiGawDSBfcZ5vRN9ZE2kTFPslLM" style={{"transform":"scale(1)"}}/>
</div>

<div className="mt-2 flex items-center space-x-2.5 pointer-events-none z-10" id="state-indicators">
<div className="pip-dot w-2 h-2 rounded-full border border-amber-400/30 bg-white/10 transition-all duration-300" id="pip-1"></div>
<div className="pip-dot w-2 h-2 rounded-full border border-amber-400/30 bg-white/10 transition-all duration-300" id="pip-2"></div>
<div className="pip-dot w-2 h-2 rounded-full border border-amber-400/30 bg-white/10 transition-all duration-300" id="pip-3"></div>
<div className="pip-dot w-2 h-2 rounded-full border border-amber-400/30 bg-white/10 transition-all duration-300" id="pip-4"></div>
</div>

<div className="mt-2 opacity-85 group-hover:opacity-100 transition-all bg-[#14031c]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-amber-400/35 flex items-center space-x-2 shadow-lg z-10" id="ignite-pill">
<span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
<span className="text-[9px] font-mono tracking-[0.24em] text-amber-200 uppercase" id="ignite-label">Click to Ignite Emblem</span>
</div>
</div>

<div className="pointer-events-auto flex flex-col items-center text-center mt-2 sm:mt-3 max-w-2xl px-4 z-30">


<h1 className="font-syne font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-[0.24em] text-parchment drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] hover:text-amber-300 transition-colors cursor-pointer uppercase mt-0.5" data-original="ÉCRIS LE MONDE" id="scramble-tagline">ÉCRIS LE MONDE</h1>

<p className="font-newsreader italic text-parchment/90 text-sm sm:text-base md:text-lg tracking-wide max-w-lg mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          “Where creativity becomes a voice, and every creation writes a new world.”
        </p>

<div className="mt-2 flex items-center space-x-3 text-[9px] font-mono tracking-[0.25em] uppercase text-white/50 cursor-pointer hover:text-amber-300 transition-colors group" id="scroll-prompt">
<span className="w-4 h-[1px] bg-amber-400/40"></span>
<span className="">Scroll to explore archive</span>
<span className="w-4 h-[1px] bg-amber-400/40"></span>
</div>
</div>
</div>

<div className="parallax-plane z-40 pointer-events-none" id="plane-particles" style={{"transform":"translate3d(-73.83px, -17.53px, 0px)"}}>
<canvas className="w-full h-full pointer-events-none" height="1024" id="particles-canvas" width="1280"></canvas>
</div>

<div className="absolute inset-0 z-45 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_42%,rgba(20,3,28,0.65)_72%,rgba(16,2,23,0.96)_100%)]"></div>
</div>


<header className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 md:px-12 py-4 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-[#14031c]/95 via-[#14031c]/70 to-transparent border-b border-white/5">

<div className="flex items-center space-x-3 group cursor-pointer" id="brand-crest">
<div className="w-10 h-10 rounded-lg border border-amber-400/40 bg-[#200a28]/85 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all">
<span className="font-cinzel font-bold text-amber-300 text-sm">SH</span>
</div>
<div className="flex flex-col">
<span className="text-xs sm:text-[13px] font-syne font-extrabold tracking-[0.2em] uppercase text-white group-hover:text-amber-300 transition-colors leading-tight">
          Shamsul Huda
        </span>
<span className="text-[9px] font-mono tracking-[0.26em] uppercase text-amber-300/80 leading-tight">
          Arts Fest • 2026
        </span>
</div>
</div>

<nav className="hidden md:flex items-center space-x-1 sm:space-x-2 px-5 py-1.5 rounded-full archival-glass shadow-2xl">
<a className="px-3.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-[0.2em] uppercase text-amber-300 bg-white/10 transition-colors flex items-center space-x-1.5" href="#prologue">
<span className="text-amber-400/70">01</span>
<span className="">Prologue</span>
</a>
<a className="px-3.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-[0.2em] uppercase text-parchment/70 hover:text-white transition-colors flex items-center space-x-1.5" href="/programmes">
<span className="text-amber-400/40">02</span>
<span className="">Programmes</span>
</a>
<a className="px-3.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-[0.2em] uppercase text-parchment/70 hover:text-white transition-colors flex items-center space-x-1.5" href="/leaderboards">
<span className="text-amber-400/40">03</span>
<span className="">Leaderboard<br/><br/></span>
</a>
<a className="px-3.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-[0.2em] uppercase text-parchment/70 hover:text-white transition-colors flex items-center space-x-1.5" href="/gallery">
<span className="text-amber-400/40">04</span>
<span className="">Archive</span>
</a>
</nav>

<div className="flex items-center space-x-3">

<button aria-label="Toggle Web Audio" className="w-9 h-9 rounded-full border border-amber-400/30 bg-[#200a28]/80 text-amber-300 flex items-center justify-center hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all" id="btn-audio-toggle">
<svg className="w-4 h-4" fill="none" id="icon-audio" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
<path d="M11 5L6 9H2v6h4l5 4V5z"></path>
<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
</svg>
</button>

<a className="px-5 sm:px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-[#14031c] font-syne font-bold text-[11px] tracking-[0.2em] uppercase flex items-center space-x-2 shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.65)] hover:scale-[1.02] transition-all" href="/schedule" id="btn-register-cta">
<span className="">Enter Fest</span>
<span className="font-mono text-xs">↗</span>
</a>

<button aria-label="Menu" className="w-9 h-9 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center space-y-1 text-white hover:border-amber-400 hover:text-amber-400 transition-colors">
<span className="w-4 h-[1.5px] bg-current"></span>
<span className="w-4 h-[1.5px] bg-current"></span>
</button>
</div>
</header>


<footer className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none pb-3 pt-4 bg-gradient-to-t from-[#100217] via-[#14031c]/90 to-transparent">
<div className="w-[94%] max-w-7xl mx-auto flex flex-col items-stretch pointer-events-auto">

<div className="archival-glass rounded-2xl md:rounded-3xl p-2.5 sm:p-3 w-full flex flex-col md:flex-row items-stretch justify-between shadow-2xl relative overflow-hidden border border-amber-400/25">

<div className="flex-1 px-4 py-2 flex items-center justify-between border-b md:border-b-0 md:border-r border-white/10" id="tile-live">
<div className="flex flex-col space-y-0.5">
<div className="flex items-center space-x-2">
<span className="w-2 h-2 rounded-full bg-crimson animate-ping"></span>
<span className="text-[9px] font-mono font-bold tracking-[0.22em] text-red-400 uppercase">Live Transmission</span>
</div>
<h3 className="text-parchment font-syne font-bold text-sm sm:text-base tracking-wide">
              Arabic Debate Clash
            </h3>
<div className="flex items-center space-x-3 text-[11px] font-mono text-parchment/60">
<span className="flex items-center space-x-1">
<span className="text-amber-400 text-xs">●</span>
<span className="">Grand Diwan Hall</span>
</span>
<span className="flex items-center space-x-1">
<span className="text-laurel text-xs">✦</span>
<span className="">Round 02</span>
</span>
</div>
</div>
<button aria-label="Live event details" className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-amber-400 hover:text-black text-white/80 flex items-center justify-center transition-all ml-2 shrink-0">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path></svg>
</button>
</div>

<div className="flex-[1.4] px-4 py-2 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10" id="tile-countdown">
<div className="flex items-center space-x-2 mb-1">
<span className="text-amber-400 text-[9px]">✦</span>
<span className="text-[9px] font-mono font-bold tracking-[0.26em] text-amber-300 uppercase text-center">
              The Grand Prologue Commences In
            </span>
<span className="text-amber-400 text-[9px]">✦</span>
</div>
<div className="grid grid-cols-4 w-full text-center divide-x divide-white/10">
<div className="px-2">
<span className="font-syne font-extrabold text-2xl sm:text-3xl text-parchment tracking-tight" id="clock-days">12</span>
<span className="block text-[8px] font-mono font-bold tracking-[0.24em] text-parchment/50 uppercase">Days</span>
</div>
<div className="px-2">
<span className="font-syne font-extrabold text-2xl sm:text-3xl text-parchment tracking-tight" id="clock-hours">08</span>
<span className="block text-[8px] font-mono font-bold tracking-[0.24em] text-parchment/50 uppercase">Hours</span>
</div>
<div className="px-2">
<span className="font-syne font-extrabold text-2xl sm:text-3xl text-parchment tracking-tight" id="clock-minutes">17</span>
<span className="block text-[8px] font-mono font-bold tracking-[0.24em] text-parchment/50 uppercase">Minutes</span>
</div>
<div className="px-2">
<span className="font-syne font-extrabold text-2xl sm:text-3xl text-amber-400 tracking-tight" id="clock-seconds">44</span>
<span className="block text-[8px] font-mono font-bold tracking-[0.24em] text-amber-400/80 uppercase">Seconds</span>
</div>
</div>
</div>

<div className="flex-1 px-4 py-2 flex items-center justify-between" id="tile-next">
<div className="flex flex-col space-y-0.5">
<span className="text-[9px] font-mono font-bold tracking-[0.22em] text-amber-300 uppercase">Upcoming Clash</span>
<h3 className="text-parchment font-syne font-bold text-sm sm:text-base tracking-wide">
              Multilingual Rhetoric
            </h3>
<div className="flex items-center space-x-3 text-[11px] font-mono text-parchment/60">
<span className="flex items-center space-x-1">
<span className="text-amber-400 text-xs">●</span>
<span className="">Open Amphitheatre</span>
</span>
<span className="flex items-center space-x-1">
<span className="text-laurel text-xs">✦</span>
<span className="">Tomorrow 09:00</span>
</span>
</div>
</div>
<button aria-label="Upcoming details" className="w-8 h-8 rounded-full border border-white/20 bg-white/5 hover:bg-amber-400 hover:text-black text-white/80 flex items-center justify-center transition-all ml-2 shrink-0">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path></svg>
</button>
</div>
</div>

<div className="pt-2 pb-0.5 flex items-center justify-between text-[9px] font-mono tracking-[0.22em] uppercase text-white/40 px-3">
<div className="flex items-center space-x-2">
<span className="text-amber-400">❖</span>
<span className="">Variant 1: The Grand Exhibition Poster Direction</span>
</div>
<div className="flex items-center space-x-3">
<span className="text-amber-200/60">Archival Series 2026</span>
<span className="">•</span>
<span className="text-white/60">Stage Aperture Active</span>
</div>
</div>
</div>
</footer>


<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none opacity-0 transition-opacity duration-700 bg-[#12031a]/95 backdrop-blur-3xl" id="gateway-portal">
<div className="relative flex flex-col items-center text-center p-8 max-w-lg border border-amber-400/30 rounded-3xl bg-[#1d0626]/80 shadow-[0_0_80px_rgba(245,158,11,0.2)]">
<span className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center animate-spin text-amber-400 mb-6 text-2xl">✦</span>
<span className="text-[11px] font-mono tracking-[0.3em] uppercase text-amber-300 mb-2">ARCHIVAL PORTAL OPENED</span>
<h1 className="font-syne font-extrabold text-3xl md:text-5xl text-parchment tracking-wider uppercase mb-3">
        L'INTERVENTION 2026
      </h1>
<p className="font-newsreader italic text-lg text-amber-200">
        “Where creativity becomes a voice, and every creation writes a new world.”
      </p>
<div className="w-56 h-1 bg-amber-400/30 rounded-full mt-6 overflow-hidden">
<div className="w-full h-full bg-gradient-to-r from-amber-400 to-amber-200 animate-pulse"></div>
</div>
</div>
</div>





    </div>
  );
};

export default HomePage;
