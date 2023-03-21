import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ref, get, child } from 'firebase/database'

import { Header } from '../../components/Header'
import { Navigator } from '../../components/Navigator'

import { database } from '../../services/firebase'

import { MerchantData } from '../api/subscribe'

import styles from './styles.module.scss'

export default function MerchantId() {
    const { data: session } = useSession()
    const router = useRouter()

    const [merchantData, setMerchantData] = useState<MerchantData>({} as MerchantData)

    const handleGetMerchantData = async (merchant_id: string | unknown) => {
        const dbRef = ref(database)
        await get(child(dbRef, `merchant/${merchant_id}/merchant_data`)).then((snapshot) => {
            if(snapshot.exists()) {
                console.log(snapshot.val())
                setMerchantData(snapshot.val())
            }
        })
    }
    
    useEffect(() => {
        if(!session) {
            router.push('/')
            return
        }
        handleGetMerchantData(session?.merchant_id)
    }, [session])

    return (
        <>
            <Head>
                <title>OpenPOS - { merchantData?.merchant_name }</title>
            </Head>

            <Header merchantName={merchantData?.merchant_name} />
            <Navigator isHomeActive />

            <main className={styles.container}>
                <div className={styles.contentContainer}>
                    <h2>Hoje</h2>
                    <div className={styles.box}>
                        <div>
                            <span>Volume bruto</span>
                            <h2>R$ </h2>
                        </div>
                        <div>
                            <span>Vendas</span>
                            <h2></h2>
                        </div>
                        <div>
                            <span>Estoque</span>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}