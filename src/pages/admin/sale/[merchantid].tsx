import { useEffect, useState } from 'react'
import Head from 'next/head'
import { child, get, push, ref, set, update } from 'firebase/database'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import toast, { Toaster, ToasterProps } from 'react-hot-toast'
import { FiCreditCard, FiDollarSign, FiSearch, FiTrash } from 'react-icons/fi'

import { Header } from '../../../components/Header'
import { Navigator } from '../../../components/Navigator'
import Box from '../../../components/Box'
import SaleItem from '../../../components/SaleItem'

import { database } from '../../../services/firebase'

import { moneyMask } from '../../../utils/itemMask'

import { MerchantData } from '../../api/subscribe'

import styles from './sale.module.scss'

interface Products {
    code: string;
    description: string;
    inventory: string;
    validity: string;
    cost: string;
    margin: string;
    salePrice: string;
    category: string;
}

interface Sale {
    code: string;
    description: string;
    inventory: string;
    validity: string;
    cost: string;
    margin: string;
    salePrice: string;
    category: string;
    quantity: string;
    date: Date
}

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

export default function MerchantId({ session }) {
    const router = useRouter()

    const [merchantData, setMerchantData] = useState<MerchantData>({} as MerchantData)
    const [filteredValue, setFilteredValue] = useState('')
    const [quantity, setQuantity] = useState(0)
    const [firebaseProduct, setFirebaseProduct] = useState<Products[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Products>({} as Products)
    const [productCode, setProductCode] = useState('')
    const [todaySale, setTodaySale] = useState<Sale[]>([])
    const [todaySales, setTodaySales] = useState<SaleType[]>([])
    const [totalSale, setTotalSale] = useState(0)
    const [selectedMethod, setSelectedMethod] = useState('')
    const [cashAmount, setCashAmount] = useState('')

    const increaseQuantity = () => {
        if(selectedProduct !== null) {
            (quantity < Number(selectedProduct.inventory)) && setQuantity(quantity + 1)
        }else {
            setQuantity(quantity + 1)
        }
    }

    const decreaseQuantity = () => (quantity !== 0) && setQuantity(quantity - 1)

    const handleSelectProduct = (code: string) => {
        setSelectedProduct(firebaseProduct.filter(p => p.code === code)[0])
        setProductCode(code)
    }

    const saleTotal = () => {
        let filter = Object.entries(todaySale).map(([key, value]) => {
            return {
                total: Number(value.salePrice.replace(',', '.')) * Number(value.quantity)
            }
        })

        var sum = 0

        for(var i = 0; i < filter.length; i++) {
            sum += filter[i].total
        }

        setTotalSale(sum)
    }

    const filteredProducts = firebaseProduct.filter(p => p.description.toLowerCase().includes(filteredValue.toLowerCase()))
        .map(p => {
            return(
                <>
                    <button key={p.code} onClick={() => handleSelectProduct(p.code)} className={`${styles.selectable} ${productCode === p.code && styles.active}`}>{p.description}</button>
                </>
            )
        })

    const handleSelectPaymentMethod = (method: string) => {
        switch(method) {
            case 'credit':
                setSelectedMethod('credit')
                break
            case 'debit':
                setSelectedMethod('debit')
                break
            case 'cash':
                setSelectedMethod('cash')
                break
        }
    }

    const handleAddSale = () => {
        let sale = {
            code: selectedProduct.code,
            description: selectedProduct.description,
            inventory: selectedProduct.inventory,
            validity: selectedProduct.validity,
            cost: selectedProduct.cost,
            margin: selectedProduct.margin,
            salePrice: selectedProduct.salePrice,
            category: selectedProduct.category,
            quantity: String(quantity),
            date: new Date()
        }

        if(filteredValue.length <= 0 || filteredProducts.length <= 0) {
            return toast.error('Selecione um produto antes.', {
                style: {
                  border: '1px solid #AF9C6A',
                  padding: '16px',
                  color: '#BB9D58',
                  background: '#FFFBEC'
                },
                iconTheme: {
                  primary: '#FDEFC8',
                  secondary: '#BB9D58',
                },
            })
        }

        if(quantity === 0) {
            return toast.error('Informe uma quantidade mínima', {
                style: {
                  border: '1px solid #AF9C6A',
                  padding: '16px',
                  color: '#BB9D58',
                  background: '#FFFBEC'
                },
                iconTheme: {
                  primary: '#FDEFC8',
                  secondary: '#BB9D58',
                },
            })
        }

        setTodaySale([...todaySale, sale])
        saleTotal()
        setSelectedProduct({} as Products)
        setFilteredValue('')
        setProductCode('')
        setQuantity(0)
    }

    function removeItemOnce(arr: Sale[], value: Sale) {
        var index = arr.indexOf(value)
        if (index > -1) {
          arr.splice(index, 1)
        }else {
            arr.pop()
        }
        setTodaySale([...arr])
        saleTotal()
    }

    const handleCreateSale = async () => {
        if(todaySale.length === 0) {
            return toast.error('Crie pelo menos uma venda', {
                style: {
                  border: '1px solid #713133',
                  padding: '16px',
                  color: '#842B2C',
                  background: '#FFEEED'
                },
                iconTheme: {
                  primary: '#FBCDCE',
                  secondary: '#842B2C',
                },
            })
        }

        todaySale.map(async s => {
            await update(ref(database, `merchant/${session?.merchant_id}/products/${s.code}`), {
                inventory: Number(s.inventory) - Number(s.quantity)
            })

            await push(ref(database, `merchant/${session?.merchant_id}/sales/`), {
                name: s.description,
                quantity: s.quantity,
                cost: s.cost,
                margin: s.margin,
                total: (Number(s.salePrice.replace(',', '.')) * Number(s.quantity)).toString(),
                date: new Date().toJSON().toString(),
                paymentMethod: selectedMethod,
                change: (Number(cashAmount.replace('.', '').replace(',', '.'))) - (Number(s.salePrice.replace('.', '').replace(',', '.')) * Number(s.quantity))
            })
        })

        setTodaySale([])
        setSelectedMethod('')
        setCashAmount('')

        handleGetTodaySales(session?.merchant_id)

        return toast.success('Venda cadastrada com sucesso!', {
            style: {
                border: '1px solid #457E6F',
                padding: '16px',
                color: '#316C5B',
                background: '#F0FCF6'
            },
            iconTheme: {
                primary: '#C7F8E3',
                secondary: '#316C5B',
            },
        })
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

                console.log('Updated value >>', parsedData)

                let todayDate = new Date()
                const offset = todayDate.getTimezoneOffset()
                todayDate = new Date(todayDate.getTime() - (offset*60*1000))
                let todayDateToString = todayDate.toISOString().split('T')[0].toString()

                let todaySale: SaleType[] = parsedData.filter(d => d.date.includes(todayDateToString))

                setTodaySales(todaySale.reverse())
            }else {
                setTodaySales([])
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
                const data: Products[] = snapshot.val() ?? {}
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
            }
         })
    }

    useEffect(() => {
        if(!session?.user) {
            router.push('/')
            return
        }
        handleGetMerchantData(session?.merchant_id)
        handleGetMerchantProducts(session?.merchant_id)
        handleGetTodaySales(session?.merchant_id)
    }, [session])

    useEffect(() => {
        saleTotal()
    }, [todaySale])

    return(
        <>
            <Head>
                <title>OpenPOS - {merchantData?.merchant_name}</title>
            </Head>

            <Header merchantName={merchantData?.merchant_name} />
            <Navigator isSaleActive />

            <Toaster position="bottom-right" reverseOrder={false} />

            <main className={styles.container}>
                <div className={styles.contentContainer}>
                    <h2>Venda</h2>
                    <div className={styles.salesContainer}>
                        <Box title='Iniciar uma venda'>
                            <div className={styles.boxContent}>
                                <div className={styles.searchBox}>
                                    <FiSearch color='#A1A1A1' />
                                    <input type='text' value={filteredValue} onChange={e => setFilteredValue(e.target.value)} placeholder='Descrição do produto' />
                                </div>
                                {filteredValue.length > 2 && filteredProducts}
                                <div className={styles.row}>
                                    <div className={styles.quantityBox}>
                                        <button onClick={decreaseQuantity}>-</button>
                                        <input type='number' value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                                        <button onClick={increaseQuantity}>+</button>
                                    </div>
                                    <button onClick={handleAddSale} className={styles.addButton}>Adicionar</button>
                                </div>
                                <span>Detalhes da venda</span>
                                <table className={styles.saleTable}>
                                    <thead className={styles.tableRowHeader}>
                                        <tr>
                                            <th className={styles.tableHeader}>Descrição</th>
                                            <th className={styles.tableHeader}>Quantidade</th>
                                            <th className={styles.tableHeader}>Total</th>
                                            <th className={styles.tableHeader}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        todaySale.map((s, index) => {
                                            return(
                                                <tr key={index} className={styles.tableRowItems}>
                                                    <td className={styles.tableCell}>{s.description}</td>
                                                    <td className={styles.tableCell}>{s.quantity}</td>
                                                    <td className={styles.tableCell}>{(Number(s.quantity) * Number(s.salePrice.replace(',', '.'))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                    <td className={styles.tableCell}><button className={styles.removeSale} onClick={() => removeItemOnce(todaySale, s)}><FiTrash color='#A1A1A1' /></button></td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                                <hr />
                                <span>Pagamento</span>
                                <div className={styles.paymentRow}>
                                    <button onClick={() => handleSelectPaymentMethod('credit')} className={`${styles.selectable} ${styles.paymentMethod} ${selectedMethod === 'credit' && styles.active}`}>
                                        <FiCreditCard color='929292' />
                                        Crédito
                                    </button>
                                    <button onClick={() => handleSelectPaymentMethod('debit')} className={`${styles.selectable} ${styles.paymentMethod} ${selectedMethod === 'debit' && styles.active}`}>
                                        <FiCreditCard color='929292' />
                                        Débito
                                    </button>
                                    <div className={`${styles.selectable} ${styles.paymentMethod} ${styles.cashMethod} ${selectedMethod === 'cash' && styles.active}`}>
                                        <FiDollarSign color='#A1A1A1' />
                                        <input type='text' onClick={() => handleSelectPaymentMethod('cash')} value={cashAmount} onChange={e => setCashAmount(moneyMask(e.target.value))} placeholder='Dinheiro' />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <div>
                                        <span>Total</span>
                                        <h2 className={styles.total}>{totalSale.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                                    </div>
                                    {
                                        selectedMethod === 'cash' && 
                                        <div>
                                            <span>Troco</span>
                                            <h2 className={styles.total}>{(Number(cashAmount.replace('.', '').replace(',', '.')) - totalSale).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
                                        </div>
                                    }
                                </div>
                                <button className={styles.submitSale} onClick={handleCreateSale}>Receber e finalizar</button>
                            </div>
                        </Box>
                        <Box title='Ultimas vendas'>
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
            </main>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req })
  
    return {
      props: {
        session
      }
    }
}