
DEFAULTS = 
  canvasName: "__pie_workspace"
  accuracy: 2
  scale: 10

class ColorList
  constructor: () ->
    @list = {}
    @colors = {}

  add: (color) ->
    
    if @list[color] is undefined
      @list[color] = 1
    else
      @list[color] += 1
    

  sort: () ->

    @omit(15)
    @disectMostUsedColors()

  omit: (threshold) ->
    _.each @list, (value, key, list) ->
      if value < threshold
        delete list[key]
      else return
    console.log "After Ommissions:"
    console.log @list

  disectMostUsedColors: (numberOfColors) ->
    console.log "Disecting"
    numberOfColors = 5 unless numberOfColors

    list = @list
    results = []

    # this works by finding the current max in 'list',
    # removing the key that equals the current max,
    # and doing it all over again

    for x in [0..numberOfColors]

      max = _.max list

      key = null

      _.find list, (v,k,l) ->
        if v is max
          key = k
          return k
        else return

      results.push key
      delete list[key]

    console.log results
    @colors = results
    return



    

# functional usage
Pie = (options) ->

  totalTime = Date.now()
  retrievalTime = null
  processingTime = null
  colorListTime = null
  colorlist = null
  #canvas = document.createElement('canvas')
  canvas = document.getElementById("__pie_workspace")
  context = canvas.getContext('2d')
  data = []

  # HELPERS

  componentToHex = (c) -> 
    hex = c.toString(16)
    if hex.length is 1
      return (hex = "0" + "#{hex}")
    else return hex

  convertRGBAtoHex = (r, g, b) ->

    return ("#" + componentToHex(r) + "" + componentToHex(g) + "" + componentToHex(b))

  # PROCESS
  loaded = ->
    
    canvas.width = img.width
    canvas.height = img.height
    context.drawImage img, 0, 0

    getData(options.show, options.color)

  getData = (show, color) ->
    retrievalTime = Date.now()
    accuracy = options.accuracy or DEFAULTS.accuracy
    width = img.width
    height = img.height
    rows = ~~(height / (DEFAULTS.scale / accuracy))
    columns = ~~(width / (DEFAULTS.scale / accuracy))
    size = ~~(width / columns)

    ###
    console.log "width:", width
    console.log "height:", height
    console.log "rows:", rows
    console.log "columns:", columns
    console.log "size:", size
    ###

    for x in [0...columns]

      datum = context.getImageData(x*size, 0, 1, height)
      data.push datum

      if show is true
        context.fillStyle = color
        context.fillRect((x*size),0,1,height)

    retrievalTime = (Date.now() - retrievalTime)/1000
    processData()

  processData = () ->
    processingTime = Date.now()
    oldData = data
    data = []

    processDatum = (datum) ->
      skipAmount = 2

      # skip by 4 because  there are 4 values to rgba's
      for r, i in datum by (4*2)
        if datum[(i+3)] < 255
          hex = "transparent"
          data.push hex unless options.discardTransparent
        else
          g = datum[i+1]
          b = datum[i+2]

          hex = convertRGBAtoHex(r, g, b)
          
          data.push hex
        

    for x in oldData
      processDatum x.data


    processingTime = (Date.now() - processingTime) / 1000

    sortDataIntoColorList()

  sortDataIntoColorList = ->
    colorListTime = Date.now()
    colorlist = new ColorList()

    for x in data
      colorlist.add x

    colorlist.sort()
    colorListTime = (Date.now() - colorListTime) / 1000
    console.log colorlist

    done(colorlist.colors)
    return

  done = (results) ->
    totalTime = (Date.now() - totalTime ) / 1000
    console.groupCollapsed "Benchmarks"
    console.log "Total duration:", totalTime, "seconds."
    console.log "Data Ommission:", 10 - options.accuracy+"0%"
    console.log "Retrieval from canvas duration:", retrievalTime, "seconds."
    console.log "Processing Data duration:", processingTime, "seconds."
    console.log "Sorting Color Data duration:", colorListTime, "seconds."
    console.log "Code Execution / Difference:", (totalTime - (processingTime + retrievalTime + colorListTime)), "seconds."
    console.groupEnd "Benchmarks"
    data = results
    return data

  # Branching

  if options.path
    img = new Image()
    img.src = options.path
    img.onload = ->
      loaded()
    console.log "path set to load."

  if options.id
    img = document.getElementById(options.id)
    loaded()


  return data

window.Pie = Pie

id = "test"
path = "./img/google_logo.png"
accuracy = 2
show = true
color = "#c0c"
discardTransparent = true

result = Pie {id, accuracy, show, color, discardTransparent}

console.log " results:"
console.log result

for x in result
  console.log "%c#{x}", "border-bottom: 5px solid #{x};"