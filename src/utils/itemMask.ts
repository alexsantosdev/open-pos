const moneyMask = (value: string) => {
    value = value.replace('.', '').replace(',', '').replace(/\D/g, '')
  
    const options = { minimumFractionDigits: 2 }
    const result = new Intl.NumberFormat('pt-BR', options).format(
      parseFloat(value) / 100
    )
  
    return result
}

const dateMask = (value: string) => {
    let v = value.replace(/\D/g,'').slice(0, 10)

    if (v.length >= 5) {
        return `${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4)}`
    }else if (v.length == 3) {
        return `${v.slice(0,2)}/${v.slice(2)}`
    }

    return v
}

export { moneyMask, dateMask }