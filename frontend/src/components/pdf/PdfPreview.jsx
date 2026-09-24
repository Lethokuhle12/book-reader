const PdfPreview = ({filename, text}) => {



    return (

       <section className="pdf-preview">

          <div>

               <span className="pdf-preview-header">Your Book</span>
               <h2>{filename}</h2>
          </div>

          <div className="pdf-text">
              {text}
          </div>
       </section>


    );

};
export default PdfPreview;