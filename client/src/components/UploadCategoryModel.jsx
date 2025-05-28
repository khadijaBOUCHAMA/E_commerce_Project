import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError';

const UploadCategoryModel = ({ close, fetchData }) => {
    const [data, setData] = useState({
        name: "",
        image: ""
    })
    const [loading, setLoading] = useState(false)

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setData((preve) => ({
            ...preve,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!data.name || !data.image) {
            toast.error("Merci de renseigner le nom et l'image avant de soumettre.")
            return
        }

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.addCategory,
                data: data
            })
            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData.message)
                close()
                fetchData()
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUploadCategoryImage = async (e) => {
        const file = e.target.files[0]

        if (!file) {
            return
        }

        try {
            setLoading(true)
            const response = await uploadImage(file)
            const { data: ImageResponse } = response

            setData((preve) => ({
                ...preve,
                image: ImageResponse.data.url
            }))
            toast.success("Image uploadée avec succès")
        } catch (error) {
            toast.error("Erreur lors de l'upload de l'image")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center p-4 bg-neutral-800 bg-opacity-60'>
            <div className='w-full max-w-4xl p-4 bg-white rounded'>
                <div className='flex items-center justify-between'>
                    <h1 className='font-semibold'>Category</h1>
                    <button onClick={close} className='block ml-auto w-fit'>
                        <IoClose size={25} />
                    </button>
                </div>
                <form className='grid gap-2 my-3' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label id='categoryName'>Name</label>
                        <input
                            type='text'
                            id='categoryName'
                            placeholder='Enter category name'
                            value={data.name}
                            name='name'
                            onChange={handleOnChange}
                            className='p-2 border border-blue-100 rounded outline-none bg-blue-50 focus-within:border-primary-200'
                        />
                    </div>
                    <div className='grid gap-1'>
                        <p>Image</p>
                        <div className='flex flex-col items-center gap-4 lg:flex-row'>
                            <div className='flex items-center justify-center w-full border rounded bg-blue-50 h-36 lg:w-36'>
                                {
                                    data.image ? (
                                        <img
                                            alt='category'
                                            src={data.image}
                                            className='object-scale-down w-full h-full'
                                        />
                                    ) : (
                                        <p className='text-sm text-neutral-500'>No Image</p>
                                    )
                                }
                            </div>
                            <label htmlFor='uploadCategoryImage'>
                                <div
                                    className={`border-primary-200 hover:bg-primary-100 px-4 py-2 rounded cursor-pointer border font-medium`}
                                >
                                    Upload Image
                                </div>

                                <input
                                    onChange={handleUploadCategoryImage}
                                    type='file'
                                    id='uploadCategoryImage'
                                    className='hidden'
                                    accept="image/*"
                                />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!(data.name && data.image) || loading}
                        className={`
                            ${data.name && data.image ? "bg-primary-200 hover:bg-primary-100" : "bg-gray-300 cursor-not-allowed"}
                            py-2    
                            font-semibold 
                            rounded
                        `}
                    >
                        {loading ? "Chargement..." : "Add Category"}
                    </button>
                </form>
            </div>
        </section>
    )
}

export default UploadCategoryModel
