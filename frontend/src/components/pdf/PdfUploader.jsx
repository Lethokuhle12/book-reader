
const PdfUploader =({onUpload, loading})=>{


    const handleFileChange = (event) =>{


        const file = event.target.files?.[0];

        if(!file) return;

        if(file.type !== "application/pdf"){

            alert("Please select a PDF file")
        }

        onUpload(file);


    };

    
    return(

        <div className="pdf-uploader">

           <label htmlFor="pdf-upload">
            
               {loading? "Processing PDF..." :"Choose a PDF"}

            </label> 

            <input
            
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={loading}
            
            
            ></input>
        </div>
    );




};

export default PdfUploader;