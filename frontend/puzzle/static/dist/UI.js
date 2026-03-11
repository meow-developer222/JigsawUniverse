"use strict";
var selectedDifficulty = 1;
let newPuzzleAlert = document.getElementById("newPuzzle");
let selectedElement = null;
var selectedData = { image: null };
function selectPuzzle(element) {
    let strData = element.lastElementChild.value;
    let data = JSON.parse(strData);
    // window.initGame(data.image, 20, 20);
    if (selectedElement) {
        selectedElement.classList.remove("selected");
    }
    element.classList.add("selected");
    selectedElement = element;
    selectedData = data;
}
function selectDifficulty(element) {
    selectedDifficulty = element.value;
}
function closeNewDialog() {
    newPuzzleAlert.style.display = "none";
}
function openNewDialog() {
    newPuzzleAlert.style.display = "flex";
}
function start() {
    if (selectedData.image) {
        indexedDB.deleteDatabase("workspace1");
        closeNewDialog();
        window.initGame(selectedData.image, 6 * selectedDifficulty, 6 * selectedDifficulty);
    }
}
//# sourceMappingURL=UI.js.map