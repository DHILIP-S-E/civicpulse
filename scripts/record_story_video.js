const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const outputDir = path.resolve(__dirname, '../demo_video');

  console.log('Launching Chromium for Story Walkthrough...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  const startTime = Date.now();

  console.log('Navigating to live application...');
  await page.goto('http://civicpulse-app-979342849987.s3-website.ap-south-1.amazonaws.com', {
    waitUntil: 'networkidle',
    timeout: 35000
  });

  // Inject visible mouse cursor helper with glowing indicator
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'demo-mouse-cursor';
    cursor.style.position = 'fixed';
    cursor.style.top = '0';
    cursor.style.left = '0';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(22, 119, 255, 0.45)';
    cursor.style.border = '2.5px solid #1677FF';
    cursor.style.boxShadow = '0 0 10px rgba(22, 119, 255, 0.6)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999999';
    cursor.style.transform = 'translate(-100px, -100px)';
    cursor.style.transition = 'transform 0.05s ease-out, background-color 0.15s ease';
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
    });
    window.addEventListener('mousedown', () => {
      cursor.style.backgroundColor = 'rgba(220, 38, 38, 0.7)';
      cursor.style.boxShadow = '0 0 14px rgba(220, 38, 38, 0.8)';
    });
    window.addEventListener('mouseup', () => {
      cursor.style.backgroundColor = 'rgba(22, 119, 255, 0.45)';
      cursor.style.boxShadow = '0 0 10px rgba(22, 119, 255, 0.6)';
    });
  });

  // Wait until map canvas is loaded and rendered
  await page.waitForSelector('canvas.maplibregl-canvas', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(3000); // 3 seconds to let 3D layers initialize

  const readyTime = Date.now();
  const trimStartSeconds = ((readyTime - startTime) / 1000).toFixed(2);
  console.log(`UI is 100% rendered and ready. Trim start offset: ${trimStartSeconds}s`);

  // Helper function for human-like mouse glide and click
  async function glideToAndClick(locatorOrX, y, waitMs = 500) {
    try {
      if (typeof locatorOrX === 'object') {
        const el = locatorOrX;
        if (await el.count() > 0) {
          await el.scrollIntoViewIfNeeded().catch(() => { });
          const box = await el.boundingBox();
          if (box) {
            const targetX = box.x + box.width / 2;
            const targetY = box.y + box.height / 2;
            await page.mouse.move(targetX, targetY, { steps: 25 });
            await page.waitForTimeout(150);
            await page.mouse.down();
            await page.waitForTimeout(120);
            await page.mouse.up();
            await page.waitForTimeout(waitMs);
            return;
          }
        }
      } else {
        await page.mouse.move(locatorOrX, y, { steps: 25 });
        await page.waitForTimeout(150);
        await page.mouse.down();
        await page.waitForTimeout(120);
        await page.mouse.up();
        await page.waitForTimeout(waitMs);
      }
    } catch (e) {
      console.warn('Glide click fallback:', e.message);
    }
  }

  // ==========================================
  // ACT 1: THE CRISIS IN MADURAI (28.5s)
  // ==========================================
  console.log('Act 1: The Crisis in Madurai...');
  // Hover over KPI cards
  await page.mouse.move(360, 110, { steps: 25 });
  await page.waitForTimeout(4000);
  await page.mouse.move(480, 110, { steps: 20 });
  await page.waitForTimeout(4000);

  // Pan the map slightly across Madurai core
  await page.mouse.move(960, 540, { steps: 20 });
  await page.mouse.down();
  await page.mouse.move(910, 500, { steps: 30 });
  await page.mouse.up();
  await page.waitForTimeout(15000);

  // ==========================================
  // ACT 2: 3D PERSPECTIVE & VOLUMETRIC PRISMS (30.9s)
  // ==========================================
  console.log('Act 2: 3D Perspective & Volumetric Prisms...');
  const btn3D = page.locator('button:has-text("3D Perspective")');
  await glideToAndClick(btn3D, 0, 1500);

  // Rotate Orbit
  const btnOrbit = page.locator('button:has-text("Rotate Orbit")');
  await glideToAndClick(btnOrbit, 0, 7000); // Orbit for 7s
  const btnStop = page.locator('button:has-text("Stop Orbit")');
  if (await btnStop.count() > 0) {
    await glideToAndClick(btnStop, 0, 1500);
  }

  // Click Sellur Railway Underpass hotspot to open inspector
  console.log('Selecting Sellur hotspot...');
  const sellurHotspot = page.locator('text="Sellur"').first();
  await glideToAndClick(sellurHotspot, 0, 2000);

  // Mouse hovers over right inspector showing depth telemetry
  await page.mouse.move(1750, 240, { steps: 25 });
  await page.waitForTimeout(12000);

  // Close inspector
  const btnClose = page.locator('button[title*="Close"], button:has-text("Close")').first();
  if (await btnClose.count() > 0) {
    await glideToAndClick(btnClose, 0, 1000);
  }

  // ==========================================
  // ACT 3: SAFE CORRIDOR ROUTING (28.7s)
  // ==========================================
  console.log('Act 3: Safe Corridor Routing...');
  const navRouting = page.locator('button[title*="Routing"], button:has-text("Routing & Detours")').first();
  await glideToAndClick(navRouting, 0, 2000);

  // Select Preset 1
  const preset1 = page.locator('button:has-text("Periyar Bus Stand -> Mattuthavani")').first();
  await glideToAndClick(preset1, 0, 2000);

  // Click Compare Safe Corridors
  const btnCompare = page.locator('button:has-text("Compare Safe Corridors"), button:has-text("Compare")').first();
  await glideToAndClick(btnCompare, 0, 4000);

  // Hover over comparison card showing the red arterial warning and safe green bypass
  await page.mouse.move(380, 520, { steps: 20 });
  await page.waitForTimeout(18000);

  // ==========================================
  // ACT 4: MUNICIPAL TRIAGE & LAKEHOUSE (30.8s)
  // ==========================================
  console.log('Act 4: Municipal Operations & Lakehouse Verification...');
  const navOps = page.locator('button[title*="Fleet"], button:has-text("Municipal Fleet")').first();
  await glideToAndClick(navOps, 0, 2500);

  // Hover over priority triage queue
  await page.mouse.move(380, 320, { steps: 25 });
  await page.waitForTimeout(3000);

  // Dispatch Crew
  const dispatchBtn = page.locator('button:has-text("Dispatch Unit"), button:has-text("Dispatch"), button:has-text("Clear Hazard")').first();
  if (await dispatchBtn.count() > 0) {
    await glideToAndClick(dispatchBtn, 0, 4000);
  }

  // Navigate to Platform Governance & Audit Ledger
  const navGov = page.locator('button[title*="Governance"], button:has-text("Platform Governance")').first();
  await glideToAndClick(navGov, 0, 2500);

  const tabAudit = page.locator('button:has-text("Audit Ledger")').first();
  if (await tabAudit.count() > 0) {
    await glideToAndClick(tabAudit, 0, 3000);
  }
  await page.mouse.move(380, 400, { steps: 20 });
  await page.waitForTimeout(14000);

  // ==========================================
  // ACT 5: CLOSING CIVIC RESILIENCE (15.0s)
  // ==========================================
  console.log('Act 5: Final Overview & Closing...');
  const navCommand = page.locator('button[title*="Command"], button:has-text("Command Center")').first();
  await glideToAndClick(navCommand, 0, 2000);

  // Glide mouse to center map
  await page.mouse.move(1100, 500, { steps: 25 });
  await page.waitForTimeout(12000);

  console.log('Completing capture...');
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const rawVideoPath = await video.path();
  console.log(`Raw video saved: ${rawVideoPath}`);

  // Save metadata
  fs.writeFileSync(
    path.join(outputDir, 'story_meta.json'),
    JSON.stringify({ trimStart: trimStartSeconds, rawVideo: rawVideoPath })
  );
}

run().catch((err) => {
  console.error('Error during story recording:', err);
  process.exit(1);
});
