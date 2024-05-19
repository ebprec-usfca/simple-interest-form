import Head from "next/head";
import Image from "next/image";
import { useEffect } from 'react';
import { WithResponseProps } from '../pages/index';
import { useLanguage } from '~/context/LanguageContext';

const ErrorComponent: React.FC<WithResponseProps> = ({ setResponse }) => {
    const handleClose = () => {
      setResponse(null);
    };
  useEffect(() => {
    // Close the error component after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    // Clear the timer if the component is unmounted before the timer expires
    return () => clearTimeout(timer);
  }, [setResponse]);
  const {isSpanish, setIsSpanish} = useLanguage();

  return (
    <>
      <Head>
        <title>Error | Interest Form</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex items-center justify-center">
        <div className="max-w-[800] bg-white border border-gray-300 rounded-lg p-8 shadow-lg">
          <div className='flex flex-col items-center justify-end'>
            <Image
              src="/logo.png"
              alt="Map showing service region of Downtown Oakland."
              width={200}
              height={100}
            />
            <h1 className="text-3xl font-heading text-primary mb-4 text-center">{isSpanish ? "Algo salió mal":"Oh no! Something went wrong"}</h1>
          </div>
          <p className="text-gray-600 mb-4 text-center">{isSpanish ? "Por favor, intenta enviar el formulario de nuevo o trata más tarde.":"Please try submitting the form again, or come back later!"}</p>
          <button
            className="bg-primary text-white font-bold py-2 px-4 rounded block mx-auto"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </main>
    </>
  );
};

export default ErrorComponent;
