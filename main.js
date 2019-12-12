const lastFm = {
  user: 'type4error',
  apiKey: '59c115753cc99de97f1bf71a7eb965a4'
};

const getScrobbles = (period, onScrobbles) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFm.user}&api_key=${lastFm.apiKey}&from=${period.start.unix()}&to=${period.end.unix()}&limit=200&format=json`, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      onScrobbles(JSON.parse(xhr.responseText).recenttracks.track
        .filter(x => !(x['@attr'] && x['@attr']['nowplaying']))
        .reverse());
    }
  }
  xhr.send();
};

const callback = (result, onInsert) => {
  console.log(result);
  const activities = result.activities;
  if (!activities.length) {
    return;
  }

  getScrobbles({
    start: activities[0].startTime,
    end: activities[activities.length - 1].endTime
  }, (scrobbles) => {
    onScrobbles(activities, scrobbles);
    onInsert();
  });
}

const onScrobbles = (activities, scrobbles) => {
  console.log(activities, scrobbles);
  let a = 0;
  let s = 0;
  while (a < activities.length && s < scrobbles.length) {
    const activity = activities[a];
    const scrobbleTime = moment.unix(scrobbles[s].date['uts']);

    if (scrobbleTime.isBefore(activity.startTime)) {
      ++s;
      continue;
    }

    if (scrobbleTime.isAfter(activity.endTime)) {
      ++a;
      continue;
    }

    activities[a].contentBox.innerHTML += scrobbles[s]['artist']['#text'] + ": " + scrobbles[s]['name'] + '</br>';
    ++s;
  }
};

let t = new Timeline(callback);
