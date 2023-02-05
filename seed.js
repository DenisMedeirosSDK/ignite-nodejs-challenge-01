import { parse } from 'csv-parse'
import fs from 'node:fs'

const tasksCSV = new URL('./tasks.csv', import.meta.url)
const stream = fs.createReadStream(tasksCSV)
const csvParse = parse({ delimiter: ',', fromLine: 2 })

async function run() {
  const rowParse = stream.pipe(csvParse)

  for await (const chunk of rowParse) {
    const [id, title, description, completed_at, created_at, updated_at] = chunk

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id, title, description, completed_at, created_at, updated_at
      })
    })

    console.log(id, title, description, completed_at, created_at, updated_at)
  }
}

run()