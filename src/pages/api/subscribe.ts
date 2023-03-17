import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { get, child, ref } from 'firebase/database'

import { database } from '../../services/firebase'
import { useRouter } from 'next/router'

export interface MerchantData {
    merchant_name: string,
    description: string,
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST') {
        const session = await getSession({ req })

        const merchantRef = ref(database)

        let merchantData: MerchantData
        let account_id: string
        let onboarding_url: string

        await get(child(merchantRef, `merchant/${session?.merchant_id}/merchant_data`)).then((snapshot) => {
            if(snapshot.exists()) {
                merchantData = snapshot.val()
            }
        })

        return res.status(200).json({ merchant_id: session?.merchant_id })
    }else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}