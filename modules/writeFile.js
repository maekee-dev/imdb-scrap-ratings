const fs = require('fs')
const path = require('path')

const writeFile = (name, values) => {
    const pathName = path.resolve('./data/' + name + '.json')
    fs.writeFile(pathName, JSON.stringify(values, null, 2), error => {
        if(error) throw error
    })
}

module.exports = { writeFile }