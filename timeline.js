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
    console.log("Creating timeline parser");
    this.onTimelineCallback = segmentCallback;
    this.date = null;
    this.startTime = null;
    this.store = [];

    this._bootstrap();
  }

  _bootstrap() {
    console.log("Creating observer for single-day element");
    const titleCatcher = (observer) => {
      if (document.getElementsByClassName('single-day')[0]) {
        observer.disconnect();
        console.log("single-day element created");
        this._addDayObserver(document.getElementsByClassName('single-day')[0]);
        this._onDayChange();
      }
    };
    const observer = new MutationObserver(() => {
      titleCatcher(observer);
    });
    observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  };

  _addSegment(segmentNode) {
    const contentBox = segmentNode.getElementsByClassName("photo-grid-wrapper")[0];
    const durations = Array.from(segmentNode.querySelectorAll('div.duration-text > span'));
    if (!durations.length) {
      if (!segmentNode.getElementsByClassName('duration-text')[0]) {
        console.log("Skipping missing activity");
        return;
      }

      const duration = parseDuration(segmentNode.getElementsByClassName('duration-text')[0].innerHTML);
      const lastEnd = this.store.length ? moment(this.store[this.store.length - 1].end) : moment(this.startTime);
      lastEnd.add(duration);

      this.store.push({
        end: lastEnd,
        contentBox: contentBox
      });
      console.log("Added travel segment");
      return;
    }

    let times = null;
    let isFinalSegment = false;
    if (durations[0].innerHTML != '') {
      // durations[0] holds both start and end time
      const timeSpans = Array.from(durations[0].querySelectorAll('span.segment-duration-part'));
      times = [timeSpans[0].innerHTML, timeSpans[1].innerHTML];
    } else if (durations[1].innerHTML != '') {
      // durations[1] holds only a starting time
      times = [durations[1].innerHTML, '11:59 PM'];
      isFinalSegment = true;
    } else if (durations[2].innerHTML != '') {
      // durations[2] holds only an ending time
      times = ['12:00 AM', durations[2].innerHTML]
    } else if (durations[3].innerHTML != '') {
      // durations[3] holds durations longer than a day ('mar 05 - mar 07')
      times = ['12:00 AM', '11:59 PM'];
    }

    times = times.map(x => moment(this.date + " " + x, 'YYYY-MM-DD h:mm a', true));
    if (!this.store.length) {
      this.startTime = times[0];
    }

    const last = this.store.length ? this.store[this.store.length - 1].end : this.startTime;
    if (times[1].isBefore(last)) {
      times[1].add(1, 'days');
      if (isFinalSegment) {
        times[1].set({
          hour: times[0].get('hour'),
          minutes: times[0].get('minute')
        });
        times[1].add(2, 'hours');
      }
    }

    this.store.push({
      end: times[1],
      contentBox: contentBox
    });
    console.log("Added place segment");
  };

  _onDayChange = () => {
    console.log("Removing injected content");
    Array.from(document.querySelectorAll('.photo-grid-wrapper .injectedContent')).forEach(x => x.remove());
    this.date = window.location.href.slice(window.location.href.length - 10);
    this.startTime = moment(this.date, 'YYYY-MM-DD', true);
    this.store = [];
    console.log("Date is " + this.date);

    for (let node of document.getElementsByClassName("place-history-moment-outer")) {
      this._addSegment(node);
    }

    this._applyCallback();
  };

  _addDayObserver(overlayElement) {
    const timelineChangeObserver = new MutationObserver(this._onDayChange);
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
