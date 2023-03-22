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

interface SaleType {
    name: string,
    quantity: string,
    total: string,
    date: string
}

interface ProductType {
    code: string;
    description: string;
    inventory: string;
    validity: string;
    cost: string;
    margin: string;
    salePrice: string;
    category: string;
}

export default function MerchantId() {
    const { data: session } = useSession()
    const router = useRouter()

    const [merchantData, setMerchantData] = useState<MerchantData>({} as MerchantData)
    const [firebaseProduct, setFirebaseProduct] = useState<ProductType[]>([])
    const [todaySales, setTodaySales] = useState<SaleType[]>([])
    const [totalSale, setTotalSale] = useState(0)

    const handleGetGrossVolume = () => {
        var sum = 0

        for(var i = 0; i < todaySales.length; i++) {
            sum += Number(todaySales[i].total)
        }

        setTotalSale(sum)

        return totalSale
    }

    const handleGetTodaySales = async (merchant_id: string | unknown) => {
        const dbRef = ref(database)
        await get(child(dbRef, `merchant/${merchant_id}/sales`)).then((snapshot) => {
            if(snapshot.exists()) {
                const data: SaleType[] = snapshot.val() ?? {}
                const parsedData = Object.entries(data).map(([key, value]) => {
                    return {
                        id: key,
                        name: value.name,
                        quantity: value.quantity,
                        total: value.total,
                        date: value.date
                    }
                })

                let todayDate = new Date()
                const offset = todayDate.getTimezoneOffset()
                todayDate = new Date(todayDate.getTime() - (offset*60*1000))
                let todayDateToString = todayDate.toISOString().split('T')[0].toString()

                let todaySale: SaleType[] = parsedData.filter(d => d.id.includes(todayDateToString))

                setTodaySales(todaySale)
                handleGetGrossVolume()
            }else {
                setTodaySales([])
                handleGetGrossVolume()
            }
         })
    }

    const handleGetMerchantData = async (merchant_id: string | unknown) => {
        const dbRef = ref(database)
        await get(child(dbRef, `merchant/${merchant_id}/merchant_data`)).then((snapshot) => {
            if(snapshot.exists()) {
                console.log(snapshot.val())
                setMerchantData(snapshot.val())
            }
        })
    }

    const handleGetMerchantProducts = async (merchant_id: string | unknown) => {
        const dbRef = ref(database)
        await get(child(dbRef, `merchant/${merchant_id}/products`)).then((snapshot) => {
            if(snapshot.exists()) {
                const data: ProductType[] = snapshot.val() ?? {}
                const parsedData = Object.entries(data).map(([key, value]) => {
                    return {
                        code: value.code,
                        description: value.description,
                        inventory: value.inventory,
                        validity: value.validity,
                        cost: value.cost,
                        margin: value.margin,
                        salePrice: value.salePrice,
                        category: value.category
                    }
                })

                setFirebaseProduct(parsedData)
            }else {
                setFirebaseProduct([])
            }
         })
    }
    
    useEffect(() => {
        if(!session) {
            router.push('/')
            return
        }

        handleGetMerchantData(session?.merchant_id)
        handleGetMerchantProducts(session?.merchant_id)
        handleGetTodaySales(session?.merchant_id)
        handleGetGrossVolume()
    }, [session])

    useEffect(() => {
        handleGetGrossVolume()
    }, [todaySales])

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
                            <h2>R$ {Math.floor(totalSale).toString().replace('.', ',')}</h2>
                        </div>
                        <div>
                            <span>Vendas</span>
                            <h2>{todaySales.length}</h2>
                        </div>
                        <div>
                            <span>Estoque</span>
                            <h2>{firebaseProduct.length}</h2>
                        </div>
                    </div>
                    <h2>Ultimas transações</h2>
                </div>
            </main>
        </>
    )
}