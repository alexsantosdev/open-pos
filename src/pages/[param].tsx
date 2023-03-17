/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { ref, get, child } from 'firebase/database'
import styled from 'styled-components'

import { database } from '../services/firebase'

interface Merchant {
    image_url: string,
    merchant_name: string,
    phone: string,
    card: {
        highlight_phrase: string,
        open: boolean,
        card_info: {
            order_text_button: string, //TODO: replace to order_button_text
        }
    },
    theme: {
        background_color: string,
        button_color: string,
        button_text_color: string,
        theme_text_color: string,
        price_text_color: string
    }
}

interface CardContainerProps {
    _theme: {
        background_color: string,
        button_color: string,
        button_text_color: string,
        theme_text_color: string,
        price_text_color: string,
    },
    isOpen?: boolean
}

export default function RestaurantId({ param }) {

    const [cardData, setCardData] = useState<Merchant>(null)

    const defaultTheme = {
        background_color: '#181A20',
        button_color: '#EBA417',
        button_text_color: '#000000',
        theme_text_color: '#FFFFFF',
        price_text_color: '#EBA417',
    }

    useEffect(() => {
        const dbRef = ref(database)
        get(child(dbRef, `merchant/${param}/merchant_data`)).then((snapshot) => {
            if(snapshot.exists()) {
                setCardData(snapshot.val())
            }
        })
    })

    return(
        <>
            <Head>
                <title>Cardápio {cardData?.merchant_name}</title>
            </Head>
            
            <CardContainer _theme={cardData?.theme ? cardData.theme : defaultTheme} isOpen={cardData?.card.open}>
                <main>
                    <div className='cardHeader'>
                        <div className='content'>
                            <h2>{cardData?.merchant_name}</h2>
                            <span>{cardData?.card.open ? 'Aberto agora' : 'Fechado'}</span>
                        </div>
                        <img src={cardData?.image_url} alt={cardData?.merchant_name} />
                    </div>
                    <div className='cardInfo'>
                        <h2>{cardData?.card.highlight_phrase}</h2>
                        <button>{cardData?.card.card_info.order_text_button}</button>
                    </div>
                </main>
            </CardContainer>
            
        </>
    )
}

export const getServerSideProps:GetServerSideProps = async ({ req, params }) => {
    const { param } = params
    console.log(param)

    return{
        props: {
            param
        }
    }
}

const CardContainer = styled.div<CardContainerProps>`
    background: ${(props) => props._theme.background_color};

    main {
        max-width: min(601px, 100%);
        margin: 0px auto;
        display: flex;
        flex-flow: column;

        background: ${(props) => props._theme.background_color};

        .cardHeader {
            padding: 2rem;

            display: flex;
            flex-direction: row;

            justify-content: space-between;

            align-items: center;

            .content {
                display: flex;
                flex-direction: column;

                gap: 8px;

                span {
                    font-size: 0.90rem;
                    color: ${(props) => props.isOpen ? '#14A343' : '#B2263D'};
                }
            }

            img {
                width: 96px;
                height: 96px;
                
                border-radius: 50%;
            }
        }

        .cardInfo {
            margin: 2rem;

            h2 {
                font-size: 2.5rem;
                line-height: 3rem;

                font-weight: 600;
            }

            button {
                margin-top: 2rem;

                color: ${(props) => props._theme.button_text_color};
                background: ${(props) => props._theme.button_color};

                border-radius: 6.25rem;
                -webkit-box-align: center;
                align-items: center;
                -webkit-box-pack: center;
                justify-content: center;
                display: flex;
                text-align: center;
                padding: 1rem 2rem;
                font-weight: bold;
                font-size: 0.875rem;
                line-height: 1rem;

                &:hover {
                    transition: filter 0.2s;
                    filter: brightness(0.7)
                }
            }
        }
    } 
`