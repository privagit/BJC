$(document).ready(() => {
  //Product table
  function fill_Product() {
    tableProd = $("#tbProd").DataTable({
      bDestroy: true,
      scrollY: "40vh",
      scrollX: true,
      scrollCollapse: true,
      ajax: {
        url: "/product_master/",
        dataSrc: "",
      },
      columns: [
        {
          data: "ProductCode",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Product",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "ProductType",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Price",
          render: function (data, type, row) {
            let html = "";
            !row.Active
              ? (html = `<span class="text-line-through">${data.toLocaleString("en-US") || "-"}</span>`)
              : (html = data.toLocaleString("en-US") || "-");
            return html;
          },
        },
        {
          data: "Weight",
          render: function (data, type, row) {
            let html = "";
            !row.Active
              ? (html = `<span class="text-line-through">${data.toLocaleString("en-US") || "-"}</span>`)
              : (html = data.toLocaleString("en-US") || "-");
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
          defaultContent: "action",
          render: function (data, type, row) {
            let html = `<button
            class="btn btn-info btn-sm text-nowrap mr-1"
            id="button_product_edit"
            type="button"
            style="font-size: 13px"
            title="แก้ไขข้อมูล"
          >
            <i class="fa fa-pencil-square-o m-1"></i></button
          ><button
            class="btn btn-danger btn-sm text-nowrap"
            id="button_product_delete"
            type="button"
            style="font-size: 13px"
            title="ลบข้อมูล"
          >
            <i class="fa fa-remove m-1"></i>
          </button>`;

            if (!row.Active) {
              html = `
              <button class="btn btn-success text-nowrap p-1" id="button_product_active" type="button" style="font-size: 13px; width: 35px;"
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

  //Product Type table
  function fill_ProductType() {
    tableProdType = $("#tbProdType").DataTable({
      bDestroy: true,
      ajax: {
        url: "/product_type_master/",
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
          data: "ProductType",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          defaultContent: "action",
          render: function (data, type, row) {
            let html = `<button
              class="btn btn-info btn-sm text-nowrap mr-1"
              id="button_productType_edit"
              type="button"
              style="font-size: 13px"
              title="แก้ไขข้อมูล"
            >
              <i class="fa fa-pencil-square-o"></i></button
            ><button
              class="btn btn-danger btn-sm text-nowrap"
              id="button_productType_delete"
              type="button"
              style="font-size: 13px"
              title="ปิดใช้งาานข้อมูล"
            >
              <i class="fa fa-remove"></i>
            </button>`;

            if (!row.Active) {
              html = `
              <button class="btn btn-success text-nowrap p-1" id="button_productType_active" type="button" style="font-size: 13px; width: 35px;"
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

  fill_Product();
  fill_ProductType();
  // product type dropdown
  function productTypeDropdown() {
    $.ajax({
      url: "/dropdown/producttype",
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        $("#prodtype_opt").html("");
        response.forEach((ProductType) => {
          $("#prodtype_opt").append(
            `
            <option data-id="${ProductType.ProductTypeId}" value="${ProductType.ProductType}" />
            `
          );
        });
      },
    });
  }

  // productTypeDropdown();

  // add Product
  $("#button_product_add").unbind();
  $("#button_product_add").on("click", function () {
    $("#modalProdDetail").modal("show");
    $("#modalProdDetail input,#modalProdDetail textarea").val("");
    productTypeDropdown();

    $("#button_inModal_submitProduct").unbind();
    $("#button_inModal_submitProduct").on("click", () => {
      let ProductCode = $("#input_inModal_productCode").val();
      let Product = $("#input_inModal_product").val();
      let ProductType = $("#input_inModal_productType").val();
      let ProductTypeId = $(`#prodtype_opt option[value="${ProductType}"]`).attr("data-id") || null;
      let Price = $("#input_inModal_price").val();
      let Weight = $("#input_inModal_weight").val();
      let Remark = $("#input_inModal_remark").val();
      let data = JSON.stringify({
        ProductCode: ProductCode,
        Product: Product,
        ProductType: ProductType,
        ProductTypeId: parseInt(ProductTypeId),
        Price: parseInt(Price || 0),
        Weight: parseInt(Weight || 0),
        Remark: Remark,
      });
      $.ajax({
        url: "/product_master",
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
          tableProd.ajax.reload(null, false);
          if (ProductTypeId == null) {
            tableProdType.ajax.reload(null, false);
          }
          $("#modalProdDetail").modal("hide");
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
      $("#modalProdDetail").modal("hide");
    });
  });

  // edit Product
  $("#tbProd").on("click", "#button_product_edit", function () {
    $("#modalProdDetail").modal("show");
    $("#modalProdDetail input,#modalProdDetail textarea").val("");
    productTypeDropdown();

    let tr = $(this).closest("tr");
    let { ProductId, ProductCode, Product, ProductType, Price, Weight, Remark } = tableProd.row(tr).data();

    $("#input_inModal_productCode").val(ProductCode);
    $("#input_inModal_product").val(Product);
    $("#input_inModal_productType").val(ProductType);
    $("#input_inModal_price").val(Price);
    $("#input_inModal_weight").val(Weight);
    $("#input_inModal_remark").val(Remark);

    $("#button_inModal_submitProduct").unbind();
    $("#button_inModal_submitProduct").on("click", () => {
      let ProductCode = $("#input_inModal_productCode").val();
      let Product = $("#input_inModal_product").val();
      let ProductType = $("#input_inModal_productType").val();
      let ProductTypeId = $(`#prodtype_opt option[value="${ProductType}"]`).attr("data-id") || null;
      let Price = $("#input_inModal_price").val();
      let Weight = $("#input_inModal_weight").val();
      let Remark = $("#input_inModal_remark").val();
      let data = JSON.stringify({
        ProductCode: ProductCode,
        Product: Product,
        ProductType: ProductType,
        ProductTypeId: parseInt(ProductTypeId),
        Price: parseInt(Price || 0),
        Weight: parseInt(Weight || 0),
        Remark: Remark,
      });
      $.ajax({
        url: "/product_master/" + ProductId,
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
          tableProd.ajax.reload(null, false);
          if (ProductTypeId == null) {
            tableProdType.ajax.reload(null, false);
          }
          $("#modalProdDetail").modal("hide");
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
      $("#modalProdDetail").modal("hide");
    });
  });
  // delete  Product
  $("#tbProd").on("click", "#button_product_delete", function () {
    $("#modalProdDel").modal("show");
    $("#modalProdDel .modal-title").html("ปิดการใช้งานข้อมูลสินค้า");
    $("#modalProdDel .modal-body p").html("ต้องการปิดการใช้งานข้อมูลสินค้าใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { ProductId } = tableProd.row(tr).data();
    $("#button_inModal_submitDelete").unbind();
    $("#button_inModal_submitDelete").on("click", () => {
      $.ajax({
        url: "/product_master/" + ProductId + "/deactivate",
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
          tableProd.ajax.reload(null, false);
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
      $("#modalProdDel").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalProdDel").modal("hide");
    });
  });

  // active  Product
  $("#tbProd").on("click", "#button_product_active", function () {
    $("#modalProdDel").modal("show");
    $("#modalProdDel .modal-title").html("เปิดการใช้งานข้อมูลสินค้า");
    $("#modalProdDel .modal-body p").html("ต้องการเปิดการใช้งานข้อมูลสินค้าใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { ProductId } = tableProd.row(tr).data();
    $("#button_inModal_submitDelete").unbind();
    $("#button_inModal_submitDelete").on("click", () => {
      $.ajax({
        url: "/product_master/" + ProductId + "/activate",
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
          tableProd.ajax.reload(null, false);
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
      $("#modalProdDel").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalProdDel").modal("hide");
    });
  });

  // add Product Type
  $("#button_productType_add").unbind();
  $("#button_productType_add").on("click", function () {
    $("#modalProdTypeDetail").modal("show");
    $("#modalProdTypeDetail input,#modalProdTypeDetail textarea").val("");

    $("#button_inModal_submitProductType").unbind();
    $("#button_inModal_submitProductType").on("click", () => {
      let data = JSON.stringify({
        ProductType: $("#input_inModal_type").val(),
      });
      $.ajax({
        url: "/product_type_master",
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
          tableProdType.ajax.reload(null, false);
          $("#modalProdTypeDetail").modal("hide");
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
      $("#modalProdTypeDetail").modal("hide");
    });
  });

  // edit Product Type
  $("#tbProdType").on("click", "#button_productType_edit", function () {
    $("#modalProdTypeDetail").modal("show");
    $("#modalProdTypeDetail input,#modalProdTypeDetail textarea").val("");

    let tr = $(this).closest("tr");
    let { ProductTypeId, ProductType } = tableProdType.row(tr).data();

    $("#input_inModal_type").val(ProductType);

    $("#button_inModal_submitProductType").unbind();
    $("#button_inModal_submitProductType").on("click", () => {
      let ProductType = $("#input_inModal_type").val();
      let data = JSON.stringify({
        ProductType: ProductType,
      });
      $.ajax({
        url: "/product_type_master/" + ProductTypeId,
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
          tableProdType.ajax.reload(null, false);
          $("#modalProdTypeDetail").modal("hide");
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
      $("#modalProdTypeDetail").modal("hide");
    });
  });
  // delete  Product Type
  $("#tbProdType").on("click", "#button_productType_delete", function () {
    $("#modalProdDel").modal("show");
    $("#modalProdDel .modal-title").html("ปิดการใช้งานข้อมูลประเภทสินค้า");
    $("#modalProdDel .modal-body p").html("ต้องการปิดการใช้งานข้อมูลประเภทสินค้าใช่หรือไม่?");
    let tr = $(this).closest("tr");
    let { ProductTypeId } = tableProdType.row(tr).data();
    $("#button_inModal_submitDelete").unbind();
    $("#button_inModal_submitDelete").on("click", () => {
      $.ajax({
        url: "/product_type_master/" + ProductTypeId + "/deactivate",
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
          tableProdType.ajax.reload(null, false);
          $("#modalProdDel").modal("hide");
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
      $("#modalProdDel").modal("hide");
    });
  });

  // activate  Product Type
  $("#tbProdType").on("click", "#button_productType_active", function () {
    $("#modalProdDel").modal("show");
    $("#modalProdDel .modal-title").html("เปิดการใช้งานข้อมูลประเภทสินค้า");
    $("#modalProdDel .modal-body p").html("ต้องการเปิดการใช้งานข้อมูลประเภทสินค้าใช่หรือไม่?");
    let tr = $(this).closest("tr");
    let { ProductTypeId } = tableProdType.row(tr).data();
    $("#button_inModal_submitDelete").unbind();
    $("#button_inModal_submitDelete").on("click", () => {
      $.ajax({
        url: "/product_type_master/" + ProductTypeId + "/activate",
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
          tableProdType.ajax.reload(null, false);
          $("#modalProdDel").modal("hide");
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
      $("#modalProdDel").modal("hide");
    });
  });

  // import
  $("#button_product_uploadFile").unbind();
  $("#button_product_uploadFile").on("click", (e) => {
    $("#input_product_uploadFile").click();
  });

  $("#input_product_uploadFile").unbind();
  $("#input_product_uploadFile").change(async function (e) {
    let ExFile = e.target.files[0];

    let Excel = new FormData();
    Excel.append("master", ExFile, "master");
    $("#input_product_uploadFile").val("");

    $.ajax({
      url: "/product_master/import",
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
        tableProd.ajax.reload(null, false);
        tableProdType.ajax.reload(null, false);
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
