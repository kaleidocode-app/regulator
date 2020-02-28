import './ui.css'

const container = document.getElementById("styles")
let renameInput = <HTMLInputElement>document.getElementById('renameInput')
let matchInput = <HTMLInputElement>document.getElementById('renameMatch')
let masterSwitch = <HTMLInputElement>document.getElementById('masterSwitch')
let switchItem = <HTMLElement>document.getElementById('switch')
let styleCount:number

onmessage = (event) => {

	const pluginMessage = event.data.pluginMessage
	

	if (pluginMessage.type == 'loadStyles') {

		console.log('loading styles...')

		let counter = pluginMessage.styles[0].length
		

		pluginMessage.styles[0].forEach((style: any, index: number) => {
			
			let name = style.name
			let styleId = style.id
			let color = style.color
			let newItem: string

			if(color === false){
				newItem = `
				<li data-id="${styleId}" class="style-item">
					<div class="checkbox"></div>
					<div class="text">Ag</div>
					<div class="name" data-name="${name}">${name}</div>
				</li>`
			} else {
				newItem = `
				<li data-id="${styleId}" class="style-item">
					<div class="checkbox"></div>
					<div class="color" style="background-color: #${color};"></div>
					<div class="name" data-name="${name}">${name}</div>
				</li>`
			}

			
			container.innerHTML += newItem;
			if ((index + 1) === counter) {
				startListening()
				masterSwitch.click()
			}
		})

	}

}

function updateStyleNames(){
	
	let items = document.getElementsByClassName('checked')
	for (let index = 0; index < items.length; index++) {

		let renameText: string
		let text = items[index].querySelector('.name')
		let originalName = text.getAttribute('data-name')
		
		// match
		if(matchInput.value.length > 0 || renameInput.value.length > 0) {
			let matchName = matchInput.value;
			let matchNameAllInstance = new RegExp(matchName,"g");
			renameText = originalName.replace(matchNameAllInstance, renameInput.value)
		}
		
		// when match is empty
		if(renameInput.value.length > 0 && matchInput.value.length == 0) {
			renameText = renameInput.value
		}

		// numerator
		if(renameInput.value.includes('$')){
			if (renameInput.value.includes('$nn')) {
				renameText = renameText.replace(/\$nn/g, pad(Number(index)+1, 2))
			} else if (renameInput.value.includes('$n')) {
				renameText = renameText.replace(/\$n/g, pad(Number(index+1), 1))
			} else if (renameInput.value.includes('$&')){
				renameText = renameText.replace(/\$&/g, originalName)
			} else if (renameInput.value.includes('$')) {
				renameText = renameText.replace(/\$/g, '')
			}
		}

		// match & replace
		if (renameInput.value.length > 0 || matchInput.value.length > 0) {
			text.innerHTML = renameText
		}

		// reset
		if (renameInput.value.length == 0 && matchInput.value.length == 0){
			text.innerHTML = originalName
		}

	}

	updateStyleCount()
	
}

function clearStyleNames(){

	let items = document.getElementsByClassName('rename')
	for (let index = 0; index < items.length; index++) {
		let originalName = items[index].querySelector('.name').getAttribute('data-name')
		let text = items[index].querySelector('.name')
		text.innerHTML = originalName
		items[index].classList.toggle('rename')
		updateStyleNames()
	}

}

function toggleAll(){
	switchItem.classList.toggle('on')

	document.querySelectorAll('.style-item').forEach(s => {
		let item = <HTMLElement>s
		item.classList.toggle('checked')

		if(switchItem.classList.contains('on') && !item.classList.contains('checked')){
			// toggle on only if item is not already on
			item.classList.toggle('checked')
		} else if(!switchItem.classList.contains('on') && item.classList.contains('checked')) {
			// toggle off only if item is not already off
			item.classList.toggle('checked')
		}

		if(!item.classList.contains('checked')){
			item.classList.toggle('rename')
			clearStyleNames()
		} else {
			updateStyleNames()	
		}

	});
}

function updateStyleCount(state?: string){
	if (renameInput.value.length > 0 || matchInput.value.length > 0) {
		console.log('updating style count')
		let buttton = document.getElementById('renameButton')

		styleCount = 0

		document.querySelectorAll('.checked').forEach(c =>{
			let name = c.querySelector('.name')
			if(name.getAttribute('data-name') !== name.innerHTML){
				styleCount++
			}
		})

		if(styleCount > 0){
			buttton.innerText = `Rename ${styleCount} Styles`
		} else {
			buttton.innerText = `Rename Styles`
		}
	} else if(state == 'clear'){
		console.log('clearing')
		document.getElementById('renameButton').innerText = `Rename Styles`
	}
}

document.addEventListener('keyup', function (e) {
	checkInputValue()
	updateStyleNames()
	e.preventDefault()
})

let rename = []

function startListening() {

	document.getElementById("styles").addEventListener('click', function (e) {
		let target = <HTMLElement>e.target
		target.classList.toggle('checked')
		

		if(!target.classList.contains('checked')){
			target.classList.toggle('rename')
			clearStyleNames()
		} else {
			updateStyleNames()	
		}

		updateStyleCount()
		
	});

	document.getElementById("masterSwitch").addEventListener('click', function (e) {
		toggleAll()
	});

	document.getElementById('shortcutName').addEventListener('click', function(e){
		let currentText = renameInput.value
		renameInput.value = currentText + '$&'
		updateStyleNames()
		e.preventDefault()
	});

	document.getElementById('shortcutNumber').addEventListener('click', function(e){
		let currentText = renameInput.value
		renameInput.value = currentText + '$nn'
		updateStyleNames()
		e.preventDefault()
	});

	document.getElementById('renameButton').addEventListener('click', function(e){
		
		if (document.querySelectorAll('.checked').length === 0) {
			renameInput.focus()
			parent.postMessage({ pluginMessage: { type: 'no-styles' } }, '*')
	
		} else if(renameInput.value.length > 0 || matchInput.value.length > 0){
			let rename = []

			let checked = document.querySelectorAll('.checked')
			checked.forEach((c, index) => {
				let styleId = c.getAttribute('data-id')
				let styleName = c.querySelector('.name').innerHTML
				rename.push({
					style: styleId,
					name: styleName
				})
				
				let name = c.querySelector('.name')
				name.setAttribute('data-name', name.innerHTML)

				// reset
				if(!switchItem.classList.contains('on')){
					// toggle on only if item is not already on
					c.classList.toggle('checked')
				}

			})

			parent.postMessage({ pluginMessage: { type: 'rename-styles', styles: rename } }, '*')

			renameInput.value = ""
			matchInput.value = ""
			matchInput.focus()
			checkInputValue()
			updateStyleCount('clear')
			e.preventDefault()
		} 
		
		
		
	})

}

function pad(n:any, width:any, z?:any) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function checkInputValue(){
	if (renameInput.value.length > 0 || matchInput.value.length > 0) {
		document.getElementById('renameButton').classList.remove('disabled')
	} else {
		updateStyleCount('clear')
		document.getElementById('renameButton').classList.add('disabled')
	}
}

matchInput.focus()