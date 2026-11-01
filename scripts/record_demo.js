const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const outputDir = path.resolve(__dirname, '../demo_video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser with 1920x1080 video recording...');
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log('Navigating to CivicPulse live S3 application...');
  await page.goto('http://civicpulse-app-979342849987.s3-website.ap-south-1.amazonaws.com', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Helper for human-like pauses
  const wait = (ms) => page.waitForTimeout(ms);

  // ACT 1: Command Center & 3D Volumetric View (0:00 - 0:35)
  console.log('Act 1: Command Center & 3D Map View...');
  await wait(4000); // Let tiles and extrusions settle

  // Click 3D perspective button
  const btn3D = page.locator('button:has-text("3D Perspective")');
  if (await btn3D.count() > 0) {
    await btn3D.click();
    await wait(2500);
  }

  // Rotate Orbit
  const btnOrbit = page.locator('button:has-text("Rotate Orbit")');
  if (await btnOrbit.count() > 0) {
    console.log('Starting Cinematic Orbit...');
    await btnOrbit.click();
    await wait(8000); // Orbit for 8 seconds
    await page.locator('button:has-text("Stop Orbit")').click();
    await wait(2000);
  }

  // Click a hotspot in Command Center to open Inspector
  console.log('Inspecting active flood hotspot...');
  const hotspotBtn = page.locator('button:has-text("Sellur Railway Underpass"), button:has-text("Sellur")').first();
  if (await hotspotBtn.count() > 0) {
    await hotspotBtn.click();
    await wait(3500); // View depth telemetry & ultrasonic reading
  }

  // ACT 2: Safe Corridor Routing (0:35 - 1:10)
  console.log('Act 2: Safe Corridor Routing...');
  const navRouting = page.locator('button[title*="Routing"], button:has-text("Routing & Detours")').first();
  await navRouting.click();
  await wait(2500);

  // Select Preset 1 (Periyar Bus Stand -> Mattuthavani)
  const preset1 = page.locator('button:has-text("Periyar Bus Stand -> Mattuthavani")').first();
  if (await preset1.count() > 0) {
    await preset1.click();
    await wait(2000);
  }

  // Click Compare Safe Corridors
  console.log('Comparing Safe Corridors vs Flooded Arterial...');
  const btnCompare = page.locator('button:has-text("Compare Safe Corridors"), button:has-text("Compare")').first();
  if (await btnCompare.count() > 0) {
    await btnCompare.click();
    await wait(5000); // Let route render on map and card show deltas
  }

  // ACT 3: Lakehouse Historical Storm Timeline (1:10 - 1:40)
  console.log('Act 3: Lakehouse Storm Timeline...');
  const navTimeline = page.locator('button[title*="Timeline"], button:has-text("Historical Timeline")').first();
  await navTimeline.click();
  await wait(2500);

  // Step through snapshots
  const snapButtons = page.locator('button:has-text("T-18h"), button:has-text("T-12h"), button:has-text("T-6h"), button:has-text("Latest")');
  const snapCount = await snapButtons.count();
  for (let i = 0; i < snapCount; i++) {
    await snapButtons.nth(i).click();
    await wait(3000);
  }

  // ACT 4: Municipal Operations & Crew Dispatch (1:40 - 2:05)
  console.log('Act 4: Municipal Operations & Dewatering Dispatch...');
  const navOps = page.locator('button[title*="Fleet"], button:has-text("Municipal Fleet")').first();
  await navOps.click();
  await wait(2500);

  // Click Dispatch Crew on first item
  const dispatchBtn = page.locator('button:has-text("Dispatch Unit"), button:has-text("Dispatch"), button:has-text("Clear Hazard")').first();
  if (await dispatchBtn.count() > 0) {
    console.log('Dispatching municipal dewatering crew...');
    await dispatchBtn.click();
    await wait(4000); // Show toast and status update
  }

  // ACT 5: Spatial Analytics & Triage Scoring (2:05 - 2:20)
  console.log('Act 5: Spatial Analytics...');
  const navAnalytics = page.locator('button[title*="Analytics"], button:has-text("Analytics & Triage")').first();
  await navAnalytics.click();
  await wait(4000);

  // ACT 6: Platform Governance & Audit Ledger (2:20 - 2:40)
  console.log('Act 6: Platform Governance & Audit Ledger...');
  const navGov = page.locator('button[title*="Governance"], button:has-text("Platform Governance")').first();
  await navGov.click();
  await wait(3000);

  // Click Audit Ledger tab
  const tabAudit = page.locator('button:has-text("Audit Ledger")').first();
  if (await tabAudit.count() > 0) {
    await tabAudit.click();
    await wait(3500);
  }

  // Click SLA & Security tab
  const tabSla = page.locator('button:has-text("SLA & Security")').first();
  if (await tabSla.count() > 0) {
    await tabSla.click();
    await wait(3500);
  }

  // Final Pan back to Command Center & 3D Perspective
  console.log('Final Overview...');
  const navCommand = page.locator('button[title*="Command"], button:has-text("Command Center")').first();
  await navCommand.click();
  await wait(3000);

  console.log('Finishing recording...');
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    console.log(`Video recorded successfully to: ${videoPath}`);
  }
}

run().catch((err) => {
  console.error('Recording error:', err);
  process.exit(1);
});

