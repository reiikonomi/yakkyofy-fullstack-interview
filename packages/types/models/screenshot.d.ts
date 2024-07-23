import { ITimestamps } from './base'

export interface IScreenshot extends ITimestamps {
  url: string
  file: Buffer
  status: 'queued' | 'processing' | 'done'
}
