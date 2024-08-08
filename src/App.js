import React, { useEffect, useState } from "react";
import RegistrationForm from "./RegistrationForm";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "./assest/Loader";
import axios from "axios";

function App() {
  const [loading, setLoading] = useState(false);
  function apicall() {
    setLoading(true)
    axios.get(`${process.env.REACT_APP_BASEURI}/api/v1/is-live`).then(() => {
      setLoading(false)
    }).catch((err) => {
      console.log(err);
      setLoading(false)
    })
  }

  useEffect(() => {
    apicall()
  }, [])



  return (
    <>
      {loading && <Loader />}

      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <RegistrationForm />
      </div>
    </>
  );
}

export default App;
