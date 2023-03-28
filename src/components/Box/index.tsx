import { ReactNode } from 'react'

import styles from './box.module.scss'

interface BoxProps {
    hasButton?: boolean,
    hasFilter?: boolean,
    buttonAction?: () => void,
    filterAction?: () => void,
    buttonTitle?: string,
    title: string,
    children: ReactNode
}

export default function Box({ hasButton, hasFilter, buttonAction, filterAction, buttonTitle, title, children }: BoxProps) {
    return(
        <div className={styles.boxContainer}>
            <div className={styles.boxHeader}>
                <span>{title}</span>
                {hasButton && <button className={styles.headerButton} value={buttonTitle} />}
            </div>
            <div className={styles.boxBody}>
                {children}
            </div>
        </div>
    )
}