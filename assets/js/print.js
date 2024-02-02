function printPageArea(areaID, modalID) {
  let opt = {
    margin: 10,
    filename: "generated-pdf.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      orientation: "landscape",
    },
  };
  let element = document.getElementById(modalID);
  // html2pdf().set(opt).from(element).save();
  html2pdf()
    .set(opt)
    .from(element)
    .toPdf()
    .get("pdf")
    .then(function (pdfObj) {
      console.log(pdfObj);
      // pdfObj has your jsPDF object in it, use it as you please!
      // For instance (untested):
      pdfObj.autoPrint();
      window.open(pdfObj.output("bloburl"), "_blank");
    });
}
