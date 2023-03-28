import styled from 'styled-components'

interface StatusProps {
    alert: boolean,
    text: string
}

interface StatusContainerProps {
    alert: boolean
}

export function Status({ alert, text }: StatusProps) {
    return(
        <StatusContainer alert={alert}>
            <span>{text}</span>
        </StatusContainer>
    )
}

const StatusContainer = styled.div<StatusContainerProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    border-radius: 22px;
    background: ${(props) => props.alert === true ? '#FFF3F0' : '#E6FAED'};

    padding: 7px 12px;

    span {
        font-size: 12px;
        font-weight: 600;
        color: ${(props) => props.alert === true ? '#76392F' : '#0F953A'};
    }
`