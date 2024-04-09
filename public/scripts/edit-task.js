
document,addEventListener('click', function(event){
    if(event.target.classList.contains('edit-task-btn')){
        const taskId = event.target.getAttribute('data-task-id')
        const task = tasks.find(task => task._id === taskId)
        if(task){
            populateEditModal(task)
            modelNames.style.display = "block"
        }
    }
})

function populateEditModal(task){
    document.getElementById('edit-task-id').value = task._id
    document.getElementById('edit-task-name').value = task.name 
    document.getElementById('edit-task-description').value = task.description
    document.getElementById('edit-task-assignee').value = task.taskAssignee
    document.getElementById('edit-task-priority').value = task.priority
    document.getElementById('edit-task-start-date').value = task.startDate
    document.getElementById('edit-task-due-date').value = task.dueDate
    document.getElementById('edit-task-status').value = task.status




}