(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const supportedThemes = ['light', 'dark'];
  const themeFromQuery = new URLSearchParams(window.location.search).get('theme');
  const themeFromWindow = window.name.startsWith('stanislav-theme:') ? window.name.replace('stanislav-theme:', '') : null;

  const readStoredTheme = () => {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  };

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const initialTheme = [themeFromQuery, readStoredTheme(), themeFromWindow].find((theme) => supportedThemes.includes(theme)) || systemTheme;
  root.dataset.theme = initialTheme;

  const effectiveTheme = () => {
    if (supportedThemes.includes(root.dataset.theme)) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const updateToggleLabel = () => {
    if (!toggle) return;
    toggle.setAttribute('aria-label', effectiveTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };

  const updateThemeColor = () => {
    if (!themeColor) return;
    themeColor.setAttribute('content', effectiveTheme() === 'dark' ? '#121512' : '#f7f7f5');
  };

  const carryThemeAcrossFileLinks = (theme) => {
    if (window.location.protocol !== 'file:') return;

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;

      const target = new URL(href, window.location.href);
      if (target.protocol !== 'file:') return;
      target.searchParams.set('theme', theme);
      link.href = target.href;
    });
  };

  const rememberTheme = (theme) => {
    window.name = `stanislav-theme:${theme}`;

    try {
      localStorage.setItem('theme', theme);
    } catch {}

    if (window.location.protocol === 'file:') {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('theme', theme);
      window.history.replaceState(null, '', currentUrl.href);
    }

    carryThemeAcrossFileLinks(theme);
  };

  updateToggleLabel();
  updateThemeColor();
  rememberTheme(effectiveTheme());

  toggle?.addEventListener('click', () => {
    root.dataset.theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
    updateToggleLabel();
    updateThemeColor();
    rememberTheme(root.dataset.theme);
  });

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('[data-tabs]').forEach((tabGroup) => {
    const tabs = [...tabGroup.querySelectorAll('[role="tab"]')];
    const panels = [...tabGroup.querySelectorAll('[role="tabpanel"]')];

    const activateTab = (selectedTab) => {
      tabs.forEach((tab) => {
        const isSelected = tab === selectedTab;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== selectedTab.dataset.tab;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        const previousKeys = ['ArrowLeft', 'ArrowUp'];
        const nextKeys = ['ArrowRight', 'ArrowDown'];
        let nextIndex = index;

        if (previousKeys.includes(event.key)) nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (nextKeys.includes(event.key)) nextIndex = (index + 1) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex === index) return;

        event.preventDefault();
        activateTab(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });
  });

  const canvas = document.createElement('canvas');
  canvas.className = 'dot-grid';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const pointer = { x: 0, y: 0, active: false };
  let dots = [];
  let animationFrame = 0;
  let isAnimating = false;
  let lastScrollY = window.scrollY;
  let scrollMomentum = 0;

  const resizeDotGrid = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const spacing = width < 600 ? 26 : 30;

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    dots = [];
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        dots.push({ x, y, offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0 });
      }
    }
  };

  const drawDotGrid = (interactive) => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const influenceRadius = 125;
    const darkMode = root.dataset.theme === 'dark';
    const dotColor = darkMode ? '142, 213, 179' : '29, 105, 81';
    const baseOpacity = darkMode ? 0.1 : 0.13;
    let particlesMoving = false;

    dots.forEach((dot) => {
      const currentX = dot.x + dot.offsetX;
      const currentY = dot.y + dot.offsetY;
      const deltaX = pointer.x - currentX;
      const deltaY = pointer.y - currentY;
      const distance = Math.hypot(deltaX, deltaY);
      const influence = pointer.active && distance < influenceRadius ? 1 - distance / influenceRadius : 0;

      if (interactive) {
        if (Math.abs(scrollMomentum) > 0.01) {
          dot.velocityY -= scrollMomentum * 0.07;
          dot.velocityX += Math.sin(dot.y * 0.035) * scrollMomentum * 0.006;
        }

        if (influence > 0 && distance > 0) {
          const gravity = influence * 0.42;
          dot.velocityX += deltaX / distance * gravity;
          dot.velocityY += deltaY / distance * gravity;
        }

        dot.velocityX += -dot.offsetX * 0.055;
        dot.velocityY += -dot.offsetY * 0.055;
        dot.velocityX *= 0.86;
        dot.velocityY *= 0.86;
        dot.offsetX += dot.velocityX;
        dot.offsetY += dot.velocityY;

        const displacement = Math.hypot(dot.offsetX, dot.offsetY);
        if (displacement > 18) {
          dot.offsetX = dot.offsetX / displacement * 18;
          dot.offsetY = dot.offsetY / displacement * 18;
        }

        particlesMoving = particlesMoving || displacement > 0.03 || Math.abs(dot.velocityX) > 0.03 || Math.abs(dot.velocityY) > 0.03;
      }

      context.beginPath();
      context.arc(dot.x + dot.offsetX, dot.y + dot.offsetY, 1.05 + influence * 0.85, 0, Math.PI * 2);
      context.fillStyle = `rgba(${dotColor}, ${baseOpacity + influence * 0.34})`;
      context.fill();
    });

    return particlesMoving;
  };

  const animateDotGrid = () => {
    if (!isAnimating) return;
    const particlesMoving = drawDotGrid(true);
    scrollMomentum *= 0.86;

    if (!finePointer.matches && Math.abs(scrollMomentum) < 0.02 && !particlesMoving) {
      isAnimating = false;
      drawDotGrid(false);
      return;
    }

    animationFrame = window.requestAnimationFrame(animateDotGrid);
  };

  const stopDotGrid = () => {
    isAnimating = false;
    window.cancelAnimationFrame(animationFrame);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };

  const updateDotGridState = () => {
    if (reducedMotion.matches || document.hidden) {
      stopDotGrid();
      drawDotGrid(false);
      return;
    }

    if (finePointer.matches || Math.abs(scrollMomentum) >= 0.02) {
      if (isAnimating) return;
      isAnimating = true;
      animateDotGrid();
      return;
    }

    stopDotGrid();
    drawDotGrid(false);
  };

  window.addEventListener('pointermove', (event) => {
    if (!finePointer.matches) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });

  window.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) pointer.active = false;
  });

  window.addEventListener('resize', () => {
    resizeDotGrid();
    updateDotGridState();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    scrollMomentum = Math.max(-5, Math.min(5, scrollMomentum + scrollDelta * 0.045));
    updateDotGridState();
  }, { passive: true });

  reducedMotion.addEventListener('change', updateDotGridState);
  document.addEventListener('visibilitychange', updateDotGridState);
  new MutationObserver(updateDotGridState).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  resizeDotGrid();
  updateDotGridState();
})();
