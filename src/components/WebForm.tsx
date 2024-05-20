import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { languages, languagesInSpanish, referralSources, type Interest, InterestGrouping, interestText, referralSource, zipCodes, referralSourcesInSpanish, interestTextInSpanish } from '~/constants/Constants';
import { useLanguage } from '~/context/LanguageContext';
import * as Yup from 'yup';


import { type FormPayload } from '~/pages/api/form';
import { type WithResponseProps } from '~/pages/index';
import Image from 'next/image';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  language: string;
  referralSource: referralSource | undefined;
  interests: Interest[];
  phone: string;
  zip: string;
  otherZip: string;
  urgent: 'Yes' | 'No' | undefined;
  contactMethod: 'phone' | 'email' | undefined;
  communityOwner: 'Yes' | 'No' | undefined;
  appointment: 'Yes' | 'No' | undefined;
  inRegion: 'Yes' | 'No' | undefined;
  notes: string;
  isSpanish: boolean;
};
function getTranslation(isSpanish: boolean, key: string): string {
  if (isSpanish) {
    switch (key) {
      case 'Permanently Affordable Homeownership':
        return 'Ser propietario de una vivienda asequible de forma permanente';
      case 'Housing':
        return 'Vivienda';
      case 'Better Neighborhoods, Same Neighbors':
        return 'Mejores barrios, mismos vecinos';
      case 'Organizing/Volunteering':
        return 'Organización de Movimiento Comunitario o Voluntariado';
      default:
        return key; // Fallback to the original key if no translation is found
    }
  } else {
    return key; // Return the original key if isSpanish is false
  }
}




// schema for Yup validation on form submission


