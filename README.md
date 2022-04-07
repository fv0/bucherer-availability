# Check watch availability of Bucherer CPO watches

I wrote this website to play around with Puppeteer and get data off a website.

## Why does this exist?

I wasn’t able to filter watches based on where there located at. So I wrote this website and script to cluster all watches by location. That way you can see if there is something interesting to check out near you.

## How to run this tool

Instructions are based on macOS.

1. Install Node modules: `npm install`
2. Run `node index.js`. A file named `watches.json` will be created. This contains all the scraped data for the website.
3. Create a localhost server to view the `index.html` file: `php -S localhost:8000`.
4. Open [http://localhost:8000](http://localhost:8000) in your browser.
5. Browse all CPO watches categorized by store.