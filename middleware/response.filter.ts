import { Request, Response } from 'express'

export default (request: Request, response: Response, next: Function) => {
    const expressJSON = response.json
    try {
        response.json = (data: any) => {
            return expressJSON.call(response, {
                success : response.statusCode == 200 ? true : false,
                statusCode: response.statusCode,
                data: data
            })
        }
        next()
    } catch (error: unknown) {
        next(error)
    }
}