const WebForm: React.FC<WithResponseProps> = ({ setResponse }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [pageNo, setPageNo] = React.useState(1);
  const {isSpanish, setIsSpanish} = useLanguage();
  

  const validationSchema = Yup.object({
    firstName: Yup.string().required(isSpanish ? 'Por favor, pon tu nombre':'Please enter your first name'),
    lastName: Yup.string(),
    email: Yup.string().email(isSpanish ? 'Dirección de Email no válida': 'Invalid email address').required(isSpanish? 'Debes poner un Email':'Email is required'),
    referralSource: Yup.string().required(isSpanish ? 'Debes indicar cómo te enteraste sobre nosotros':'Referral source is required'),
    phone: Yup.string()
      .required(isSpanish ? 'Debes poner un número de teléfono':'Phone number is required')
      .matches(/^[0-9]+$/, isSpanish ? "Debes usar sólo números":"Must be only digits")
      .min(10, isSpanish ? 'Debe tener exactamente 10 dígitos':'Must be exactly 10 digits')
      .max(10, isSpanish ? 'Debe tener exactamente 10 dígitos':'Must be exactly 10 digits'),
    zip: Yup.string()
      .required(isSpanish ? 'Debes indicar un código postal':'Zip code is required'),
    otherZip: Yup.string()
      .when('zip', {
        is: (zip: string) => zip === 'Other',
        then: (schema) => schema.matches(/^[0-9]+$/, isSpanish ? "Debes usar sólo números":"Must be only digits")
          .length(5, isSpanish? 'Debe tener exactamente 5 dígitos':'Must be exactly 5 digits'),
        otherwise: (schema) => schema.notRequired(),
      }),
  });

  // handle form submission. This is where we will make our POST request to the server
  const handleSubmit = async (values: FormData) => {
    const payload: FormPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      language: "",
      interests:
      values.urgent === "Yes"
        ? ["evictions" as Interest].concat(values.interests)
        : values.interests,
      referralSource: values.referralSource!,
      phone: values.phone,
      zip: values.zip === "Other" ? values.otherZip : values.zip,
      contactMethod: values.contactMethod!,
      communityOwner: values.communityOwner!,
      appointment: values.appointment!,
      inRegion: values.inRegion!,
      notes: values.notes,
      isSpanish: isSpanish,
    };
    const payloadJSON = JSON.stringify(payload);

    // set loading
    setIsLoading(true);
    let res = await fetch("/api/form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payloadJSON,
    });
    setIsLoading(false);

    // update response state (ok -> thank you, !ok -> error)
    setResponse(res.ok);
  };

  return (
    <div className="min-h-screen max-w-[800px] rounded border border-gray-300 bg-white p-6 shadow sm:min-h-0 sm:p-8 md:p-10 lg:p-12 xl:p-14">
      <div className="flex flex-col items-center justify-end md:flex-row-reverse md:items-baseline md:justify-between md:gap-10">
        <div>
          <Image
            src="/logo.png"
            alt="Map showing service region of Downtown Oakland."
            width={200}
            height={100}
          />
          
          <div className='max-w-[200px] flex items-center justify-between'>
            <p className='font-bold text-primary'>English</p>
            <button className={`relative border-0 rounded-full cursor-pointer w-8 h-5 appearance-none ${isSpanish ? 'bg-green-500' : 'bg-red-500'}`} onClick={() => setIsSpanish(!isSpanish)}>
              <span className={`absolute bg-white rounded-full w-4 h-4 top-0.5 transition-all duration-500 ease-in-out ${isSpanish ? 'left-3.5'  : 'left-0.5'}`} />
            </button>
            <p className='font-bold text-primary'>Español</p>
          </div>

        </div>

      
        <h1 className="mb-4 text-center font-heading text-3xl text-primary md:text-4xl">
          East Oakland is #Here2Stay
        </h1>
        
        
      </div>
      {/* Name */}
      <Formik
        initialValues={
          {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            zip: "",
            referralSource: undefined,
            isSpanish: true,
          } as FormData
        }
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => {
          // handle checkbox change
          function handleCheckboxChange(
            e: React.ChangeEvent<HTMLInputElement>
          ) {
            const checked = e.target.checked;
            const newInterest = e.target.id as Interest;

            let newInterests = checked
              ? [...values.interests, newInterest]
              : values.interests.filter((key) => key !== newInterest);

            setFieldValue("interests", newInterests);
          }

          const errorClass = "text-red-500";

          return (
            <Form>
                <>
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label htmlFor="firstName" className="mb-1 block text-lg">
                        {isSpanish? "Nombre": "First Name"}:
                      </label>
                      <Field
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={`w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none ${
                          errors.firstName && touched.firstName
                            ? errorClass
                            : ""
                        }`}
                      />
                      <ErrorMessage
                        name="firstName"
                        render={message => (
                          <div className={errorClass}>
                            {isSpanish ? "Por favor, pon tu nombre" : message}
                          </div>
                        )}
                      />
                    </div>{" "}
                    <div className="w-full sm:w-1/2">
                      <label htmlFor="lastName" className="mb-1 block text-lg">
                        {isSpanish? "Apellido": "Last Name"}:
                      </label>
                      <Field
                        type="text"
                        id="lastName"
                        name="lastName"
                        className={`w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none ${
                          errors.lastName && touched.lastName ? errorClass : ""
                        }`}
                      />
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className={errorClass}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <h6 className="mb-4 text-primary">{isSpanish? <>Si no tienes email, usa: <span className='italic'>here2stay@ebprec.org</span> e indica el número de teléfono que más te convenga.</> : <>If you don't have an email please use <span className='italic'>here2stay@ebprec.org</span> & provide a phone number that is best to you.</>}</h6>
                    <label htmlFor="email" className="mb-1 block text-lg">
                      {isSpanish? "Email (Correo electrónico)": "Email"}:
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={`w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none ${
                        errors.email && touched.email ? errorClass : ""
                      }`}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className={errorClass}
                    />
                  </div>

                  {/* Phone */}
                  <div className="mb-4">
                    <h6></h6>
                    <label htmlFor="phone" className="mb-1 block text-lg">
                      {isSpanish? "Teléfono": "Phone Number"}:
                    </label>
                    <Field
                      type="text"
                      id="phone"
                      name="phone"
                      className={`w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none ${
                        errors.phone && touched.phone ? errorClass : ""
                      }`}
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className={errorClass}
                    />
                  </div>

                  {/* Zip Code */}
                  <div className="mb-4">
                    <label htmlFor="zip" className="mb-1 block text-lg">
                      {isSpanish? "Código postal": "Zip Code"}:
                    </label>
                    <div className="flex gap-4">
                      <Field
                        as="select"
                        id="zip"
                        name="zip"
                        className={`rounded border px-3 py-2 focus:border-blue-500 focus:outline-none ${
                          errors.zip && touched.zip ? errorClass : ""
                        }`}
                      >
                        <option value="">{isSpanish? "Selecciona un código postal" : "Select a Zip Code"}</option>
                        {zipCodes.map((zip) => (
                          <option key={zip} value={zip}>
                            {isSpanish && zip === "Other"? "Otro": zip}        
                          </option>
                        ))}
                      </Field>
                      {values.zip === "Other" && (
                        <Field
                          type="text"
                          id="otherZip"
                          name="otherZip"
                          className={`w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none ${
                            errors.zip && touched.zip ? errorClass : ""
                          }`}
                        />
                      )}
                    </div>
                    <ErrorMessage
                      name="zip"
                      component="div"
                      className={errorClass}
                    />
                    <ErrorMessage
                      name="otherZip"
                      component="div"
                      className={errorClass}
                    />
                  </div>

                  {/* Referral Source */}
                  <div className="mb-4">
                    <label
                      htmlFor="referralSource"
                      className="mb-1 block text-lg"
                    >
                      {isSpanish ? "¿Cómo te enteraste sobre nosotros?" : "Where did you hear about us?"}
                    </label>
                    <Field
                      as="select"
                      id="referralSource"
                      name="referralSource"
                      className={`w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none ${
                        errors.referralSource && touched.referralSource
                          ? errorClass
                          : ""
                      }`}
                    >
                      <option value="">{isSpanish ? "Seleccionar fuente":"Select source"}</option>
                      {Object.keys(referralSources).map((key) => (
                        <option key={key} value={key}>
                          {isSpanish ? referralSourcesInSpanish[key as referralSource]:referralSources[key as referralSource]}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="referralSource"
                      component="div"
                      className={errorClass}
                    />
                  </div>
                </>
              
                <>
                  <div className="flex flex-col justify-center items-center">
                    {/* Error Message */}
                    {((touched.firstName && errors.firstName) ||
                      (touched.email && errors.email) ||
                      (touched.phone && errors.phone) ||
                      (touched.referralSource && errors.referralSource)) && (
                      <p className={`${errorClass} mx-auto`}>
                        {isSpanish ? "Por favor, responde a todas las preguntas." : "Please fill out all the fields."}
                      </p>
                    )}
                  {/* Submit Button */}
                  <button
                      type="submit"
                      
                      className="w-full max-w-md px-3 py-4 mt-4 text-white bg-primary rounded-lg focus:outline-none"
                    >
                      {isLoading ? (
                        <FaSpinner className="mx-auto animate-spin" />
                      ) : (
                        isSpanish ? "Enviar":"Submit"
                      )}
                    </button>
                  </div>
                </>
              
              <div className="mb-4 flex justify-between">
              </div>
              {pageNo === 2 && (
                <>
                 <div className="mx-auto mb-4 max-w-md text-center">
                 {/* Error Message */}
                 {((!touched.firstName || errors.firstName
                   || !touched.email || errors.email
                   || !touched.phone || errors.phone
                   || !touched.zip || errors.zip
                   || !touched.referralSource || errors.referralSource
                   || !touched.urgent || errors.urgent) && (
                   <p className={`${errorClass} mx-auto`}>
                      {isSpanish ? "Por favor, responde a todas las preguntas." : "Please fill out all the fields."}
                   </p>
                 ))}
               </div>
                  
                  </>
                )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default WebForm;