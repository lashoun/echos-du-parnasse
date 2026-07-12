import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const s = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)
const { data } = await s.from('tags').select('*, poem_tags(count)')
console.log(JSON.stringify(data, null, 2))
