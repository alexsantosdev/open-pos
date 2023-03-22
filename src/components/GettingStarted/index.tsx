import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { FormEvent, useState } from 'react'
import { Session } from 'next-auth'
import { child, ref, update, get } from 'firebase/database'
import toast, { Toaster } from 'react-hot-toast'

import { database } from '../../services/firebase'

import styles from './styles.module.scss'
import { useRouter } from 'next/router'

interface GettingStartedProps {
    session: Session
}

export function GettingStarted({ session }: GettingStartedProps) {
    const router = useRouter()

    const [merchantName, setMerchantName] = useState('')
    const [file, setFile] = useState<any>(null)

    const handleSubscribeMerchant = async (e: FormEvent) => {
        e.preventDefault()

        if(merchantName.trim() === '') {
            return toast.error('Informe um nome válido.', {
                style: {
                  border: '1px solid var(--purple-500)',
                  padding: '16px',
                  color: '#b6b6b6',
                  background: '#333'
                },
                iconTheme: {
                  primary: '#5D3FB2',
                  secondary: '#FFFFFF',
                },
              });
        }

        // if(file === null) {
        //     return toast.error('É necessário uma imagem para prosseguir.', {
        //         style: {
        //           border: '1px solid var(--purple-500)',
        //           padding: '16px',
        //           color: '#b6b6b6',
        //           background: '#333'
        //         },
        //         iconTheme: {
        //           primary: '#5D3FB2',
        //           secondary: '#FFFFFF',
        //         },
        //       });
        // }

        var merchantId = merchantName.replace(/\s/g, "").toLowerCase()

        const searchMerchant = await get(ref(database, `merchant/${merchantId}`))

        if(searchMerchant.exists()) {
            return toast.error('Já existe um estabelecimento com esse nome.')
        }

        const merchant = {
            owner_id: session?.owner_id,
            merchant_data: {
                merchant_name: merchantName,
                card: {
                    open: false,
                    highlight_phrase: '',
                    order_button_text: 'Meus pedidos'
                },
                theme: {
                    background_color: '#181A20',
                    button_color: '#EBA417',
                    button_text_color: '#000000',
                    theme_text_color: '#FFFFFF',
                    price_text_color: '#EBA417',
                }
            },
        }

        try{
            const dbRef = ref(database)
            toast.promise(
                update(child(dbRef, `merchant/${merchantId}`), merchant),
                 {
                   loading: 'Estamos salvando suas informações.',
                   success: <b>Informações salvas.</b>,
                   error: <b>Ooops! Ocorreu um erro, tente novamente.</b>,
                 },
                 {
                    style: {
                        border: '1px solid var(--purple-500)',
                        padding: '16px',
                        color: '#b6b6b6',
                        background: '#333'
                      },
                      iconTheme: {
                        primary: '#5D3FB2',
                        secondary: '#FFFFFF',
                      },
                 }
            );
            
            //TODO: Criar subscrição na plataforma
            // await api.post('/subscribe')
            
            const ownerData = {
                subscription: true,
                merchant_id: merchantId
            }

            toast.promise(
                update(child(dbRef, `owner/${session?.owner_id}`), ownerData),
                {
                    loading: 'Estamos validando suas credenciais.',
                    success: <b>Credenciais OK.</b>,
                    error: <b>Hmm! Ocorreu um erro, tente novamente.</b>,
                },
                {
                style: {
                        border: '1px solid var(--purple-500)',
                        padding: '16px',
                        color: '#b6b6b6',
                        background: '#333'
                    },
                        iconTheme: {
                        primary: '#5D3FB2',
                        secondary: '#FFFFFF',
                    },
                }
            );
            
            router.push(`/admin/${session.merchant_id}`)
            
        }catch (err) {
            alert(err.message)
        }
    }

    return(
        <>
            <Toaster position="bottom-right" reverseOrder={false} />
            <main className={styles.container}>
                <form onSubmit={handleSubscribeMerchant} >
                    <h1>Cadastre seu estabelecimento</h1>
                    <div className={styles.group}>
                        <span>Dê um nome para seu estabelecimento</span>
                        <div className={styles.line}>
                            <input
                                type='text'
                                placeholder='Nome do estabelecimento'
                                value={merchantName}
                                onChange={(e) => setMerchantName(e.target.value)}
                            />
                        </div>
                    </div>
                    <input type='submit' value='Salvar' />
                </form>
            </main>
        </>
    )
}

export const getServerSideProps:GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req })

    return {
        props: {
            session
        }
    }
}