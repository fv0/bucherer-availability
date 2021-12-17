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
  const newData = 
    _.chain(data)
      // Group the elements of Array based on `color` property
      .groupBy("availableIn")
      // `key` is group's name (color), `value` is the array of objects
      .map((value, key) => ({ availableIn: key, watches: value }))
      .value()
  ;

  console.log(newData);

  // Show in HTML
  var mainContainer = document.getElementById("myData");

  for (var i = 0; i < newData.length; i++) {
    var location = document.createElement("h1");
    location.innerHTML = newData[i].availableIn;
    mainContainer.appendChild(location);
    
    var list = document.createElement("ul");
    mainContainer.appendChild(list);
    
    for (var n = 0; n < newData[i].watches.length; n++) {
      var listItem = document.createElement("li");
      listItem.innerHTML =
        newData[i].watches[n].brand + " " +
        newData[i].watches[n].model + " " +
        "(" +
        newData[i].watches[n].price +
        ")";
      list.appendChild(listItem);
    }
  }
}
