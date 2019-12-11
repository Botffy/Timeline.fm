const parseDuration = str => {
  const bits = str.split(' ').filter((val, idx) => idx % 2 == 0).map(parseInt);
  let result = moment.duration();
  if (bits.length > 2) {
    result.add(bits[2], 'days');
  }
  if (bits.length == 2) {
    result.add(bits[1], 'hours');
  }
  result.add(bits[0], 'minutes');
  return result;
};

class Timeline {
  constructor(segmentCallback) {
    this.onTimelineCallback = segmentCallback;
    this.date = null;
    this.startTime = null;
    this.store = [];

    this._createObserver();
  }

  _createObserver() {
    const overlayElement = document.getElementsByClassName('single-day')[0];
    if (overlayElement) {
      this._onDayChange(overlayElement);
    } else {
      const titleCatcher = (observer) => {
        if (document.getElementsByClassName('single-day')[0]) {
          observer.disconnect();
          this._onDayChange(document.getElementsByClassName('single-day')[0]);
        }
      };
      const observer = new MutationObserver(() => {
        titleCatcher(observer);
      });
      observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
    };
  }

  _addSegment(segmentNode) {
    const contentBox = segmentNode.getElementsByClassName("photo-grid-wrapper")[0];
    const durations = Array.from(segmentNode.querySelectorAll('div.duration-text > span'));
    if (!durations.length) {
      const duration = parseDuration(segmentNode.getElementsByClassName('duration-text')[0].innerHTML);
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
      times = ['12:00 AM', durations[2].innerHTML]
    }

    times = times.map(x => moment(this.date + " " + x, 'YYYY-MM-DD h:mm a', true));
    if (!this.store.length) {
      this.startTime = times[0];
    }

    this.store.push({
      end: times[1],
      contentBox: contentBox
    });
  };

  _onDayChange(overlayElement) {
    Array.from(document.querySelectorAll('.photo-grid-wrapper .injectedContent')).forEach(x => x.remove());

    const timelineChangeObserver = new MutationObserver(() => {
      this.date = window.location.href.slice(window.location.href.length - 10);
      this.startTime = moment(this.date, 'YYYY-MM-DD', true);
      this.store = [];

      for (let node of document.getElementsByClassName("place-history-moment-outer")) {
        this._addSegment(node);
      }

      this._applyCallback();
    });
    timelineChangeObserver.observe(overlayElement, {attributes: true, childList: false, subtree: false});
  };

  static _createBox(wrapper) {
    const box = document.createElement('div');
    box.className = "injectedContent";
    box.style.display = 'none';
    wrapper.appendChild(box);
    return box;
  };

  _applyCallback() {
    const result = [];
    for (let i = 0; i < this.store.length; ++i) {
      result.push({
        startTime: moment(i == 0 ? this.startTime : this.store[i - 1].end),
        endTime: moment(this.store[i].end),
        contentBox: Timeline._createBox(this.store[i].contentBox)
      });
    }
    this.onTimelineCallback({ activities: result }, () => this._handleWrapperVisibility(result));
  };

  _handleWrapperVisibility(result) {
    for (let elem of result) {
      const box = elem.contentBox;
      box.style.display = box.innerHTML ? '' : 'none';

      const anyChildVisible = Array.from(box.parentElement.children).some(x => x.style.display !== 'none');
      if (anyChildVisible) {
        box.parentElement.style.display = '';
      }
    }
  }
};
