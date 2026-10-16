import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto("http://localhost:8082/video/2", {
    waitUntil: "domcontentloaded",
    timeout: 10000,
  });
  await page.waitForTimeout(2000);

  // Trigger video end
  await page.evaluate(() => {
    const video = document.querySelector("video");
    if (video) {
      video.currentTime = video.duration || 100;
      video.dispatchEvent(new Event("ended"));
    }
  });
  await page.waitForTimeout(3000); // Wait for animations

  // Get all buttons and their text
  const buttons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    return btns.map((btn, i) => ({
      index: i,
      text: btn.textContent?.trim() || "",
      hasIcon: !!btn.querySelector("svg"),
      ariaLabel: btn.getAttribute("aria-label") || "",
      visible: btn.offsetParent !== null,
    }));
  });

  console.log("All buttons on end screen:");
  buttons.forEach((btn) => {
    if (btn.text || btn.ariaLabel || btn.hasIcon) {
      console.log(
        `  ${btn.index}: "${btn.text}" (aria: ${btn.ariaLabel}, icon: ${btn.hasIcon}, visible: ${btn.visible})`,
      );
    }
  });

  // Check if Documents button is anywhere
  const docsCheck = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll("button"));
    const withText = allBtns.filter(
      (btn) => btn.textContent && btn.textContent.trim().length > 0,
    );
    const docsBtn = allBtns.find(
      (btn) =>
        btn.textContent?.includes("مستند") ||
        btn.textContent?.includes("Documents") ||
        btn.getAttribute("aria-label")?.includes("مستند"),
    );
    
    return {
      totalButtons: allBtns.length,
      withText: withText.length,
      docsFound: !!docsBtn,
      docsBtnText: docsBtn?.textContent?.trim() || "N/A",
      docsBtnVisible: docsBtn ? docsBtn.offsetParent !== null : false,
    };
  });
  
  console.log("\nDocument button search:");
  console.log(` Total buttons: ${docsCheck.totalButtons}`);
  console.log(` Buttons with text: ${docsCheck.withText}`);
  console.log(` Docs button found: ${docsCheck.docsFound}`);
  if (docsCheck.docsFound) {
    console.log(` Docs button text: "${docsCheck.docsBtnText}"`);
    console.log(` Docs button visible: ${docsCheck.docsBtnVisible}`);
  }
  
  // Check if i18n key is being used
  const i18nCheck = await page.evaluate(() => {
    const body = document.body.textContent || "";
    return {
      hasDocsTitle: body.includes("docs.title"),
      hasArabicDocs: body.includes("مستند"),
      hasEnglishDocs: body.includes("Documents"),
      bodySnippet: body.substring(0, 500),
    };
  });
  console.log("\nPage text search:");
  console.log(` Has "docs.title": ${i18nCheck.hasDocsTitle}`);
  console.log(` Has Arabic "مستند": ${i18nCheck.hasArabicDocs}`);
  console.log(` Has English "Documents": ${i18nCheck.hasEnglishDocs}`);

  const docsButton = buttons.find(
    (b) =>
      b.text.includes("مستند") ||
      b.text.includes("Documents") ||
      b.ariaLabel.includes("مستند") ||
      b.ariaLabel.includes("Documents"),
  );
  console.log("\nDocuments button found in button list:", docsButton ? "YES" : "NO");
  if (docsButton) {
    console.log("  Details:", docsButton);
  }

  await page.screenshot({ path: "debug-end-screen.png", fullPage: true });
  console.log("\nScreenshot saved: debug-end-screen.png");
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await browser.close();
}
