import { useEffect, useState } from 'react'
import Head from 'next/head'
import { child, get, push, ref, update } from 'firebase/database'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import toast, { Toaster, ToasterProps } from 'react-hot-toast'
import { FiSearch, FiTrash } from 'react-icons/fi'

import { Header } from '../../../components/Header'
import { Navigator } from '../../../components/Navigator'

import { database } from '../../../services/firebase'

import { MerchantData } from '../../api/subscribe'

import styles from './styles.module.scss'

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

export default function MerchantId({ session }) {
    const router = useRouter()

    const [merchantData, setMerchantData] = useState<MerchantData>({} as MerchantData)
    const [filteredValue, setFilteredValue] = useState('')
    const [quantity, setQuantity] = useState(0)
    const [firebaseProduct, setFirebaseProduct] = useState<Products[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Products>({} as Products)
    const [productCode, setProductCode] = useState('')
    const [todaySale, setTodaySale] = useState<Sale[]>([])
    const [totalSale, setTotalSale] = useState(0)

    const increaseQuantity = () => setQuantity(quantity + 1)
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

    const filteredProducts = firebaseProduct.filter(p => p.description.includes(filteredValue))
        .map(p => {
            return(
                <>
                    <button key={p.code} onClick={() => handleSelectProduct(p.code)} className={`${styles.selectable} ${productCode === p.code && styles.active}`}>{p.description}</button>
                </>
            )
        })

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
            return toast.error('Informe um produto para venda', {
                style: {
                  border: '1px solid var(--purple-500)',
                  padding: '16px',
                  color: '#5D3FB2',
                  background: '#f6f6f6'
                },
                iconTheme: {
                  primary: '#5D3FB2',
                  secondary: '#FFFFFF',
                },
            })
        }

        if(quantity === 0) {
            return toast.error('Informe a quantidade.', {
                style: {
                  border: '1px solid var(--purple-500)',
                  padding: '16px',
                  color: '#5D3FB2',
                  background: '#f6f6f6'
                },
                iconTheme: {
                  primary: '#5D3FB2',
                  secondary: '#FFFFFF',
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
        todaySale.map(async s => {
            await update(ref(database, `merchant/${session?.merchant_id}/products/${s.code}`), {
                inventory: Number(s.inventory) - Number(s.quantity)
            })

            await push(ref(database, `merchant/${session?.merchant_id}/sales/`), {
                name: s.description,
                quantity: s.quantity,
                date: new Date()
            })
        })

        setTodaySale([])

        return toast.success('Venda cadastrada com sucesso!', {
            style: {
                border: '1px solid var(--purple-500)',
                padding: '16px',
                color: '#5D3FB2',
                background: '#f6f6f6'
            },
            iconTheme: {
                primary: '#5D3FB2',
                secondary: '#FFFFFF',
            },
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
                    <h2>Registrar venda</h2>
                    <div className={styles.saleContainer}>
                        <div className={styles.searchBox}>
                            <FiSearch color='#A1A1A1' />
                            <input type='text' value={filteredValue} onChange={e => setFilteredValue(e.target.value)} placeholder='Descrição do produto' />
                        </div>
                        {filteredValue.length > 2 && filteredProducts}
                        <div className={styles.quantityBox}>
                            <button onClick={decreaseQuantity}>-</button>
                            <input type='number' value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                            <button onClick={increaseQuantity}>+</button>
                        </div>
                        <button onClick={handleAddSale} className={styles.addButton}>Adicionar</button>
                    </div>
                    <h3>Venda</h3>
                    <div className={styles.tableContainer}>
                        <table className={styles.saleTable}>
                            <thead className={styles.tableRowHeader}>
                                <tr>
                                    <th className={styles.tableHeader}>Código</th>
                                    <th className={styles.tableHeader}>Descrição</th>
                                    <th className={styles.tableHeader}>Quantidade</th>
                                    <th className={styles.tableHeader}>Preço de venda</th>
                                    <th className={styles.tableHeader}>Total</th>
                                    <th className={styles.tableHeader}></th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                todaySale.map((s, index) => {
                                    return(
                                        <tr key={index} className={styles.tableRowItems}>
                                            <td className={styles.tableCell}>{s.code}</td>
                                            <td className={styles.tableCell}>{s.description}</td>
                                            <td className={styles.tableCell}>{s.quantity}</td>
                                            <td className={styles.tableCell}>$ {s.salePrice}</td>
                                            <td className={styles.tableCell}>$ {String(Number(s.quantity) * Number(s.salePrice.replace(',', '.'))).replace('.', ',')}</td>
                                            <td className={styles.tableCell}><button className={styles.removeSale} onClick={() => removeItemOnce(todaySale, s)}><FiTrash color='#A1A1A1' /></button></td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                    
                    <h3>Total</h3>
                    <h2>R$ {String(totalSale).replace('.', ',')}</h2>
                    <button className={styles.submitSale} onClick={handleCreateSale}>Fechar venda</button>
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