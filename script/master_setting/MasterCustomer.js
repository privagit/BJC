$(document).ready(() => {
  //main customer table
  const fill_mainCustomer = () => {
    tableMainCust = $("#tbMainCust").DataTable({
      bDestroy: true,
      scrollY: "40vh",
      ajax: {
        url: "/customer_master",
        dataSrc: "",
      },
      columns: [
        {
          data: "CustomerCode",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Customer",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Address",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Tel",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Remark",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          defaultContent: "",
          render: function (data, type, row) {
            let html = `
            <div class="text-center">
              <div class="btn-group">
                  <button class="btn btn-info text-nowrap p-1 mr-1" type="button" id="button_customer_edit" style="font-size: 13px; width: 35px;" title="แก้ไขข้อมูลลูกค้า">
                      <i class="fa fa-pencil-square-o"></i>
                  </button>
                  <button class="btn btn-danger text-nowrap p-1" id="button_customer_delete" type="button" style="font-size: 13px; width: 35px;"
                  title="ลบข้อมูลลูกค้า">
                      <i class="fa fa-remove "></i>
                  </button>
              </div>
            </div>`;

            if (!row.Active) {
              html = `
                <button class="btn btn-success text-nowrap p-1" id="button_customer_active" type="button" style="font-size: 13px; width: 35px;"
                  title="เปิดใช้งานข้อมูลลูกค้า">
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
  };
  fill_mainCustomer();

  // MAIN CUSTOMER
  // add main customer
  $("#button_customer_add").unbind();
  $("#button_customer_add").on("click", function () {
    $("#modalCustDetail").modal("show");
    $("#modalCustDetail input").val("");

    $("#button_inModal_saveCustomer").unbind();
    $("#button_inModal_saveCustomer").on("click", () => {
      let CustomerCode = $("#input_inModal_code").val();
      let Customer = $("#input_inModal_name").val();
      let Address = $("#input_inModal_address").val();
      let Tel = $("#input_inModal_tel").val();
      let Remark = $("#input_inModal_remark").val();

      let data = JSON.stringify({
        CustomerCode,
        Customer,
        Address,
        Tel,
        Remark,
      });
      if (CustomerCode !== null && Customer !== null) {
        $.ajax({
          url: "/customer_master",
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
            tableMainCust.ajax.reload(null, false);
            $("#modalCustDetail").modal("hide");
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
      }
    });
    $(".close,.no").click(function () {
      $("#modalCustDetail").modal("hide");
    });
  });

  // edit main customer
  $("#tbMainCust").on("click", "#button_customer_edit", function () {
    $("#modalCustDetail").modal("show");

    $("#modalCustDetail input").val("");

    let tr = $(this).closest("tr");
    let { CustomerId, CustomerCode, Customer, Address, Tel, Remark } = tableMainCust.row(tr).data();

    $("#input_inModal_code").val(CustomerCode);
    $("#input_inModal_name").val(Customer);
    $("#input_inModal_address").val(Address);
    $("#input_inModal_tel").val(Tel);
    $("#input_inModal_remark").val(Remark);

    $("#button_inModal_saveCustomer").unbind();
    $("#button_inModal_saveCustomer").on("click", () => {
      let CustomerCode = $("#input_inModal_code").val();
      let Customer = $("#input_inModal_name").val();
      let Address = $("#input_inModal_address").val();
      let Tel = $("#input_inModal_tel").val();
      let Remark = $("#input_inModal_remark").val();

      let data = JSON.stringify({
        CustomerCode,
        Customer,
        Address,
        Tel,
        Remark,
      });

      if (CustomerCode && Customer) {
        $.ajax({
          url: "/customer_master/" + CustomerId,
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
            tableMainCust.ajax.reload(null, false);
            $("#modalCustDetail").modal("hide");
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
      }
    });
    $(".close,.no").click(function () {
      $("#modalCustDetail").modal("hide");
    });
  });
  // delete main customer
  $("#tbMainCust").on("click", "#button_customer_delete", function () {
    $("#modalCustDel").modal("show");
    $("#modalCustDel .modal-title").html("ปิดการใช้งานข้อมูลลูกค้า");
    $("#modalCustDel .modal-body p").html("ต้องการปิดการใช้งานข้อมูลลูกค้าใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { CustomerId } = tableMainCust.row(tr).data();
    $("#YesCustBtn").unbind();
    $("#YesCustBtn").on("click", () => {
      $.ajax({
        url: "/customer_master/" + CustomerId + "/deactivate",
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
          tableMainCust.ajax.reload(null, false);
          $("#modalCustDel").modal("hide");
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
      $("#modalCustDel").modal("hide");
    });
  });

  // active
  $("#tbMainCust").on("click", "#button_customer_active", function () {
    $("#modalCustDel").modal("show");
    $("#modalCustDel .modal-title").html("เปิดการใช้งานข้อมูลลูกค้า");
    $("#modalCustDel .modal-body p").html("ต้องการเปิดการใช้งานข้อมูลลูกค้าใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { CustomerId } = tableMainCust.row(tr).data();
    $("#YesCustBtn").unbind();
    $("#YesCustBtn").on("click", () => {
      $.ajax({
        url: "/customer_master/" + CustomerId + "/activate",
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
          tableMainCust.ajax.reload(null, false);
          $("#modalCustDel").modal("hide");
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
      $("#modalCustDel").modal("hide");
    });
  });

  $("#button_customer_uploadFile").unbind();
  $("#button_customer_uploadFile").on("click", (e) => {
    $("#input_customer_uploadFile").click();
  });

  $("#input_customer_uploadFile").unbind();
  $("#input_customer_uploadFile").change(async function (e) {
    let ExFile = e.target.files[0];

    let Excel = new FormData();
    Excel.append("master", ExFile, "master");
    $("#input_customer_uploadFile").val("");

    $.ajax({
      url: "/customer_master/import",
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
        tableMainCust.ajax.reload(null, false);
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
