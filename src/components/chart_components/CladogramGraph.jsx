import React, { useEffect, useState } from "react";

function CladogramGraph({setLoad, setMsg, data}){
  const [clado, setClado] = useState()
  // begin preparing data
  async function fetchClado() {
    setLoad(true)
    setMsg('Loading data')
    console.log(data)
    const resultImage = await fetch('http://127.0.0.1:8080/api/cladogram', {
      method: "POST",
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url,
      body: JSON.stringify(data)
    }
    )
    const cladoBlob = await resultImage.blob()
    const cladoURL = URL.createObjectURL(cladoBlob)
    setMsg('Loading image')  
    setClado(cladoURL)
    setLoad(false)
  }

  useEffect(() => {
    fetchClado();
  }, [])

  return (
    <>
      <img src={clado} alt="icons" />
    </>
  )
}


export default CladogramGraph