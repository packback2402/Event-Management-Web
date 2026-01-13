import express from "express"
import cors from "cors"
import morgan from "morgan"
import { errorHandler } from "./middleware/auth.middleware"
import { authRouter } from "./routes/auth.route"
import { userRouter } from "./routes/user.route"
import { adminRouter } from "./routes/admin.route"

export const app = express()

// Trust proxy - quan trọng khi chạy sau nginx và Cloudflare
// Cho phép Express nhận đúng IP và protocol từ X-Forwarded-* headers
app.set('trust proxy', true)

// CORS configuration to support HTTPS frontend
// Dynamic origin function để hỗ trợ cả HTTP và HTTPS từ Cloudflare
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (như mobile apps hoặc Postman)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'https://nhihoangf.id.vn',
      'http://nhihoangf.id.vn',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite dev server
    ]
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan("dev"))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)

app.use(errorHandler)



