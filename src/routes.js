import { Database } from './database.js'
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query
      const tasks = database.select(
        'tasks',
        search ? { title: search, description: search } : null,
      )
      return res.end(JSON.stringify(tasks))
    },
  },

  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title is required' }),
        )
      }

      if (!description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'description is required' })
        )
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
        completed: false,
      }

      database.insert('tasks', task)
      return res.writeHead(201).end()
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const task = database.getById('tasks', id)
      if (!task) {
        return res.writeHead(400).end(JSON.stringify({ error: 8888, message: 'Id is missing' }))
      }

      database.delete('tasks', id)
      return res.writeHead(204).end()
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.getById('tasks', id)
      if (!task) {
        return res.writeHead(400).end(JSON.stringify({ error: 8888, message: 'Id is missing' }))
      }

      task.updated_at = new Date()
      task.title = req.body.title
      task.description = req.body.description

      database.update('tasks', id, task)

      return res.writeHead(204).end()
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params
      const task = database.getById('tasks', id)
      if (!task) {
        return res.writeHead(400).end(JSON.stringify({ error: 8888, message: 'Id is missing' }))
      }

      if (req.body.completed) task.completed_at = new Date()
      else task.completed_at = null

      task.completed = req.body.completed
      task.updated_at = new Date()

      database.update('tasks', id, task)

      return res.writeHead(204).end()
    },
  },
]