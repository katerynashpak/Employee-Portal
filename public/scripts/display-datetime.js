
const curDate = new Date()

const options = {weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'}

const formattedDateTime = curDate.toLocaleDateString('en-US', options)

document.getElementById('currentDateTime').textContent = formattedDateTime