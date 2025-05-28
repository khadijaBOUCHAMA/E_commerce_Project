import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import AddAddress from '../components/AddAddress'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import EditAddressDetails from '../components/EditAddressDetails';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';

const Address = () => {
  const addressList = useSelector(state => state.addresses.addressList)
  const [openAddress, setOpenAddress] = useState(false)
  const [OpenEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({})
  const { fetchAddress } = useGlobalContext()

  const handleDisableAddress = async (id) => {
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress(id),
        data: {
          id: id
        }
      })
      if (response.data.success) {
        toast.success("Address Remove")
        if (fetchAddress) {
          fetchAddress()
        }
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }
  return (
    <div className=''>
      <div className='flex items-center justify-between gap-4 px-2 py-2 bg-white shadow-lg '>
        <h2 className='font-semibold text-ellipsis line-clamp-1'>Address</h2>
        <button onClick={() => setOpenAddress(true)} className='px-3 py-1 border rounded-full border-primary-200 text-primary-200 hover:bg-primary-200 hover:text-black'>
          Add Address
        </button>
      </div>
      <div className='grid gap-4 p-2 bg-blue-50'>
        {
          addressList.map((address, index) => {
            return (
              <div className={`border rounded p-3 flex gap-3 bg-white ${!address.status && 'hidden'}`}>
                <div className='w-full'>
                  <p>{address.address_line}</p>
                  <p>{address.city}</p>
                  <p>{address.state}</p>
                  <p>{address.country} - {address.pincode}</p>
                  <p>{address.mobile}</p>
                </div>
                <div className='grid gap-10 '>
                  <button onClick={() => {
                    setOpenEdit(true)
                    setEditData(address)
                  }} className='p-1 bg-green-200 rounded hover:text-white hover:bg-green-600'>
                    <MdEdit />
                  </button>
                  <button onClick={() =>
                    handleDisableAddress(address.id)
                  } className='p-1 bg-red-200 rounded hover:text-white hover:bg-red-600'>
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            )
          })
        }
        <div onClick={() => setOpenAddress(true)} className='flex items-center justify-center h-16 border-2 border-dashed cursor-pointer bg-blue-50'>
          Add address
        </div>
      </div>

      {
        openAddress && (
          <AddAddress close={() => setOpenAddress(false)} />
        )
      }

      {
        OpenEdit && (
          <EditAddressDetails data={editData} close={() => setOpenEdit(false)} />
        )
      }
    </div>
  )
}

export default Address
