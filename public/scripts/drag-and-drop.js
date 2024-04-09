
document.querySelectorAll('.col').forEach(col => {
    col.addEventListener('dragover', handleDragOver)
    col.addEventListener('drop', handleDrop)
})

function handleDragStart(e){
    e.dataTransfer.setData("text/plain", e.target.id)
}

function handleDragOver(e){
    e.preventDefault()
}


function handleDrop(e) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    const draggedTask = document.getElementById(taskId)
    const dropZone = e.target.closest('.col')

    if (dropZone) {
        //append the dragged task to the drop zone
        dropZone.appendChild(draggedTask)
        
        //const status = dropZone.getAttribute('id')

        const statusMap = {
            'ready-col': 'ready',
            'in-progress-col': 'in-progress',
            'needs-review-col': 'needs-review',
            'done-col': 'done'
        }
        const status = statusMap[dropZone.id]

        //update status
        draggedTask.setAttribute('data-status', status)
        updateTaskStatus(taskId, status)
    }
}

function handleDragEnd(e){

}


//update status
async function updateTaskStatus(taskId, status) {
    try {
        //
        console.log('Task ID:', taskId)

        const requestBody = {status: status}
        console.log("Request body: ", requestBody)

        const response = await fetch(`/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        })
        if (!response.ok) {
            throw new Error('Failed to update task status')
        }
        
    } catch (error) {
        console.error('Error updating task status:', error)
        
    }
}


document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('dragstart', handleDragStart)
})



document.addEventListener('dragend', handleDragEnd)
