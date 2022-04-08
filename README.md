![Screenshot](https://abload.de/img/screenshot2022-04-08a9ekpb.png)

# Check watch availability of Bucherer CPO watches

I wrote this website to play around with [Puppeteer](https://developers.google.com/web/tools/puppeteer/).

> Puppeteer is a Node library which provides a high-level API to control headless Chrome or Chromium over the DevTools Protocol. It can also be configured to use full (non-headless) Chrome or Chromium.

## Why does this exist?

I like browsing the Certified Pre-Owned watches (CPO) from Bucherer. I wasn’t able to see **in what store** the watches were. I wanted to see all watches of one store to know if it made sense to go and check them out. So I wrote this website and script to get all watch information and cluster all watches by store. That way you can see if there is something interesting to check out near you.

The following information about the watches is getting fetched and grouped by where it is located (store):

- Brand
- Model
- Price
- Image
- URL to Bucherer page

## How to run this tool

Instructions are based on macOS.

1. Clone this repository to your Mac.
2. Install Node modules: 
   ```bash
   $ npm install
   ```
3. Execute the NodeJS script.
   ```bash
   $ node index.js
   ```
   A file named `watches.json` will be created. This contains all the gathered watch data necessary to display the results on a website.
4. Create a localhost server to view the `index.html` file:
   ```bash
   $ php -S localhost:8000
   ```
5. Open [http://localhost:8000](http://localhost:8000) in your browser.
6. Browse all CPO watches categorized by store.

## Change the country

To change the country where you want to see CPO watches from adjust one variable in `index.js`. 

```js
// Look for this variable in index.js
var country = "switzerland"; // Set to either "germany", "austria", "france" or "switzerland".
```