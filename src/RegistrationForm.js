import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

const RegistrationForm = () => {
  const MIN_AGE = 18;
  const [loading, setLoading] = useState(false)
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    // Adjust age if the birthday hasn't occurred yet this year
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      residentialStreet1: "",
      residentialStreet2: "",
      sameAsResidential: false,
      permanentStreet1: "",
      permanentStreet2: "",
      documents: [
        { fileName: "", fileType: "", file: null },
        { fileName: "", fileType: "", file: null },
      ],
    },


    validationSchema: Yup.object({
      firstName: Yup.string()
        .max(15, "Must be 15 characters or less")
        .required("First name is required."),
      lastName: Yup.string()
        .max(20, "Must be 20 characters or less.")
        .required("Last name is required."),
      email: Yup.string().email("Invalid email address").required("Email is required."),
      dateOfBirth: Yup.date()
        .max(new Date(), "Invalid date of birth")
        .test(
          'age',
          `You must be at least ${MIN_AGE} years old.`,
          value => value && calculateAge(value) >= MIN_AGE
        )
        .required("Date of Birth is Required."),
      residentialStreet1: Yup.string().required("Street1 is Required."),
      residentialStreet2: Yup.string().required("Street2 is Required."),

      permanentStreet1: Yup.string().test(
        'is-required',
        'Permanent Street1 is Required.',
        function (value) {
          const { sameAsResidential } = this.parent;
          return sameAsResidential || !!value;
        }
      ),
      permanentStreet2: Yup.string().test(
        'is-required',
        'Permanent Street2 is Required.',
        function (value) {
          const { sameAsResidential } = this.parent;
          return sameAsResidential || !!value;
        }
      ),
      documents: Yup.array().of(
        Yup.object().shape({
          fileName: Yup.string().required("File name is required."),
          fileType: Yup.string().required("File type is required."),
          file: Yup.mixed().required("File is required."),
        })
      ),
    }),
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  //  api intergration

  function handleSubmit(data) {
    try {
      setLoading(true)
      const formData = new FormData();
      formData.set("firstName", data.firstName);
      formData.set("lastName", data.lastName);
      formData.set("email", data.email);
      formData.set("residentialaddress[street1]", data.residentialStreet1);
      formData.set("residentialaddress[street2]", data.residentialStreet2);
      if (data?.permanentStreet1 && data?.permanentStreet2) {
        formData.set("permanentaddress[street1]", data?.permanentStreet1);
        formData.set("permanentaddress[street1]", data?.permanentStreet2);
      }
      if (data.documents) {
        data.documents?.map((item, key) => {
          formData.set(`documents[${key}][filename]`, item.fileName);
          formData.set(`documents[${key}][filetype]`, item.fileType);
          formData.set(`documents[${key}][file]`, item.file);
        })
      }

      axios.post(`${process.env.REACT_APP_BASEURI}/api/v1/register`, formData,
        { 'Content-Type': 'multipart/form-data' })
        .then((res) => {
          formik.resetForm()
          toast.success(res.data?.message)
          setLoading(false)
        }).catch((error) => {
          toast.error(`Error : ${error?.response?.data?.message}`)
          console.log(error?.response?.data?.message, "error");
          setLoading(false)
        })
    } catch (error) {
      setLoading(false)
      console.log(error, "error");
    }
  }

  return (
    <>
      <ToastContainer />
      <form
        onSubmit={formik.handleSubmit}
        className="p-6 bg-white rounded-lg shadow-md space-y-4 my-5"
      >
        {/* Name Fields */}
        <div className="flex flex-wrap -mx-2">

          <div className="w-full md:w-1/2 px-2">
            <label className="block text-sm mb-2 font-bold text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your first name here."
              name="firstName"
              className=" border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            {formik.touched.firstName && formik.errors.firstName ? (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.firstName}
              </div>
            ) : null}
          </div>
          <div className="w-full md:w-1/2 px-2">
            <label className="block text-sm mb-2  font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="lastName"
              placeholder="Enter your last name here."
              className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
            {formik.touched.lastName && formik.errors.lastName ? (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.lastName}
              </div>
            ) : null}
          </div>
        </div>

        {/* Email and Date of Birth Fields */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2">
            <label className="block text-sm mb-2  font-medium text-gray-700">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="ex: myname@example.com"
              name="email"
              className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.email}
              </div>
            ) : null}
          </div>
          <div className="w-full md:w-1/2 px-2">
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="dateOfBirth"
              placeholder="Date of Birth"
              className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
            <div><small>(Min. age should be 18 Years)</small></div>
            {formik.touched.dateOfBirth && formik.errors.dateOfBirth ? (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.dateOfBirth}
              </div>
            ) : null}
          </div>
        </div>

        {/* Residential Address Fields */}
        <div>
          <label className="block text-md mb-2 font-medium text-gray-700">
            Residential Address
          </label>
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-sm  mb-2 font-medium text-gray-500">
                Street 1<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formik.values.residentialStreet1}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="residentialStreet1"
                className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
              {formik.touched.residentialStreet1 &&
                formik.errors.residentialStreet1 ? (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.residentialStreet1}
                </div>
              ) : null}
            </div>
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-sm mb-2 font-medium text-gray-500">
                Street 2<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formik.values.residentialStreet2}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="residentialStreet2"
                className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
              {formik.touched.residentialStreet2 &&
                formik.errors.residentialStreet2 ? (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.residentialStreet2}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Same as Residential Address Checkbox */}
        <div className="flex items-center mb-2">
          <input
            id="address_checkbox"
            type="checkbox"
            value={formik.values.sameAsResidential}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            name="sameAsResidential"
            className="mr-2 text-md"
          />
          <label htmlFor='address_checkbox' className="block text-md font-bold text-gray-700">
            Same as Residential Address
          </label>
        </div>

        {/* Permanent Address Fields */}
        <div>
          <label className="block text-md mb-2 font-bold text-gray-700">
            Permanent Address
          </label>
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-sm mb-2 font-medium text-gray-500">
                Street 1
              </label>
              <input
                type="text"
                value={
                  formik.values.sameAsResidential
                    ? formik.values.residentialStreet1
                    : formik.values.permanentStreet1
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="permanentStreet1"
                className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
              {formik.touched.permanentStreet1 &&
                formik.errors.permanentStreet1 ? (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.permanentStreet1}
                </div>
              ) : null}
            </div>
            <div className="w-full md:w-1/2 px-2">
              <label className="block text-sm mb-2 font-medium text-gray-500">
                Street 2
              </label>
              <input
                type="text"
                value={
                  formik.values.sameAsResidential
                    ? formik.values.residentialStreet2
                    : formik.values.permanentStreet2
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="permanentStreet2"
                className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
              {formik.touched.permanentStreet2 &&
                formik.errors.permanentStreet2 ? (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.permanentStreet2}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Documents Upload Section */}
        <div>
          <label className="block text-md mb-4 mt-4 font-bold text-gray-700">
            Upload Documents
          </label>
          {formik.values?.documents?.map((_, index) => (
            <div key={index} className="flex items-center space-x-4 mt-2">
              <div className="w-1/3">
                <label className="block text-sm mb-2 font-medium text-gray-500">File Name</label>
                <input
                  type="text"
                  value={formik.values.documents[index].fileName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name={`documents[${index}].fileName`}
                  // className="block w-1/3 rounded-md border-gray-300 shadow-sm"
                  className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="File Name"
                />
                {(formik.touched?.documents && formik.errors?.documents) ? formik.touched?.documents[index]?.fileName &&
                  formik.errors?.documents[index]?.fileName ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors?.documents[index]?.fileName}
                  </div>
                ) : null : null}
              </div>
              <div className="w-1/3">
                <label className="block text-sm mb-2 font-medium text-gray-500">Type of File</label>
                <select
                  value={formik.values.documents[index].fileType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name={`documents[${index}].fileType`}
                  className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                  <option value="" label="Select file type" />
                  <option value="image" label="Image" />
                  <option value="pdf" label="PDF" />
                </select>
                {(formik.touched?.documents && formik.errors?.documents) ? formik.touched?.documents[index]?.fileType &&
                  formik.errors?.documents[index]?.fileType ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors?.documents[index]?.fileType}
                  </div>
                ) : null : null}
              </div>
              <div className="w-1/3">
                <label className="block text-sm mb-2 font-medium text-gray-500">Upload Document</label>
                <input
                  type="file"
                  name={`documents[${index}].file`}
                  onChange={(event) => {
                    formik.setFieldValue(
                      `documents[${index}].file`,
                      event.currentTarget.files[0]
                    );
                  }}
                  onBlur={formik.handleBlur}
                  className="border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                {(formik.touched?.documents && formik.errors?.documents) ? formik.touched?.documents[index]?.file &&
                  formik.errors?.documents[index]?.file ? (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors?.documents[index]?.file}
                  </div>
                ) : null : null}
              </div>

            </div>
          ))}

          <div className="text-end">
            <button
              type="button"
              onClick={() =>
                formik.setFieldValue("documents", [
                  ...formik.values.documents,
                  { fileName: "", fileType: "", file: null },
                ])
              }
              className="mt-2 text-blue-600 ms-2"
            >
              <img
                src={require("./assest/icons/add.png")}
                alt=""
                width="60%"
                height="50%"
              />
            </button>
            <button
              type="button"
              onClick={() => {
                if (formik.values.documents.length > 2) {
                  let newDocuments = formik.values.documents;
                  newDocuments.pop();

                  formik.setFieldValue("documents", newDocuments);
                }
              }}
              className="text-red-600"
            >
              <img
                src={require("./assest/icons/delete.png")}
                width="60%"
                height="50%"
                alt=""
              />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading ? true : false}
            className="bg-slate-700 text-white font-medium rounded-lg text-sm px-7 py-4 text-center me-2 inline-flex items-center">
            {loading ? <><svg aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
            </svg>
              Loading... </> : "Submit"}
          </button>

        </div>
      </form>
    </>
  );
};

export default RegistrationForm;
