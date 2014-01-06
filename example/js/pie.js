var DEFAULTS, Pie, accuracy, color, discardTransparent, id, path, result, show;

DEFAULTS = {
  canvasName: "__pie_workspace",
  accuracy: 2,
  scale: 10
};

Pie = function(options) {
  var canvas, componentToHex, context, convertRGBAtoHex, data, done, getData, img, loaded, processData, processingTime, retrievalTime, totalTime;
  totalTime = Date.now();
  retrievalTime = null;
  processingTime = null;
  canvas = document.getElementById("__pie_workspace");
  context = canvas.getContext('2d');
  data = [];
  componentToHex = function(c) {
    var hex;
    hex = c.toString(16);
    if (hex.length === 1) {
      return hex = "0" + hex;
    } else {
      return hex;
    }
  };
  convertRGBAtoHex = function(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };
  loaded = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    return getData(options.show, options.color);
  };
  getData = function(show, color) {
    var accuracy, columns, datum, height, rows, size, width, x, _i;
    retrievalTime = Date.now();
    accuracy = options.accuracy || DEFAULTS.accuracy;
    width = img.width;
    height = img.height;
    rows = ~~(height / (DEFAULTS.scale / accuracy));
    columns = ~~(width / (DEFAULTS.scale / accuracy));
    size = ~~(width / columns);
    /*
    console.log "width:", width
    console.log "height:", height
    console.log "rows:", rows
    console.log "columns:", columns
    console.log "size:", size
    */

    for (x = _i = 0; 0 <= columns ? _i < columns : _i > columns; x = 0 <= columns ? ++_i : --_i) {
      datum = context.getImageData(x * size, 0, 1, height);
      data.push(datum);
      if (show === true) {
        context.fillStyle = color;
        context.fillRect(x * size, 0, 1, height);
      }
    }
    retrievalTime = (Date.now() - retrievalTime) / 1000;
    return processData();
  };
  done = function(data) {
    totalTime = (Date.now() - totalTime) / 1000;
    console.group("Benchmarks");
    console.log("Total duration:", totalTime, "seconds.");
    console.log("Retrieval from canvas duration:", retrievalTime, "seconds.");
    console.log("Processing Data duration:", processingTime, "seconds.");
    console.log("Code Execution / Difference:", totalTime - (processingTime + retrievalTime), "seconds.");
    console.groupEnd("Benchmarks");
    return data;
  };
  processData = function() {
    var oldData, processDatum, x, _i, _len;
    processingTime = Date.now();
    oldData = data;
    data = [];
    processDatum = function(datum) {
      var hex, i, index, r, skipAmount, _i, _len, _ref, _results;
      skipAmount = 2;
      index = 0;
      _ref = 4 * 2;
      _results = [];
      for ((_ref > 0 ? (i = _i = 0, _len = datum.length) : i = _i = datum.length - 1); _ref > 0 ? _i < _len : _i >= 0; i = _i += _ref) {
        r = datum[i];
        if (i + 3 < 255) {
          hex = "transparent";
          if (!options.discardTransparent) {
            _results.push(data.push(hex));
          } else {
            _results.push(void 0);
          }
        } else {
          hex = convertRGBAtoHex(r, i + 1, i + 2, i + 3);
          _results.push(data.push(hex));
        }
      }
      return _results;
    };
    for (_i = 0, _len = oldData.length; _i < _len; _i++) {
      x = oldData[_i];
      processDatum(x.data);
    }
    processingTime = (Date.now() - processingTime) / 1000;
    return done();
  };
  if (options.path) {
    img = new Image();
    img.src = options.path;
    img.onload = function() {
      return loaded();
    };
    console.log("path set to load.");
  }
  if (options.id) {
    img = document.getElementById(options.id);
    loaded();
  }
  return data;
};

window.Pie = Pie;

id = "test";

path = "./img/google_logo.png";

accuracy = 2;

show = true;

color = "#c0c";

discardTransparent = true;

result = Pie({
  id: id,
  accuracy: accuracy,
  show: show,
  color: color,
  discardTransparent: discardTransparent
});

console.log(result);

// Generated by CoffeeScript 1.5.0-pre