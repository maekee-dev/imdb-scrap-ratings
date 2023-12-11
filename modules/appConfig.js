module.exports = {
    minRatingsYear: 5,
    minRatingsGenre: 5,
    minRatingsDirector: 5,
    dbWriting: false, // if true need to set MongoDB data in .env file
    puppeteerGui: false, //values: false or "new"
    scrapLimit: 5 //number of page to scrap (1 page 100 ratings); must be int
}