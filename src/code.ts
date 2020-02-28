figma.showUI(__html__, { width: 400, height: 360 });

let ref = []
let colors
let hex

figma.getLocalPaintStyles().forEach(style => {

	let node = <SolidPaint>style.paints[0]

	if(node.color){
		colors = node.color
		hex = findTheHEX(colors.r, colors.g, colors.b)
	} else {
		hex = 'f8f8f8'
	}
	

	ref.push({
		id: style.id,
		name: style.name,
		color: hex
	})
})

figma.getLocalTextStyles().forEach(style => {
	ref.push({
		id: style.id,
		name: style.name,
		color: false,
		font: style.fontName.family
	})
})

figma.ui.postMessage({ type: 'loadStyles', styles: [ref] })

figma.ui.onmessage = async msg => {

	if (msg.type === "rename-styles") {
		msg.styles.forEach(s => {
			figma.getStyleById(s.style).name = s.name
		})
	}

	if (msg.type === "no-styles"){
		figma.notify('Please select styles to rename')
	}

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