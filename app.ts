import express, { NextFunction, Request, Response } from 'express'
const morgan = require('morgan')

import ResponseFilterMiddleware from './middleware/response.filter'
import { ErrorMiddleware } from './middleware/error.filter'

import nctRouter from './routes/nct'

const app = express()
const port = 8080

app.use(morgan('combined'))
app.use(ResponseFilterMiddleware)


app.get('/', (req: Request, res: Response, next: NextFunction) => {
    next(new Error('error'))
})

app.use('/nct', nctRouter)


app.use(ErrorMiddleware)

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
})