const puppeteer = require("puppeteer")
const http = require('http')
const port = process.env.PORT | 3000

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const explore = async () => {
    const browser = await puppeteer.launch({
        headless: true
    })
    const page = await browser.newPage()
    await page.setCacheEnabled(true)
    await page.goto(`https://twitter.com/i/trends`,  {"waitUntil" : "networkidle2"})
    .catch(e => {})
    const trends = await page.evaluate(async function() {
        const timeline = await document.querySelector('section[aria-labelledby="accessible-list-0"][role="region"]')
        var trends = []
        if(timeline) {
            let trend_container = timeline.querySelectorAll('div[role="link"] > div')
            trend_container.forEach(div => {
                let position = div.querySelector('span:nth-child(1)')
                let text = div.querySelector('div[dir="ltr"]')
                let total_tweets = text.nextElementSibling
                let category = div.querySelector('div:nth-child(3)')
                trends.push({
                    "position": position.textContent,
                    "category": category.textContent,
                    "text": text.querySelector('span').textContent,
                    "total_tweets": total_tweets.textContent
                })
            })
        }
        return trends
    })
  
    await browser.close()
    return trends
}

var app = http.createServer(async function(req,res){
    const explores = await explore()
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(explores))
})


var server = app.listen(port, () => {
    var host = server.address().address
    console.log('Server running on http://%s:%s', host, port)
})