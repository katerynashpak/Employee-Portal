
document.querySelectorAll('.edit-task-btn').forEach(button => {
    button.addEventListener('click', async () => {


        const modal = document.getElementById("task-modal")
        const modalContent = modal.querySelector(".modal-content")
        const btn = document.getElementById("add-task-btn")
        const closeBtn = document.querySelector(".modal-content .close")
        const backgroundOverlay = document.getElementById("background-overlay")
        const assigneeDropdown = document.getElementById("task-assignee")

        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0

        btn.onclick = function () {
            modal.style.display = "block"
            backgroundOverlay.style.display = "block"
        }

        closeBtn.onclick = function () {
            modal.style.display = "none"
            backgroundOverlay.style.display = "none"
        }

        window.onclick = function (event) {
            if(event.target == modal){
                modal.style.display = "none"
                backgroundOverlay.style.display = "none"
            }
        }



        const taskId = button.getAttribute('data-task-id')
        try {
            
            const taskData = await fetch(`/tasks/${taskId}`, {
                method: 'PATCH'
            })

            if (taskData){
                    //populateEditModal(taskData)
                    //modelNames.style.display = "block"
                    document.getElementById('edit-task-modal').style.display = 'block'
            } else{
                console.error('Task not found')
            }

        } catch (error){
            console.error('Error editing task: ', error)
        }
        
    })
})




/*async function fetchTasksData(){
    try{
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'PATCH'
        })
        if(!response.ok){
            throw new Error('Failed to fetch tasks data')
        }
    }
    catch(error){
        console.error('Error  fetching tasks data: ', error)
    }
} 
*/

function populateEditModal(task) {
    document.getElementById('edit-task-id').value = task.id
    document.getElementById('edit-task-name').value = task.name
    if(task.description){
        document.getElementById('edit-task-description').value = task.description
    } else {
        document.getElementById('edit-task-description').value = ""
    }
    
    document.getElementById('edit-task-assignee').value = task.assignee
    document.getElementById('edit-task-priority').value = task.priority
    //if(task.startDate){
       document.getElementById('edit-task-start-date').value = task.startDate 
    //} else {
    //    document.getElementById('edit-task-start-date').value = ""
   // }

    //if(task.dueDate){
        document.getElementById('edit-task-due-date').value = task.dueDate
    // } else {
    //     document.getElementById('edit-task-due-date').value = ""
    // }
    
    document.getElementById('edit-task-status').value = task.status


}



function closeModal() {
    document.getElementById('edit-task-modal').style.display = 'none';
}

window.onclick = function (event) {
    if (event.target == document.getElementById('edit-task-modal')) {
        closeModal()
    }
}



