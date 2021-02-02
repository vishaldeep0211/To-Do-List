function addItems()
{
    var newItemName = document.getElementById("newItems").value;
    var newItemDiv = document.createElement("div");
    newItemDiv.className += "item";
    newItemDiv.innerHTML = 
    `<input type="checkbox" name="checkBox">
    <div class="item-para">
        <p>${newItemName}</p>
    </div>`

    // console.log(newItemName);
    //console.log(newItemDiv);

    var itemDiv =  document.getElementById("newItem");
    itemDiv.insertAdjacentElement("beforebegin", newItemDiv);
    document.getElementById("newItems").value = "";
    document.getElementById("newItems").focus();
}

function deleteItems()
{
    var checkedBoxes = [];
    var checkBox = document.getElementsByName("checkBox");
    checkBox.forEach(element => {
        // console.log(element.checked);
        if(element.checked)
        {
            // console.log(element);
            checkedBoxes.push(element);
        }
    });
   
    checkedBoxes.forEach(checkedBox => {
        // console.log(checkedBox);
        checkedBox.parentElement.remove();
    });
}