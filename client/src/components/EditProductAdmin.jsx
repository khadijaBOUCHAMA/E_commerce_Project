import React, { useState } from 'react';
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux';
import { IoClose } from "react-icons/io5";
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';
import { useEffect } from 'react';

const EditProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  const [data, setData] = useState({
    _id: propsData?._id || "",
    name: propsData?.name || "",
    image: propsData?.image || [],
    category: propsData?.category || [],
    subCategory: propsData?.subCategory || [],
    unit: propsData?.unit || "",
    stock: propsData?.stock || "",
    price: propsData?.price || "",
    discount: propsData?.discount || "",
    description: propsData?.description || "",
    more_details: propsData?.more_details || {},
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const allCategory = useSelector(state => state.product.allCategory || []);
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const allSubCategory = useSelector(state => state.product.allSubCategory || []);
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const response = await uploadImage(file);
      const imageUrl = response?.data?.data?.url;
      setData(prev => ({ ...prev, image: [...(prev.image || []), imageUrl] }));
    } catch (err) {
      console.error(err);
    }
    setImageLoading(false);
  };

  const handleDeleteImage = (index) => {
    const newImages = [...(data.image || [])];
    newImages.splice(index, 1);
    setData(prev => ({ ...prev, image: newImages }));
  };

  const handleRemoveCategory = (index) => {
    const newCategories = [...(data.category || [])];
    newCategories.splice(index, 1);
    setData(prev => ({ ...prev, category: newCategories }));
  };

  const handleRemoveSubCategory = (index) => {
    const newSubCategories = [...(data.subCategory || [])];
    newSubCategories.splice(index, 1);
    setData(prev => ({ ...prev, subCategory: newSubCategories }));
  };

  const handleAddField = () => {
    setData(prev => ({
      ...prev,
      more_details: {
        ...prev.more_details,
        [fieldName]: ""
      }
    }));
    setFieldName("");
    setOpenAddField(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: data
      });
      const { data: responseData } = response;
      if (responseData.success) {
        successAlert(responseData.message);
        close?.();
        fetchProductData?.();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 z-50 p-4 bg-black bg-opacity-70'>
      <div className='bg-white w-full p-4 max-w-2xl mx-auto rounded overflow-y-auto h-full max-h-[95vh]'>
        <div className='flex items-center justify-between p-2 bg-white shadow-md'>
          <h2 className='font-semibold'>Edit Product</h2>
          <button onClick={close}>
            <IoClose size={20} />
          </button>
        </div>

        <form className='grid gap-4 p-3' onSubmit={handleSubmit}>
          {/* Name */}
          <div className='grid gap-1'>
            <label htmlFor='name' className='font-medium'>Name</label>
            <input
              id='name'
              name='name'
              type='text'
              value={data.name}
              onChange={handleChange}
              required
              className='p-2 border rounded bg-blue-50'
            />
          </div>

          {/* Description */}
          <div className='grid gap-1'>
            <label htmlFor='description' className='font-medium'>Description</label>
            <textarea
              id='description'
              name='description'
              value={data.description}
              onChange={handleChange}
              rows={3}
              required
              className='p-2 border rounded resize-none bg-blue-50'
            />
          </div>

          {/* Image Upload */}
          <div className='grid gap-2'>
            <p className='font-medium'>Images</p>
            <label htmlFor='productImage' className='flex items-center justify-center h-24 border rounded cursor-pointer bg-blue-50'>
              {imageLoading ? <Loading /> : (
                <div className='text-center'>
                  <FaCloudUploadAlt size={35} />
                  <p>Upload Image</p>
                </div>
              )}
              <input type='file' id='productImage' className='hidden' accept='image/*' onChange={handleUploadImage} />
            </label>

            <div className='flex flex-wrap gap-2'>
              {(data.image || []).map((img, idx) => (
                <div key={idx} className='relative w-20 h-20 border bg-blue-50 group'>
                  <img src={img} alt="uploaded" className='object-contain w-full h-full' onClick={() => setViewImageURL(img)} />
                  <button type='button' onClick={() => handleDeleteImage(idx)} className='absolute bottom-0 right-0 hidden p-1 text-white bg-red-600 group-hover:block'>
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className='grid gap-1'>
            <label className='font-medium'>Category</label>
            <select
              className='p-2 border rounded bg-blue-50'
              value={selectCategory}
              onChange={(e) => {
                const cat = allCategory.find(c => c._id === e.target.value);
                if (cat) {
                  setData(prev => ({ ...prev, category: [...(prev.category || []), cat] }));
                }
                setSelectCategory("");
              }}
            >
              <option value="">Select Category</option>
              {allCategory.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <div className='flex flex-wrap gap-2'>
              {(data.category || []).map((c, idx) => (
                <div key={c._id + idx} className='flex items-center px-2 py-1 rounded bg-blue-50'>
                  <span>{c.name}</span>
                  <button type='button' onClick={() => handleRemoveCategory(idx)} className='ml-1'>
                    <IoClose />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SubCategory */}
          <div className='grid gap-1'>
            <label className='font-medium'>Sub Category</label>
            <select
              className='p-2 border rounded bg-blue-50'
              value={selectSubCategory}
              onChange={(e) => {
                const sub = allSubCategory.find(s => s._id === e.target.value);
                if (sub) {
                  setData(prev => ({ ...prev, subCategory: [...(prev.subCategory || []), sub] }));
                }
                setSelectSubCategory("");
              }}
            >
              <option value="">Select Sub Category</option>
              {allSubCategory.map(sc => (
                <option key={sc._id} value={sc._id}>{sc.name}</option>
              ))}
            </select>
            <div className='flex flex-wrap gap-2'>
              {(data.subCategory || []).map((c, idx) => (
                <div key={c._id + idx} className='flex items-center px-2 py-1 rounded bg-blue-50'>
                  <span>{c.name}</span>
                  <button type='button' onClick={() => handleRemoveSubCategory(idx)} className='ml-1'>
                    <IoClose />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Other Fields (unit, stock, price, etc.) */}
          {/* Ajoutez ici les autres champs comme "unit", "price", "discount", etc. de la même façon */}

          {/* Submit Button */}
          <button type='submit' className='py-2 text-white bg-blue-600 rounded hover:bg-blue-700'>
            Save Changes
          </button>
        </form>
      </div>
      {ViewImageURL && <ViewImage url={ViewImageURL} onClose={() => setViewImageURL("")} />}
    </section>
  );
};

export default EditProductAdmin;
