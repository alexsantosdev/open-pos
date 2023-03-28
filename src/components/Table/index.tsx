import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FiEdit, FiTrash } from 'react-icons/fi'

import { Status } from '../Status'

import useTable from '../../hooks/useTable'

import styles from './styles.module.scss'

interface TableProps {
    data: any[],
    rowsPerPage: number,
    handleDeleteItem?: (code: string) => void,
    handleEditItem?: (code: string) => void,
}

interface TableFooterProps {
    range: any[],
    setPage: Dispatch<SetStateAction<number>>,
    page: number,
    slice: any[]
}

export function Table({data, rowsPerPage, handleDeleteItem, handleEditItem }: TableProps) {
    const [page, setPage] = useState(1)
    const { slice, range } = useTable(data, page, rowsPerPage)

    return(
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead className={styles.tableRowHeader}>
                    <tr>
                        <th className={styles.tableHeader}>Código</th>
                        <th className={styles.tableHeader}>Descrição</th>
                        <th className={styles.tableHeader}>Estoque</th>
                        <th className={styles.tableHeader}>Validade</th>
                        <th className={styles.tableHeader}>Custo p/ unidade</th>
                        <th className={styles.tableHeader}>Preço de venda</th>
                        <th className={styles.tableHeader}>Margem</th>
                        <th className={styles.tableHeader}>Status</th>
                        <th className={styles.tableHeader}>Categoria</th>
                        <th className={styles.tableHeader}></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        slice.map((el) => (
                            <tr className={styles.tableRowItems} key={el.code}>
                                <td className={styles.tableCell}>{el.code}</td>
                                <td className={styles.tableCell}>{el.description}</td>
                                <td className={styles.tableCell}>{el.inventory}</td>
                                <td className={styles.tableCell}>{el.validity}</td>
                                <td className={styles.tableCell}>{Number(String(el.cost).replace(',', '.')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className={styles.tableCell}>{Number(String(el.salePrice).replace(',', '.')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td className={styles.tableCell}>{el.margin}%</td>
                                <td className={styles.tableCell}>
                                    <Status alert={Number(el.inventory) < 10} text={Number(el.inventory) < 10 ? 'Baixo' : 'OK'} />
                                </td>
                                <td className={styles.tableCell}>{el.category}</td>
                                <td className={styles.tableCell}>
                                    <div className={styles.actionsRow}>
                                        <button onClick={() => handleEditItem(el.code)}><FiEdit color='#A1A1A1' /></button>
                                        <button onClick={() => handleDeleteItem(el.code)}><FiTrash color='#A1A1A1' /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <TableFooter range={range} slice={slice} setPage={setPage} page={page} />
        </div>
    )
}

const TableFooter = ({ range, setPage, page, slice }: TableFooterProps) => {
    useEffect(() => {
        if(slice.length < 1 && page !== 1) {
            setPage(page - 1)
        }
    }, [slice, page, setPage])

    return(
        <div className={styles.tableFooter}>
            {range.map((el, index) => (
                <button
                    key={index}
                    className={`${styles.button} ${
                        page === el ? styles.activeButton : styles.inactiveButton
                    }`}
                    onClick={() => setPage(el)}
                >
                    {el}
                </button>
            ))}
        </div>
    )
}