document.addEventListener('DOMContentLoaded', function(){
    const canvas = document.getElementById('avatarCanvas')
    const ctx = canvas.getContext('2d') //2D
    const avatarUploadInput = document.getElementById('avatarUploadInput')
    const saveAvatarButton = document.getElementById('saveAvatarButton')

    avatarUploadInput.addEventListener('change', handleAvatarUpload)
    saveAvatarButton.addEventListener('click', saveAvatar)

    function handleAvatarUpload(event) {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = function (e) {
                const img = new Image()
                img.onload = function () {
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                }
                img.src = e.target.result
            }
            reader.readAsDataURL(file)
        }
    }

    function saveAvatar() {
        const dataURL = canvas.toDataURL('image/png') || canvas.toDataURL('image/jpeg')

        fetch('/profile/avatar', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ avatarData: dataURL })
        })
            .then(response => {
                if (response.ok) {
                    console.log('Avatar saved successfully')
                } else {
                    console.error('Failed to save avatar')
                }
            })
            .catch(error => {
                console.error('Error saving avatar: ', error)
            })
    }

    fetch('/profile/avatar')
    .then(response => response.json())
    .then(data => {
        if(data.avatar){
            const img = new Image()
            img.onload = function(){
                ctx.clearRect(0,0,canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            }
            img.src = data.avatar
        }
    })
    .catch(error => console.error('Error fetching avatar: ', error))


})
