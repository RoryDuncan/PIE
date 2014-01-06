var ColorList, DEFAULTS, Pie, accuracy, color, discardTransparent, id, path, result, show, x, _i, _len;

DEFAULTS = {
  canvasName: "__pie_workspace",
  accuracy: 2,
  scale: 10
};

ColorList = (function() {

  function ColorList() {
    this.list = {};
    this.colors = {};
  }

  ColorList.prototype.add = function(color) {
    if (this.list[color] === void 0) {
      return this.list[color] = 1;
    } else {
      return this.list[color] += 1;
    }
  };

  ColorList.prototype.sort = function() {
    this.omit(15);
    return this.disectMostUsedColors();
  };

  ColorList.prototype.omit = function(threshold) {
    _.each(this.list, function(value, key, list) {
      if (value < threshold) {
        return delete list[key];
      } else {

      }
    });
    console.log("After Ommissions:");
    return console.log(this.list);
  };

  ColorList.prototype.disectMostUsedColors = function(numberOfColors) {
    var key, list, max, results, x, _i;
    console.log("Disecting");
    if (!numberOfColors) {
      numberOfColors = 5;
    }
    list = this.list;
    results = [];
    for (x = _i = 0; 0 <= numberOfColors ? _i <= numberOfColors : _i >= numberOfColors; x = 0 <= numberOfColors ? ++_i : --_i) {
      max = _.max(list);
      key = null;
      _.find(list, function(v, k, l) {
        if (v === max) {
          key = k;
          return k;
        } else {

        }
      });
      results.push(key);
      delete list[key];
    }
    console.log(results);
    this.colors = results;
  };

  return ColorList;

})();

Pie = function(options) {
  var canvas, colorListTime, colorlist, componentToHex, context, convertRGBAtoHex, data, done, getData, img, loaded, processData, processingTime, retrievalTime, sortDataIntoColorList, totalTime;
  totalTime = Date.now();
  retrievalTime = null;
  processingTime = null;
  colorListTime = null;
  colorlist = null;
  canvas = document.getElementById("__pie_workspace");
  context = canvas.getContext('2d');
  data = [];
  componentToHex = function(c) {
    var hex;
    hex = c.toString(16);
    if (hex.length === 1) {
      return (hex = "0" + ("" + hex));
    } else {
      return hex;
    }
  };
  convertRGBAtoHex = function(r, g, b) {
    return "#" + componentToHex(r) + "" + componentToHex(g) + "" + componentToHex(b);
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
  processData = function() {
    var oldData, processDatum, x, _i, _len;
    processingTime = Date.now();
    oldData = data;
    data = [];
    processDatum = function(datum) {
      var b, g, hex, i, r, skipAmount, _i, _len, _ref, _results;
      skipAmount = 2;
      _ref = 4 * 2;
      _results = [];
      for ((_ref > 0 ? (i = _i = 0, _len = datum.length) : i = _i = datum.length - 1); _ref > 0 ? _i < _len : _i >= 0; i = _i += _ref) {
        r = datum[i];
        if (datum[i + 3] < 255) {
          hex = "transparent";
          if (!options.discardTransparent) {
            _results.push(data.push(hex));
          } else {
            _results.push(void 0);
          }
        } else {
          g = datum[i + 1];
          b = datum[i + 2];
          hex = convertRGBAtoHex(r, g, b);
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
    return sortDataIntoColorList();
  };
  sortDataIntoColorList = function() {
    var x, _i, _len;
    colorListTime = Date.now();
    colorlist = new ColorList();
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      x = data[_i];
      colorlist.add(x);
    }
    colorlist.sort();
    colorListTime = (Date.now() - colorListTime) / 1000;
    console.log(colorlist);
    done(colorlist.colors);
  };
  done = function(results) {
    totalTime = (Date.now() - totalTime) / 1000;
    console.groupCollapsed("Benchmarks");
    console.log("Total duration:", totalTime, "seconds.");
    console.log("Data Ommission:", 10 - options.accuracy + "0%");
    console.log("Retrieval from canvas duration:", retrievalTime, "seconds.");
    console.log("Processing Data duration:", processingTime, "seconds.");
    console.log("Sorting Color Data duration:", colorListTime, "seconds.");
    console.log("Code Execution / Difference:", totalTime - (processingTime + retrievalTime + colorListTime), "seconds.");
    console.groupEnd("Benchmarks");
    data = results;
    return data;
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

console.log(" results:");

console.log(result);

for (_i = 0, _len = result.length; _i < _len; _i++) {
  x = result[_i];
  console.log("%c" + x, "border-bottom: 5px solid " + x + ";");
}

// Generated by CoffeeScript 1.5.0-pre
