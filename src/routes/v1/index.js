import express from 'express'

const router = express.Router()

router.get('/',(req,res)=>{
res.json({message:"v1 router is working"})
})


export default router