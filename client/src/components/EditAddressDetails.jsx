import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const EditAddressDetails = ({ close, data }) => {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            id: data.id,  // Assure-toi que c'est bien 'id' ou '_id' selon ce que tu as
            userId: data.userId,
            address_line: data.address_line,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
            mobile: data.mobile,
        }
    })

    const { fetchAddress } = useGlobalContext()

    const onSubmit = async (formData) => {
        try {
            const response = await Axios({
                ...SummaryApi.updateAddress,
                data: {
                    ...formData
                    // Pas besoin de répéter les champs, ils sont déjà dans formData
                }
            })

            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData.message)
                if (close) {
                    close()
                    reset()
                    fetchAddress()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
        <section className='fixed top-0 bottom-0 left-0 right-0 z-50 h-screen overflow-auto bg-black bg-opacity-70'>
            <div className='w-full max-w-lg p-4 mx-auto mt-8 bg-white rounded'>
                <div className='flex items-center justify-between gap-4'>
                    <h2 className='font-semibold'>Edit Address</h2>
                    <button onClick={close} className='hover:text-red-500'>
                        <IoClose size={25} />
                    </button>
                </div>
                <form className='grid gap-4 mt-4' onSubmit={handleSubmit(onSubmit)}>
                    {/* Champ caché pour envoyer l'id */}
                    <input type="hidden" {...register("id")} />

                    <div className='grid gap-1'>
                        <label htmlFor='addressline'>Address Line :</label>
                        <input
                            type='text'
                            id='addressline'
                            className='p-2 border rounded bg-blue-50'
                            {...register("address_line", { required: true })}
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='city'>City :</label>
                        <input
                            type='text'
                            id='city'
                            className='p-2 border rounded bg-blue-50'
                            {...register("city", { required: true })}
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='state'>State :</label>
                        <input
                            type='text'
                            id='state'
                            className='p-2 border rounded bg-blue-50'
                            {...register("state", { required: true })}
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='pincode'>Pincode :</label>
                        <input
                            type='text'
                            id='pincode'
                            className='p-2 border rounded bg-blue-50'
                            {...register("pincode", { required: true })}
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='country'>Country :</label>
                        <input
                            type='text'
                            id='country'
                            className='p-2 border rounded bg-blue-50'
                            {...register("country", { required: true })}
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='mobile'>Mobile No. :</label>
                        <input
                            type='text'
                            id='mobile'
                            className='p-2 border rounded bg-blue-50'
                            {...register("mobile", { required: true })}
                        />
                    </div>

                    <button type='submit' className='w-full py-2 mt-4 font-semibold bg-primary-200 hover:bg-primary-100'>Submit</button>
                </form>
            </div>
        </section>
    )
}

export default EditAddressDetails
