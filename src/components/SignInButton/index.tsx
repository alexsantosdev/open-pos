import { FaGoogle } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'
import { signIn, signOut, useSession } from 'next-auth/react'

import styles from './styles.module.scss'

export function SignInButton() {

    const { data: session } = useSession()

    return session ? (
        <button
            className={styles.signInButton}
            type='button'
            onClick={() => signOut()}
        >
            <FiX color="#737380" className={styles.closeIcon} />
            {/* {session.user.name} */} Sair
        </button>
    ) : (
        <button
            className={styles.signInButton}
            type='button'
            onClick={() => signIn('google')}
        >
            <FaGoogle color="#5D3FB2" />
            Acessar com o Google
        </button>
    )
}