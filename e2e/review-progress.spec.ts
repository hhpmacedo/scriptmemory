import { test, expect } from "@playwright/test";

const TEST_SCRIPT = `**JOHN**: Hello there
**MARY**: Hi John, how are you?
**JOHN**: I'm doing great, thanks for asking.
**MARY**: That's wonderful to hear.
**JOHN**: Indeed it is.`;

test.describe("Review Progress Tracking", () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto("/");
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase("scriptmemory");
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    });
    await page.reload();
  });

  test("should add a script and start practice", async ({ page }) => {
    await page.goto("/");

    // Should show empty state
    await expect(page.getByText("Script Memory")).toBeVisible();
    await expect(page.getByText("Add Script")).toBeVisible();

    // Add a script
    await page.getByText("Add Script").click();
    await expect(page.getByText("Add New Script")).toBeVisible();

    // Paste script
    await page.getByPlaceholder("Paste your script here...").fill(TEST_SCRIPT);
    await page.getByRole("button", { name: "Continue" }).click();

    // Select character
    await expect(page.getByText("Select Your Character")).toBeVisible();
    await page.getByRole("button", { name: "JOHN" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Set chunk size (default 5)
    await expect(page.getByText("Set Learning Pace")).toBeVisible();
    await page.getByRole("button", { name: "Start Learning" }).click();

    // Should be on home screen with lines loaded
    await expect(page.getByText("3 lines loaded")).toBeVisible();
  });

  test("should update streak progress when answering correctly", async ({ page }) => {
    // First add a script
    await page.goto("/scripts/new");
    await page.getByPlaceholder("Paste your script here...").fill(TEST_SCRIPT);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "JOHN" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Start Learning" }).click();

    // Start practice
    await page.getByRole("button", { name: "Start Practice" }).click();

    // Should show chunk 1 of 1
    await expect(page.getByText("Chunk 1 of 1")).toBeVisible();

    // Initial state: all streak squares should be empty (border only)
    const streakSquares = page.locator(".bg-green-500");
    await expect(streakSquares).toHaveCount(0);

    // Show answer
    await page.getByRole("button", { name: "Show Answer" }).click();

    // Click "Got it"
    await page.getByRole("button", { name: "Got it" }).click();

    // Wait for DB update and re-render
    await page.waitForTimeout(500);

    // Should now have 1 filled streak square
    await expect(page.locator(".bg-green-500")).toHaveCount(1);

    // Answer correctly again
    await page.getByRole("button", { name: "Show Answer" }).click();
    await page.getByRole("button", { name: "Got it" }).click();
    await page.waitForTimeout(500);

    // Should have 2 filled streak squares
    await expect(page.locator(".bg-green-500")).toHaveCount(2);

    // Answer correctly a third time
    await page.getByRole("button", { name: "Show Answer" }).click();
    await page.getByRole("button", { name: "Got it" }).click();
    await page.waitForTimeout(500);

    // Line should be mastered (checkmark appears)
    await expect(page.locator("text=✓")).toHaveCount(1);
  });

  test("should reset streak when answering incorrectly", async ({ page }) => {
    // Add script
    await page.goto("/scripts/new");
    await page.getByPlaceholder("Paste your script here...").fill(TEST_SCRIPT);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "JOHN" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Start Learning" }).click();

    // Start practice
    await page.getByRole("button", { name: "Start Practice" }).click();

    // Get 2 correct
    await page.getByRole("button", { name: "Show Answer" }).click();
    await page.getByRole("button", { name: "Got it" }).click();
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Show Answer" }).click();
    await page.getByRole("button", { name: "Got it" }).click();
    await page.waitForTimeout(500);

    await expect(page.locator(".bg-green-500")).toHaveCount(2);

    // Miss one
    await page.getByRole("button", { name: "Show Answer" }).click();
    await page.getByRole("button", { name: "Missed it" }).click();
    await page.waitForTimeout(500);

    // Streak should reset to 0
    await expect(page.locator(".bg-green-500")).toHaveCount(0);
  });

  test("should show checkmark when line is mastered", async ({ page }) => {
    // Add script
    await page.goto("/scripts/new");
    await page.getByPlaceholder("Paste your script here...").fill(TEST_SCRIPT);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "JOHN" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Start Learning" }).click();

    // Start practice
    await page.getByRole("button", { name: "Start Practice" }).click();

    // Initially no checkmarks
    await expect(page.locator("text=✓")).toHaveCount(0);

    // Get 3 correct to master the line
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: "Show Answer" }).click();
      await page.getByRole("button", { name: "Got it" }).click();
      await page.waitForTimeout(500);
    }

    // Should have 1 checkmark for the mastered line
    await expect(page.locator("text=✓")).toHaveCount(1);
  });
});
