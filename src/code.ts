figma.showUI(__html__, { width: 400, height: 280 });

let ref = []

figma.getLocalPaintStyles().forEach(style => {
  let node = <SolidPaint>style.paints[0]
  let colors = node.color
  let hex = findTheHEX(colors.r, colors.g, colors.b)

  ref.push({
    id: style.id,
    name: style.name,
    color: hex
  })
})

figma.ui.postMessage({ type: 'loadStyles', styles: [ref] })

figma.ui.onmessage = async msg => {

  if (msg.type === "rename-styles") {
    msg.styles.forEach(s => {
      console.log(s.name)
      figma.getStyleById(s.style).name = s.name
    })
  }

  figma.closePlugin()

}

function findTheHEX(red: number, green: number, blue: number) {
  var redHEX = rgbToHex(red)
  var greenHEX = rgbToHex(green)
  var blueHEX = rgbToHex(blue)

  return redHEX + greenHEX + blueHEX
}

function rgbToHex(rgb: any) {
  rgb = Math.floor(rgb * 255)
  var hex = Number(rgb).toString(16)
  if (hex.length < 2) {
    hex = '0' + hex
  }
  return hex
}