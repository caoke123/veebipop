import React from 'react'
import Link from 'next/link';
import TopNavLangCurrency from './TopNavLangCurrency'

interface Props {
    props: string;
    slogan: string;
}

const TopNavOne: React.FC<Props> = ({ props, slogan }) => {
    return (
        <>
            <div className={`top-nav md:h-[44px] h-[30px] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="top-nav-main flex justify-between max-md:justify-center h-full">
                        <TopNavLangCurrency />
                        <div className="text-center text-button-uppercase text-white flex items-center">
                            {slogan}
                        </div>
                        <span className="flex items-center gap-5 max-md:hidden">
                            <Link href={'https://www.facebook.com/'} target='_blank'>
                                <i className="icon-facebook text-white"></i>
                            </Link>
                            <Link href={'https://www.instagram.com/'} target='_blank'>
                                <i className="icon-instagram text-white"></i>
                            </Link>
                            <Link href={'https://www.youtube.com/'} target='_blank'>
                                <i className="icon-youtube text-white"></i>
                            </Link>
                            <Link href={'https://twitter.com/'} target='_blank'>
                                <i className="icon-twitter text-white"></i>
                            </Link>
                            <Link href={'https://pinterest.com/'} target='_blank'>
                                <i className="icon-pinterest text-white"></i>
                            </Link>
                        </span>

                    </div>
                </div>
            </div>
        </>
    )
}

export default TopNavOne