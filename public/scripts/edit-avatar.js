document.addEventListener('DOMContentLoaded', async function() {
    const avatarCanvasBtn = document.getElementById("avatarCanvas")
    const avatarModal = document.getElementById("avatar-modal")
    const closeBtn = document.querySelector(".modal-content .close");
    const backgroundOverlay = document.getElementById("background-overlay");


    avatarCanvasBtn.onclick = function(){
        avatarModal.style.display = "block"
        backgroundOverlay.style.display = "block"
    }

    closeBtn.onclick = function(){
        avatarModal.style.display = "none"
        backgroundOverlay.style.display = "none"
    }

    window.onclick = function(event){
        if(event.target == avatarModal){
           avatarModal.style.display = "none" 
           backgroundOverlay.style.display = "none"
        }
            
    }


})