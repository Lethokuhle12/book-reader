import LoadingSpinner from "../components/common/LoadingSpinner";
import PdfPreview from "../components/pdf/PdfPreview";
import PdfUploader from "../components/pdf/PdfUploader";
import usePdf from "../hooks/usePdf";
import AudioPlayer from "../components/audio/AudioPlayer";

const Home = () =>{

    const{

        pdf,
        loading,
        error,
        uploadPdf
    } = usePdf();


    return(

        <main className="home">
        <section>
           <span className="hero-label">
                PDF TO AUDIO
           </span>
        
           <h1>
                Let your books
                <br />
                <span>read themselves</span>
            
            <p>
                    Upload a PDF and turn it into an audiobook.
                    Sit back, relax, and listen.               
            </p>
           </h1>

           <PdfUploader
           
              onUpload={uploadPdf}
              loading={loading}
           />
        
        </section>

        {loading && <LoadingSpinner/>}
        {error && (

            <div className="error-message">
                <strong>Something went wrong</strong>
                <p>{error}</p>
            </div>
        )}

        {pdf && !loading &&(

          <>
           <PdfPreview
          
             filename={pdf.filename}
             text={pdf.text}
          
          />
          <AudioPlayer
             filename={pdf.filename}
             text={pdf.text}
          />         
          
          </>
        )}
        
       
        </main>

       

    )

}

export default Home;