function print(PlanId) {
  $.ajax({
    url: "/weight/plan/" + PlanId + "/qrcode",
    method: "get",
    contentType: "application/json",
    dataType: "json",
    success: function (res) {
      $("#showPDF").html("");
      $("#showPDF").html(`
      <iframe id="pdfFrame" src="${res.message}" style=""></iframe>
      `);

      printPDF();
    },
    error: function (err) {
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
}
function printPDF() {
  var pdfFrame = document.getElementById("pdfFrame");
  var frameWindow = pdfFrame.contentWindow;
  frameWindow.focus();
  frameWindow.print();
}

$(document).ready(() => {
  function checkDataWeightPlan(dataTarget) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: `/weight/plan/${dataTarget.PlanId}`,
        method: "get",
        contentType: "application/json",
        dataType: "json",
        success: function (res) {
          delete dataTarget.index;
          resolve(JSON.stringify(res[0]) === JSON.stringify(dataTarget));
        },
        error: function (error) {
          console.error("Error fetching data:", error);
          reject(error);
        },
      });
    });
  }
  //  table
  function fill_WeightPlan() {
    tableWeightPlan = $("#tbWeightPlan").DataTable({
      bDestroy: true,
      // scrollY: "40vh",
      // scrollX: true,
      // scrollCollapse: true,
      ajax: {
        url: "/weight/plan/list",
        dataSrc: "",
      },
      columns: [
        {
          data: "index",
        },
        {
          data: "PlanNo",
        },
        {
          data: "PlanDate",
        },
        {
          data: "VehiclePlate",
        },
        {
          data: "Customer",
        },
        {
          data: "WeightType",
          render: function (data, type, row) {
            let html = "";
            if (data == 1) html = "ชั่งเข้า";
            if (data == 2) html = "ชั่งออก";
            return html;
          },
        },
        {
          data: "ProductInPlan",
        },
        {
          data: "Status",
          render: function (data, type, row) {
            let html = "";
            if (data == 1) html = `<i class="fas fa-stop-circle status-icon"></i>`;
            else if (data == 2) html = `<i class="fas fa-play-circle status-icon"></i>`;
            else if (data == 3) html = `<i class="fa fa-check-circle status-icon"></i>`;
            else if (data == 4) html = `<i class="fa fa-times-circle status-icon"></i>`;

            return html;
          },
        },
        {
          data: "CheckDate",
          render: function (data, type, row) {
            let html = "";
            // if (row.Status != 4) {
            if (data) {
              html = `
                <div class="d-flex flex-column align-items-center justify-content-center">
                  <div>${row.DriverName}</div>
                  <div>${data.replace(" ", "<br>")}</div>
                </div>`;
            } else {
              html = `
                <button
                  class="btn btn-primary btn-sm text-nowrap mr-1"
                  id="button_plan_checkIn"
                  type="button"
                  style="font-size: 13px"
                  title="ลงชื่อพนักงานขับรถ"
                >
                  <i class="fa fa-sign-in m-1"></i>
                </button>
                `;
            }
            return html;
          },
        },
        { data: "Remark" },
        {
          defaultContent: "action",
          render: function (data, type, row) {
            let _qrCode, _edit, _del;
            if (row.Status == 1) {
              _edit = "";
              _del = "";
            } else if (row.Status == 2) {
              _edit = "d-none";
              _del = "d-none";
            } else if (row.Status == 3) {
              _edit = "d-none";
              _del = "d-none";
            }
            row.CheckDate ? (_qrCode = "") : (_qrCode = "d-none");
            if (row.CheckDate) {
              _qrCode = "";
              _edit = "d-none";
              _del = "d-none";
            } else {
              _qrCode = "d-none";
              _edit = "";
              _del = "";
            }
            let html = `
            <button
              class="btn btn-secondary btn-sm text-nowrap mr-1 mb-1 ${_qrCode}"
              id="button_plan_qr"
              type="button"
              style="font-size: 13px"
              title="คิวอาร์โค้ด"
            >
              <i class="fa fa-qrcode m-1"></i></button
            >
            <button
                class="btn btn-info btn-sm text-nowrap mr-1 mb-1 ${_edit} "
                id="button_plan_edit"
                type="button"
                style="font-size: 13px"
                title="แก้ไขแผน"
              >
                <i class="fa fa-pencil-square-o m-1"></i></button
            ><button
                class="btn btn-danger btn-sm text-nowrap mb-1 ${_del} " 
                id="button_plan_delete"
                type="button"
                style="font-size: 13px"
                title="ยกเลิกแผนการชั่ง"
              >
                <i class="fa fa-remove m-1"></i>
            </button>
            `;
            if (row.Status == 4) {
              if (!row.CheckDate) {
                html = `
                  <button class="btn btn-success text-nowrap p-1" id="button_plan_active" type="button" style="font-size: 13px; width: 35px;"
                    title="เปิดใช้งานแผนการชั่ง">
                    <i class="fa fa-rotate-right"></i>
                  </button>
                `;
              } else html = "";
            }
            return html;
          },
        },
      ],
      columnDefs: [],
    });
  }

  function fill_ProductList(PlanId) {
    tableProductList = $("#tbProductList").DataTable({
      bDestroy: true,
      scrollCollapse: true,
      ajax: {
        url: "/weight/plan/" + PlanId + "/products",
        dataSrc: "",
      },
      columns: [
        {
          data: "CardNo",
          render: function (data, type, row) {
            return data || "-";
          },
        },
        {
          data: "ProductCode",
        },
        {
          data: "Product",
        },
        {
          data: "BillNo",
        },
        {
          data: "BillWeight",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "Status",
          render: function (data, type, row) {
            let html = "";
            if (data == 1) {
              html = `<i class="fa fa-hourglass status-icon"></i>`;
            } else if (data == 2) {
              html = `<i class="fas fa-truck-loading status-icon"></i>`;
            } else if (data == 3) {
              html = `<i class="fa fa-check-circle status-icon"></i>`;
            } else if (data == 4) {
              html = `<i class="fa fa-times-circle status-icon"></i>`;
            }
            return html;
          },
        },
        {
          defaultContent: "action",
          render: function (data, type, row) {
            let html;
            if (row.Status == 1) {
              html = `
              <button
                  class="btn btn-danger btn-sm text-nowrap"
                  id="button_product_delete"
                  type="button"
                  style="font-size: 13px"
                  title="ยกเลิกรายการสินค้า"
                >
                  <i class="fa fa-remove m-1"></i>
              </button>
              `;
            } else if (row.Status == 4) {
              html = `
              <button class="btn btn-success text-nowrap p-1" id="button_product_active" type="button" style="font-size: 13px; width: 35px;"
                title="เปิดใช้งานรายการสินค้า">
                <i class="fa fa-rotate-right"></i>
              </button>
            `;
            } else {
              html = "";
            }

            return html;
          },
        },
      ],
      columnDefs: [],
    });
  }

  fill_WeightPlan();

  function dpCustomer() {
    $.ajax({
      url: "/dropdown/customer",
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        $("#customer_opt").html("");
        res.forEach((data) => {
          $("#customer_opt").append(`<option data-id="${data.CustomerId}" data-code="${data.CustomerCode}" value="${data.Customer}" />`);
        });
      },
    });

    $("#input_inModalPlanAdd_customer").change(function () {
      if (this.value) {
        let $this = $(`#customer_opt option[value="${this.value}"]`);
        $this.attr("data-code")
          ? $("#input_inModalPlanAdd_customerCode").val($this.attr("data-code")).prop("disabled", true)
          : $("#input_inModalPlanAdd_customerCode").val("").removeAttr("disabled", false);
      } else {
        $("#input_inModalPlanAdd_customerCode").val("").prop("disabled", true);
      }
    });

    $("#input_inModalPlanAdd_molassesSeller").change(function () {
      if (this.value) {
        let $this = $(`#customer_opt option[value="${this.value}"]`);
        $this.attr("data-code")
          ? $("#input_inModalPlanAdd_molassesSellerCode").val($this.attr("data-code")).prop("disabled", true)
          : $("#input_inModalPlanAdd_molassesSellerCode").prop("disabled", false);
      } else {
        $("#input_inModalPlanAdd_molassesSellerCode").val("").prop("disabled", true);
      }
    });

    $("#input_inModalPlanDetail_customer").change(function () {
      if (this.value) {
        let $this = $(`#customer_opt option[value="${this.value}"]`);
        $this.attr("data-code")
          ? $("#input_inModalPlanDetail_customerCode").val($this.attr("data-code")).prop("disabled", true)
          : $("#input_inModalPlanDetail_customerCode").val("").removeAttr("disabled", false);
      } else {
        $("#input_inModalPlanDetail_customerCode").val("").prop("disabled", true);
      }
    });

    $("#input_inModalPlanDetail_molassesSeller").change(function () {
      if (this.value) {
        let $this = $(`#customer_opt option[value="${this.value}"]`);
        $this.attr("data-code")
          ? $("#input_inModalPlanDetail_molassesSellerCode").val($this.attr("data-code")).prop("disabled", true)
          : $("#input_inModalPlanDetail_molassesSellerCode").prop("disabled", false);
      } else {
        $("#input_inModalPlanDetail_molassesSellerCode").val("").prop("disabled", true);
      }
    });
  }

  function dpVehicle() {
    $.ajax({
      url: "/dropdown/vehicle",
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        $("#vehicle_opt").html("");
        res.forEach((data) => {
          $("#vehicle_opt").append(
            `<option data-id="${data.VehicleId}" data-shipper="${data.Shipper}" data-shipper-id="${data.ShipperId}" data-type="${data.VehicleType}" data-type-id="${data.VehicleTypeId}" value="${data.VehiclePlate}" />`
          );
        });
      },
    });

    $("#input_inModalPlanAdd_vehicle").change(function () {
      if (this.value) {
        let $this = $(`#vehicle_opt option[value="${this.value}"]`);
        if ($this.attr("data-type")) {
          $("#input_inModalPlanAdd_vehicleType").val($this.attr("data-type")).prop("disabled", true);
          $("#input_inModalPlanAdd_shipper").val($this.attr("data-shipper")).prop("disabled", true);
        } else {
          $("#input_inModalPlanAdd_vehicleType").val("").prop("disabled", false);
          $("#input_inModalPlanAdd_shipper").val("").prop("disabled", false);
        }
      } else {
        $("#input_inModalPlanAdd_vehicleType").val("").prop("disabled", true);
        $("#input_inModalPlanAdd_shipper").val("").prop("disabled", true);
      }
    });

    $("#input_inModalPlanDetail_vehicle").change(function () {
      if (this.value) {
        let $this = $(`#vehicle_opt option[value="${this.value}"]`);
        if ($this.attr("data-type")) {
          $("#input_inModalPlanDetail_vehicleType").val($this.attr("data-type")).prop("disabled", true);
          $("#input_inModalPlanDetail_shipper").val($this.attr("data-shipper")).prop("disabled", true);
        } else {
          $("#input_inModalPlanDetail_vehicleType").val("").prop("disabled", false);
          $("#input_inModalPlanDetail_shipper").val("").prop("disabled", false);
        }
      } else {
        $("#input_inModalPlanDetail_vehicleType").val("").prop("disabled", true);
        $("#input_inModalPlanDetail_shipper").val("").prop("disabled", true);
      }
    });

    $("#input_inModalCheckIn_vehicle").change(function () {
      if (this.value) {
        let $this = $(`#vehicle_opt option[value="${this.value}"]`);
        if ($this.attr("data-type")) {
          $("#input_inModalCheckIn_vehicleType").val($this.attr("data-type")).prop("disabled", true);
          $("#input_inModalCheckIn_shipper").val($this.attr("data-shipper")).prop("disabled", true);
        } else {
          $("#input_inModalCheckIn_vehicleType").val("").prop("disabled", false);
          $("#input_inModalCheckIn_shipper").val("").prop("disabled", false);
        }
      } else {
        $("#input_inModalCheckIn_vehicleType").val("").prop("disabled", true);
        $("#input_inModalCheckIn_shipper").val("").prop("disabled", true);
      }
    });
  }

  function dpProduct() {
    $.ajax({
      url: "/dropdown/product",
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        $("#product_opt").html("");
        res.forEach((data) => {
          $("#product_opt").append(
            `<option data-id="${data.ProductId}" data-code="${data.ProductCode}" data-type="${data.ProductType}" data-type-id="${data.productTypeId}" value="${data.Product}" />`
          );
        });
      },
    });

    $("#input_inModalPlanDetail_product").change(function () {
      if (this.value) {
        let $this = $(`#product_opt option[value="${this.value}"]`);
        if ($this.attr("data-type")) {
          $("#input_inModalPlanDetail_productType").val($this.attr("data-type")).prop("disabled", true);
          $("#input_inModalPlanDetail_productCode").val($this.attr("data-code")).prop("disabled", true);
        } else {
          $("#input_inModalPlanDetail_productType").val("").prop("disabled", false);
          $("#input_inModalPlanDetail_productCode").val("").prop("disabled", false);
        }
      } else {
        $("#input_inModalPlanDetail_productType").val("").prop("disabled", true);
        $("#input_inModalPlanDetail_productCode").val("").prop("disabled", true);
      }
    });
  }

  // add
  $("#button_plan_add").unbind();
  $("#button_plan_add").on("click", function () {
    dpCustomer();
    dpVehicle();

    $("#modalPlanAdd").modal("show");
    $("#modalPlanAdd input,#modalPlanAdd textarea").val("");

    $("#button_inModal_planAdd").unbind();
    $("#button_inModal_planAdd").on("click", () => {
      let Customer = $("#input_inModalPlanAdd_customer").val();
      let $Customer = $(`#customer_opt option[value="${Customer}"]`);
      let CustomerId = parseInt($Customer.attr("data-id")) || null;

      let VehiclePlate = $("#input_inModalPlanAdd_vehicle").val();
      let $Vehicle = $(`#vehicle_opt option[value="${VehiclePlate}"]`);
      let VehicleId = parseInt($Vehicle.attr("data-id")) || null;
      let VehicleTypeId = parseInt($Vehicle.attr("data-type-id")) || null;
      let ShipperId = parseInt($Vehicle.attr("data-shipper-id")) || null;

      let MolassesSeller = $("#input_inModalPlanAdd_molassesSeller").val();
      let $MolassesSeller = $(`#customer_opt option[value="${MolassesSeller}"]`);
      let MolassesSellerId = parseInt($MolassesSeller.attr("data-id")) || null;

      let data = JSON.stringify({
        PlanDate: $("#input_inModalPlanAdd_date").val(),
        WeightType: parseInt($("#select_inModalPlanAdd_weightType").val()), // 1 ชั่งเข้า / 2 ชั่งออก
        CustomerId,
        CustomerCode: $("#input_inModalPlanAdd_customerCode").val(),
        Customer,
        ShipperId,
        Shipper: $("#input_inModalPlanAdd_shipper").val(),
        VehicleTypeId,
        VehicleType: $("#input_inModalPlanAdd_vehicleType").val(),
        VehicleId,
        VehiclePlate,
        TrailerPlate: $("#input_inModalPlanAdd_TrailerPlate").val(),
        DriverName: $("#input_inModalPlanAdd_driverName").val(),
        Remark: $("#textarea_inModalPlanAdd_remark").val(),
        ThaiMolassesNo: $("#input_inModalPlanAdd_thaiMolassesNo").val(),
        MolassesSellerId,
        MolassesSellerCode: $("#input_inModalPlanAdd_molassesSellerCode").val(),
        MolassesSeller,
      });
      $.ajax({
        url: "/weight/plan",
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
          tableWeightPlan.ajax.reload(null, false);
          $("#modalPlanAdd").modal("hide");
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
      $("#modalPlanAdd").modal("hide");
    });
  });

  // edit
  $("#tbWeightPlan").on("click", "#button_plan_edit", function () {
    let tr = $(this).closest("tr");
    let tableData = tableWeightPlan.row(tr).data();
    checkDataWeightPlan(tableData)
      .then((res) => {
        if (res) {
          $("#modalPlanDetail").modal("show");
          $("#modalPlanDetail input,#modalPlanDetail textarea").val("");
          dpCustomer();
          dpVehicle();
          dpProduct();
          // let tr = $(this).closest("tr");
          let {
            Customer,
            CustomerCode,
            PlanDriver,
            MolassesSeller,
            MolassesSellerCode,
            PlanDate,
            PlanId,
            Remark,
            ThaiMolassesNo,
            PlanTrailerPlate,
            VehiclePlate,
            VehicleId,
            VehicleType,
            Shipper,
            ShipperId,
            WeightType,
            Status,
          } = tableData;
          Status == 2 ? $("#input_inModalPlanDetail_vehicle").prop("disabled", true) : $("#input_inModalPlanDetail_vehicle").prop("disabled", false);
          $("#input_inModalPlanDetail_date").val(PlanDate);
          $("#select_inModalPlanDetail_weightType").val(WeightType);
          $("#input_inModalPlanDetail_customer").val(Customer);
          $("#input_inModalPlanDetail_customerCode").val(CustomerCode);
          $("#input_inModalPlanDetail_vehicle").val(VehiclePlate).attr("data-id", VehicleId);
          $("#input_inModalPlanDetail_vehicleType").val(VehicleType);
          $("#input_inModalPlanDetail_shipper").val(Shipper).attr("data-id", ShipperId);
          $("#input_inModalPlanDetail_TrailerPlate").val(PlanTrailerPlate);
          $("#input_inModalPlanDetail_driverName").val(PlanDriver);
          $("#textarea_inModalPlanDetail_remark").val(Remark);
          $("#input_inModalPlanDetail_thaiMolassesNo").val(ThaiMolassesNo);
          $("#input_inModalPlanDetail_molassesSeller").val(MolassesSeller);
          $("#input_inModalPlanDetail_molassesSellerCode").val(MolassesSellerCode);

          fill_ProductList(PlanId);

          $("#modalPlanDetail").on("click", "#button_product_add", function () {
            // $("#button_product_add").unbind();
            // $("#button_product_add").on("click", function () {
            let Product = $("#input_inModalPlanDetail_product").val();

            let $Product = $(`#product_opt option[value="${Product}"]`);
            let ProductId = parseInt($Product.attr("data-id")) || null;
            let ProductTypeId = parseInt($Product.attr("data-type-id")) || null;

            let data = JSON.stringify({
              ProductId,
              Product,
              ProductTypeId,
              ProductType: $("#input_inModalPlanDetail_productType").val(),
              ProductCode: $("#input_inModalPlanDetail_productCode").val(),
              BillNo: $("#input_inModalPlanDetail_billNo").val(),
              BillWeight: parseInt($("#input_inModalPlanDetail_billWeight").val()) || 0,
            });

            $.ajax({
              url: "/weight/plan/" + PlanId + "/product",
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
                $("#modalPlanDetail .card input").val("");
                tableWeightPlan.ajax.reload(null, false);
                tableProductList.ajax.reload(null, false);
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
          $("#tbProductList").on("click", "#button_product_delete", function () {
            let tr = $(this).closest("tr");
            let { CardId } = tableProductList.row(tr).data();
            $.ajax({
              url: "/weight/plan/product/" + CardId + "/cancel",
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
                tableWeightPlan.ajax.reload(null, false);
                tableProductList.ajax.reload(null, false);
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
          $("#tbProductList").on("click", "#button_product_active", function () {
            let tr = $(this).closest("tr");
            let { CardId } = tableProductList.row(tr).data();
            $.ajax({
              url: "/weight/plan/product/" + CardId + "/uncancel",
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
                tableWeightPlan.ajax.reload(null, false);
                tableProductList.ajax.reload(null, false);
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

          $("#button_inModal_planDetail").unbind();
          $("#button_inModal_planDetail").on("click", () => {
            let Customer = $("#input_inModalPlanDetail_customer").val();
            let $Customer = $(`#customer_opt option[value="${Customer}"]`);
            let CustomerId = parseInt($Customer.attr("data-id")) || null;

            let VehiclePlate = $("#input_inModalPlanDetail_vehicle").val();
            let $Vehicle = $(`#vehicle_opt option[value="${VehiclePlate}"]`);
            let VehicleId = parseInt($Vehicle.attr("data-id")) || parseInt($("#input_inModalPlanDetail_vehicle").attr("data-id")) || null;
            let VehicleTypeId = parseInt($Vehicle.attr("data-type-id")) || null;
            let ShipperId = parseInt($Vehicle.attr("data-shipper-id")) || parseInt($("#input_inModalPlanDetail_shipper").attr("data-id")) || null;

            let MolassesSeller = $("#input_inModalPlanDetail_molassesSeller").val();
            let $MolassesSeller = $(`#customer_opt option[value="${MolassesSeller}"]`);
            let MolassesSellerId = parseInt($MolassesSeller.attr("data-id")) || null;

            let data = JSON.stringify({
              PlanDate: $("#input_inModalPlanDetail_date").val(),
              WeightType: parseInt($("#select_inModalPlanDetail_weightType").val()), // 1 ชั่งเข้า / 2 ชั่งออก
              CustomerId,
              CustomerCode: $("#input_inModalPlanDetail_customerCode").val(),
              Customer,
              ShipperId,
              Shipper: $("#input_inModalPlanDetail_shipper").val(),
              VehicleTypeId,
              VehicleType: $("#input_inModalPlanDetail_vehicleType").val(),
              VehicleId,
              VehiclePlate,
              TrailerPlate: $("#input_inModalPlanDetail_TrailerPlate").val(),
              DriverName: $("#input_inModalPlanDetail_driverName").val(),
              Remark: $("#textarea_inModalPlanDetail_remark").val(),
              ThaiMolassesNo: $("#input_inModalPlanDetail_thaiMolassesNo").val(),
              MolassesSellerId,
              MolassesSellerCode: $("#input_inModalPlanDetail_molassesSellerCode").val(),
              MolassesSeller,
            });

            $.ajax({
              url: "/weight/plan/" + PlanId,
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
                tableWeightPlan.ajax.reload(null, false);
                $("#modalPlanDetail").modal("hide");
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
            $("#modalPlanDetail").modal("hide");
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "Warning",
            text: "ข้อมูลมีการเปลื่ยนแปลง",
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#FF5733",
          });
          tableWeightPlan.ajax.reload(null, false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  // check In
  $("#tbWeightPlan").on("click", "#button_plan_checkIn", function () {
    let tr = $(this).closest("tr");
    let tableData = tableWeightPlan.row(tr).data();
    checkDataWeightPlan(tableData)
      .then((result) => {
        if (result) {
          dpCustomer();
          dpVehicle();

          $("#modalCheckIn").modal("show");
          $("#modalCheckIn input,#modalCheckIn textarea").val("");

          let { Customer, PlanDriver, PlanId, PlanTrailerPlate, VehiclePlate, VehicleType, Shipper } = tableData;

          let currentDate = new Date();

          let year = currentDate.getFullYear();
          let month = currentDate.getMonth() + 1; // Months are zero-based
          let day = currentDate.getDate();
          let hours = currentDate.getHours();
          let minutes = currentDate.getMinutes();

          let formattedDateTime = year + "-" + padNumber(month) + "-" + padNumber(day) + " " + padNumber(hours) + ":" + padNumber(minutes);

          function padNumber(num) {
            return num < 10 ? "0" + num : num;
          }

          $("#input_inModalCheckIn_date").val(formattedDateTime);
          $("#input_inModalCheckIn_customer").val(Customer);
          $("#input_inModalCheckIn_vehicle").val(VehiclePlate);
          $("#input_inModalCheckIn_vehicleType").val(VehicleType);
          $("#input_inModalCheckIn_shipper").val(Shipper);
          $("#input_inModalCheckIn_TrailerPlate").val(PlanTrailerPlate);
          $("#input_inModalCheckIn_driverName").val(PlanDriver);

          $("#button_inModal_checkIn").unbind();
          $("#button_inModal_checkIn").on("click", () => {
            let Customer = $("#input_inModalCheckIn_customer").val();
            let $Customer = $(`#customer_opt option[value="${Customer}"]`);
            let CustomerId = parseInt($Customer.attr("data-id")) || null;

            let VehiclePlate = $("#input_inModalCheckIn_vehicle").val();
            let $Vehicle = $(`#vehicle_opt option[value="${VehiclePlate}"]`);
            let VehicleId = parseInt($Vehicle.attr("data-id")) || null;
            let VehicleTypeId = parseInt($Vehicle.attr("data-type-id")) || null;
            let ShipperId = parseInt($Vehicle.attr("data-shipper-id")) || null;

            let data = JSON.stringify({
              CheckDate: $("#input_inModalCheckIn_date").val().replace("T", " "),
              CustomerId,
              CustomerCode: $("#input_inModalCheckIn_customerCode").val(),
              Customer,
              ShipperId,
              Shipper: $("#input_inModalCheckIn_shipper").val(),
              VehicleTypeId,
              VehicleType: $("#input_inModalCheckIn_vehicleType").val(),
              VehicleId,
              VehiclePlate,
              TrailerPlate: $("#input_inModalCheckIn_TrailerPlate").val(),
              DriverName: $("#input_inModalCheckIn_driverName").val(),
            });

            $.ajax({
              url: "/weight/plan/" + PlanId + "/checkin",
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
                tableWeightPlan.ajax.reload(null, false);
                print(PlanId);
                $("#modalCheckIn").modal("hide");
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
            $("#modalCheckIn").modal("hide");
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "Warning",
            text: "ข้อมูลมีการเปลื่ยนแปลง",
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#FF5733",
          });
          tableWeightPlan.ajax.reload(null, false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  // qr
  $("#tbWeightPlan").on("click", "#button_plan_qr", function () {
    let tr = $(this).closest("tr");
    let { PlanId } = tableWeightPlan.row(tr).data();
    print(PlanId);
    // $.ajax({
    //   url: "/weight/plan/" + PlanId + "/qrcode",
    //   method: "get",
    //   contentType: "application/json",
    //   dataType: "json",
    //   success: function (res) {
    //     $("#showPDF").html("");
    //     $("#showPDF").html(`
    //     <iframe id="pdfFrame" src="${res.message}" style=""></iframe>
    //     `);

    //     printPDF();
    //   },
    //   error: function (err) {
    //     let error = err.responseJSON.message;
    //     Swal.fire({
    //       position: "center",
    //       icon: "warning",
    //       title: "Warning",
    //       text: error,
    //       showConfirmButton: true,
    //       confirmButtonText: "OK",
    //       confirmButtonColor: "#FF5733",
    //     });
    //   },
    // });
  });
  $(document).on("click", "#test_print_pdf", function () {
    console.log("test print pdf");
    printPDF();
  });
  // delete
  $("#tbWeightPlan").on("click", "#button_plan_delete", function () {
    let tr = $(this).closest("tr");
    let tableData = tableWeightPlan.row(tr).data();
    checkDataWeightPlan(tableData)
      .then((result) => {
        if (result) {
          $("#modalPlanDel").modal("show");
          $("#modalPlanDel .modal-title").html("ยกเลิกแผนการชั่ง");
          $("#modalPlanDel .modal-body p").html("ต้องการยกเลิกแผนการชั่งใช่หรือไม่?");

          let { PlanId } = tableData;
          $("#YesPlanBtn").unbind();
          $("#YesPlanBtn").on("click", () => {
            $.ajax({
              url: "/weight/plan/" + PlanId + "/cancel",
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
                $("#modalPlanDel").modal("hide");
                tableWeightPlan.ajax.reload(null, false);
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
            $("#modalPlanDel").modal("hide");
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "Warning",
            text: "ข้อมูลมีการเปลื่ยนแปลง",
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#FF5733",
          });
          tableWeightPlan.ajax.reload(null, false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  //active
  $("#tbWeightPlan").on("click", "#button_plan_active", function () {
    let tr = $(this).closest("tr");
    let tableData = tableWeightPlan.row(tr).data();
    checkDataWeightPlan(tableData)
      .then((result) => {
        if (result) {
          $("#modalPlanDel").modal("show");
          $("#modalPlanDel .modal-title").html("เปิดการใช้งานแผนการชั่ง");
          $("#modalPlanDel .modal-body p").html("ต้องการเปิดการใช้งานแผนการชั่งใช่หรือไม่?");

          let { PlanId } = tableWeightPlan.row(tr).data();
          $("#YesPlanBtn").unbind();
          $("#YesPlanBtn").on("click", () => {
            $.ajax({
              url: "/weight/plan/" + PlanId + "/uncancel",
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
                $("#modalPlanDel").modal("hide");
                tableWeightPlan.ajax.reload(null, false);
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
            $("#modalPlanDel").modal("hide");
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "Warning",
            text: "ข้อมูลมีการเปลื่ยนแปลง",
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#FF5733",
          });
          tableWeightPlan.ajax.reload(null, false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  $("#button_plan_uploadFile").unbind();
  $("#button_plan_uploadFile").on("click", (e) => {
    $("#input_plan_uploadFile").click();
  });

  $("#input_plan_uploadFile").unbind();
  $("#input_plan_uploadFile").change(async function (e) {
    let ExFile = e.target.files[0];

    let Excel = new FormData();
    Excel.append("plan", ExFile, "plan");
    $("#input_plan_uploadFile").val("");

    $.ajax({
      url: "/weight/plan/import",
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
        tableWeightPlan.ajax.reload(null, false);
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
