import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ref, get, child } from 'firebase/database'
import { FiDollarSign, FiArchive, FiInbox, FiFileText } from 'react-icons/fi'

import { Header } from '../../components/Header'
import { Navigator } from '../../components/Navigator'
import Box from '../../components/Box'
import SalePercentage from '../../components/SalePercentage'
import SaleItem from '../../components/SaleItem'

import { database } from '../../services/firebase'

import { MerchantData } from '../api/subscribe'

import styles from './styles.module.scss'

interface SaleType {
    id: string,
    name: string,
    quantity: string,
    cost: string,
    margin: string,
    total: string,
    date: string,
    paymentMethod: string,
    change: number
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

interface Categories {
    name: string;
}

export default function MerchantId() {
    const { data: session } = useSession()
    const router = useRouter()

    const [merchantData, setMerchantData] = useState<MerchantData>({} as MerchantData)
    const [firebaseProduct, setFirebaseProduct] = useState<ProductType[]>([])
    const [todaySales, setTodaySales] = useState<SaleType[]>([])
    const [yesterdaySales, setYesterdaySales] = useState<SaleType[]>([])
    const [totalSale, setTotalSale] = useState(0)
    const [totalLiquidSale, setTotalLiquidSale] = useState(0)
    const [yesterdayTotalSale, setYesterdayTotalSale] = useState(0)
    const [yesterdayLiquidSale, setYesterdayLiquidSale] = useState(0)
    const [categories, setCategories] = useState<Categories[]>([])


    const handleGetGrossVolume = () => {
        var sum = 0
        var yesSum = 0

        for(var i = 0; i < todaySales.length; i++) {
            sum += Number(todaySales[i].total)
        }

        for(var i = 0; i < yesterdaySales.length; i++) {
            yesSum += Number(yesterdaySales[i].total)
        }

        setTotalSale(sum)
        setYesterdayTotalSale(yesSum)

        return totalSale
    }

    const handleGetLiquidVolume = () => {
        var sum = 0
        var yesSum = 0

        for(var i = 0; i < todaySales.length; i++) {
            let totalProfit = Number(todaySales[i].total) * (Number(todaySales[i].margin)/100)
            sum += totalProfit
        }

        for(var i = 0; i < yesterdaySales.length; i++) {
            let totalProfit = Number(yesterdaySales[i].total) * (Number(yesterdaySales[i].margin)/100)
            yesSum += totalProfit
        }

        setTotalLiquidSale(sum)
        setYesterdayLiquidSale(yesSum)

        return totalSale
    }

    const getYesterday = (dateOnly: boolean) => {
        let d = new Date();
        d.setDate(d.getDate() - 1);
        return dateOnly ? new Date(d).toDateString() : d;
    }

    const calculatePercentage = (first: number, second: number) => {
        var fullValue = parseFloat(String(first));
        var partialValue = parseFloat(String(second));
       
        var percentageIncrease =  ((partialValue - fullValue) / fullValue) * 100

        if(fullValue === 0 && partialValue === 0) {
            return 0
        }

        if(fullValue === 0) {
            return 100
        }

        return percentageIncrease.toFixed(2)
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
                        cost: value.cost,
                        margin: value.margin,
                        total: value.total,
                        date: value.date,
                        paymentMethod: value.paymentMethod,
                        change: value.change
                    }
                })

                
                let todayDate = new Date()
                
                const offset = todayDate.getTimezoneOffset()
                
                todayDate = new Date(todayDate.getTime() - (offset*60*1000))
                
                let todayDateToString = todayDate.toISOString().split('T')[0].toString()
                
                let todaySale: SaleType[] = parsedData.filter(d => d.date.includes(todayDateToString))
                
                console.log('passou aqui >>', todaySale)
                //Yesterday
                let yesterdayDate = new Date(getYesterday(true))
                const yesterdayOffset = yesterdayDate.getTimezoneOffset()
                yesterdayDate = new Date(yesterdayDate.getTime() - (yesterdayOffset*60*1000))
                
                let yesterdayDateToString = yesterdayDate.toISOString().split('T')[0].toString()
                let yesterdaySale: SaleType[] = parsedData.filter(d => d.date.includes(yesterdayDateToString))

                setTodaySales(todaySale.reverse())
                setYesterdaySales(yesterdaySale.reverse())
                handleGetGrossVolume()
                handleGetLiquidVolume()
            }else {
                setTodaySales([])
                handleGetGrossVolume()
                handleGetLiquidVolume()
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

    const handleGetMerchantCategories = async (merchant_id: string | unknown) => {
        const dbRef = ref(database)
        await get(child(dbRef, `merchant/${merchant_id}/categories`)).then((snapshot) => {
            if(snapshot.exists()) {
                const firebaseCategories: Categories[] = snapshot.val() ?? {}
                const parsedData = Object.entries(firebaseCategories).map(([key, value]) => {
                    return {
                        name: value.name
                    }
                })
                setCategories(parsedData)
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
        handleGetMerchantCategories(session?.merchant_id)
        handleGetTodaySales(session?.merchant_id)
        handleGetGrossVolume()
        handleGetLiquidVolume()
    }, [session])

    useEffect(() => {
        handleGetGrossVolume()
        handleGetLiquidVolume()
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
                    <h2>Minhas estatísticas</h2>
                    <br />
                    <div className={styles.statisticsContainer}>
                        <Box title='Hoje'>
                            <div className={styles.boxContent}>
                                <div className={styles.boxItem}>
                                    <div>
                                        <FiDollarSign color='#727E8A' />
                                        <span>Volume bruto</span>
                                    </div>
                                    <div>
                                        <div className={styles.row}>
                                            <h3>{totalSale.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
                                            <SalePercentage value={`${calculatePercentage(yesterdayTotalSale, totalSale)}%`} isUp={Number(calculatePercentage(yesterdayTotalSale, totalSale)) > 0 ? true : false} />
                                        </div>
                                        <span>vs Ontem: <b>{yesterdayTotalSale.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</b></span>
                                    </div>
                                </div>
                                <div className={`${styles.verticalLine} ${styles.hide}`}></div>
                                <div className={`${styles.boxItem} ${styles.hide}`}>
                                    <div>
                                        <FiDollarSign color='#727E8A' />
                                        <span>Volume líquido</span>
                                    </div>
                                    <div>
                                        <div className={styles.row}>
                                            <h3>{totalLiquidSale.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
                                            <SalePercentage value={`${Number(calculatePercentage(yesterdayLiquidSale, totalLiquidSale)) && '+'} ${calculatePercentage(yesterdayLiquidSale, totalLiquidSale)}%`} isUp={Number(calculatePercentage(yesterdayLiquidSale, totalLiquidSale)) > 0 ? true : false} />
                                        </div>
                                        <span>vs Ontem: <b>{yesterdayLiquidSale.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</b></span>
                                    </div>
                                </div>
                                <div className={`${styles.verticalLine} ${styles.hide}`}></div>
                                <div className={`${styles.boxItem} ${styles.hide}`}>
                                    <div>
                                        <FiDollarSign color='#727E8A' />
                                        <span>Total de vendas</span>
                                    </div>
                                    <div>
                                        <div className={styles.row}>
                                            <h3>{todaySales.length}</h3>
                                            <SalePercentage value={`${Number(calculatePercentage(yesterdaySales.length, todaySales.length)) && '+'} ${calculatePercentage(yesterdaySales.length, todaySales.length)}%`} isUp={Number(calculatePercentage(yesterdaySales.length, todaySales.length)) > 0 ? true : false} />
                                        </div>
                                        <span>vs Ontem: <b>{yesterdaySales.length}</b></span>
                                    </div>
                                </div>
                                <div className={`${styles.verticalLine} ${styles.hide}`}></div>
                                <div className={`${styles.boxItem} ${styles.hide}`}>
                                    <div>
                                        <FiArchive color='#727E8A' />
                                        <span>Estoque</span>
                                    </div>
                                    <div>
                                        <h3>{firebaseProduct.length}</h3>
                                        <span>Categorias: <b>{categories.length}</b></span>
                                    </div>
                                </div>
                                <div className={`${styles.verticalLine} ${styles.hide}`}></div>
                                <div className={styles.boxItem}>
                                    <button>
                                        <FiInbox color='#F6F6F6' />
                                        <span>Abrir caixa</span>
                                    </button>
                                    <button>
                                        <FiFileText color='#515357' />
                                        <span>Relatório</span>
                                    </button>
                                </div>
                            </div>
                        </Box>
                        <div className={styles.rowPanel}>
                            <Box title='Avisos'>

                            </Box>

                            <Box title='Últimas vendas'>
                                {
                                    todaySales.length > 0 ?
                                    todaySales.slice(0, 4).map(sale => {
                                        return(
                                            <SaleItem key={sale.id} paymentMethod={sale.paymentMethod} description={sale.name} saleAmount={Number(sale.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} date={
                                                new Date(sale.date).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                            } />
                                        )
                                    }) : <span className={styles.empty}>Nenhuma venda registrada.</span>
                                }
                            </Box>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}