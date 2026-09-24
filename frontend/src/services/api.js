const API_URL ="http://localhost:8080/api";

export const extractPdfText = async (file) =>{



    const formData = new FormData();

    formData.append("file",file);

    const response = await fetch(`${API_URL}/pdf/extract` ,{


        method:"POST",
        body:formData,


    });

    const data = await response.json();

    if(!response.ok){


        throw new Error(

                data.message || data.error || "Failed to process PDF"
                
            );
            
    }

    return data;



}
