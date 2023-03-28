import { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { ref, get, child, update, set, remove } from 'firebase/database'
import toast, { Toaster } from 'react-hot-toast'
import { FiSearch, FiCircle } from 'react-icons/fi'

import { Header } from '../../../components/Header'
import { Navigator } from '../../../components/Navigator'
import Modal from '../../../components/Modal'
import { Table } from '../../../components/Table'

import { database } from '../../../services/firebase'

import { MerchantData } from '../../api/subscribe'

import { dateMask, moneyMask } from '../../../utils/itemMask'

import styles from './inventory.module.scss'

interface Categories {
    name: string;
}

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

export default function MerchantId({session}) {
    const router = useRouter()

    const [merchantData, setMerchantData] = useState<MerchantData>({} as MerchantData)
    const [isNewProductOpen, setIsNewProductOpen] = useState(false)
    const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedCode, setSelectedCode] = useState('')
    const [filteredValue, setFilteredValue] = useState('')

    const handleChangeProductModal = () => {
        handleClearData()
        setIsNewProductOpen(!isNewProductOpen)
    }
    const handleChangeCategoryModal = () => setIsNewCategoryOpen(!isNewCategoryOpen)

    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [inventory, setInventory] = useState('')
    const [validity, setValidity] = useState('')
    const [cost, setCost] = useState('')
    const [margin, setMargin] = useState('')
    const [sale, setSale] = useState('')
    const [productCategory, setProductCategory] = useState('')
    const [category, setCategory] = useState('')

    const [firebaseCategory, setFirebaseCategory] = useState<Categories[]>([])
    const [firebaseProduct, setFirebaseProduct] = useState<Products[]>([])

    const saleMask = (value: string) => {
        let percentage:number = Number(value)/100
        let salePrice: number = (Number(cost.replace(',', '.')) * percentage)
        let calc: number = (Number(cost.replace(',', '.')) + salePrice)

        setSale(calc.toFixed(2))
        setMargin(value)
        setSale(calc.toFixed(2))
        return value
    }

    const filteredProducts = firebaseProduct.filter(p => p.description.toLowerCase().includes(filteredValue.toLowerCase()))

    const handleClearData = () => {
        setCategory('')
        setCode('')
        setDescription('')
        setInventory('')
        setValidity('')
        setCost('')
        setMargin('')
        setSale('')
        setProductCategory('')
    }

    const handleOpenEditOptions = async (c: string) => {
        setIsEditing(true)
        setIsNewProductOpen(!isNewProductOpen)

        const dbRef = ref(database)
        await get(child(dbRef, `merchant/${session.merchant_id}/products/${c}`)).then((snapshot) => {
            if(snapshot.exists()) {
                const data: ProductType = snapshot.val() ?? {}
                console.log(data)

                setCode(data.code)
                setDescription(data.description)
                setInventory(data.inventory)
                setValidity(data.validity)
                setCost(data.cost)
                setMargin(data.margin)
                setSale(data.salePrice)
                setProductCategory(data.category)
            }
        })

        setSelectedCode(c)
    }

    const handleEditItem = async (c: string) => {
        console.log('Entrou aqui', productCategory)
        toast.promise(
            update(ref(database, `merchant/${session?.merchant_id}/products/${c}`), {
                code,
                description,
                inventory,
                validity,
                cost,
                margin,
                sale,
                category: productCategory
            }),
            {
                loading: 'Estamos Salvando as alterações...',
                success: <b>Alterações salvas!</b>,
                error: <b>Hmm! Ocorreu um erro, tente novamente.</b>,
            },
            {
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
            }
        )

        handleClearData()
        setIsEditing(false)
        handleGetMerchantCategories(session?.merchant_id)
        handleGetMerchantProducts(session?.merchant_id)
    }

    const handleDeleteItem = async (code: string) => {
        toast.promise(
            remove(ref(database, `merchant/${session?.merchant_id}/products/${code}`)),
            {
                loading: 'Estamos removendo seu produto...',
                success: <b>Produto removido!</b>,
                error: <b>Hmm! Ocorreu um erro, tente novamente.</b>,
            },
            {
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
            }
        )

        handleGetMerchantProducts(session?.merchant_id)
    }

    const handleCreateCategory = async () => {
        if(category.trim() === '') {
            return toast.error('Informe um nome válido.', {
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
            });
        }

        let categoryId: string = category.trim().toLowerCase()

        toast.promise(
            set(ref(database, `merchant/${session?.merchant_id}/categories/` + categoryId), {
                name: category
            }),
            {
                loading: 'Estamos criando sua categoria...',
                success: <b>Categoria criada!</b>,
                error: <b>Hmm! Ocorreu um erro, tente novamente.</b>,
            },
            {
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
            }
        )

        handleGetMerchantCategories(session?.merchant_id)
        setCategory('')
    }

    const handleCreateProduct = async () => {
        if(code.trim() === '') {
            return toast.error('Informe um código válido.', {
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
            });
        }

        if(description.trim() === '') {
            return toast.error('Informe uma descrição válida.', {
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
            });
        }

        if(inventory.trim() === '') {
            return toast.error('Informe uma quantidade válida.', {
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
            });
        }

        if(validity.trim() === '') {
            return toast.error('Informe uma data válida.', {
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
            });
        }

        if(cost.trim() === '') {
            return toast.error('Informe um valor válido.', {
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
            });
        }

        if(margin.trim() === '') {
            return toast.error('Informe uma margem válida.', {
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
            });
        }

        if(sale.trim() === '') {
            return toast.error('Informe um valor válido.', {
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
            });
        }

        if(productCategory.trim() === '') {
            return toast.error('Selecione ao menos uma categoria.', {
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
            });
        }

        let productId: string = code.trim().toLowerCase()

        let productIdExists: boolean = false

        await get(child(ref(database), `merchant/${session?.merchant_id}/products/` + productId)).then((snapshot) => {
            if(snapshot.exists()) {
                productIdExists = true
                return toast.error('Já existe um produto com esse código.', {
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
        })

        if(!productIdExists) {
            toast.promise(
                set(ref(database, `merchant/${session?.merchant_id}/products/` + productId), {
                    code: code,
                    description: description,
                    inventory: inventory,
                    validity: validity,
                    cost: cost,
                    margin: margin,
                    salePrice: sale,
                    category: productCategory
                }),
                {
                    loading: 'Estamos criando seu produto...',
                    success: <b>Produto criado!</b>,
                    error: <b>Hmm! Ocorreu um erro, tente novamente.</b>,
                },
                {
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
                }
            )

            handleGetMerchantProducts(session?.merchant_id)
            setCode('')
            setDescription('')
            setInventory('')
            setValidity('')
            setCost('')
            setMargin('')
            setSale('')
            setProductCategory('')
        }
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
                setFirebaseCategory(parsedData)
                console.log('Categorias >>', parsedData)
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
        if(!session?.user) {
            router.push('/')
            return
        }
        handleGetMerchantData(session?.merchant_id)
        handleGetMerchantCategories(session?.merchant_id)
        handleGetMerchantProducts(session?.merchant_id)
    }, [session])

    return(
        <>
            <Head>
                <title>OpenPOS - { merchantData?.merchant_name }</title>
            </Head>

            <Header merchantName={merchantData?.merchant_name} />
            <Navigator isInventoryActive />

            <Toaster position="bottom-right" reverseOrder={false} />

            <Modal show={isNewProductOpen} headerTitle={isEditing ? 'Editar produto' : 'Novo produto'}>
                <div className={styles.modalFormContent}>
                    <input type='text' placeholder='Código do produto' value={code} onChange={e => setCode(e.target.value)} />
                    <input type='text' placeholder='Descrição do produto' value={description} onChange={e => setDescription(e.target.value)} />
                    <input type='numeric' placeholder='Quantidade em estoque' value={inventory} onChange={e => setInventory(e.target.value)} />
                    <input type='numeric' placeholder='Validade' value={validity} onChange={e => setValidity(dateMask(e.target.value))} />
                    <input type='numeric' placeholder='Custo por unidade' value={cost ? 'R$ ' + cost : ''} onChange={e => setCost(moneyMask(e.target.value))} />
                    <input type='numeric' placeholder='Margem de lucro em %' value={margin} onChange={e => setMargin(saleMask(e.target.value))} />
                    <input type='numeric' placeholder='Preço de venda' value={sale ? 'R$ ' + sale : ''} disabled />
                    <select value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                        <option value='' hidden>Categoria</option>
                        {
                            firebaseCategory.map(category => {
                                return(
                                    <option key={category.name} value={category.name}>{category.name}</option>
                                )
                            })
                        }
                    </select>
                    <div>
                        <button onClick={handleChangeProductModal}>Cancelar</button>
                        <button onClick={handleClearData}>Limpar</button>
                        <button onClick={() => isEditing ? handleEditItem(selectedCode) : handleCreateProduct()}>Salvar</button>
                    </div>
                </div>
            </Modal>

            <Modal show={isNewCategoryOpen} headerTitle='Nova categoria'>
            <div className={styles.modalFormContent}>
                    <input type='text' placeholder='Nome da categoria' value={category} onChange={e => setCategory(e.target.value)} />
                    <div>
                        <button onClick={handleChangeCategoryModal}>Cancelar</button>
                    <button onClick={handleClearData}>Limpar</button>
                        <button onClick={handleCreateCategory}>Salvar</button>
                    </div>
                </div>
            </Modal>

            <main className={styles.container}>
                <div className={styles.contentContainer}>
                    <h2>Controle de estoque</h2>
                    <br />
                    <div className={styles.row}>
                        <div>
                            <button onClick={handleChangeProductModal}>+ Produto</button>
                            <button onClick={handleChangeCategoryModal}>+ Categoria</button>  
                            <span>{firebaseCategory.length} Categorias / {firebaseProduct.length} Produtos</span>
                        </div>
                        <div>
                            <div className={styles.searchBox}>
                                <FiSearch color='#A1A1A1' />
                                <input type='text' value={filteredValue} onChange={e => setFilteredValue(e.target.value)} placeholder='Descrição do produto' />
                            </div>
                        </div>
                    </div>
                    <br />
                    <div className={styles.tableContainer}>
                        {/* <ProductTable
                            columns={[]}
                            data={firebaseProduct}
                            dense
                            fixedHeaderScrollHeight="300px"
                            highlightOnHover
                            noHeader
                            pagination
                            responsive
                            subHeaderWrap
                        /> */}
                        {/* <table className={styles.tableContainer}>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Descrição</th>
                                    <th>Estoque</th>
                                    <th>Validade</th>
                                    <th>Custo p/ unidade</th>
                                    <th>Preço de venda</th>
                                    <th>Margem</th>
                                    <th>Status</th>
                                    <th>Categoria</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    firebaseProduct.map(p => {
                                        return(
                                            <tr key={p.code}>
                                                <td>{p.code}</td>
                                                <td>{p.description}</td>
                                                <td>{p.inventory}</td>
                                                <td>{p.validity}</td>
                                                <td>$ {p.cost}</td>
                                                <td>$ {p.salePrice}</td>
                                                <td>{p.margin}%</td>
                                                <td>
                                                    <Status alert={Number(p.inventory) < 10} text={Number(p.inventory) < 10 ? 'Abastecer' : 'OK'} />
                                                </td>
                                                <td>{p.category}</td>
                                                <td>
                                                    <div className={styles.actionsRow}>
                                                        <button></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table> */}

                        <Table data={filteredValue.length > 0 ? filteredProducts : firebaseProduct} rowsPerPage={6} handleDeleteItem={handleDeleteItem} handleEditItem={handleOpenEditOptions} />
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