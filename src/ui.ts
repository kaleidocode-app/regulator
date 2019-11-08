import './ui.css'

const container = document.getElementById("styles")
let renameInput = <HTMLInputElement>document.getElementById('renameInput')
let numerate = 1

onmessage = (event) => {

	const pluginMessage = event.data.pluginMessage
	

	if (pluginMessage.type == 'loadStyles') {

		let counter = pluginMessage.styles[0].length
		

		pluginMessage.styles[0].forEach((style: any, index: number) => {
			
			let name = style.name
			let styleId = style.id
			let color = style.color

			let newItem = `
				<li data-id="${styleId}" class="style-item">
					<div class="checkbox"></div>
					<div class="color" style="background-color: #${color};"></div>
					<div class="name" data-name="${name}">${name}</div>
				</li>`
			container.innerHTML += newItem;
			if ((index + 1) === counter) {
				startListening()
			}
		})

	}

}

function updateStyleNames(){
	
	let items = document.getElementsByClassName('checked')
	for (let index = 0; index < items.length; index++) {

		let renameText

		let text = items[index].querySelector('.name')
		if (renameInput.value.includes('$nn')) {
			renameText = renameInput.value.replace('$nn', pad(Number(index)+1, 2))
		}
		else if (renameInput.value.includes('$n')) {
			renameText = renameInput.value.replace('$n', pad(Number(index+1), 1))
		} else if (renameInput.value.includes('$')) {
			renameText = renameInput.value.replace('$', '')
		} else {
			renameText = renameInput.value
		}
		if (renameInput.value.length > 0) {
			text.innerHTML = renameText
		}

	}
	
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

		
		
	});

	document.getElementById('renameButton').addEventListener('click', function(e){
		
		if (document.querySelectorAll('.checked').length === 0) {
			renameInput.focus()
			parent.postMessage({ pluginMessage: { type: 'no-styles' } }, '*')
	
		} else if(renameInput.value.length > 0){
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
				c.classList.toggle('checked')
			})

			parent.postMessage({ pluginMessage: { type: 'rename-styles', styles: rename } }, '*')

			renameInput.value = ""
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
	if (renameInput.value.length > 0) {
		document.getElementById('renameButton').classList.remove('disabled')
	} else {
		document.getElementById('renameButton').classList.add('disabled')
	}
}

renameInput.focus()