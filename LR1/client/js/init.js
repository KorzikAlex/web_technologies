/**
 * Сохранить имя пользователя в localStorage
 * @param source
 */
function store(source) {
    localStorage["tetris.username"] = source.value
}

/**
 *
 * @param source
 */
function read(source) {
    source.value = localStorage["tetris.username"]
}

function setName() {
    if (localStorage.hasOwnProperty("tetris.username")) {
        let input = document.getElementById("name")
        input.value = localStorage["tetris.username"]
    }
}