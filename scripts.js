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
    var storeContainer = document.createElement("section");
    storeContainer.className = "store";
    mainContainer.appendChild(storeContainer);

    // Show when the watches where last updated
    var crawledOn = document.createElement("p");
    // First data entry is sufficient, since all date strings are the same
    var whenUpdated = newData[0].watches[0].crawledOn;
    var whenUpdatedFormatted = new Date(whenUpdated);
    crawledOn.innerHTML = `Updated on: ${whenUpdatedFormatted.toLocaleDateString(
      "de-CH"
    )} at ${whenUpdatedFormatted.toLocaleTimeString("de-CH")}`;
    crawledOn.className = "crawledOn";
    storeContainer.appendChild(crawledOn);

    // Add the store
    var location = document.createElement("h2");
    Object.assign(location, {
      className: "store_name",
      innerHTML: newData[i].availableIn
    });
    storeContainer.appendChild(location);

    // …and how many watches this location has
    var amountPerLocation = document.createElement("span");
    Object.assign(amountPerLocation, {
      className: "amountPerStore",
      innerHTML: `${newData[i].watches.length}`
    });
    location.appendChild(amountPerLocation);

    // Create the list
    var list = document.createElement("ul");
    list.className = "watches";
    storeContainer.appendChild(list);

    for (var n = 0; n < newData[i].watches.length; n++) {
      var listItem = document.createElement("li");
      listItem.className = "watch_item";
      list.appendChild(listItem);

      var watchData = document.createElement("div");
      listItem.appendChild(watchData);

      // Create brand
      createWatchElement(
        "span",
        "brand",
        newData[i].watches[n].brand,
        watchData
      );
      // Create brand
      createWatchElement("span", "model", newData[i].watches[n].model, watchData);
      
      const formatToCHF = new Intl.NumberFormat("de-CH", {
        style: "currency",
        currency: "CHF",
        minimumFractionDigits: 0,
      });

      createWatchElement(
        "span",
        "price",
        formatToCHF.format(`${newData[i].watches[n].price}`),
        watchData
      );

      // Create image
      var img = document.createElement("img");
      Object.assign(img, {
        srcset: newData[i].watches[n].image,
        className: "watch-image",
        loading: "lazy",
      });
      listItem.appendChild(img);

      // Create link
      var watchLink = document.createElement("a");
      Object.assign(watchLink, {
        href: `https://www.bucherer.com${newData[i].watches[n].href}`,
        className: "watch_link",
        innerHTML: "More information"
      });
      
      watchData.appendChild(watchLink);
    }
  }
}
