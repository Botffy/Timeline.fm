const lastFm = {
  _baseUrl: 'https://ws.audioscrobbler.com/2.0/',
  _apiKey: '59c115753cc99de97f1bf71a7eb965a4',

  getUserInfo: function(userName, onSuccess, onError) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${this._baseUrl}?method=user.getinfo&user=${userName}&api_key=${this._apiKey}&format=json`, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const result = JSON.parse(xhr.responseText);
        if (result.error) {
          onError(result);
        } else {
          onSuccess(result.user)
        }
      }
    }
    xhr.send();
  },

  getScrobbles: function(user, period, onScrobbles) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${this._baseUrl}?method=user.getrecenttracks&user=${user}&api_key=${this._apiKey}&from=${period.start.unix()}&to=${period.end.unix()}&limit=200&format=json`, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const recentTracks = JSON.parse(xhr.responseText).recenttracks;
        if (recentTracks.track.filter) {
          onScrobbles(recentTracks.track
            .filter(x => !(x['@attr'] && x['@attr']['nowplaying']))
            .reverse());
        } else {
          onScrobbles([]);
        }
      }
    }
    xhr.send();
  }
};
