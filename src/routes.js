import { randomUUID } from 'node:crypto'
import { Database } from "./database.js"
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

let TASKS = []

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { id, title, description, completed_at, created_at, updated_at } = req.body

      const task = {
        id: id === undefined || id === '' ? randomUUID() : id,
        title: title === undefined || title === '' ? new Date() : title,
        description: description === undefined || description === '' ? new Date() : description,
        completed_at: completed_at === undefined || completed_at === '' ? null : completed_at,
        created_at: created_at === undefined || created_at === '' ? new Date() : created_at,
        updated_at: updated_at === undefined || updated_at === '' ? new Date() : updated_at,
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const tasks = database.select('tasks')

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if (id === undefined || id === '') {
        return res.end(JSON.stringify({ message: 'É necessário informar o ID' }))
      }

      if (title === '' || title === null && description === '' || description === null) {
        return res.end(JSON.stringify({
          message: 'Necessário, informar pelo menos um dos atributos - title ou description'
        }))
      }

      const updatedTask = database.findById('tasks', id)

      if (updatedTask === undefined) {
        return res.end(JSON.stringify({ message: 'Tasks não encontrada' }))
      }

      if (title && description) {
        updatedTask.title = title
        updatedTask.description = description

        database.update('tasks', id, {
          title, description, updated_at: new Date(), ...updatedTask
        })

      } else if (title) {
        updatedTask.title = title
        updatedTask.updated_at = new Date()

        database.update('tasks', id, {
          title, updated_at: new Date(), ...updatedTask
        })
      }
      if (description) {
        database.update('tasks', id, {
          description, updated_at: new Date(), ...updatedTask
        })
      }

      return res.end(JSON.stringify())
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const checkTaskExists = database.findById('tasks', id)

      if (checkTaskExists === undefined) {
        return res.end(JSON.stringify({ message: 'Tasks não encontrada' }))
      }

      database.delete('tasks', id)

      return res.end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const checkTaskExists = database.findById('tasks', id)

      if (checkTaskExists === undefined) {
        return res.end(JSON.stringify({ message: 'Tasks não encontrada' }))
      }


      const taskById = TASKS.find(task => task.id === id)
      const rowIndex = TASKS.findIndex(row => row.id === id)

      console.log(rowIndex)

      if (rowIndex > -1) {
        TASKS[rowIndex] = { id, ...taskById, completed_at: new Date(), updated_at: new Date() }
      }

      return res.end()
    }
  },
]