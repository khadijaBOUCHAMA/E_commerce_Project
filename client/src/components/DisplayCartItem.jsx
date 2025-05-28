import React from 'react'
import { IoClose } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { FaCaretRight } from "react-icons/fa"
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import imageEmpty from '../assets/empty_cart.webp'
import toast from 'react-hot-toast'

const DisplayCartItem = ({ close }) => {
    const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const navigate = useNavigate()

    const redirectToCheckoutPage = () => {
        if (user?.id) {
            navigate("/checkout")
            if (close) close()
        } else {
            toast("Please Login")
        }
    }

    return (
        <section className='fixed top-0 bottom-0 left-0 right-0 z-50 bg-neutral-900 bg-opacity-70'>
            <div className='w-full max-w-sm max-h-screen min-h-screen ml-auto bg-white'>
                {/* Header */}
                <div className='flex items-center justify-between gap-3 p-4 shadow-md'>
                    <h2 className='font-semibold'>Cart</h2>
                    <Link to={"/"} className='lg:hidden'>
                        <IoClose size={25} />
                    </Link>
                    <button onClick={close} className='hidden lg:block'>
                        <IoClose size={25} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className='min-h-[75vh] lg:min-h-[80vh] h-full max-h-[calc(100vh-150px)] bg-blue-50 p-2 flex flex-col gap-4'>
                    {
                        cartItem.length > 0 ? (
                            <>
                                {/* Savings */}
                                <div className='flex items-center justify-between px-4 py-2 text-blue-500 bg-blue-100 rounded-full'>
                                    <p>Your total savings</p>
                                    <p>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}</p>
                                </div>

                                {/* Items list */}
                                <div className='grid gap-5 p-4 overflow-auto bg-white rounded-lg'>
                                    {cartItem.map((item, index) => (
                                        <div key={item?._id + "cartItemDisplay"} className='flex w-full gap-4'>
                                            <div className='flex flex-col items-center justify-center bg-white'>
                                                <img
                                                    src={item?.product_details?.image?.[0] || "https://via.placeholder.com/64"}
                                                    className='object-scale-down w-full h-full max-w-[64px] max-h-[64px]'
                                                    alt={item?.product_details?.name || "product image"}
                                                />
                                            </div>
                                            <div className='w-full max-w-sm text-xs'>
                                                <p className='text-xs text-ellipsis line-clamp-2'>{item?.product_details?.name}</p>
                                                <p className='text-neutral-400'>{item?.product_details?.unit}</p>
                                                <p className='font-semibold'>
                                                    {DisplayPriceInRupees(pricewithDiscount(item?.product_details?.price, item?.product_details?.discount))}
                                                </p>
                                            </div>
                                            <div>
                                                <AddToCartButton data={item?.productId} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bill details */}
                                <div className='p-4 bg-white'>
                                    <h3 className='font-semibold'>Bill details</h3>
                                    <div className='flex justify-between gap-4 ml-1'>
                                        <p>Items total</p>
                                        <p className='flex items-center gap-2'>
                                            <span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                                            <span>{DisplayPriceInRupees(totalPrice)}</span>
                                        </p>
                                    </div>
                                    <div className='flex justify-between gap-4 ml-1'>
                                        <p>Quantity total</p>
                                        <p>{totalQty} item{totalQty > 1 && "s"}</p>
                                    </div>
                                    <div className='flex justify-between gap-4 ml-1'>
                                        <p>Delivery Charge</p>
                                        <p>Free</p>
                                    </div>
                                    <div className='flex items-center justify-between gap-4 font-semibold'>
                                        <p>Grand total</p>
                                        <p>{DisplayPriceInRupees(totalPrice)}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Empty cart section
                            <div className='flex flex-col items-center justify-center h-full gap-4 p-8 bg-white rounded-lg'>
                                <img
                                    src={imageEmpty}
                                    className='object-contain w-40 h-40'
                                    alt="Empty Cart"
                                />
                                <p className='text-lg font-semibold text-center text-gray-500'>Your cart is empty</p>
                                <Link
                                    onClick={close}
                                    to="/"
                                    className='px-4 py-2 text-white bg-green-600 rounded'
                                >
                                    Shop Now
                                </Link>
                            </div>
                        )
                    }
                </div>

                {/* Proceed Button */}
                {
                    cartItem.length > 0 && (
                        <div className='p-2'>
                            <div className='static flex items-center justify-between gap-4 px-4 py-4 text-base font-bold bg-green-700 rounded text-neutral-100'>
                                <div>
                                    {DisplayPriceInRupees(totalPrice)}
                                </div>
                                <button onClick={redirectToCheckoutPage} className='flex items-center gap-1'>
                                    Proceed
                                    <span><FaCaretRight /></span>
                                </button>
                            </div>
                        </div>
                    )
                }
            </div>
        </section>
    )
}

export default DisplayCartItem
