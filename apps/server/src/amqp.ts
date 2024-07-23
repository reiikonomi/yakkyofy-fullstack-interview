import { Connection } from 'rabbitmq-client'
import config from './config'

const rabbit = new Connection(config.RABBIT_MQ)
rabbit.on('error', err => console.error('RabbitMQ connection error', err))
rabbit.on('connection', () => console.info('Connection successfully (re)established'))

const publisher = rabbit.createPublisher({
  queues: [
    {
      queue: 'screenshot'
    }
  ]
})

async function onShutdown() {
  console.info('SIGTERM signal received: closing RabbitMQ connections')
  // Waits for pending confirmations and closes the underlying Channel
  // await publisher.close()
  await rabbit.close()
}
process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)

export { rabbit, publisher }
