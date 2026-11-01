const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function run() {
  const outputDir = path.resolve(__dirname, '../demo_video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching Chromium for synced recording...');
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
    timeout: 30000
  });

  // Wait until the map canvas is visible and rendered
  await page.waitForSelector('canvas.maplibregl-canvas', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(3000); // 3 seconds for tile cache to settle

  const readyTime = Date.now();
  const trimStartSeconds = ((readyTime - startTime) / 1000).toFixed(2);
  console.log(`UI is 100% rendered and ready. Trim start offset: ${trimStartSeconds}s`);

  // SECTION 1: Intro & Command Center (18s)
  console.log('Recording Section 1: Intro & Command Center...');
  await page.waitForTimeout(10000); // Highlight KPI strip & city map
  const btn3D = page.locator('button:has-text("3D Perspective")');
  if (await btn3D.count() > 0) {
    await btn3D.click();
  }
  await page.waitForTimeout(8000);

  // SECTION 2: 3D Volumetric Water Prisms & Inspector (18s)
  console.log('Recording Section 2: 3D Water Prisms & Sellur Inspector...');
  const hotspotBtn = page.locator('button:has-text("Sellur Railway Underpass"), button:has-text("Sellur")').first();
  if (await hotspotBtn.count() > 0) {
    await hotspotBtn.click();
  }
  await page.waitForTimeout(18000);

  // SECTION 3: Safe Corridor Routing (18s)
  console.log('Recording Section 3: Safe Corridor Routing...');
  const navRouting = page.locator('button[title*="Routing"], button:has-text("Routing & Detours")').first();
  await navRouting.click();
  await page.waitForTimeout(2000);

  const preset1 = page.locator('button:has-text("Periyar Bus Stand -> Mattuthavani")').first();
  if (await preset1.count() > 0) {
    await preset1.click();
  }
  await page.waitForTimeout(2000);

  const btnCompare = page.locator('button:has-text("Compare Safe Corridors"), button:has-text("Compare")').first();
  if (await btnCompare.count() > 0) {
    await btnCompare.click();
  }
  await page.waitForTimeout(14000); // Let route and avoidance corridor be admired

  // SECTION 4: Lakehouse Storm Timeline (15s)
  console.log('Recording Section 4: Lakehouse Historical Timeline...');
  const navTimeline = page.locator('button[title*="Timeline"], button:has-text("Historical Timeline")').first();
  await navTimeline.click();
  await page.waitForTimeout(2000);

  const snapButtons = page.locator('button:has-text("T-18h"), button:has-text("T-12h"), button:has-text("T-6h"), button:has-text("Latest")');
  const snapCount = await snapButtons.count();
  for (let i = 0; i < snapCount; i++) {
    await snapButtons.nth(i).click();
    await page.waitForTimeout(3000);
  }
  await page.waitForTimeout(1000);

  // SECTION 5: Municipal Dispatch & Governance (16s)
  console.log('Recording Section 5: Municipal Dispatch & Governance...');
  const navOps = page.locator('button[title*="Fleet"], button:has-text("Municipal Fleet")').first();
  await navOps.click();
  await page.waitForTimeout(2000);

  const dispatchBtn = page.locator('button:has-text("Dispatch Unit"), button:has-text("Dispatch"), button:has-text("Clear Hazard")').first();
  if (await dispatchBtn.count() > 0) {
    await dispatchBtn.click();
  }
  await page.waitForTimeout(5000);

  const navGov = page.locator('button[title*="Governance"], button:has-text("Platform Governance")').first();
  await navGov.click();
  await page.waitForTimeout(4000);

  const tabAudit = page.locator('button:has-text("Audit Ledger")').first();
  if (await tabAudit.count() > 0) {
    await tabAudit.click();
  }
  await page.waitForTimeout(5000);

  console.log('Finishing capture...');
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const rawVideoPath = await video.path();
  console.log(`Raw video saved: ${rawVideoPath}`);

  // Save metadata
  fs.writeFileSync(
    path.join(outputDir, 'trim_meta.json'),
    JSON.stringify({ trimStart: trimStartSeconds, rawVideo: rawVideoPath })
  );
}

run().catch((err) => {
  console.error('Error during recording:', err);
  process.exit(1);
});

