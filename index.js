const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const dotenv = require('dotenv')

const appConfig = require('./modules/appConfig.js')
const write = require('./modules/writeFile.js')
const primaryAnalysis = require('./modules/primaryAnalysis.js')
const secondaryAnalysis = require('./modules/secondaryAnalysis.js')
const database = require('./modules/database/module.js')

dotenv.config()

puppeteer.use(StealthPlugin())
const url = 'https://www.imdb.com/user/' + process.env.USERID + '/ratings?sort=date_added'

const scrapData = async() => {
    console.log('[#] Loading page')
    const browser = await puppeteer.launch({ headless: appConfig.puppeteerGui })
    const page = await browser.newPage()
    await page.goto(url)
    let loopControl = true
    let loopIndex = 1
    let filmList = []
    while (loopControl) {
        console.log('[#] Scraping page ' + loopIndex + ' (' + (loopIndex - 1) * 100 + ' -> ' + loopIndex * 100 + ')')
        const ratingsData = await page.evaluate(url => {
            const ratedFilms = Array.from(document.querySelectorAll('.lister-item'))
            const data = ratedFilms.map(film => ({
                title: film.querySelector('.lister-item-header a').innerHTML.trim(),
                movieId: film.querySelector('.lister-item-header a').getAttribute('href').match(/tt(\d+)/)[0],
                genres: film.querySelector('.genre').innerHTML.trim().split(', '),
                director: Object.entries(film.querySelectorAll('.lister-item-content .text-small a'))
                .filter(item => item[1].href.slice(-4,-2) === 'dr')
                .map(item => item[1].innerHTML),
                stars: Object.entries(film.querySelectorAll('.lister-item-content .text-small a'))
                .filter(item => item[1].href.slice(-4,-2) === 'st')
                .map(item => item[1].innerHTML),
                MPAA: film.querySelector('.certificate').innerHTML,
                year: Number(film.querySelector('.lister-item-header .lister-item-year').innerHTML.slice(-5).replace(/[()]/g, '')),
                imdbRating: Number(film.querySelector('.ipl-rating-widget .ipl-rating-star__rating').innerHTML),
                userRating: Number(film.querySelector('.ipl-rating-star--other-user .ipl-rating-star__rating').innerHTML),
            }))
            return data
        }, url)
        for(let i = 0; i < ratingsData.length; i++) filmList.push(ratingsData[i])
        if(ratingsData.length == 100 && loopIndex < appConfig.scrapLimit){
            await page.click('.lister-page-next')
            await page.waitForNavigation({ waitUntil: 'networkidle2' })
            loopIndex++
        }else{
            loopControl = false
            if(loopIndex == appConfig.scrapLimit) console.log('[#] Reached Limit (' + appConfig.scrapLimit +'00 films)')
        } 
    }   
    await browser.close()
    console.log('[#] Scraped ' + filmList.length + ' items\n')
    write.writeFile('movies', filmList)
    const generalData = {
        'bestYear': primaryAnalysis.analyzeYear(filmList),
        'bestGenre': primaryAnalysis.analyzeGenre(filmList),
        'bestDirector': primaryAnalysis.analyzeDirector(filmList),
        'differences': secondaryAnalysis.analyzeDifference(filmList)
    }
    secondaryAnalysis.analyzeRating(filmList)
    secondaryAnalysis.analyzeReviews(filmList)
    write.writeFile('general', generalData)
    if(appConfig.dbWriting){
        console.log('\n[#] Connecting to database')
        await database.writeData(filmList)
        await database.updateGeneral(generalData)
        console.log('[#] Writing completed')
    }
}

console.log('[#] This app execute some basic analysis based on your IMDb ratings')
console.log('[#] Limit number set to ' + appConfig.scrapLimit * 100 + ' films')
console.log('[#] Scraping is executed from the most recent ratings\n')
console.log('[#] Process started:')
scrapData().then( () => {
    console.log('\n[#] Process terminated')
    console.log("[#] Data written in ./data/\n")
})