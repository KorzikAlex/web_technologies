import {readFromLocalStorage, STORAGE_KEY, storeToLocalStorage} from "./utils/utils";


const inputUsername = document.getElementById("username");
const savedUsername = readFromLocalStorage(STORAGE_KEY);

if (savedUsername !== null) {
    inputUsername.value = savedUsername;
}

inputUsername.addEventListener("input", () => {
    storeToLocalStorage(STORAGE_KEY, inputUsername.value);
})
