fetch("watches.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    appendData(data);
  })
  .catch(function (err) {
    console.log("error: " + err);
  });

function appendData(data) {
  // Sort the incoming data by a specific key
  const newData = 
    _.chain(data)
      // Group the elements of Array based on `color` property
      .groupBy("availableIn")
      // `key` is group's name (color), `value` is the array of objects
      .map((value, key) => ({ availableIn: key, watches: value }))
      .value()
  ;

  var mainContainer = document.getElementById("myData");
  
  // Show total amount of watches
  var totalAmountOfWatches = document.createElement("p");
  totalAmountOfWatches.innerHTML = `${data.length} watches in total`;
  mainContainer.appendChild(totalAmountOfWatches);

  function createWatchElement(HTMLelement, theClassName, innerHTML, appendTo) {
    var CSSClass = theClassName;
    var theClassName = document.createElement(HTMLelement);
    theClassName.className = `watch-${CSSClass}`;
    theClassName.innerHTML = innerHTML;
    appendTo.appendChild(theClassName);
  }

  for (var i = 0; i < newData.length; i++) {
    // Show when the watches where last updated
    var crawledOn = document.createElement("p");
    // First data entry is sufficient, since all date strings are the same
    var whenUpdated = newData[0].watches[0].crawledOn;
    var whenUpdatedFormatted = new Date(whenUpdated);
    crawledOn.innerHTML = `Updated on: ${whenUpdatedFormatted.toLocaleDateString(
      "de-CH"
    )} at ${whenUpdatedFormatted.toLocaleTimeString("de-CH")}`;
    mainContainer.appendChild(crawledOn);

    // Add the location
    var location = document.createElement("h1");
    location.innerHTML = newData[i].availableIn;
    mainContainer.appendChild(location);

    // …and how many watches this location has
    var amountPerLocation = document.createElement("span");
    amountPerLocation.innerHTML = ` (${newData[i].watches.length} watches)`;
    location.appendChild(amountPerLocation);

    // Create the list
    var list = document.createElement("ul");
    mainContainer.appendChild(list);

    for (var n = 0; n < newData[i].watches.length; n++) {
      var listItem = document.createElement("li");
      list.appendChild(listItem);

      var watchData = document.createElement("div");
      listItem.appendChild(watchData);

      createWatchElement(
        "span",
        "brand",
        newData[i].watches[n].brand,
        watchData
      );
      createWatchElement("a", "model", newData[i].watches[n].model, watchData);
      createWatchElement(
        "span",
        "price",
        `${newData[i].watches[n].price} CHF`,
        watchData
      );

      // Create image
      var img = document.createElement("img");
      img.srcset = newData[i].watches[n].image;
      img.className = "watch-image";
      img.setAttribute("loading", "lazy");
      listItem.appendChild(img);

      // Create link
      var watchLink = document.createElement("a");
      watchLink.setAttribute(
        "href",
        `https://www.bucherer.com${newData[i].watches[n].href}`
      );
      watchLink.className = "watch-link";
      watchLink.innerHTML = "Link";
      watchData.appendChild(watchLink);
    }
  }
}
