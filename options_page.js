const onSubmit = e => {
  e.preventDefault();

  const user = document.getElementById('lastfm-user').value;
  lastFm.getUserInfo(user, setUser, userValidationFailed);
};

const userValidationFailed = error => {
  chrome.notifications.create("failed_validation", {
    iconUrl: 'res/last-fm.png',
    type: 'basic',
    message: `${error.message} (code ${error.error})`,
    title: 'Failed to set user'
  });
};

const setUser = user => {
  chrome.storage.sync.set({lastFmUser: user.name}, function() {
    fillUserData(user);
    chrome.notifications.create("user_set", {
      iconUrl: 'res/last-fm.png',
      type: 'basic',
      message: `Last.fm user set to ${user.name}`,
      title: 'User set!'
    });
  });
};

const loadCurrentUser = () => {
  chrome.storage.sync.get(['lastFmUser'], function(result) {
    if (!result.lastFmUser) {
      userDataError('No Last.fm user set');
      return;
    }

    lastFm.getUserInfo(result.lastFmUser, fillUserData, () => userDataError("Could not get user data. Maybe last.fm is down."));
  });
};

const fillUserData = userData => {
  const container = document.getElementById('userData');
  console.log(userData);
  container.innerHTML = '';
  container.classList.remove('error');

  const a = document.createElement('a');
  a.setAttribute('href', userData.url);
  a.setAttribute('target', '_blank');

  const img = document.createElement('img');
  img.setAttribute('src', userData.image[1]['#text']);

  a.appendChild(img);
  a.appendChild(document.createTextNode(userData.name));

  container.appendChild(a);
};

const userDataError = message => {
  document.getElementById('userData').innerHTML = message;
  document.getElementById('userData').classList.add('error');
};

window.onload = () => {
  loadCurrentUser();
  const form = document.getElementById('settings-form');
  form.addEventListener("submit", onSubmit);
};
