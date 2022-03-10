import { Request, Response, NextFunction } from 'express'

export const ErrorMiddleware =  (err: Error, req: Request, res: Response, next: NextFunction) => {
    const { message } = err
    const statusCode = 500
    res.status(statusCode).json({
      message
    })
}