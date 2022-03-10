import express from 'express'
import ZingMP3 from '../vendors/zingmp3/api'
const router = express.Router()

const zing = new ZingMP3()
router.get('/playlist/:id', async (req: any, res: any) => {
    
})

export default router