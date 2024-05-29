
document.addEventListener('DOMContentLoaded', async function () {
    const editModal = document.getElementById("edit-task-modal");
    const editModalContent = editModal.querySelector(".modal-content");
    const editCloseBtn = editModalContent.querySelector(".close");
    const backgroundOverlay = document.getElementById("background-overlay");
    const editForm = document.getElementById("edit-task-form");

    document.querySelectorAll('.edit-task-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const taskId = button.getAttribute('data-task-id');
            try {
                const response = await fetch(`/tasks/${taskId}`);
                const task = await response.json();

                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                document.getElementById('edit-task-id').value = task._id;
                document.getElementById('edit-task-name').value = task.name;
                document.getElementById('edit-task-description').value = task.description;
                document.getElementById('edit-task-assignee').value = task.taskAssignee;
                document.getElementById('edit-task-priority').value = task.priority;
                document.getElementById('edit-task-start-date').value = formatDate(task.startDate);
                document.getElementById('edit-task-due-date').value = formatDate(task.dueDate);
                document.getElementById('edit-task-status').value = task.status;

                const assigneeDropdown = document.getElementById('edit-task-assignee');
                assigneeDropdown.innerHTML = '';
                const usersResponse = await fetch('/users');
                const users = await usersResponse.json();

                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user._id;
                    option.textContent = user.name;
                    if (user._id === task.taskAssignee) {
                        option.selected = true;
                    }
                    assigneeDropdown.appendChild(option);
                });

                editModal.style.display = "block";
                backgroundOverlay.style.display = "block";
                console.log('Got task details');
            } catch (error) {
                console.error('Error fetching task details:', error);
            }
        });
    });

    editCloseBtn.onclick = function () {
        editModal.style.display = "none";
        backgroundOverlay.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target === editModal) {
            editModal.style.display = "none";
            backgroundOverlay.style.display = "none";
        }
    };

    editForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const taskId = document.getElementById('edit-task-id').value;
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        console.log('Payload data:', data);

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            console.log('Response:', responseData);

            if (response.ok) {
                console.log('Task updated successfully');
                location.reload();
            } else {
                console.error('Failed to update task:', responseData);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    });
});