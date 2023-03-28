import styles from './styles.module.scss'

interface SalePercentageProps {
    isUp: boolean,
    value: string | number
}

export default function SalePercentage({ isUp, value }: SalePercentageProps) {
    return(
        <div className={`${styles.percentageContainer} ${isUp ? styles.up : styles.down}`}>
            <span>{ value }</span>
        </div>
    )
}