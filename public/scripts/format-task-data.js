
function formatDueDate(task) {
    if(task.dueDate){
        const dueDate = new Date(task.dueDate)
        const formattedDate = `${dueDate.getMonth() + 1}/${dueDate.getDate()+1}/${dueDate.getFullYear()}`
        return { ...task._doc, dueDate: formattedDate };
    }
    return { ...task._doc, dueDate: 'N/A' };
}

module.exports = {formatDueDate}