import express from 'express'
import authRoutes from './routes/authRoutes'



const app = express()

// middle wares
app.use(express.json())


// Routes
app.use('/auth',authRoutes)

export default app