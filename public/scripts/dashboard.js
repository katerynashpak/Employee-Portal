const sideMenu = document.querySelector("aside")
const menuBtn = document.querySelector("#menu-btn")
const closeBtn = document.querySelector("#close-btn")

const themeToggler = document.querySelector('.theme-toggler')
const themeIcons = document.querySelectorAll('.theme-toggler i')



menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block'
})

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none'
})



//toggle light/dark mode

function toggleTheme(){
    document.body.classList.toggle('dark-theme-variables')
    themeIcons.forEach(icon => icon.classList.toggle('active'))

    //store in browser local storage
    const isDarkMode = document.body.classList.contains('dark-theme-variables')
    localStorage.setItem('darkMode', isDarkMode)

}


themeToggler.addEventListener('click', toggleTheme)


window.addEventListener('load', () => { //check what mode was saved in storage
    const darkMode = localStorage.getItem('darkMode')

    if(darkMode === 'true'){
        toggleTheme()
    }
})







//recent orders
document.addEventListener('DOMContentLoaded', () => {
    fetch('/')
        .then(response => response.text())
            .then(html => {
                document.getElementById('recent-orders-placeholder').innerHTML = html
            })
    .catch(error => console.error('Error fetching: ', error))
})

