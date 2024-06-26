// ! REPLACE WITH YOUR OWN REALTIME IRL PULL KEY
const pullKey = "YOUR_PULL_KEY";
// ! REPLACE WITH YOUR OWN FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "qwerty",
  authDomain: "qwerty",
  projectId: "qwerty",
  storageBucket: "qwerty",
  messagingSenderId: "qwerty",
  appId: "qwerty",
};

// elements
var speedElem;
var totalElem;
var todayElem;
var altitudeElem;

// variables from streamelements settings
var dateTimezone = "Asia/Tokyo";
var altitudeMethod = "WGS84";
var useTotal = true;
var useToday = true;
var useAltitude = true;
// streamelements variables end

var totalApp;
var totaldb;
var app;

var total = 0.0;
var today = 0.0;

var speedTimeout;
var speedTimeoutInMilliSeconds = 7000; // timeout to set speed to 0
var rightNow;
var currentDateId;
var sameDayUntilHour = 4;

var gps = {
  old: { latitude: 0.0, longitude: 0.0 },
  new: { latitude: 0.0, longitude: 0.0 },
};

function setTodaysObj(merge) {
  return totaldb
    .collection("distances")
    .doc(pullKey + "_" + currentDateId)
    .set(
      { date: firebase.firestore.Timestamp.fromDate(new Date()) },
      { merge: merge }
    );
}

function setTotalObj(merge) {
  return totaldb
    .collection("distances")
    .doc(pullKey)
    .set(
      { date: firebase.firestore.Timestamp.fromDate(new Date()) },
      { merge: merge }
    );
}

async function resetTotal() {
  await setTotalObj(false);
  total = 0.0;
  totalElem.innerText = total;
}

async function resetToday() {
  await setTodaysObj(false);
  today = 0.0;
  todayElem.innerText = today;
}

function updateDb(distance) {
  if (useToday || useTotal) {
    var batch = totaldb.batch();

    if (useToday) {
      var todayRef = totaldb
        .collection("distances")
        .doc(pullKey + "_" + currentDateId);
      batch.update(todayRef, {
        date: firebase.firestore.Timestamp.fromDate(new Date()),
        distance: firebase.firestore.FieldValue.increment(distance),
      });
    }

    if (useTotal) {
      var totalRef = totaldb.collection("distances").doc(pullKey);
      batch.update(totalRef, {
        distance: firebase.firestore.FieldValue.increment(distance),
      });
    }

    // Commit the batch
    batch
      .commit()
      .then(() => null)
      .catch(() => null);
  }
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function handleLocationChange(obj) {
  clearTimeout(speedTimeout);

  if (useAltitude && obj.altitude) {
    altitudeElem.innerText = obj.altitude[altitudeMethod] | 0;
  }

  // RTIRL speed
  // if (obj.speed) {
  //   const speedInKph = (obj.speed * 3.6) | 0;
  //   speedElem.innerText =
  //     speedInKph > 0 ? speedInKph : 0;
  // }

  if (obj.location) {
    const { latitude, longitude } = obj.location;
    gps.new.time = obj.reportedAt;
    gps.new.latitude = latitude;
    gps.new.longitude = longitude;

    if (
      gps.new.latitude &&
      gps.new.longitude &&
      gps.old.latitude &&
      gps.old.longitude
    ) {
      // We have new gps points. Let's calculate the delta distance using previously saved gps points.
      const delta = distanceInKmBetweenEarthCoordinates(
        gps.new.latitude,
        gps.new.longitude,
        gps.old.latitude,
        gps.old.longitude
      );

      if (delta < 10) {
        // calculate speed
        let _speed =
          ((delta * 1000) / ((gps.new.time - gps.old.time) / 1000)) * 3.6;

        // update variables
        total += delta;
        today += delta;

        // update html
        speedElem.innerText = _speed | 0;
        if (useToday) {
          todayElem.innerText = today.toFixed(1);
        }
        if (useTotal) {
          totalElem.innerText = total.toFixed(1);
        }

        // update db
        updateDb(delta);
      }
    }
    //shifting new points to old for next update
    gps.old.latitude = latitude;
    gps.old.longitude = longitude;
    gps.old.time = gps.new.time;

    speedTimeout = setTimeout(() => {
      speedElem.innerText = 0.0;
    }, speedTimeoutInMilliSeconds);
  }
}

function addRTIRLListener(callback) {
  return app
    .database()
    .ref()
    .child("pullables")
    .child(pullKey)
    .on("value", function (snapshot) {
      callback(snapshot.val());
    });
}

async function start(obj) {
  speedElem = document.getElementById("speed");
  totalElem = document.getElementById("total");
  todayElem = document.getElementById("today");
  altitudeElem = document.getElementById("altitude");

  const fieldData = obj.detail.fieldData;
  dateTimezone = fieldData.dateTimezone ?? dateTimezone;
  useTotal = fieldData.totalClass !== "hidden" ? true : false;
  useToday = fieldData.todayClass !== "hidden" ? true : false;
  useAltitude = fieldData.altitudeClass !== "hidden" ? true : false;

  rightNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: dateTimezone })
  );
  if (rightNow.getHours() < sameDayUntilHour) {
    rightNow.setDate(rightNow.getDate() - 1);
  }
  currentDateId = `${rightNow.getFullYear()}_${rightNow.getMonth()}_${rightNow.getDate()}`;

  totalApp = firebase.initializeApp(firebaseConfig);
  totaldb = firebase.firestore();

  if (useTotal) {
    await setTotalObj(true);
    // get total
    await totaldb
      .collection("distances")
      .doc(pullKey)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const _distance = doc.data().distance;
          if (_distance) {
            total = _distance;
            totalElem.innerText = total.toFixed(1);
          }
        }
      })
      .catch((error) => {});
  }

  if (useToday) {
    await setTodaysObj(true);
    // get daily
    await totaldb
      .collection("distances")
      .doc(pullKey + "_" + currentDateId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const _distance = doc.data().distance;
          if (_distance) {
            today = _distance;
            todayElem.innerText = today.toFixed(1);
          }
        }
      })
      .catch((error) => {});
  }

  firebase.database.INTERNAL.forceWebSockets();
  app = firebase.initializeApp(
    {
      apiKey: "AIzaSyC4L8ICZbJDufxe8bimRdB5cAulPCaYVQQ",
      databaseURL: "https://rtirl-a1d7f-default-rtdb.firebaseio.com",
      projectId: "rtirl-a1d7f",
      appId: "1:684852107701:web:d77a8ed0ee5095279a61fc",
    },
    "rtirl-api"
  );

  addRTIRLListener(handleLocationChange);
}

window.addEventListener("onWidgetLoad", start);

window.addEventListener("onEventReceived", function (obj) {
  if (obj.detail.event.listener === "widget-button") {
    if (obj.detail.event.field === "resetTotalButton") {
      resetTotal();
    } else if (obj.detail.event.field === "resetTodayButton") {
      resetToday();
    }
  }
});
