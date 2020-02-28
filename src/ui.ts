import './ui.css'

const container = document.getElementById("styles")
let renameInput = <HTMLInputElement>document.getElementById('renameInput')
let matchInput = <HTMLInputElement>document.getElementById('renameMatch')
let selectAll = <HTMLInputElement>document.getElementById('selectAll')
let numerate = 1

onmessage = (event) => {

	const pluginMessage = event.data.pluginMessage
	

	if (pluginMessage.type == 'loadStyles') {

		console.log('loading styles...')
		console.log(pluginMessage.styles[0])

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
				document.getElementById('selectAll').click()
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

		if(items[index].getAttribute('id') !== 'selectAll'){

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

	}
	
}

function clearStyleNames(){

	let items = document.getElementsByClassName('rename')
	for (let index = 0; index < items.length; index++) {
		if(items[index].getAttribute('id') !== 'selectAll'){
			let originalName = items[index].querySelector('.name').getAttribute('data-name')
			let text = items[index].querySelector('.name')
			text.innerHTML = originalName
			items[index].classList.toggle('rename')
			updateStyleNames()
		}
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
			if(target.getAttribute('id') !== 'selectAll'){ selectAll.classList.remove('checked') }
			target.classList.toggle('rename')
			clearStyleNames()
		} else {
			updateStyleNames()	
		}
		
		// select all
		if(target.getAttribute('id') === 'selectAll'){
			let items = document.querySelectorAll('.style-item:not(#selectAll)')
			let state = target.classList.contains('checked')
			
			items.forEach(c => {
				if(state === true){
					if(!c.classList.contains('checked')) {
						c.classList.add('checked')
					}	
				} else {
					c.classList.remove('checked')
				}
				
			})
		}
		
	});

	document.getElementById('renameButton').addEventListener('click', function(e){

		console.log(selectAll.classList.contains('checked'))
		
		if (document.querySelectorAll('.checked:not(#selectAll)').length === 0) {
			renameInput.focus()
			parent.postMessage({ pluginMessage: { type: 'no-styles' } }, '*')
	
		} else if(renameInput.value.length > 0 || matchInput.value.length > 0){
			let rename = []

			let checked = document.querySelectorAll('.checked:not(#selectAll)')
			checked.forEach((c, index) => {
				let styleId = c.getAttribute('data-id')
				let styleName = c.querySelector('.name').innerHTML
				rename.push({
					style: styleId,
					name: styleName
				})
				
				let name = c.querySelector('.name')
				name.setAttribute('data-name', name.innerHTML)
				c.classList.toggle('checked')
			})

			console.log(selectAll.classList.contains('checked'))

			parent.postMessage({ pluginMessage: { type: 'rename-styles', styles: rename } }, '*')

			// reset
			renameInput.value = ""
			matchInput.value = ""
			renameInput.focus()
			checkInputValue()
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
		document.getElementById('renameButton').classList.add('disabled')
	}
}

matchInput.focus()