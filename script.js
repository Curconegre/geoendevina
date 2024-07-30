
const otm = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenTopoMap',
  maxZoom: 17
});

const topoMonICGCCache = L.tileLayer('https://geoserveis.icgc.cat/servei/catalunya/contextmaps/wmts/contextmaps-mapa-estandard/MON3857NW/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'ICGC CC-BY-SA-3. <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles  </a>; © OpenStreetMap contributors; © Mapzen, OpenStreetMap, and others'
});

const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri'
});

var sentinel2 = L.tileLayer('https://s2maps-tiles.eu/wmts?layer=s2cloudless-2022_3857&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}', {
	attribution: '<a target="sentinel" href="https://s2maps.eu">Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2022)</a>'
});

const orto = L.tileLayer('https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wmts/orto/GRID3857/{z}/{x}/{y}.png', {
  attribution: '© ICGC'
});

const ortoWithPnoa = L.layerGroup([sentinel2, orto]);

var map = L.map('map', {
    center: [41.7, 1.6],
    zoom: 8,
    layers: [topoMonICGCCache]
});

var baseMaps = {
    "Topo ICGC": topoMonICGCCache,
    "OpenTopoMap": otm,
    "Open Street Map": osm,
    "Ortofoto": ortoWithPnoa
    //"Satellite": Esri_WorldImagery,
    //"Sentinel-2": sentinel2
};

const styleLine = {
	color: "#b33f62",
	weight: 5,
	opacity: 0.8,
	dashArray: '5, 10',
}

var layerControl = L.control.layers(baseMaps).addTo(map);

var arcbera = L.latLng(41.173307, 1.469131);
var monupau = L.latLng(41.022011, 0.466150);
var turo = L.latLng(41.776248, 2.435052);
var besalu = L.latLng(42.199297, 2.701632);
var montgri = L.latLng( 42.052123, 3.131634);
var asco = L.latLng(41.202641, 0.574045);
var pica = L.latLng(42.666948, 1.397897);
var xemeneies = L.latLng(41.426893, 2.235048);
var montferri = L.latLng(41.268632, 1.369713);
var pedraforca = L.latLng(42.237201,1.703924);
var ponteiffel = L.latLng(41.984550,2.823936);
var medes = L.latLng(42.046930,3.222414);

const station = document.getElementById("station");
const myDiv = document.getElementById("my-div");

const userMarkers = []; // Array to store user-added markers

const nextButton = document.createElement("subbutton");
nextButton.innerText = "Next";
nextButton.id = "buttonsdiv";
nextButton.disabled = true;
nextButton.className = "my-button";

const submitButton = document.createElement("subbutton");
submitButton.innerText = "Check";
submitButton.id = "buttonsdiv";
submitButton.disabled = true;
submitButton.className = "my-button";

let totalDistance = 0; // Keep track of accumulated distance
let roundDistances = []; // Array to store distance for each round

// Custom user marker icon
const LeafIcon = L.Icon.extend({
  options: {
    iconSize: [30, 41],
    iconAnchor: [15, 40],
  },
});

