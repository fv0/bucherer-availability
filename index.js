import puppeteer from "puppeteer";
import * as fs from "fs";
import fetch from "node-fetch";

(async () => {
  // Helper URLs
  const urlAllProducts =
    "https://www.bucherer.com/ch/de/buy-certifiedpreowned?srule=searching-result-sorting&start=0&sz=";
  const amountOfProductsToScrape = 100;
  const scrapeUrl = urlAllProducts + amountOfProductsToScrape;

  // Setup Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(scrapeUrl);

  var watches = await page.evaluate(async () => {

    // Collect information about all watches
    var productList = document.querySelectorAll(".product-grid .product");
    var brand = document.querySelectorAll(".m-product-tile__product-brand");
    var model = document.querySelectorAll(".m-product-tile__product-model");
    var price = document.querySelectorAll(".m-product-price__total .value");
    var image = document.querySelectorAll(".m-product-tile__image img");

    var watchArray = [];

    async function getAvailabilities(pid) {
      // Request availability for this watch in all stores based on the unique product ID (PID).
      const response = await fetch(
        "https://www.bucherer.com/on/demandware.store/Sites-bucherer-Site/de_CH/Store-Availability?pid=" +
          pid
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

      function checkIfAttributeExists(target, attribute) {
        if (target.getAttribute(attribute)) {
          return target.getAttribute(attribute);
        } else {
          return null;
        }
      }
      
      watchArray[i] = {
        brand: brand[i].innerText,
        model: model[i].innerText,
        price: Number(price[i].getAttribute("content")) + " CHF",
        pid: pid,
        image: await checkIfAttributeExists(image[i], "data-srcset"),
        availableIn: await getAvailabilities(pid),
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