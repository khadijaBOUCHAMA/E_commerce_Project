import React, { useState } from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from './AddToCartButton'

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`
  const [loading, setLoading] = useState(false)

  // ✅ Vérification & transformation des prix
  const price = Number(data.price) || 0
  const discount = Number(data.discount) || 0
  const discountedPrice = pricewithDiscount(price, discount)

  return (
    <Link to={url} className='grid gap-1 py-2 bg-white border rounded cursor-pointer lg:p-4 lg:gap-3 min-w-36 lg:min-w-52'>
      <div className='w-full overflow-hidden rounded min-h-20 max-h-24 lg:max-h-32'>
        <img
          src={data.image[0]}
          className='object-scale-down w-full h-full lg:scale-125'
          alt={data.name}
        />
      </div>

      <div className='flex items-center gap-1'>
        <div className='rounded text-xs w-fit p-[1px] px-2 text-green-600 bg-green-50'>
          10 min
        </div>
        {discount > 0 && (
          <p className='px-2 text-xs text-green-600 bg-green-100 rounded-full w-fit'>
            {discount}% discount
          </p>
        )}
      </div>

      <div className='px-2 text-sm font-medium lg:px-0 text-ellipsis lg:text-base line-clamp-2'>
        {data.name}
      </div>

      <div className='gap-1 px-2 text-sm w-fit lg:px-0 lg:text-base'>
        {data.unit}
      </div>

      <div className='flex items-center justify-between gap-1 px-2 text-sm lg:px-0 lg:gap-3 lg:text-base'>
        <div className='flex items-center gap-1'>
          <div className='font-semibold'>
            {DisplayPriceInRupees(discountedPrice)}
          </div>
        </div>
        <div>
          {data.stock === 0 ? (
            <p className='text-sm text-center text-red-500'>Out of stock</p>
          ) : (
            <AddToCartButton data={data} />
          )}
        </div>
      </div>
    </Link>
  )
}

export default CardProduct
