import React, { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { zipCodes } from '~/constants/Constants';

import * as Yup from 'yup';

import { type FormPayload } from '~/pages/api/form';
import { type WithResponseProps } from '~/pages/index';
import Image from 'next/image';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  otherZip: string;
  eventName: string;
};

// schema for Yup validation on form submission
const validationSchema = Yup.object({
  firstName: Yup.string().required('Please enter your first name'),
  lastName: Yup.string(),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(10, 'Must be exactly 10 digits')
    .max(10, 'Must be exactly 10 digits'),
  zip: Yup.string()
    .required('Zip code is required'),
  otherZip: Yup.string()
    .when('zip', {
      is: (zip: string) => zip === 'Other',
      then: (schema) => schema.required('Zip code is required')
        .matches(/^[0-9]+$/, "Must be only digits")
        .length(5, 'Must be exactly 5 digits'),
      otherwise: (schema) => schema.notRequired(),
    }),
    eventName: Yup.string()
});



const WebForm: React.FC<WithResponseProps> = ({ setResponse }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [eventNameVisible, setEventNameVisible] = React.useState(false);

  const [eventName, setEventName] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('eventName') || 'defaultEventName';
    }
    return 'defaultEventName';
  });
  // handle form submission. This is where we will make our POST request to the server
  const handleSubmit = async (values: FormData) => {
    const payload: FormPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      zip: values.zip === "Other" ? values.otherZip : values.zip,
      eventName: values.eventName,
    }
    const payloadJSON = JSON.stringify(payload);

    // set loading 
    setIsLoading(true);
    let res = await fetch('/api/form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payloadJSON,
    })
    setIsLoading(false);
  
    // update response state (ok -> thank you, !ok -> error)
    setResponse(res.ok);
  };

  useEffect(() => {
    const storedEventName = window.localStorage.getItem('eventName') || 'defaultEventName';
    window.localStorage.setItem('eventName', storedEventName);
  }, []);

  const toggleEventNameVisibility = (enteredValue: string) => {
    if (enteredValue === 'qnbZaz5QCv4L') {
      setEventNameVisible(true);
    } else {
      setEventNameVisible(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded shadow max-w-[800px] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 min-h-screen sm:min-h-0">
      <div className='flex flex-col items-center justify-end md:flex-row-reverse md:items-baseline md:gap-10 md:justify-between'>
        <Image
          src="/logo.png"
          alt="Map showing service region of Downtown Oakland."
          width={200}
          height={100}
        />
        <h1 className="text-primary text-3xl font-heading mb-4 text-center md:text-4xl">East Oakland is #Here2Stay</h1>
      </div>
        {/* Name */}
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            zip: '',
            eventName: typeof window !== 'undefined' ? window.localStorage.getItem('eventName') || 'defaultEventName' : 'defaultEventName',
          } as FormData}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
          
            handleSubmit(values);

            // After form submission, set the eventName in localStorage and Formik's state.
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('eventName', values.eventName);
            }
            actions.setFieldValue('eventName', values.eventName);
          }}
        >
          {({ values, setFieldValue, errors, touched }) => {
            
            const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              setEventName(e.target.value);
            };
            const errorClass = 'text-red-500';
    
            return (
              <Form>
                <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label htmlFor="firstName" className="block mb-1 text-lg">First Name:</label>
                    <Field
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                        errors.firstName && touched.firstName ? errorClass : ''
                      }`}
                    />
                    <ErrorMessage name="firstName" component="div" className={errorClass} />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label htmlFor="lastName" className="block mb-1 text-lg">Last Name:</label>
                    <Field
                      type="text"
                      id="lastName"
                      name="lastName"
                      onChange={(e: any) => {
                        const enteredValue = e.target.value;
                        setFieldValue('lastName', enteredValue);
                        toggleEventNameVisibility(enteredValue);
                      }}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                        errors.lastName && touched.lastName ? errorClass : ''
                      }`}
                    />
                    <ErrorMessage name="lastName" component="div" className={errorClass} />
                  </div>
                </div>
    
                {/* Email */}
                <div className="mb-4">
                <h6 className="mb-4 text-primary">If you don't have an email please use <span className='italic'> here2stay@ebprec.org</span> & provide a phone number that is best to you.</h6>
                  <label htmlFor="email" className="block mb-1 text-lg">Email:</label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                      errors.email && touched.email ? errorClass : ''
                    }`}
                  />
                  <ErrorMessage name="email" component="div" className={errorClass} />
                </div>
    
                {/* Phone */}
                <div className="mb-4">
                  <label htmlFor="phone" className="block mb-1 text-lg">Phone Number:</label>
                  <Field
                    type="text"
                    id="phone"
                    name="phone"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                      errors.phone && touched.phone ? errorClass : ''
                    }`}
                  />
                  <ErrorMessage name="phone" component="div" className={errorClass} />
                </div>
    
                {/* Zip Code */}
                <div className="mb-4">
                  <label htmlFor="zip" className="block mb-1 text-lg">Zip Code:</label>
                  <div className="flex gap-4">
                    <Field
                      as="select"
                      id="zip"
                      name="zip"
                      className={`px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                        errors.zip && touched.zip ? errorClass : ''
                      }`}
                    >
                      <option value="">Select a Zip Code</option>
                      {zipCodes.map((zip) => (
                        <option key={zip} value={zip}>{zip}</option>
                        ))}
                    </Field> 
                    {values.zip === "Other" && (
                      <Field
                        type="text"
                        id="otherZip"
                        name="otherZip"
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 ${
                          errors.zip && touched.zip ? errorClass : ''
                        }`}
                      />
                    )}
                  </div>
                  <ErrorMessage name="zip" component="div" className={errorClass} />
                  <ErrorMessage name="otherZip" component="div" className={errorClass} />
                </div>

                
            {eventNameVisible && (
              <div className="mb-4">
                <label htmlFor="eventName" className="block mb-1 text-lg">Event Name:</label>
                <Field
                  type="text"
                  id="eventName"
                  name="eventName"
                  
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                  
                />
              </div>
            )}

                {/* Submit */}
                <div className="flex flex-col justify-center items-center">
                  {((touched.firstName && errors.firstName) ||
                    (touched.email && errors.email) ||
                    (touched.phone && errors.phone)) && (
                      <p className={errorClass}>Please fill out all required fields.</p>
                    )}
                  <button
                    type="submit"
                    id="submitBtn"
                    className="w-full max-w-md px-3 py-4 mt-4 text-white bg-primary rounded-lg focus:outline-none"
                  >
                    {isLoading ? (
                      <FaSpinner className="animate-spin mx-auto" />
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </Form>
            );
         }}
        </Formik>
    </div>
  );
};

export default WebForm;
