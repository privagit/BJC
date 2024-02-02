$(document).ready(() => {
  // table
  function fill_VehicleType() {
    tableVehicleType = $("#tbVehicleType").DataTable({
      bDestroy: true,
      scrollCollapse: true,
      ajax: {
        url: "/vehicle_type_master/",
        dataSrc: "",
      },
      columns: [
        {
          data: "index",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "VehicleType",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          defaultContent: "action",
          render: function (data, type, row) {
            let html = `
            <button
                class="btn btn-info btn-sm text-nowrap mr-1"
                id="button_vehicleType_edit"
                type="button"
                style="font-size: 13px"
                title="แก้ไขข้อมูล"
              >
                <i class="fa fa-pencil-square-o m-1"></i></button
              ><button
                class="btn btn-danger btn-sm text-nowrap"
                id="button_vehicleType_delete"
                type="button"
                style="font-size: 13px"
                title="ปิดใช้งานข้อมูล"
              >
                <i class="fa fa-remove m-1"></i>
            </button>
            `;

            if (!row.Active) {
              html = `
              <button class="btn btn-success text-nowrap p-1" id="button_vehicleType_active" type="button" style="font-size: 13px; width: 35px;"
                title="เปิดใช้งานข้อมูล">
                <i class="fa fa-rotate-right"></i>
              </button>
            `;
            }

            return html;
          },
        },
      ],
      columnDefs: [],
    });
  }
  fill_VehicleType();

  //
  // add
  $("#button_vehicleType_add").unbind();
  $("#button_vehicleType_add").on("click", function () {
    $("#modalVehicleTypeDetail").modal("show");
    $("#modalVehicleTypeDetail input").val("");

    $("#button_inModal_submitVehicleType").unbind();
    $("#button_inModal_submitVehicleType").on("click", () => {
      let data = JSON.stringify({
        VehicleType: $("#modal_VehicleType").val(),
      });
      $.ajax({
        url: "/vehicle_type_master",
        method: "post",
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
          tableVehicleType.ajax.reload(null, false);
          $("#modalVehicleTypeDetail").modal("hide");
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
    $(".close,.no").click(function () {
      $("#modalVehicleTypeDetail").modal("hide");
    });
  });

  // edit
  $("#tbVehicleType").on("click", "#button_vehicleType_edit", function () {
    $("#modalVehicleTypeDetail").modal("show");
    $("#modalVehicleTypeDetail input").val("");

    let tr = $(this).closest("tr");
    let { VehicleTypeId, VehicleType } = tableVehicleType.row(tr).data();
    $("#modal_VehicleType").val(VehicleType);

    $("#button_inModal_submitVehicleType").unbind();
    $("#button_inModal_submitVehicleType").on("click", () => {
      let data = JSON.stringify({
        VehicleType: $("#modal_VehicleType").val(),
      });
      $.ajax({
        url: "/vehicle_type_master/" + VehicleTypeId,
        method: "put",
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
          tableVehicleType.ajax.reload(null, false);
          $("#modalVehicleTypeDetail").modal("hide");
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
    $(".close,.no").click(function () {
      $("#modalVehicleTypeDetail").modal("hide");
    });
  });

  // delete
  $("#tbVehicleType").on("click", "#button_vehicleType_delete", function () {
    $("#modalVehicleDel").modal("show");
    $("#modalVehicleDel .modal-title").html("ปิดการใช้งานข้อมูลประเภทรถ");
    $("#modalVehicleDel .modal-body p").html("ต้องการปิดการใช้งานข้อมูลประเภทรถใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { VehicleTypeId } = tableVehicleType.row(tr).data();
    $("#YesVehicleBtn").unbind();
    $("#YesVehicleBtn").on("click", () => {
      $.ajax({
        url: "/vehicle_type_master/" + VehicleTypeId + "/deactivate",
        method: "put",
        contentType: "application/json",
        success: (res) => {
          let success = res.message;
          Swal.fire({
            position: "center",
            icon: "success",
            text: success,
            showConfirmButton: false,
            timer: 1500,
          });
          tableVehicleType.ajax.reload(null, false);
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
      $("#modalVehicleDel").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalVehicleDel").modal("hide");
    });
  });

  // delete
  $("#tbVehicleType").on("click", "#button_vehicleType_active", function () {
    $("#modalVehicleDel").modal("show");
    $("#modalVehicleDel .modal-title").html("เปิดการใช้งานข้อมูลประเภทรถ");
    $("#modalVehicleDel .modal-body p").html("ต้องการเปิดการใช้งานข้อมูลประเภทรถใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { VehicleTypeId } = tableVehicleType.row(tr).data();
    $("#YesVehicleBtn").unbind();
    $("#YesVehicleBtn").on("click", () => {
      $.ajax({
        url: "/vehicle_type_master/" + VehicleTypeId + "/activate",
        method: "put",
        contentType: "application/json",
        success: (res) => {
          let success = res.message;
          Swal.fire({
            position: "center",
            icon: "success",
            text: success,
            showConfirmButton: false,
            timer: 1500,
          });
          tableVehicleType.ajax.reload(null, false);
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
      $("#modalVehicleDel").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalVehicleDel").modal("hide");
    });
  });
});
