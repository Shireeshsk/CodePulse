import {pool} from '../../config/database.js'

export const createTestCases = async (req,res)=>{
    const client = await pool.connect()
    try{
        const {problem_id,input,output,visibility} = req.body;
        await client.query('BEGIN')
        const {rows} = await client.query(`INSERT INTO test_cases(problem_id,input,output,visibility) 
            values($1,$2,$3,$4) RETURNING *`,[problem_id,input,output,visibility]
        )
        await client.query('COMMIT')
        return res.status(200).json(rows[0])
    }catch(err){
        await client.query('ROLLBACK')
        console.log(err)
        return res.status(500).json({message:'Internal Server Error'})
    }
    finally{
        client.release()
    }
}