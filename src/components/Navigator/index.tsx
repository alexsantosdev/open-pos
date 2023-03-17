import { useSession } from 'next-auth/react'
import { FiArchive, FiDollarSign, FiHome } from 'react-icons/fi'
import styled from 'styled-components'

import styles from './styles.module.scss'

interface LinkTextProps {
    isActive: boolean
}

interface NavigatorProps {
    isHomeActive?: boolean;
    isInventoryActive?: boolean;
    isSaleActive?: boolean;
}

const LinkText = styled.span<LinkTextProps>`
    color: ${(props) => props.isActive ? 'var(--white)' : 'var(--purple-100)'};
`

export function Navigator({ isHomeActive, isInventoryActive, isSaleActive }: NavigatorProps) {
    const { data: session } = useSession()

    return(
        <div className={styles.navigatorContainer}>
            <div className={styles.navigatorContent}>
                <nav>
                    <a href={`/admin/${session?.merchant_id}`}>
                        {isHomeActive ? <FiHome color='#FFF' /> : <FiHome color='#B297F5' />}
                        <LinkText isActive={isHomeActive}>Estatística</LinkText>
                    </a>
                    <div className={styles.verticalLine}></div>
                    <a href={`/admin/inventory/${session?.merchant_id}`}>
                        {isInventoryActive ? <FiArchive color='#FFF' /> : <FiArchive color='#B297F5' />}
                        <LinkText isActive={isInventoryActive}>Estoque</LinkText>
                    </a>
                    <div className={styles.verticalLine}></div>
                    <a href={`/admin/sale/${session?.merchant_id}`}>
                        {isSaleActive ? <FiDollarSign color='#FFF' /> : <FiDollarSign color='#B297F5' /> }
                        <LinkText isActive={isSaleActive}>Venda</LinkText>
                    </a>
                </nav>
            </div>
        </div>
    )
}