const greenIcon = new LeafIcon({
  iconUrl: "/img/marker.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

let randomIndex;
let idSetInterval;
let userMarker;

// Function to run the game with remaining reference points
function generateAndPlay(remainingPoints) {

  if (remainingPoints.length === 0) {
    
    if(userMarkers.length !== 0){
      // Fit the map to the user-added markers
      const bounds = new L.LatLngBounds();
      //fitmapbounds to userMarker
      userMarkers.forEach(function (markerLatLng) {
        bounds.extend(markerLatLng);
      });
      map.fitBounds(bounds);
    }

    //remove round 5 picture
    ghostinfo.innerHTML = "";

    // Add the "Play Again" button
    const playAgainButton = document.createElement("subbutton");
    playAgainButton.id = "playAgainBtn";
    playAgainButton.innerText = "Play again";
    playAgainButton.className = "my-button";

    // Add click event listener to the button
    playAgainButton.addEventListener("click", function () {
      //cheating by reloading the browser. Instead this function should reset all variables and remove markers from map
      location.reload();
    });

    document.getElementById("playagain").appendChild(playAgainButton);

    // save personal best scores
    const personalBest = localStorage.getItem("personalBest");

    if (personalBest === null || totalDistance < parseFloat(personalBest)) {
      // If personalBest is not set or the current totalDistance is less than the stored personalBest
      localStorage.setItem("personalBest", totalDistance.toFixed(2));
    }

    //display game score
    
    loop(); // ready for some fireworks!
    station.style.color = "#333";
    station.innerHTML = `Game ended<br><br>
    ${roundDistances
    .map((distance, index) => `round ${index + 1}: ${distance.toFixed(2)} kilometres`)
    .join("<br>")}<br>
    <br>Total distance: ${totalDistance.toFixed(2)} kilometers.<br>
    Best game: ${localStorage.getItem("personalBest")} kilometers.`;

    document
      .getElementById("station")
      .animate(
        [
          { transform: "rotate(-10deg)" },
          { transform: "rotate(10deg)" },
          { transform: "rotate(-10deg)" },
          { transform: "rotate(10deg)" },
          { transform: "rotate(-10deg)" },
          { transform: "rotate(10deg)" },
        ],
        {
          duration: 1000,
          iterations: 1,
        }
      );

    return;
  }

  randomIndex = Math.floor(Math.random() * remainingPoints.length);
  const referencePoint = remainingPoints[randomIndex];

  const roundNumber = Math.ceil(5 - remainingPoints.length + 1); // Calculate round number

  const capitalizedRound = "round".charAt(0).toUpperCase() + "round".slice(1);
  station.innerHTML = `${capitalizedRound}  ${roundNumber}: place ${locationNames[referencePoint][0]}.<br>`;
  ghostinfo.innerHTML = `${stationInfo[referencePoint]}<br><div id="myProgress"><div id="myBar"></div></div>`;

  document.getElementById("myProgress").style.display = "block";

  move(remainingPoints);

  map.off("click"); // Remove previous click event listener

  // Function to create the midpoint variable
  function createMidpoint(markerLatLng, referencePointLatLng) {
    const markerLat = markerLatLng.lat;
    const markerLng = markerLatLng.lng;
    const referencePointLat = referencePointLatLng.lat;
    const referencePointLng = referencePointLatLng.lng;

    // Calculate the midpoint's latitude and longitude
    const midpointLat = (markerLat + referencePointLat) / 2;
    const midpointLng = (markerLng + referencePointLng) / 2;

    // Create the midpoint L.latLng object
    const midpoint = L.latLng(midpointLat, midpointLng);

    return midpoint;
  }

  map.on("click", function (e) {

    myDiv.innerHTML = "Click again to change the mark.<br>Click on 'Check' to validate the position";

    // Add user marker to the array

    if (userMarker) {
      map.removeLayer(userMarker); // Remove the previous marker
    }

    userMarker = L.marker(e.latlng).addTo(map); // Add the new marker
    userMarker._icon.classList.add("huechange");
    userMarkers.push(userMarker.getLatLng());

    //add submitbutton
    document.getElementById("buttonsdiv").appendChild(submitButton);

    submitButton.onclick = function () {

      document.getElementById("myProgress").style.display = "none";
      clearInterval(idSetInterval);

      const marker = L.marker(e.latlng).addTo(map);
      marker._icon.classList.add("huechange");
      const distance = L.latLng(e.latlng).distanceTo(referencePoint);
      map.off("click");

      // Create a bounds object encompassing both markers
      const bounds = L.latLngBounds([e.latlng, referencePoint]);

      // Zoom the map to fit those bounds
      map.fitBounds(bounds);

      //remove submit button and add next painting button
      document.getElementById("buttonsdiv").appendChild(nextButton);
      document.getElementById("buttonsdiv").removeChild(submitButton);

      // Convert meters to miles:
      //const distanceInMiles = distance * 0.000621371;
      const distanceInKilometers = distance * 0.001;

      myDiv.innerHTML = `You clicked ${distanceInKilometers.toFixed(2)} kilometers from correct point ${locationNames[referencePoint][1]}`;
        
      // Create the midpoint variable and display message
      const midpoint = createMidpoint(e.latlng, referencePoint);

      let backgroundColor = '';
      let gaEventDistance = '';

      if (distanceInKilometers < 0.5) {
        backgroundColor = 'rgba(0, 128, 0, 0.9)';
        gaEventDistance = "Less than 500m";
      } else if (distanceInKilometers < 2) {
        backgroundColor = 'rgba(139, 197, 0, 0.9)';
        gaEventDistance = "Less than 2000m";
      } else if (distanceInKilometers < 10) {
        backgroundColor = 'rgba(202, 180, 0, 0.9)';
        gaEventDistance = "Less than 10000m";
      } else if (distanceInKilometers < 25) {
        backgroundColor = 'rgba(255, 127, 14, 0.9)';
        gaEventDistance = "Less than 25000m";
      } else {
        backgroundColor = 'rgba(255, 0, 0, 0.9)';
        gaEventDistance = "More 25000m";
      }


      // emojis from https://www.w3schools.com/charsets/ref_emoji_smileys.asp
      const popup = L.popup().setLatLng(midpoint)
        .setContent(
          distanceInKilometers < 0.5
            ? "Perfect <span style='font-size:24px;'>&#128512;</span>"
            : distanceInKilometers < 2
            ? "Quite good <span style='font-size:24px;'>&#128521;</span>"
            : distanceInKilometers < 10
            ? "Improveable <span style='font-size:24px;'>&#128558;</span>"
            : distanceInKilometers < 100
            ? "Far <span style='font-size:24px;'>&#128551;</span>"
            : "Too far!! <span style='font-size:24px;'>&#128553;</span>" // Default message for distances 100 km or more
        )
        .openOn(map);

      // Set background color dynamically
      const popupWrapper = document.querySelector('.leaflet-popup-content-wrapper');
      if (popupWrapper) {
        popupWrapper.style.backgroundColor = backgroundColor;
      }

      // Update total distance with clicked marker's distance
      totalDistance += distanceInKilometers;
      roundDistances.push(distanceInKilometers); // Add distance to the roundDistances array
      // connect user marker to correct location
      const polyline = L.polyline([e.latlng, referencePoint], styleLine).addTo(map);

      // Put marker on correct location
      const stationMarker = L.marker(referencePoint, { icon: greenIcon }).addTo(
        map
      );

      // Remove the used reference point from the remaining pool
      remainingPoints.splice(randomIndex, 1);
      
      var imgInfo = document.getElementsByClassName('imgDescript');
      imgInfo[0].style.display = 'block';
      
    };
  });

  // Enable next button when a new game round starts
  nextButton.disabled = false;

  // Handle next button click
  nextButton.onclick = function () {
    //remove popup message
    map.closePopup();
    // Change button text to "Results" on the fifth question
    if (roundNumber === 4) {
      nextButton.innerText = "Resultats";
    }

    //remove next button and add submit painting button
    document.getElementById("buttonsdiv").removeChild(nextButton);
    map.setView([41.7, 1.6], 8);
    document
      .getElementById("station")
      .animate(
        [
          { transform: "translateX(-3px)" },
          { transform: "translateX(3px)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(3px)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(3px)" },
        ],
        {
          duration: 1000,
          iterations: 1,
        }
      );

    generateAndPlay(remainingPoints);
    myDiv.innerHTML = "Click on map";
  };
}

function move(remainingPoints) {
  var elem = document.getElementById("myBar");
  var width = 100; // Initial width set to 100%
  var decrementRate = 1; // Decrement rate for width
  var duration = 60 * 1000; // Duration in milliseconds
  var intervalTime = 60; // Interval time in milliseconds
  var steps = duration / intervalTime; // Total steps

  var stepWidth = width / steps; // Width to decrement at each step

  idSetInterval = setInterval(frame, intervalTime);
  
  function frame() {
    if (width <= 0) {
      clearInterval(idSetInterval);
      alert("Has exahurit el temps \u{1F971}");

      remainingPoints.splice(randomIndex, 1); // Remove the used reference point from the remaining pool
      // if submitButton ("Comprovar") exists, then remove it
      document.getElementById("buttonsdiv").contains(submitButton) ? document.getElementById("buttonsdiv").removeChild(submitButton) : false;
      document.getElementById("buttonsdiv").appendChild(nextButton);
      // Remove marker if there is on map
      //userMarkers.slice(0, -1);

      if (userMarker) {
        map.removeLayer(userMarker); // Remove the previous marker
      }

      userMarkers.pop();

      roundDistances.push(300); // Add max distance


    } else {
      width -= stepWidth;
      elem.style.width = width + "%";
      // Dynamically adjust color from green to yellow/orange to red based on width
      var startColor = [200, 0, 40]; // Green: rgb(0,145,40)
      var midColor = [255, 205, 0]; // Orange: rgb(255,165,0)
      var endColor = [0, 145, 40]; // Red: rgb(200,0,40)
      var red, green, blue;

      if (width >= 50) {
        // Transition from green to yellow/orange
        var ratio = (width - 50) / 50;
        red = Math.round(midColor[0] + (endColor[0] - midColor[0]) * ratio);
        green = Math.round(midColor[1] + (endColor[1] - midColor[1]) * ratio);
        blue = Math.round(midColor[2] + (endColor[2] - midColor[2]) * ratio);
      } else {
        // Transition from yellow/orange to red
        var ratio = width / 50;
        red = Math.round(startColor[0] + (midColor[0] - startColor[0]) * ratio);
        green = Math.round(startColor[1] + (midColor[1] - startColor[1]) * ratio);
        blue = Math.round(startColor[2] + (midColor[2] - startColor[2]) * ratio);
      }

      elem.style.backgroundColor = "rgb(" + red + "," + green + "," + blue + ")";
    }
  }

}

// Use map to determine location name according to the chosen reference point
const locationNames = {
  [arcbera]: ["this arch",""],
  [monupau]: ["this monument",""],
  [turo]: ["this peak",""],
  [besalu]: ["this bridge",""],
  [montgri]: ["this castle",""],
  [asco]: ["this building",""],
  [pica]: ["this cross",""],
  [xemeneies]: ["this building",""],
  [montferri]: ["this church",""],
  [pedraforca]: ["this montain",""],
  [ponteiffel]: ["this bridge",""],
  [medes]: ["these islands",""],
};


const stationInfo = {
  [arcbera]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/efmqsztrz.jpg?v=1721823250612" onclick="this.requestFullscreen()" class="center" alt="Built at the end of the 1st century BC to honor Augustus" title="Built at the end of the 1st century BC to honor Augustus" ><div class="imgDescript">Arc de Berà. <br><a href=\'https://www.mnat.cat/arc-de-bera/\' target="infowindow">More information</a>.</div>',
  [monupau]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/gqprzvcnm.jpg?v=1721823311135" onclick="this.requestFullscreen()" class="center" alt="In memory of all the fighters of the Civil War" title="In memory of all the fighters of the Civil War" ><div class="imgDescript">Monument a la Pau, Serra de Pàndols.<br><a href=\'https://banc.memoria.gencat.cat/ca/results/espais_memoria/21\' target="infowindow">Route to Monument a la Pau</a>.</div>',
  [turo]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/gvculzdmk.jpg?v=1721823297326" onclick="this.requestFullscreen()" class="center" alt="It was a meteorological observatory" title="It was a meteorological observatory" ><div class="imgDescript">Turó de l\'Home. <br><a href=\'https://explora.cat/turodelhome.html\' target="infowindow">Route to Turó de l\'Home</a>.</div>',
  [besalu]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/tfjwhcmzx.jpg?v=1721823334129" onclick="this.requestFullscreen()" class="center" alt="Bridge over the river Fluvià" title="Bridge over the river Fluvià" ><div class="imgDescript">Pont de Besalú <br>Més informació: <a href=\'https://ca.wikipedia.org/wiki/Pont_de_Besal%C3%BA\' target="infowindow">https://ca.wikipedia.org/wiki/Pont_de_Besal%C3%BA</a>.</div>',
  [montgri]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/ygvculzqd.jpg?v=1721823352385" onclick="this.requestFullscreen()" class="center" alt="It is an unfinished castle" title="It is an unfinished castle" ><div class="imgDescript"> Castell de Montgrí. <br><a href=\'https://ca.wikipedia.org/wiki/Castell_del_Montgr%C3%AD\' target="infowindow">More information</a>.</div>',
  [asco]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/zbgxhtlfj.jpg?v=1721823265130" onclick="this.requestFullscreen()" class="center" alt="Chimney 160 meters high" title="Chimney 160 meters high" ><div class="imgDescript">Central nuclear d\'Ascó.<br><a href=\'https://www.anav.es/ca/anav-ca/esquema/\' target="infowindow">More information</a>.</div>',
  [pica]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/jzmxspwht.jpg?v=1721823257902" onclick="this.requestFullscreen()" class="center" alt="The highest peak in Catalonia" title="The highest peak in Catalonia" ><div class="imgDescript">Pica d\'Estats<br><a href=\'https://explora.cat/pica.html\' target="infowindow">Route to la Pica d\'Estats</a>.</div>',
  [xemeneies]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/bdwpvhska.jpg?v=1721823243910" onclick="this.requestFullscreen()" class="center" alt="They almost reach 200 m. of height" title="They almost reach 200 m. of height" ><div class="imgDescript">Les tres xemeneies. St. Adrià de Besòs.<br><a href=\'https://ca.wikipedia.org/wiki/Central_t%C3%A8rmica_de_Sant_Adri%C3%A0_de_Bes%C3%B2s\' target="infowindow">More information</a>.</div>',
  [montferri]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/tphdywulj.jpg?v=1721823397612" onclick="this.requestFullscreen()" class="center" alt="It was completed in 1999" title="It was completed in 1999" ><div class="imgDescript">Santuari de Montferri. Alt Camp.<br><a href=\'https://www.larutadelcister.info/museus-espais-visitables/santuari-de-la-mare-de-d%C3%A9u-de-montserrat-de-montferri\' target="infowindow">More information</a>.</div>',
  [pedraforca]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/ypwhvfzdr.jpg?v=1721823269256" onclick="this.requestFullscreen()" class="center" alt="It separates the towns of Saldes and Gósol" title="It separates the towns of Saldes and Gósol" ><div class="imgDescript">Pedraforca. Berguedà.<br><a href=\'https://ca.wikipedia.org/wiki/Pedraforca\' target="infowindow">More information.</a>.</div>',
  [ponteiffel]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/vnrtpgmwj.jpg?v=1721823261862" onclick="this.requestFullscreen()" class="center" alt="Built by the Eiffel Company of Paris" title="Built by the Eiffel Company of Paris" ><div class="imgDescript">Pont de les Peixeteres Velles. Girona<br><a href=\'https://www.pedresdegirona.com/separata_pont_peixateries.htm\' target="infowindow">More information.</a>.</div>',
  [medes]:
    '<img src="https://cdn.glitch.global/7ce42fcf-ec09-449a-b0ee-95e6950fb2c8/imszbajwu.jpg?v=1721823370640" onclick="this.requestFullscreen()" class="center" alt="It is a marine nature reserve" title="It is a marine nature reserve" ><div class="imgDescript">Illes Medes. Baix Empordà.<br><a href=\'https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/illes-medes/inici/index.html\' target="infowindow">More information.</a>.</div>', 
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Start the game with all reference points

function toPlay() {

  playbutton.remove();
  const shuffledEntries = [
    arcbera,
    monupau,
    turo,
    besalu,
    montgri,
    asco,
    pica,
    xemeneies,
    montferri,
    pedraforca,
    ponteiffel,
    medes,
  ];
    //select 5 random pictures
  //  .slice()
  //  .sort(() => Math.random() - 0.5); // Shuffle using Fisher-Yates
  //const randomEntries = shuffledEntries.slice(0, 5);


  const shuffled = shuffleArray([...shuffledEntries]);
  const randomEntries = shuffled.slice(0, 5);

  generateAndPlay(randomEntries);
  myDiv.innerHTML = "Clic over map";
}

function addMarkers(map) {
  var markers = [
    arcbera,
    monupau,
    turo,
    besalu,
    montgri,
    asco,
    pica,
    xemeneies,
    montferri,
    pedraforca,
    ponteiffel,
    medes,
  ];

  for (var i = 0; i < markers.length; i++) {
    var marker = L.marker(markers[i], {
      icon: greenIcon,
      referencePoint: markers[i]
    });

    marker.addTo(map).on('click', function() {

      var markerKey = this.options.referencePoint;
      var correctContent = stationInfo[markerKey];
      document.getElementById('ghostinfo').innerHTML = correctContent + '<br>';
    });
  }
}

var mapSequence = [];

document.addEventListener("keydown", function (event) {
  mapSequence.push(event.key);

  if (mapSequence.length === 3 && mapSequence.join("") === "map") {
    event.preventDefault();
    mapSequence = [];
    addMarkers(map);
  } else if (mapSequence.length > 3) {
    mapSequence = [];
  }
});

document.getElementById("about").addEventListener("click", function(event) {
  event.preventDefault();
  
  const ghostinfo = document.getElementById("ghostinfo");
  const playbutton = document.getElementById("playbutton");
  const home = document.getElementById("home");
  const aboutContent = document.getElementById("aboutContent");
  const about = document.getElementById("about");

  if (ghostinfo) {
    ghostinfo.style.display = "none";
  }

  if (playbutton) {
    playbutton.style.display = "none";
  }

  if (home) {
    home.classList.remove("active");
  }

  if (aboutContent) {
    aboutContent.style.display = "block";
  }

  if (about) {
    about.classList.add("active");
  }
  
});

document.getElementById("home").addEventListener("click", function(event) {
  event.preventDefault();

  const ghostinfo = document.getElementById("ghostinfo");
  const playbutton = document.getElementById("playbutton");
  const home = document.getElementById("home");
  const aboutContent = document.getElementById("aboutContent");
  const about = document.getElementById("about");
  
  if (ghostinfo) {
    ghostinfo.style.display = "block";
  }

  if (playbutton) {
    playbutton.style.display = "block";
  }

  if (home) {
    home.classList.add("active");
  }

  if (aboutContent) {
    aboutContent.style.display = "none";
  }

  if (about) {
    about.classList.remove("active");
  }

});

