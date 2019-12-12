const onSubmit = e => {
  e.preventDefault();

  const user = document.getElementById('lastfm-user').value;
  lastFm.getUserInfo(user, setUser, userValidationFailed);
};

const userValidationFailed = error => {
  new Toast({
    message: `User validation failed: ${error.message} (code ${error.error})`,
    type: 'danger'
  });
};

const setUser = user => {
  chrome.storage.sync.set({lastFmUser: user.name}, function() {
    new Toast({
      message: `Last.fm user set to ${user.name}`, type: 'success'
    })
  });
};

const loadCurrentUser = () => {
  chrome.storage.sync.get(['lastFmUser'], function(result) {
    document.getElementById('lastfm-user').value = result.lastFmUser;
  });
};

window.onload = () => {
  loadCurrentUser();
  const form = document.getElementById('settings-form');
  form.addEventListener("submit", onSubmit);
};
