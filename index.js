import puppeteer from "puppeteer";
import * as fs from "fs";
import fetch from "node-fetch";

(async () => {
  
  // Setup Puppeteer
  const browser = await puppeteer.launch({
    headless: true
  });

  try {
    const pageGetAmountOfResults = await browser.newPage();

    var country = "ch"; // ch or de

    await pageGetAmountOfResults.goto(
      `https://www.bucherer.com/${country}/de/buy-certifiedpreowned`,
      { waitUntil: "domcontentloaded" }
    );

    const amountOfProductsToScrape = await pageGetAmountOfResults.evaluate(
      () => {
        const n = document
          .querySelector(".o-search__results-count.result-count")
          .innerText.match(/\d+/)[0];
        // Somehow this breaks when you don’t subtract 2 from the results
        return Number(n) - 2;
      }
    );
    // const amountOfProductsToScrape = 20;
    console.log(`Scraping ${amountOfProductsToScrape} watches from Bucherer’s ${country}-shop…`);

    // Now that we have the amount of products, let’s construct the new URL that all products are shown.
    const page = await browser.newPage();

    await page.goto(
      `https://www.bucherer.com/${country}/de/buy-certifiedpreowned?srule=searching-result-sorting&start=0&sz=${amountOfProductsToScrape}`,
      { waitUntil: "domcontentloaded" }
    );

    var watches = await page.evaluate(async () => {
      // Collect information about all watches
      const productList = document.querySelectorAll(".product-grid .product");
      const brand = document.querySelectorAll(".m-product-tile__product-brand");
      const model = document.querySelectorAll(".m-product-tile__product-model");
      const link = document.querySelectorAll(".m-product-tile__link");

      var watchArray = [];

      // See where the watch is available
      async function getAvailabilities(pid) {
        var country = "de_CH"; /// de_DE or de_CH

        // Request availability for this watch in all stores based on the unique product ID (PID).
        var urlStoreAvailability = `https://www.bucherer.com/on/demandware.store/Sites-bucherer-Site/${country}/Store-Availability?pid=${pid}`;
        const response = await fetch(urlStoreAvailability);
        const data = await response.json();

        // Default if there is no store with in stock availability
        let availabilityResponse = "Not available in stores";

        for (var i = 0; i < data.stores.length; i++) {
          // Check which store has this watch in stock
          if (data.stores[i].availability.inStock === true) {
            availabilityResponse = data.stores[i].name;
          }
        }

        return availabilityResponse;
      }

      for (var i = 0; i < productList.length; i++) {
        // Get uniqe product ID of watch (PID)
        const pid = productList[i].getAttribute("data-pid");

        const getPrice = JSON.parse(link[i].getAttribute("data-tracking")).originalPrice;
        const getImage = JSON.parse(link[i].getAttribute("data-tracking")).images;

        watchArray[i] = {
          brand: brand[i].innerText,
          model: model[i].innerText.replace("Certified Pre Owned", ""),
          pid: pid,
          image: getImage,
          price: getPrice,
          availableIn: await getAvailabilities(pid),
          href: link[i].getAttribute("href"),
          crawledOn: Date.now()
        };
      }

      return watchArray;
    });

    const exportFileName = "watches.json";

    // Write array with watch information into a JSON file
    fs.writeFile(
      "./" + exportFileName,
      JSON.stringify(watches, null, 3),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(exportFileName + " successfully created.");
      }
    );
  } catch (err) {
    console.error(err.message);
  } finally {
    await browser.close();
  }
})();