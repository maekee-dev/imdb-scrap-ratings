const write = require('./writeFile')

const analyzeRating = films => {
    const ratingsName = ['G', 'PG', 'PG-13', 'R', 'NC-17']
    const ratingsList = []
    const ratingCount = Array(5).fill(0)
    ratingsName.forEach(ratingName => {
        ratingsList.push({
            MDAA: ratingName,
            ratingsSum: 0,
            ratingsNum: 0,
            ratingsAverage: 0,
            films: []
        })
    })
    films.forEach(film => {
        for(let i = 0; i < ratingsName.length; i++){
            if(film.MPAA == ratingsName[i]){
                ratingCount[i]++
                ratingsList[i].ratingsSum += film.userRating
                ratingsList[i].ratingsNum++
                ratingsList[i].ratingsAverage = (ratingsList[i].ratingsSum / ratingsList[i].ratingsNum).toFixed(2)
                ratingsList[i].films.push(film.title)
            }
        }
    })
    write.writeFile('analyzed/mdaa', ratingsList)
    ratingsName.forEach((ratingName, i) => {
        console.log('[#] Films rated ' + ratingName + ': ' + ratingCount[i])
    })
}


const analyzeDifference = films => {
    let differencesList = []
    let maxValue = 0
    let maxValuesTitles = []
    let minValue = 10
    let minValuesTitles = []
    films.forEach(film => {
        let difference = Math.abs(film.imdbRating - film.userRating)
        if(difference >= maxValue){
            if(difference == maxValue){
                maxValuesTitles.push(film.title)
            }else {
                maxValuesTitles.length = 0
                maxValuesTitles.push(film.title)
            }
            maxValue = difference
        }
        if(difference <= minValue){
            if(difference == minValue){
                minValuesTitles.push(film.title)
            }else {
                minValuesTitles.length = 0
                minValuesTitles.push(film.title)
            }
            minValue = difference
        }
        differencesList.push({
            title: film.title,
            ratingDifference: difference.toFixed(2)
        })
    })
    maxValue = maxValue.toFixed(2)
    minValue = minValue.toFixed(2)
    console.log('[#] Max Ratings Difference: ' + maxValue + ' (' + maxValuesTitles.join(', ') + ')')
    console.log('[#] Min Ratings Difference: ' + minValue + ' (' + minValuesTitles.join(', ') + ')')
    write.writeFile('analyzed/difference', differencesList)
    return({
        'maxDifferences': [maxValue, maxValuesTitles],
        'minDifferences': [minValue, minValuesTitles]
    })
}

const analyzeReviews = films => {
    const reviews = [[], [], [], [], []];
    films.forEach(film => {
        const index = film.userRating < 4 ? 0 : film.userRating < 6 ? 1 : film.userRating < 8 ? 2 : film.userRating <= 9 ? 3 : 4;
        reviews[index].push({ title: film.title, userRating: film.userRating });
    })
    for (let i = 0; i < 5; i++) reviews[i].sort((a, b) => b.userRating - a.userRating)
    const fileNames = ['1_awful', '2_bad', '3_ok', '4_beautiful', '5_perfect']
    reviews.forEach((review, index) => write.writeFile(`split/${fileNames[index]}`, review))
    const consoleNames = ['0-3 (Awful): ', '4-5 (Bad): ', '6-7 (Ok): ', '8-9 (Beautiful): ', '10 (Perfect): ']
    for(let i = 0; i < 5; i++) console.log('[#] Films rated ' + consoleNames[i] + reviews[i].length)
}

module.exports = { analyzeRating, analyzeDifference, analyzeReviews }