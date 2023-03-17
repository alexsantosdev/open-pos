import { ReactNode } from 'react'

import styles from './styles.module.scss'

interface ModalProps {
    show: boolean;
    headerTitle: string;
    children: ReactNode;
}

export default function Modal({ show, headerTitle, children }: ModalProps) {
    if(!show) {
        return <></>
    }
    
    return(
        <div className={styles.modalContainer}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>{ headerTitle }</h2>
                </div>
                <div className={styles.modalBody}>{ children }</div>
            </div>
        </div>
    )
}