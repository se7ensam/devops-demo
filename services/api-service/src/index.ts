import express from 'express';
import type {Request,Response} from 'express'

const app = express();
const PORT = process.env.PORT||3000;

//api - landing
app.get('/',(req:Request,res:Response)=>{
    res.json({
        message:"Hello from AWS ECS",
        timestamp:new Date().toISOString()
    })
})

//api - healthcheck
app.get('/health', (req:Request, res:Response)=>{
    res.status(200).send('ok')
})
app.use(express.json());


app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}`)
})