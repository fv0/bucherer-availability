const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrape(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  var watches = await page.evaluate(() => {
    var productList = document.querySelectorAll(".product-grid .product");
    var brand = document.querySelectorAll(
      ".m-product-tile__product-brand"
    );
    var model = document.querySelectorAll(".m-product-tile__product-model");
    var price = document.querySelectorAll(".m-product-price__total .value");
    var label = document.querySelectorAll(".m-product-tile__label-text");
    var watchArray = [];
    for (var i = 0; i < productList.length; i++) {
      watchArray[i] = {
        brand: brand[i].innerText,
        model: model[i].innerText,
        label: label[i].innerText,
        price: Number(price[i].getAttribute("content")) + " CHF",
        pid: productList[i].getAttribute("data-pid")
      };
    }
    return watchArray;
  });
  fs.writeFile(
    "./watches.json",
    JSON.stringify(watches, null, 3),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Great Success");
    }
  );

  browser.close();
}

const amountOfProductsToScrape = 10;

scrape(
  "https://www.bucherer.com/ch/de/buy-certifiedpreowned?srule=searching-result-sorting&start=0&sz=" +
    amountOfProductsToScrape
);
