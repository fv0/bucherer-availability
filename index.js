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
    var label = document.querySelectorAll(".m-product-tile__label-text");

    var watchArray = [];

    for (var i = 0; i < productList.length; i++) {

      async function getAvailabilities(pid) {
        // Request availability for this watch in all stores based on the unique product ID (PID).
        const response = await fetch(
          "https://www.bucherer.com/on/demandware.store/Sites-bucherer-Site/de_CH/Store-Availability?pid=" +
            pid
        );
        const data = await response.json();

        let returnvalue = "Not available in stores.";

        for (var i = 0; i < data.stores.length; i++) {
          // Check which store has this watch in stock
          if (data.stores[i].availability.inStock === true) {
            returnvalue = data.stores[i].name;
          }
        }

        return returnvalue;
      }

      // Get product ID
      const pid = productList[i].getAttribute("data-pid");
      
      watchArray[i] = {
        brand: brand[i].innerText,
        model: model[i].innerText,
        // label: label[i].innerText,
        price: Number(price[i].getAttribute("content")) + " CHF",
        pid: pid,
        availableIn: await getAvailabilities(pid)
      };

      // watchArray[i].availableIn = await getAvailabilities(pid);

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