function formatDate(dateString){
    const options = {month: 'short', day: '2-digit'}
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', options).toUpperCase()
}

function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1)
}