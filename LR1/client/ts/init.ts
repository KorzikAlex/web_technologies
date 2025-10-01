function store(source: HTMLInputElement) {
    localStorage["tetris.username"] = source.value
}

function read(source: HTMLInputElement) {
    source.value = localStorage["tetris.username"]
}

let input = document.getElementById("name") as HTMLInputElement
read(input)
input.onchange = () => store(input)