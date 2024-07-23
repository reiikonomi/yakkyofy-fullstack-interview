import { Connection } from 'rabbitmq-client'
import config from './config'

const rabbit = new Connection(config.RABBIT_MQ)
rabbit.on('error', err => console.error('RabbitMQ connection error', err))
rabbit.on('connection', () => console.info('RabbitMQ Connection successfully (re)established'))

rabbit
  .createConsumer({ queue: 'screenshot' }, msg => {
    console.log('Received message', msg)
  })
  .on('error', err => console.error('consumer error (saturation)', err))

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
