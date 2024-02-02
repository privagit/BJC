$(document).ready(() => {
  $.ajax({
    url: "/factory_master",
    method: "get",
    contentType: "application/json",
    success: (res) => {
      if (res) {
        let { FactoryId, FactoryName, FactoryAddress, FactoryTel } = res;
        $("#input_factory_id").val(FactoryId);
        $("#input_factory_name").val(FactoryName);
        $("#input_factory_address").val(FactoryAddress);
        $("#input_factory_tel").val(FactoryTel);
      }
    },
  });

  $("#button_submit_factory").unbind();
  $("#button_submit_factory").on("click", function () {
    let FactoryId = $("#input_factory_id").val();
    let ajax = { url: "/factory_master", method: "post" };

    if (FactoryId) ajax = { url: "/factory_master/" + FactoryId, method: "put" };

    let data = JSON.stringify({
      FactoryName: $("#input_factory_name").val(),
      FactoryAddress: $("#input_factory_address").val(),
      FactoryTel: $("#input_factory_tel").val(),
    });
    $.ajax({
      url: ajax.url,
      method: ajax.method,
      contentType: "application/json",
      data: data,
      success: (res) => {
        let success = res.message;
        Swal.fire({
          position: "center",
          icon: "success",
          text: success,
          showConfirmButton: false,
          timer: 1500,
        });
      },
      error: (err) => {
        let error = err.responseJSON.message;
        Swal.fire({
          position: "center",
          icon: "warning",
          title: "Warning",
          text: error,
          showConfirmButton: true,
          confirmButtonText: "OK",
          confirmButtonColor: "#FF5733",
        });
      },
    });
  });
});
