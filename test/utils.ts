import * as fs from 'fs'
import * as path from 'path'

export function readTestDataFile(filename: string): string {
  const filePath = path.join(__dirname, 'data', filename)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  return fileContent
}
