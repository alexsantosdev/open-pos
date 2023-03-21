import { useSession } from 'next-auth/react'
import Image from 'next/image'

import { SignInButton } from '../SignInButton'

import Logo from '../../../public/images/logo.svg'

import styles from './styles.module.scss'

type HeaderProps = {
    merchantName?: string;
}

export function Header({ merchantName }: HeaderProps) {

    const { data: session } = useSession()


    return session ? (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Image src={Logo} width={32} height={32} alt='OpenPOS logo' />
                <nav>
                    <span>{merchantName}</span>
                </nav>
                {/* <nav>
                    <ActiveLink activeClassName={styles.active} href={`/admin/${session.merchant_id}`}>
                        <a>Estatística</a>
                    </ActiveLink>
                    <ActiveLink activeClassName={styles.active} href={`/admin/stock/${session.merchant_id}`}>
                        <a>Produtos</a>
                    </ActiveLink>
                    <ActiveLink activeClassName={styles.active} href={`/admin/sale/${session.merchant_id}`}>
                        <a>Venda</a>
                    </ActiveLink>
                </nav> */}

                <SignInButton />
            </div>
        </header>
    ) : (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Image src={Logo} width={32} height={32} alt='OpenPOS logo' />
                <SignInButton />
            </div>
        </header>
    )
}