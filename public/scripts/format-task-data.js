function formatDate(dateString){
    const date = new Date(dateString)
    const month = String(date.getMonth()+1).padStart(2,'0')
    const day = String(date.getDate()).padStart(2,'0')
    const year = date.getFullYear()
    return '${month}/${day}/${year}'
}

function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1)
}

app.get('/tasks', (req,res) =>{
    res.render('tasks.ejs', {tasks, formatDate})
})