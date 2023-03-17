import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { getSession } from 'next-auth/react'

import { Header } from '../components/Header'
import { GettingStarted } from '../components/GettingStarted'

import styles from './home.module.scss'
import { useRouter } from 'next/router'
import { child, get, ref } from 'firebase/database'
import { database } from '../services/firebase'

export default function Home({ session, message }) {

  console.log('Message >>>>', message)

  const { asPath } = useRouter()

  if(session?.subscription === null || session?.subscription === undefined) {
    return (
      <>
        <Header />

        <Head>
          <title>OpenPOS - Estabelecimento do seu jeito.</title>
        </Head>
        
        <main className={styles.contentContainer}>
          <section className={styles.hero}>
            <h1>Sistema PDV completo para o seu Negócio!</h1>
            <p>
              Sem <strong>custos</strong> de configuração e sem custos <strong>adicionais</strong>.
            </p>
          </section>

          <img className={styles.heroImage} src="/images/delivered.svg" alt='Phone' />
        </main>
      </>
    )
  }else if(session?.subscription === false) {
    return (
      <>
        <Head>
          <title>OpenPOS - Primeiros passos.</title>
        </Head>

        {session && asPath !== "/" && <Header />}
        
        <GettingStarted session={session} />
      </>
    )
  }
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req })

  if(session?.subscription) {
    return {
      redirect: {
        destination: `/admin/${session?.merchant_id}`,
        permanent: false
      }
    }
  }

  return {
    props: {
      session
    }
  }
}