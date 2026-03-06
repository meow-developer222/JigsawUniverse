


let newPuzzleAlert = document.getElementById("newPuzzle");

let selectedElement: HTMLElement | null = null;
var selectedData: {image: string | null} = {image: null};

function selectPuzzle(element: HTMLElement)
{


    let strData = (element.lastElementChild! as HTMLFormElement).value;


    
    let data = JSON.parse(strData);

    // window.initGame(data.image, 20, 20);
    if (selectedElement)
    {
        selectedElement.classList.remove("selected");
        
    }
    element.classList.add("selected");
    selectedElement = element;
    selectedData = data;
    

    
}

function closeNewDialog()
{
    newPuzzleAlert!.style.display = "none";
}

function openNewDialog()
{
    newPuzzleAlert!.style.display = "flex";
}


function start()
{
    
    if (selectedData.image)
    {
        indexedDB.deleteDatabase("workspace1");
        closeNewDialog();
        window.initGame(selectedData.image, 24, 24);
    }
    
}