import React from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'

function safeParseProductDetails(data) {
  try {
    const firstParse = JSON.parse(data);
    if (typeof firstParse === 'string') {
      return JSON.parse(firstParse);
    }
    return firstParse;
  } catch {
    return {};
  }
}

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order) || []

  if (!orders.length) {
    return (
      <div>
        <div className='p-3 font-semibold bg-white shadow-md'>
          <h1>Order</h1>
        </div>
        <NoData />
      </div>
    )
  }

  return (
    <div>
      <div className='p-3 font-semibold bg-white shadow-md'>
        <h1>Order</h1>
      </div>
      {orders.map((order, index) => {
        const product = safeParseProductDetails(order.product_details)

        const imageUrl = product.image && product.image.length > 0 ? product.image[0] : null

        return (
          <div key={`${order.id || order._id}-${index}-order`} className='p-4 text-sm rounded order'>
            <p>Order No : {order?.orderId || 'N/A'}</p>
            <div className='flex items-center gap-3'>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name || 'product image'}
                  className='object-cover rounded w-14 h-14'
                />
              ) : (
                <div className='flex items-center justify-center text-xs text-gray-500 bg-gray-200 rounded w-14 h-14'>
                  No Image
                </div>
              )}
              <p className='font-medium'>{product.name || 'No name'}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MyOrders
