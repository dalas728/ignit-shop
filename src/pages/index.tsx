import { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Stripe from 'stripe'
import { useKeenSlider } from 'keen-slider/react'
import { stripe } from '../lib/stripe'
import { HomeContainer, Product } from '../styles/pages/home'
import { priceFormatter } from '../utils/priceFormatter'

import 'keen-slider/keen-slider.min.css'

interface HomeProps {
  products: {
    id: string
    name: string
    imageUrl: string
    price: string
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    },
  })

  return (
    <>
      <Head>
        <title>Ignite Shop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <HomeContainer ref={sliderRef} className="keen-slider">
        {products.map((product) => (
          <Product key={product.id} className="keen-slider__slide">
            <Image src={product.imageUrl} alt="" width={520} height={480} />
            <footer>
              <strong>{product.name}</strong>
              <span>{product.price}</span>
            </footer>
          </Product>
        ))}
      </HomeContainer>
    </>
  )
}

export async function getStaticProps(): Promise<
  GetStaticPropsResult<HomeProps>
> {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
    active: true,
  })

  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: priceFormatter.format(Number(price.unit_amount) / 100),
    }
  })

  return {
    props: { products },
    revalidate: 60 * 60 * 2, // 2 hours
  }
}
