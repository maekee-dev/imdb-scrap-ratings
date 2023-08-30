const appConfig = require('./appConfig.js')
const write = require('./writeFile.js')

const getBest = (items, analysis) => {
    let maxValue = 0
    let minRating
    let bestValues = []
    switch (analysis) {
        case 'year':
            minRating = appConfig.minRatingsYear
            break;
        case 'genre':
            minRating = appConfig.minRatingsGenre
            break;
        case 'director':
            minRating = appConfig.minRatingsDirector
            break;
        default:
            minRating = 1
            break;
    }
    items.forEach(item => {
        item.ratingsAverage = Number(item.ratingsAverage.toFixed(2))
        if(item.ratingsAverage >= maxValue && item.ratingsNum >= minRating){
            if(item.ratingsAverage == maxValue){
                bestValues.push(item[Object.keys(item)[0]])
            }else {
                bestValues.length = 0
                bestValues.push(item[Object.keys(item)[0]])
            }
            maxValue = item.ratingsAverage
        }
    })
    return [bestValues, maxValue]
}

const analyzeYear = films => {
    let years = []
    let yearsList = []
    films.forEach(film => {
        if(years.includes(film.year)){
            yearsList.forEach(objectItem => {
                if(objectItem.year == film.year){
                    objectItem.ratingsSum += film.userRating
                    objectItem.ratingsNum++
                    objectItem.ratingsAverage = objectItem.ratingsSum / objectItem.ratingsNum
                    objectItem.films.push(film.title)
                }
            })
        }else {
            years.push(film.year)
            yearsList.push({
                year: film.year,
                ratingsSum: film.userRating,
                ratingsNum: 1,
                ratingsAverage: film.userRating,
                films: [film.title]
            })
        }
    })
    const bestValue = getBest(yearsList, 'year')
    console.log('[#] Best Year: ' + bestValue[0] + ' (' + bestValue[1] +  ' as ratings average, with a minimum of ' + appConfig.minRatingsYear + ' ratings)')
    yearsList.sort((a, b) => b.year - a.year)
    write.writeFile('analyzed/year', yearsList)
    return [bestValue[0][0], bestValue[1]]
}

const analyzeDirector = films => {
    let directors = []
    let directorsList = []
    films.forEach(film => {
        film.director.forEach(director => {
            if(directors.includes(director)){
                directorsList.forEach(objectItem => {
                    if(objectItem.director == director){
                        objectItem.ratingsSum += film.userRating
                        objectItem.ratingsNum++
                        objectItem.ratingsAverage = objectItem.ratingsSum / objectItem.ratingsNum
                        objectItem.films.push(film.title)
                    }
                })
            }else {
                directors.push(director)
                directorsList.push({
                    director: director,
                    ratingsSum: film.userRating,
                    ratingsNum: 1,
                    ratingsAverage: film.userRating,
                    films: [film.title]
                })
            }
        })
    })
    const bestValue = getBest(directorsList, 'director')
    console.log('[#] Best Director/s: ' + bestValue[0] + ' (' + bestValue[1] +  ' as ratings average, with a minimum of ' + appConfig.minRatingsDirector + ' ratings)')
    directorsList.sort((a, b) => b.ratingsAverage - a.ratingsAverage)
    write.writeFile('analyzed/director', directorsList)
    return [bestValue[0][0], bestValue[1]]
}

const analyzeGenre = films => {
    let genres = []
    let genresList = []
    films.forEach(film => {
        film.genres.forEach(genre => {
            if(genres.includes(genre)){
                genresList.forEach(objectItem => {
                    if(objectItem.genre == genre){
                        objectItem.ratingsSum += film.userRating
                        objectItem.ratingsNum++
                        objectItem.ratingsAverage = objectItem.ratingsSum / objectItem.ratingsNum
                        objectItem.films.push(film.title)
                    }
                })
            }else {
                genres.push(genre)
                genresList.push({
                    genre: genre,
                    ratingsSum: film.userRating,
                    ratingsNum: 1,
                    ratingsAverage: film.userRating,
                    films: [film.title]
                })
            }
        })
    })
    const bestValue = getBest(genresList, 'genre')
    console.log('[#] Best Genre: ' + bestValue[0] + ' (' + bestValue[1] +  ' as ratings average, with a minimum of ' + appConfig.minRatingsYear + ' ratings)')
    write.writeFile('analyzed/genre', genresList)
    return [bestValue[0][0], bestValue[1]]
}

module.exports = { analyzeYear, analyzeDirector, analyzeGenre }