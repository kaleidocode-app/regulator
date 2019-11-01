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
                    <div class="name">${name}</div>
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
        console.log(index)
        let text = items[index].querySelector('.name')
        if (renameInput.value.includes('$nn')) {
            renameText = renameInput.value.replace('$nn', pad(Number(index)+1, 2))
            // index++
        }
        else if (renameInput.value.includes('$n')) {
            renameText = renameInput.value.replace('$n', pad(Number(index+1), 1)
            // index++
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

document.addEventListener('keyup', function (e) {
    updateStyleNames()
    e.preventDefault()
})

let rename = []

function startListening() {

    document.getElementById("styles").addEventListener('click', function (e) {
        let target = <HTMLElement>e.target
        target.classList.toggle('checked')
        updateStyleNames()
    });

    document.getElementById('renameButton').addEventListener('click', function(e){
        if(renameInput.value.length > 0){
            let rename = []

            let checked = document.querySelectorAll('.checked')
            checked.forEach(c => {
                let styleId = c.getAttribute('data-id')
                let styleName = c.querySelector('.name').innerHTML
                rename.push({
                    style: styleId,
                    name: styleName
                })
            })

            parent.postMessage({ pluginMessage: { type: 'rename-styles', styles: rename } }, '*')
            e.preventDefault()
        }
        
    })

}

function pad(n:any, width:any, z?:any) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}