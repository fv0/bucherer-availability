import puppeteer from "puppeteer";
import * as fs from "fs";
import fetch from "node-fetch";

const urlAllProducts =
  "https://www.bucherer.com/ch/de/buy-certifiedpreowned?srule=searching-result-sorting&start=0&sz=";
const amountOfProductsToScrape = 5;
const scrapeUrl = urlAllProducts + amountOfProductsToScrape;

async function getAvailabilities(url) {
  const response = await fetch(url);
  const data = await response.json();

  for (var i = 0; i < data.stores.length; i++) {
    if (data.stores[i].availability.inStock == true) {
      console.log("Available in " + data.stores[i].name);
    }
  }
}

async function scrape(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  var watches = await page.evaluate(() => {
    var productList = document.querySelectorAll(".product-grid .product");
    var brand = document.querySelectorAll(".m-product-tile__product-brand");
    var model = document.querySelectorAll(".m-product-tile__product-model");
    var price = document.querySelectorAll(".m-product-price__total .value");
    var label = document.querySelectorAll(".m-product-tile__label-text");

    var watchArray = [];

    for (var i = 0; i < productList.length; i++) {
      // Save the 
      const pid = productList[i].getAttribute("data-pid");
      
      // URL to check the availability of a store
      const urlStoreAvailability =
        "https://www.bucherer.com/on/demandware.store/Sites-bucherer-Site/de_CH/Store-Availability?pid=" + pid;

      watchArray[i] = {
        brand: brand[i].innerText,
        model: model[i].innerText,
        label: label[i].innerText,
        price: Number(price[i].getAttribute("content")) + " CHF",
        pid: pid
      };
    }
    return watchArray;
  });

  const exportFileName = "watches.json";

  // Write results into a JSON file
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
}

scrape(scrapeUrl);
getAvailabilities("https://www.bucherer.com/on/demandware.store/Sites-bucherer-Site/de_CH/Store-Availability?pid=1350-723-0");
