
document.addEventListener('DOMContentLoaded', function(){
    const modal = document.getElementById("task-modal")
    const modalContent = modal.querySelector(".modal-content")
    const btn = document.getElementById("add-task-btn")
    const closeBtn = document.querySelector(".modal-content .close")

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0

    btn.onclick = function () {
        modal.style.display = "block"
    }

    closeBtn.onclick = function () {
        modal.style.display = "none"
    }

    window.onclick = function (event) {
        if(event.target == modal){
            modal.style.display = "none"
        }
    }

    /*
    //draggable

    modalContent.onmousedown = function(e){
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }


    function elementDrag(e){
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY




        
        modal.style.top = (modal.offsetTop - pos2) + "px"
        modal.style.left = (modal.offsetLeft - pos1) + "px"


    }

    function closeDragElement(){
        document.onmouseup = null
        document.onmousemove = null
    }

    */

})




FormData.addEventListener('submit', async function(event){
    event.preventDefault()

    const formData = JSON.stringify(Object.fromEntries(new FormData(form)))

    try{
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: formData
        })

        if(response.ok){
            window.history.back()
        } else{
            console.error('Failed to add task', response.statusText)
        }


    } catch(error){
        console.error('Error adding task:', error)
    }



})
