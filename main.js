const callback = (result, onInsert) => {
  const activities = result.activities;
  if (!activities.length) {
    return;
  }

  chrome.storage.sync.get(['lastFmUser'], res => {
    lastFm.getScrobbles(res.lastFmUser, {
      start: activities[0].startTime,
      end: activities[activities.length - 1].endTime
    }, (scrobbles) => {
      onScrobbles(activities, scrobbles);
      onInsert();
    });
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
