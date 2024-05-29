
document.addEventListener('DOMContentLoaded', async function () {
    const modal = document.getElementById("task-modal")
    const modalContent = modal.querySelector(".modal-content")
    const btn = document.getElementById("add-task-btn")
    const closeBtn = document.querySelector(".modal-content .close")
    const backgroundOverlay = document.getElementById("background-overlay")
    const assigneeDropdown = document.getElementById("task-assignee")
    const addForm = document.getElementById("task-form")

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
        if (event.target == modal) {
            modal.style.display = "none"
            backgroundOverlay.style.display = "none"
        }
    }


    try {
        const response = await fetch('/users')
        const users = await response.json()

        users.forEach(user => {
            const option = document.createElement('option')
            option.value = user.name
            option.textContent = user.name
            assigneeDropdown.appendChild(option)

        })

    } catch {
        console.error('Error fetching users: ', error)
    }

    addForm.addEventListener('submit', async function (event) {
        event.preventDefault()

        const formData = JSON.stringify(Object.fromEntries(new FormData(addForm)))

        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: formData
            })

            if (response.ok) {
                //window.history.back()
                location.reload();
            } else {
                console.error('Failed to add task', response.statusText)
            }


        } catch (error) {
            console.error('Error adding task:', error)
        }



    })

})




