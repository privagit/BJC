$(document).ready(() => {
  // table
  function fill_Vehicle() {
    tableVehicle = $("#tbVehicle").DataTable({
      bDestroy: true,
      scrollCollapse: true,
      ajax: {
        url: "/vehicle_master/",
        dataSrc: "",
      },
      columns: [
        {
          data: "VehiclePlate",
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
          data: "Shipper",
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
                id="button_vehicle_edit"
                type="button"
                style="font-size: 13px"
                title="แก้ไขข้อมูล"
              >
                <i class="fa fa-pencil-square-o m-1"></i></button
              ><button
                class="btn btn-danger btn-sm text-nowrap"
                id="button_vehicle_delete"
                type="button"
                style="font-size: 13px"
                title="ปิดใช้งานข้อมูล"
              >
                <i class="fa fa-remove m-1"></i>
            </button>
            `;

            if (!row.Active) {
              html = `
              <button class="btn btn-success text-nowrap p-1" id="button_vehicle_active" type="button" style="font-size: 13px; width: 35px;"
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
  fill_Vehicle();

  //dropdown
  function dpVehicleType() {
    $.ajax({
      url: "/dropdown/vehicletype",
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        $("#vehicletype_opt").html("");
        res.forEach((data) => {
          $("#vehicletype_opt").append(`<option data-id="${data.VehicleTypeId}" value="${data.VehicleType}" />`);
        });
      },
    });
  }

  function dpShipper() {
    $.ajax({
      url: "/dropdown/shipper",
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        $("#shipper_opt").html("");
        res.forEach((data) => {
          $("#shipper_opt").append(`<option data-id="${data.ShipperId}" value="${data.Shipper}" />`);
        });
      },
    });
  }
  // add
  $("#button_vehicle_add").unbind();
  $("#button_vehicle_add").on("click", function () {
    $("#modalVehicleDetail").modal("show");
    $("#modalVehicleDetail input").val("");
    dpShipper();
    dpVehicleType();

    $("#button_inModal_submitVehicle").unbind();
    $("#button_inModal_submitVehicle").on("click", () => {
      let VehicleType = $("#modalEdit_VehicleType").val();
      let VehicleTypeId = parseInt($(`#vehicletype_opt option[value="${VehicleType}"]`).attr("data-id")) || null;
      let Shipper = $("#modalEdit_Shipper").val();
      let ShipperId = parseInt($(`#shipper_opt option[value="${Shipper}"]`).attr("data-id")) || null;
      let data = JSON.stringify({
        ShipperId,
        Shipper,
        VehicleTypeId,
        VehicleType,
        VehiclePlate: $("#modalEdit_VehiclePlate").val(),
      });
      $.ajax({
        url: "/vehicle_master",
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
          tableVehicle.ajax.reload(null, false);
          if (VehicleTypeId == null) tableVehicleType.ajax.reload(null, false);
          if (ShipperId == null) tableShipper.ajax.reload(null, false);

          $("#modalVehicleDetail").modal("hide");
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
      $("#modalVehicleDetail").modal("hide");
    });
  });

  // edit
  $("#tbVehicle").on("click", "#button_vehicle_edit", function () {
    $("#modalVehicleDetail").modal("show");
    $("#modalVehicleDetail input").val("");
    dpShipper();
    dpVehicleType();

    let tr = $(this).closest("tr");
    let { VehicleId, VehiclePlate, VehicleType, Shipper } = tableVehicle.row(tr).data();
    $("#modalEdit_VehiclePlate").val(VehiclePlate);
    $("#modalEdit_VehicleType").val(VehicleType);
    $("#modalEdit_Shipper").val(Shipper);

    $("#button_inModal_submitVehicle").unbind();
    $("#button_inModal_submitVehicle").on("click", () => {
      let VehicleType = $("#modalEdit_VehicleType").val();
      let VehicleTypeId = parseInt($(`#vehicletype_opt option[value="${VehicleType}"]`).attr("data-id")) || null;
      let Shipper = $("#modalEdit_Shipper").val();
      let ShipperId = parseInt($(`#shipper_opt option[value="${Shipper}"]`).attr("data-id")) || null;
      let data = JSON.stringify({
        ShipperId,
        Shipper,
        VehicleTypeId,
        VehicleType,
        VehiclePlate: $("#modalEdit_VehiclePlate").val(),
      });
      $.ajax({
        url: "/vehicle_master/" + VehicleId,
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
          tableVehicle.ajax.reload(null, false);
          $("#modalVehicleDetail").modal("hide");
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
      $("#modalVehicleDetail").modal("hide");
    });
  });

  // delete
  $("#tbVehicle").on("click", "#button_vehicle_delete", function () {
    $("#modalVehicleDel").modal("show");
    $("#modalVehicleDel .modal-title").html("ปิดการใช้งานข้อมูลทะเบียนรถ");
    $("#modalVehicleDel .modal-body p").html("ต้องการปิดการใช้งานข้อมูลทะเบียนรถใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { VehicleId } = tableVehicle.row(tr).data();
    $("#YesVehicleBtn").unbind();
    $("#YesVehicleBtn").on("click", () => {
      $.ajax({
        url: "/vehicle_master/" + VehicleId + "/deactivate",
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
          tableVehicle.ajax.reload(null, false);
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
  $("#tbVehicle").on("click", "#button_vehicle_active", function () {
    $("#modalVehicleDel").modal("show");
    $("#modalVehicleDel .modal-title").html("เปิดการใช้งานข้อมูลทะเบียนรถ");
    $("#modalVehicleDel .modal-body p").html("ต้องการเปิดการใช้งานข้อมูลทะเบียนรถใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { VehicleId } = tableVehicle.row(tr).data();
    $("#YesVehicleBtn").unbind();
    $("#YesVehicleBtn").on("click", () => {
      $.ajax({
        url: "/vehicle_master/" + VehicleId + "/activate",
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
          tableVehicle.ajax.reload(null, false);
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

  $("#button_vehicle_uploadFile").unbind();
  $("#button_vehicle_uploadFile").on("click", (e) => {
    $("#input_vehicle_uploadFile").click();
  });

  $("#input_vehicle_uploadFile").unbind();
  $("#input_vehicle_uploadFile").change(async function (e) {
    let ExFile = e.target.files[0];

    let Excel = new FormData();
    Excel.append("master", ExFile, "master");
    $("#input_vehicle_uploadFile").val("");

    $.ajax({
      url: "/vehicle_master/import",
      method: "post",
      processData: false,
      contentType: false,
      data: Excel,
      success: (res) => {
        let success = res.message;
        Swal.fire({
          position: "center",
          icon: "success",
          text: success,
          showConfirmButton: false,
          timer: 1500,
        });
        tableVehicle.ajax.reload(null, false);
        tableVehicleType.ajax.reload(null, false);
        tableShipper.ajax.reload(null, false);
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
