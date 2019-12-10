const parseDuration = str => {
  const result = {};
  const bits = str.split(" ");
  for (let i = 0; i < bits.length; i +=2 ) {
    switch (bits[i + 1]) {
      case 'min':
      case 'mins':
        result['minutes'] = parseInt(bits[i]);
        break;
      case 'hour':
      case 'hours':
        result['hours'] = parseInt(bits[i]);
        break;
      default:
        throw new Error("Unknown duration value " + bits[i + 1]);
    }
    return result;
  }
};

const registry = {
  date: null,
  startTime: null,
  store: [],

  addSegment: function(node) {
    const contentBox = node.getElementsByClassName("photo-grid-wrapper")[0];
    const durations = Array.from(node.querySelectorAll('div.duration-text > span'));
    if (!durations.length) {
      const duration = parseDuration(node.getElementsByClassName('duration-text')[0].innerHTML);
      const lastEnd = this.store.length ? moment(this.store[this.store.length - 1].end) : moment(this.startTime);
      lastEnd.add(duration);

      this.store.push({
        end: lastEnd,
        contentBox: contentBox
      });
      return;
    }

    let times = null;
    if (durations[0].style.display !== 'none') {
      // durations[0] holds both start and end time
      const timeSpans = Array.from(durations[0].querySelectorAll('span.segment-duration-part'));
      times = [timeSpans[0].innerHTML, timeSpans[1].innerHTML];
    } else if (durations[1].style.display !== 'none') {
      // durations[1] holds only a starting time
      times = [durations[1].innerHTML, '11:59 PM'];
    } else if (durations[2].style.display !== 'none') {
      // durations[2] holds only an ending time
      times = ['00:00 AM', durations[2].innerHTML]
    }

    times = times.map(x => moment(this.date + " " + x, 'YYYY-MM-DD h:mm a', true));
    if (!this.store.length) {
      this.startTime = times[0];
    }

    this.store.push({
      end: times[1],
      contentBox: contentBox
    });
  },

  reset: function(dateString) {
    this.store = [];
    this.date = dateString;
    this.startTime = moment(this.date, 'YYYY-MM-DD', true);
  }
};

const observeDayChange = (overlayElement) => {
  const timelineChangeObserver = new MutationObserver(() => {
    const dateString = window.location.href.slice(window.location.href.length - 10);
    registry.reset(dateString);

    for (let node of document.getElementsByClassName("place-history-moment-outer")) {
      registry.addSegment(node);
    }

    console.log(registry.store);
  });
  timelineChangeObserver.observe(overlayElement, {attributes: true, childList: false, subtree: false});
};

const overlayElement = document.getElementsByClassName('single-day')[0];
if (overlayElement) {
  observeDayChange(overlayElement);
} else {
  const titleCatcher = (observer) => {
    if (document.getElementsByClassName('single-day')[0]) {
      observer.disconnect();
      observeDayChange(document.getElementsByClassName('single-day')[0]);
    }
  };
  const observer = new MutationObserver(() => {
    titleCatcher(observer);
  });
  observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
};
