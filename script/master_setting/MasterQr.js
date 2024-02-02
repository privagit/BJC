// customer qr dropdown
const customerQrDropdown = (VehicleId) => {
  $.ajax({
    url: "/dropdown/customer_qr/" + VehicleId,
    method: "get",
    contentType: "application/json",
    dataType: "json",
    success: function (response) {
      $("#modal_CustQR").html(
        '<option value="" selected="">เลือกลูกค้า</option>'
      );
      response.forEach((Customer) => {
        $("#modal_CustQR").append(
          "<option value=" +
            Customer.CustomerId +
            "><span>" +
            Customer.CustomerName +
            "</span></option>"
        );
        $(".selectpicker").selectpicker("refresh");

      });
    },
  });
};

$(document).on("click", "#QrDataBtn", function () {
  $("#PreviewPDF").css({"display": "none"});
  $("#modalPrintQr").modal("show");

  tr = $(this).closest("tr");
  let { VehicleId, VehiclePlate } = tableVehicle.row(tr).data();

  $("#modal_VehicleQR").append(
    "<option value=" +
      VehicleId +
      ' selected=""><span>' +
      VehiclePlate +
      "</span></option>"
  );
  
  customerQrDropdown(VehicleId);

  $("#modal_CustQR").unbind();
  $("#modal_CustQR").on("change", () => {
    if ($("#modal_CustQR").val() == "") {
      $("#PreviewPDF").css({"display": "none"});
    } 
    else{
      $("#PreviewPDF").css({"display": "block"});
    }
    
    let CustomerId = $("#modal_CustQR").val();
    if (CustomerId != "") {
      $.ajax({
        url: "/qrcode/print",
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
          VehicleId: VehicleId,
          CustomerId: CustomerId,
        }),
        success: res => {
          fileName = res.message;
          document.getElementById('PreviewPDF').src = fileName + "#view=FitH&#toolbar=1";
        },
        
      })
    }
  });

  $(".close,.no").click(function () {
    $("#modalPrintQr").modal("hide");
  });
});
