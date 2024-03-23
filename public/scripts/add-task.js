
document.addEventListener('DOMContentLoaded', function(){
    const modal = document.getElementById("task-modal")
    const btn = document.getElementById("add-task-btn")
    const closeBtn = document.querySelector(".modal-content .close")

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
})




FormData.addEventListener('submit', async function(event){
    event.preventDefault();

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
            window.history.back();
        } else{
            console.error('Failed to add task', response.statusText)
        }


    } catch(error){
        console.error('Error adding task:', error)
    }



})

    