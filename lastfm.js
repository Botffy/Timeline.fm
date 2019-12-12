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
  }
};
