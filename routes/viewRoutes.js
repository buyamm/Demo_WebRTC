import { Router } from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))

// Handle incoming http request
app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'app', 'login.html'))
})

app.get('/remote_screen', (req, res) => {
  res.sendFile(join(__dirname, 'app', 'remote_screen.html'))
})

app.get('/driver_summary', (req, res) => {
  res.sendFile(join(__dirname, 'app', 'driver_summary.html'))
})

export default router
