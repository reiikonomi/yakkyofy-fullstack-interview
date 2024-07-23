import { Connection } from 'rabbitmq-client'
import config from './config'
import { Screenshot } from '@interview/models'
import puppeteer from 'puppeteer'
import { connection } from './database'

const rabbit = new Connection(config.RABBIT_MQ)
rabbit.on('error', err => console.error('RabbitMQ connection error', err))
rabbit.on('connection', () => console.info('RabbitMQ Connection successfully (re)established'))

rabbit
  .createConsumer({ queue: 'screenshot' }, async msg => {
    console.log(connection.readyState)
    const screenshot = await Screenshot.findOne({ _id: msg.body.id })

    if (!screenshot) {
      console.error('Screenshot not found')
      return
    }

    await screenshot.updateOne({ status: 'processing' })

    // TODO: comment puppeteer code if using mac, for some reason it doesn't work with silicon processors
    const browser = await puppeteer.launch()

    const page = await browser.newPage()

    await page.goto(msg.body.url)

    const screenshotFile = await page.screenshot({ fullPage: true, encoding: 'binary' })

    await browser.close()

    await screenshot.updateOne({ file: screenshotFile, status: 'done' })

    // TODO: uncomment this code if using mac, for test purposes only
    // const fs = require('fs')
    // const path = require('path')
    // const screenshotFile = fs.readFileSync(path.join(__dirname, 'test.webp'))
  })
  .on('error', err => {
    console.error('consumer error (saturation)', err)
  })

// subscribers
// const subscriber = rabbit.createConsumer({}, (msg) => {})
// subscriber.on('error', err => console.error('consumer error (saturation)', err))

async function onShutdown() {
  // console.info('SIGTERM signal received: closing RabbitMQ connections')
  // await subscriber.close()
  await rabbit.close()
}
process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)
