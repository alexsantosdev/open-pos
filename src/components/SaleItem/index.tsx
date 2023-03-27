import { FiCreditCard, FiDollarSign } from 'react-icons/fi'

import styles from './styles.module.scss'

interface SaleItemProps {
    paymentMethod: string,
    description: string,
    saleAmount: string,
    date: string
}

export default function SaleItem({ paymentMethod, description, saleAmount, date }: SaleItemProps) {
    return(
        <button className={styles.saleItemContainer}>
            <div className={styles.left}>
                <div className={styles.iconContainer}>
                    {paymentMethod === 'cash' ? <FiDollarSign color='#929292' /> : <FiCreditCard color='#929292' />}
                </div>
                <div className={styles.saleItemContent}>
                    <h2>{description}</h2>
                    <span>{paymentMethod === 'cash' ? 'Dinheiro' : paymentMethod === 'credit' ? 'Crédito' : 'Débito'}</span>
                </div>
            </div>
            <div className={styles.right}>
                <h3>{saleAmount}</h3>
                <span>{date}</span>
            </div>
        </button>
    )
}