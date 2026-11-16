// Home page: animated background with a scrolling grid, a drifting network of linked nodes and signal pulses that follow the links
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.createElement("canvas");
  canvas.className = "bg-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const CYAN = "73, 246, 255";
  const GREEN = "72, 255, 75";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let nodes = [];
  let pulses = [];
  let gridOffset = 0;
  let linkDist = 150;
  const mouse = { x: -9999, y: -9999 };

  // Match the canvas to the screen and create nodes (more nodes on bigger screens)
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    linkDist = width < 700 ? 110 : 150;

    const count = Math.min(110, Math.round((width * height) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8,
      green: Math.random() < 0.25,
      phase: Math.random() * Math.PI * 2
    }));
    pulses = [];
  };

  const drawLine = (x1, y1, x2, y2, color, lineWidth = 1) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawDot = (x, y, radius, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  // Perspective grid on the lower part of the screen, scrolling toward the viewer
  const drawGrid = () => {
    const horizon = height * 0.62;
    const depth = height - horizon;
    const centerX = width / 2;

    // Lines fanning out from the vanishing point
    const fade = ctx.createLinearGradient(0, horizon, 0, height);
    fade.addColorStop(0, `rgba(${CYAN}, 0)`);
    fade.addColorStop(1, `rgba(${CYAN}, 0.13)`);
    for (let i = -22; i <= 22; i++) {
      drawLine(centerX, horizon, centerX + (i / 22) * width * 1.6, height, fade);
    }

    // Rows get closer together near the horizon
    const rows = 14;
    for (let i = 0; i < rows; i++) {
      const t = ((i + gridOffset) % rows) / rows;
      const y = horizon + depth * t * t;
      drawLine(0, y, width, y, `rgba(${CYAN}, ${t * 0.16})`);
    }

    // Glowing horizon line
    const glow = ctx.createLinearGradient(0, 0, width, 0);
    glow.addColorStop(0, `rgba(${GREEN}, 0)`);
    glow.addColorStop(0.5, `rgba(${GREEN}, 0.25)`);
    glow.addColorStop(1, `rgba(${GREEN}, 0)`);
    drawLine(0, horizon, width, horizon, glow);
  };

  // Drift each node, pull it gently toward the cursor and wrap it around the screen edges
  const moveNodes = () => {
    nodes.forEach((node) => {
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180 && dist > 1) {
        node.vx += (dx / dist) * 0.012;
        node.vy += (dy / dist) * 0.012;
      }

      // Keep the speed in a range so the field never freezes or races
      const speed = Math.hypot(node.vx, node.vy);
      const factor = speed < 0.12 ? 1.05 : speed > 1.2 ? 0.9 : 0.995;
      node.vx *= factor;
      node.vy *= factor;

      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -20) node.x = width + 20;
      if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      if (node.y > height + 20) node.y = -20;
    });
  };

  const drawNetwork = (time) => {
    moveNodes();

    // Link nearby nodes; closer nodes get brighter links
    const links = [];
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach((b) => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < linkDist) {
          drawLine(a.x, a.y, b.x, b.y, `rgba(${CYAN}, ${(1 - dist / linkDist) * 0.35})`, 0.8);
          links.push([a, b]);
        }
      });
    });

    // Connect the cursor to nearby nodes
    nodes.forEach((node) => {
      const dist = Math.hypot(mouse.x - node.x, mouse.y - node.y);
      if (dist < 180) drawLine(mouse.x, mouse.y, node.x, node.y, `rgba(${GREEN}, ${(1 - dist / 180) * 0.45})`);
    });

    // Send a new signal pulse along a random link now and then
    if (links.length && pulses.length < 14 && Math.random() < 0.08) {
      const [a, b] = links[Math.floor(Math.random() * links.length)];
      pulses.push({ a, b, t: 0, speed: 0.012 + Math.random() * 0.018 });
    }

    pulses = pulses.filter((pulse) => pulse.t <= 1);
    pulses.forEach((pulse) => {
      pulse.t += pulse.speed;
      const x = pulse.a.x + (pulse.b.x - pulse.a.x) * pulse.t;
      const y = pulse.a.y + (pulse.b.y - pulse.a.y) * pulse.t;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
      glow.addColorStop(0, `rgba(${GREEN}, 0.95)`);
      glow.addColorStop(1, `rgba(${GREEN}, 0)`);
      drawDot(x, y, 8, glow);
    });

    // Nodes with a soft glow and twinkle
    nodes.forEach((node) => {
      const twinkle = 0.6 + Math.sin(time * 0.002 + node.phase) * 0.4;
      const color = node.green ? GREEN : CYAN;
      drawDot(node.x, node.y, node.r * 4, `rgba(${color}, ${0.15 * twinkle})`);
      drawDot(node.x, node.y, node.r, `rgba(${color}, ${0.9 * twinkle})`);
    });
  };

  // With "reduce motion" turned on, only one still frame is drawn
  const frame = (time = 0) => {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawNetwork(time);
    gridOffset = (gridOffset + 0.02) % 14;
    if (!reduceMotion) requestAnimationFrame(frame);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  resize();
  requestAnimationFrame(frame);
});
