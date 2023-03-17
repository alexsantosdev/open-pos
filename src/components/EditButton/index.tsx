import { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './styles.module.scss'

interface EditButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode
}

export function EditButton({ children }: EditButtonProps) {
    return(
        <button className={styles.editButton}>
            { children }
        </button>
    )
}