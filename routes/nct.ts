import express, { NextFunction, Request, Response } from 'express'
import NCT from '../vendors/nhaccuatui/api'
const NCTGraph = require('../vendors/nhaccuatui/graph')
const router = express.Router()

const nct = new NCT()
const nctGraph = new NCTGraph()

router.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin','*')
    next()
})

router.get('/song/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const song_data = await nct.getSong(req.params.id)
        res.json(song_data)
    }
    catch(err) {
        next(err)
    }
})

router.get('/playlist/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const playlist_data = await nct.getPlaylist(req.params.id)
        res.json(playlist_data)    
    }
    catch(err) {
        next(err)
    }
})

router.get('/lyric/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lyric_data = await nct.getLyric(req.params.id)
        res.json(lyric_data)
    }
    catch(err) {
        next(err)
    }
})

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query, limit }: any = req.query
        const search_data = await nct.search(query, limit)
        res.json(search_data)
    }
    catch(err) {
        next(err)
    }
})

export default router