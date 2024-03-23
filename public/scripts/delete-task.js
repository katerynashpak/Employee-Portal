
document.querySelectorAll('.delete-task-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const taskId = button.getAttribute('data-task-id')
        try{
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE'
            })
            if(response.ok){
                location.reload();
            } else{
                console.error('Failed to delete task')
            }
        } catch (error){
            console.error('Error:', error)
        }


    })
}) 