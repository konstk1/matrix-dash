import * as fs from 'fs'
import * as path from 'path'

export async function sleepMs(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function readTestDataFile(filename: string): string {
  const filePath = path.join(__dirname, 'data', filename)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  return fileContent
}
