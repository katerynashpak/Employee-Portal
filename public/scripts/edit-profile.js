
document.addEventListener('DOMContentLoaded', function () {

    const editModal = document.getElementById("edit-profile-modal")
    const editModalContent = editModal.querySelector(".modal-content")
    const editCloseBtn = editModalContent.querySelector(".close")
    const backgroundOverlay = document.getElementById("background-overlay")
    const editForm = document.getElementById("edit-profile-form")

    document.querySelector('.edit-profile-btn').addEventListener('click', async () => {
            //const userId = button.getAttribute('data-profile-id')
            console.log('Edit profile button clicked')
            try {
                const response = await fetch('/profile/update')
                if(!response.ok)
                    throw new Error('Failed to fetch profile details')
                const profile = await response.json()

                document.getElementById('edit-profile-id').value = profile._id
                document.getElementById('edit-profile-name').value = profile.name
                document.getElementById('edit-profile-email').value = profile.email
                document.getElementById('edit-profile-birthday').value = profile.birthday ? profile.birthday.split('T')[0] : ''
                document.getElementById('edit-profile-jobTitle').value = profile.jobTitle || ''
                document.getElementById('edit-profile-department').value = profile.department || ''

                editModal.style.display = "block"
                backgroundOverlay.style.display = "block"
                console.log('Got profile details')
            } catch (error) {
                console.error('Error fetching profile details:', error)
            }
    })

    editCloseBtn.onclick = function () {
        editModal.style.display = "none"
        backgroundOverlay.style.display = "none"
    }

    window.onclick = function (event) {
        if (event.target === editModal) {
            editModal.style.display = "none"
            backgroundOverlay.style.display = "none"
        }
    }

    editForm.addEventListener('submit', async function (event) {
        event.preventDefault()
        const formData = new FormData(editForm)
        const data = Object.fromEntries(formData.entries())

        console.log('Payload data:', data)

        try {
            const response = await fetch(`/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            
            
            if (response.ok) {
                console.log('Profile updated successfully')

                const responseData = await response.json()
                console.log('Response:', responseData)

                location.reload()

            } else {
                const responseData = await response.json()
                console.error('Failed to update profile:', responseData.message)
            }
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    })
})