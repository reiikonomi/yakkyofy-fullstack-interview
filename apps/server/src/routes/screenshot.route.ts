import { Router } from 'express'
import Joi from 'joi'
import { Screenshot } from '@interview/models'
import { publisher } from '../amqp'

const router = Router()

router.post('/create', async (req, res) => {
  try {
    const schema = Joi.object({
      url: Joi.string().uri().required()
    })

    const { error } = schema.validate(req.body)

    if (error) {
      return res.status(400).send(error.details[0].message)
    }

    const screenshot = new Screenshot({
      url: req.body.url,
      file: req.body.file,
      status: 'queued'
    })

    try {
      await screenshot.save()
      await publisher.send('screenshot', { id: screenshot._id, url: screenshot.url })
      res.status(201).send({
        message: 'Success',
        status: 201,
        data: {
          url: screenshot.url,
          id: screenshot._id
        }
      })
    } catch (error: any) {
      res.status(500).send(error.message)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/get/:id', async (req, res) => {
  try {
    const screenshot = await Screenshot.findById(req.params.id)
    if (!screenshot) {
      return res.status(404).send('Screenshot not found')
    }
    res.send(screenshot)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/list', async (req, res) => {
  try {
    const screenshots = await Screenshot.find()
    res.send(screenshots)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
