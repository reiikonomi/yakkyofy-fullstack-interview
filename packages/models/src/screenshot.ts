import { Schema, model } from 'mongoose'

import { IScreenshot } from '@interview/types/models/screenshot'

const screenshotSchema = new Schema<IScreenshot>(
  {
    url: { type: String, required: true },
    file: { type: Buffer, required: false, default: null },
    status: { type: String, enum: ['queued', 'processing', 'done'], default: 'queued' }
  },
  { timestamps: true }
)

export default model<IScreenshot>('Screenshot', screenshotSchema)
