import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from './Loading'
import { useSelector } from 'react-redux'
import { FaMinus, FaPlus } from "react-icons/fa6";

const AddToCartButton = ({ data }) => {
    const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails, setCartItemsDetails] = useState()

    const handleADDTocart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setLoading(true);

            const postData = {
                productId: data?._id,
                qty: 1
            };

            console.log("Posting to /api/cart/create with data:", postData);

            const response = await Axios({
                ...SummaryApi.addTocart,
                data: postData
            });

            const { data: responseData } = response;

            if (responseData.success) {
                toast.success(responseData.message);
                if (fetchCartItem) {
                    fetchCartItem();
                }
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        console.log('Cart items:', cartItem);
    }, [cartItem]);

    //checking this item in cart or not
    useEffect(() => {
        const checkingitem = cartItem.some(item => item.productId._id === data._id)
        setIsAvailableCart(checkingitem)

        const product = cartItem.find(item => item.productId._id === data._id)
        setQty(product?.quantity)
        setCartItemsDetails(product)
    }, [data, cartItem])


    const increaseQty = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("increaseQty called with id:", cartItemDetails?.id, "qty:", qty + 1);

        const response = await updateCartItem(cartItemDetails?.id, qty + 1);

        if (response.success) {
            toast.success("Item added");
        }
    }


    const decreaseQty = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("decreaseQty called with id:", cartItemDetails?.id, "qty:", qty - 1);

        if (qty === 1) {
            deleteCartItem(cartItemDetails?.id);
        } else {
            const response = await updateCartItem(cartItemDetails?.id, qty - 1);

            if (response.success) {
                toast.success("Item removed");
            }
        }
    }

    return (
        <div className='w-full max-w-[150px]'>
            {
                isAvailableCart ? (
                    <div className='flex w-full h-full'>
                        <button onClick={decreaseQty} className='flex items-center justify-center flex-1 w-full p-1 text-white bg-green-600 rounded hover:bg-green-700'><FaMinus /></button>

                        <p className='flex items-center justify-center flex-1 w-full px-1 font-semibold'>{qty}</p>

                        <button onClick={increaseQty} className='flex items-center justify-center flex-1 w-full p-1 text-white bg-green-600 rounded hover:bg-green-700'><FaPlus /></button>
                    </div>
                ) : (
                    <button onClick={handleADDTocart} className='px-2 py-1 text-white bg-green-600 rounded hover:bg-green-700 lg:px-4'>
                        {loading ? <Loading /> : "Add"}
                    </button>
                )
            }

        </div>
    )
}

export default AddToCartButton
