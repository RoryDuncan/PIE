
DEFAULTS = 
  canvasName: "__pie_workspace"
  accuracy: 2
  scale: 10

# functional usage
Pie = (options) ->

  totalTime = Date.now()
  retrievalTime = null
  processingTime = null
  #canvas = document.createElement('canvas')
  canvas = document.getElementById("__pie_workspace")
  context = canvas.getContext('2d')
  data = []

  # HELPERS

  componentToHex = (c) -> 
      hex = c.toString(16)
      if hex.length is 1
        return hex = "0" + hex
      else return hex

  convertRGBAtoHex = (r, g, b) ->
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

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

  done = (data) ->
    totalTime = (Date.now() - totalTime ) / 1000
    console.group "Benchmarks"
    console.log "Total duration:", totalTime, "seconds."
    console.log "Retrieval from canvas duration:", retrievalTime, "seconds."
    console.log "Processing Data duration:", processingTime, "seconds."
    console.log "Code Execution / Difference:", (totalTime - (processingTime + retrievalTime)), "seconds."
    console.groupEnd "Benchmarks"
    return data

  processData = () ->
    processingTime = Date.now()
    oldData = data
    data = []

    processDatum = (datum) ->
      skipAmount = 2
      index = 0
      # skip by 4 because  there are 4 values to rgba's
      for r, i in datum by (4*2)
        if i+3 < 255
          hex = "transparent"
          data.push hex unless options.discardTransparent
        else
          hex = convertRGBAtoHex(r, i+1, i+2, i+3)
          data.push hex
        

    for x in oldData
      processDatum x.data


    processingTime = (Date.now() - processingTime) / 1000
    done()


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
console.log result
