import DataTable, { TableProps, TableColumn, ExpanderComponentProps } from 'react-data-table-component'
import { FiEdit, FiTrash } from 'react-icons/fi'
import { EditButton } from '../EditButton'
import { moneyMask } from '../../utils/itemMask'

interface ProductRow {
    code: string,
    description: string,
    inventory: string,
    validity: string,
    cost: string,
    margin: string,
    salePrice: string,
    category: string
}

interface TablePropsExtended extends TableProps<ProductRow> {
    data: any,
    handleEditItem?: (id: string) => void
}

export function ProductTable({
    selectableRows,
	selectableRowsNoSelectAll,
	selectableRowsVisibleOnly,
	selectableRowsHighlight,
	selectableRowsSingle,
	expandableRows,
	expandOnRowClicked,
	expandOnRowDoubleClicked,
	expandableRowsHideExpander,
	pagination,
	highlightOnHover,
	striped,
	pointerOnHover,
	dense,
	persistTableHead,
	noHeader,
	fixedHeader,
	fixedHeaderScrollHeight,
	progressPending,
    data,
    handleEditItem,
	noTableHead,
	noContextMenu,
	direction,
	subHeader,
	subHeaderAlign,
	subHeaderWrap,
	responsive,
	disabled
}: TablePropsExtended): JSX.Element {
    const ExpandableRowComponent: React.FC<ExpanderComponentProps<ProductRow | any>> = ({ data }) => {
        return(
            <>
                <p>{data.code}</p>
                <p>{data.description}</p>
                <p>{data.inventory}</p>
                <p>{data.validity}</p>
                <p>{data.cost}</p>
                <p>{data.margin}</p>
                <p>{data.salePrice}</p>
                <p>{data.category}</p>
            </>
        )
    }

    const productColumns: TableColumn<ProductRow>[] = [
        {
            name: 'Código',
            selector: row => row.code,
            sortable: true,
            reorder: true
        },
        {
            name: 'Descrição',
            selector: row => row.description,
            sortable: true,
            reorder: true
        },
        {
            name: 'Estoque',
            selector: row => row.inventory,
            sortable: true,
            reorder: true
        },
        {
            name: 'Custo p/ unidade',
            selector: row => 'R$ ' + moneyMask(String(row.cost)),
            sortable: true,
            reorder: true
        },
        {
            name: 'Preço de venda',
            selector: row => moneyMask(String(row.salePrice)),
            sortable: true,
            reorder: true
        },
        {
            name: 'Margem',
            selector: row => row.margin,
            sortable: true,
            reorder: true
        },
        {
            name: 'Categoria',
            selector: row => row.category,
            sortable: true,
            reorder: true
        },
        {
            name: 'Status',
            cell: (row) => <span>{Number(row.inventory) < 10 ? 'Abastecer' : 'OK' }</span>,
            sortable: true,
            reorder: true
        },
        {
            cell: (row) => <EditButton onClick={() => handleEditItem(row.code)}><FiEdit color='#A1A1A1' /></EditButton>,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
    ]

    const customStyles = {
        rows: {
            style: {
                minHeight: '72px', // override the row height
            },
        },
        headCells: {
            style: {
                color: '#abafb5',
                paddingLeft: '8px', // override the cell padding for head cells
                paddingRight: '8px',
            },
        },
        cells: {
            style: {
                color: '#757575',
                paddingLeft: '8px', // override the cell padding for data cells
                paddingRight: '8px',
            },
        },
    }

    return(
        <DataTable 
            columns={productColumns}
			data={data}
			defaultSortFieldId={1}
			selectableRows={selectableRows}
			selectableRowsNoSelectAll={selectableRowsNoSelectAll}
			selectableRowsHighlight={selectableRowsHighlight}
			selectableRowsSingle={selectableRowsSingle}
			selectableRowsVisibleOnly={selectableRowsVisibleOnly}
			expandableRows={expandableRows}
			expandableRowsComponent={ExpandableRowComponent}
			expandOnRowClicked={expandOnRowClicked}
			expandOnRowDoubleClicked={expandOnRowDoubleClicked}
			expandableRowsHideExpander={expandableRowsHideExpander}
			pagination={pagination}
			highlightOnHover={highlightOnHover}
			striped={striped}
			pointerOnHover={pointerOnHover}
			dense={dense}
			noTableHead={noTableHead}
			persistTableHead={persistTableHead}
			progressPending={progressPending}
			noHeader={noHeader}
			subHeader={subHeader}
			subHeaderAlign={subHeaderAlign}
			subHeaderWrap={subHeaderWrap}
			noContextMenu={noContextMenu}
			fixedHeader={fixedHeader}
			fixedHeaderScrollHeight={fixedHeaderScrollHeight}
			direction={direction}
			responsive={responsive}
			disabled={disabled}
            customStyles={customStyles}
        />
    )
}