const callback = segments => {
  for (let segment of segments) {
    segment.contentBox.innerHTML = 'hello';
  }
};

let t = new Timeline(callback);
