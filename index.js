import puppeteer from "puppeteer";
import * as fs from "fs";
import fetch from "node-fetch";

(async () => {
  // Helper URLs
  // Germany: 
  const germanyAllProducts = "https://www.bucherer.com/de/de/buy-certifiedpreowned?srule=searching-result-sorting&start=0&sz=";
  const switzerlandAllProducts =
    "https://www.bucherer.com/ch/de/buy-certifiedpreowned?srule=searching-result-sorting&start=0&sz=";
  const urlAllProducts = germanyAllProducts;

  const amountOfProductsToScrape = 386;
  const scrapeUrl = urlAllProducts + amountOfProductsToScrape;

  // Setup Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(scrapeUrl);

  var watches = await page.evaluate(async () => {
    // Collect information about all watches
    var productList = document.querySelectorAll(".product-grid .product");
    var brand = document.querySelectorAll(".m-product-tile__product-brand");
    var model = document.querySelectorAll(".m-product-tile__product-model");
    var image = document.querySelectorAll(".m-product-tile__image img");
    var link = document.querySelectorAll(".m-product-tile__link");

    var watchArray = [];

    // See where the watch is available
    async function getAvailabilities(pid) {
      // Request availability for this watch in all stores based on the unique product ID (PID).
      var germanyAvailabilities = "https://www.bucherer.com/on/demandware.store/Sites-bucherer-Site/de_DE/Store-Availability?pid=";
      var switzerlandAvailabilities =
        "https://www.bucherer.com/on/demandware.store/Sites-bucherer-Site/de_CH/Store-Availability?pid=";
      const response = await fetch(
        germanyAvailabilities + pid
      );
      const data = await response.json();

      let availabilityResponse = null;

      for (var i = 0; i < data.stores.length; i++) {
        // Check which store has this watch in stock
        if (data.stores[i].availability.inStock === true) {
          availabilityResponse = data.stores[i].name;
        }
      }

      return availabilityResponse;
    }

    for (var i = 0; i < productList.length; i++) {
      // Get product ID
      const pid = productList[i].getAttribute("data-pid");

      var price = link[i].getAttribute("data-tracking");
      var priceJson = JSON.parse(price);

      watchArray[i] = {
        brand: brand[i].innerText,
        model: model[i].innerText,
        pid: pid,
        price: priceJson.price,
        image: image[i].getAttribute("data-srcset"),
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

  browser.close();
})();