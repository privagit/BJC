$(document).ready(() => {
  // table
  function fill_Shipper() {
    tableShipper = $("#tbShipper").DataTable({
      bDestroy: true,
      scrollCollapse: true,
      ajax: {
        url: "/shipper_master/",
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
                id="button_shipper_edit"
                type="button"
                style="font-size: 13px"
                title="แก้ไขข้อมูล"
              >
                <i class="fa fa-pencil-square-o m-1"></i></button
              ><button
                class="btn btn-danger btn-sm text-nowrap"
                id="button_shipper_delete"
                type="button"
                style="font-size: 13px"
                title="ปิดใช้งานข้อมูล"
              >
                <i class="fa fa-remove m-1"></i>
            </button>
            `;

            if (!row.Active) {
              html = `
              <button class="btn btn-success text-nowrap p-1" id="button_shipper_active" type="button" style="font-size: 13px; width: 35px;"
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
  fill_Shipper();

  //
  // add
  $("#button_shipper_add").unbind();
  $("#button_shipper_add").on("click", function () {
    $("#modalShipperDetail").modal("show");
    $("#modalShipperDetail input").val("");

    $("#button_inModal_submitShipper").unbind();
    $("#button_inModal_submitShipper").on("click", () => {
      let data = JSON.stringify({
        Shipper: $("#modal_ShipperName").val(),
      });
      $.ajax({
        url: "/shipper_master",
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
          tableShipper.ajax.reload(null, false);
          $("#modalShipperDetail").modal("hide");
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
      $("#modalShipperDetail").modal("hide");
    });
  });

  // edit
  $("#tbShipper").on("click", "#button_shipper_edit", function () {
    $("#modalShipperDetail").modal("show");
    $("#modalShipperDetail input").val("");

    let tr = $(this).closest("tr");
    let { ShipperId, Shipper } = tableShipper.row(tr).data();
    $("#modal_ShipperName").val(Shipper);

    $("#button_inModal_submitShipper").unbind();
    $("#button_inModal_submitShipper").on("click", () => {
      let data = JSON.stringify({
        Shipper: $("#modal_ShipperName").val(),
      });
      $.ajax({
        url: "/shipper_master/" + ShipperId,
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
          tableShipper.ajax.reload(null, false);
          $("#modalShipperDetail").modal("hide");
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
      $("#modalShipperDetail").modal("hide");
    });
  });

  // delete
  $("#tbShipper").on("click", "#button_shipper_delete", function () {
    $("#modalVehicleDel").modal("show");
    $("#modalVehicleDel .modal-title").html("ปิดการใช้งานข้อมูลบริษัทขนส่ง");
    $("#modalVehicleDel .modal-body p").html("ต้องการปิดการใช้งานข้อมูลบริษัทขนส่งใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { ShipperId } = tableShipper.row(tr).data();
    $("#YesVehicleBtn").unbind();
    $("#YesVehicleBtn").on("click", () => {
      $.ajax({
        url: "/shipper_master/" + ShipperId + "/deactivate",
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
      $("#modalVehicleDel").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalVehicleDel").modal("hide");
    });
  });

  // delete
  $("#tbShipper").on("click", "#button_shipper_active", function () {
    $("#modalVehicleDel").modal("show");
    $("#modalVehicleDel .modal-title").html("เปิดการใช้งานข้อมูลบริษัทขนส่ง");
    $("#modalVehicleDel .modal-body p").html("ต้องการเปิดการใช้งานข้อมูลบริษัทขนส่งใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { ShipperId } = tableShipper.row(tr).data();
    $("#YesVehicleBtn").unbind();
    $("#YesVehicleBtn").on("click", () => {
      $.ajax({
        url: "/shipper_master/" + ShipperId + "/activate",
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
      $("#modalVehicleDel").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalVehicleDel").modal("hide");
    });
  });
});
