import { useState } from "react";
import { extractPdfText } from "../services/api";

const usePdf =() => {

   const [pdf, setPdf] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);


   const uploadPdf = async (file) => {

      setLoading(true);
      setError(null);


      try{

          const result = await extractPdfText(file);

          setPdf(result);
          return result;



      }
      catch(error){

        setError(error.message);

      }
      finally{

        setLoading(false);
      }
    
   }

   return{

      pdf,
      loading,
      error,
      uploadPdf,
   };

};

export default usePdf;