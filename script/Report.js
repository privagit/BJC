const EditableElem = $("#input_inModalCard_adjWeight, #input_inModalCard_cardNote, #input_inModalCard_billNo, #input_inModalCard_billWeight");

$(document).ready(() => {
  function getSumTable(api, col) {
    let sum = api
      .column(col, { page: "current" })
      .data()
      .reduce(function (acc, val) {
        return acc + val;
      }, 0);
    return sum;
  }
  //  table
  function fill_ReportProduct(ProductId, CustomerId, WeightType, FromDate, ToDate) {
    let url;
    url = `/weight/report/plan/?${ProductId ? `ProductId=${ProductId}` : ""}&${CustomerId ? `CustomerId=${CustomerId}` : ""}&${
      WeightType ? `WeightType=${WeightType}` : ""
    }&${FromDate ? `FromDate=${FromDate}` : ""}&${ToDate ? `ToDate=${ToDate}` : ""}`;

    tableMolasses = $("#tbProduct").DataTable({
      bDestroy: true,
      scrollY: "40vh",
      scrollX: true,
      scrollCollapse: true,
      paging: false,
      ajax: {
        url,
        dataSrc: "",
      },
      columns: [
        {
          data: "CardDate",
        },
        {
          data: "VehiclePlate",
        },
        {
          defaultContent: "Cout",
          render: function (data, type, row) {
            return 1;
          },
        },
        {
          data: "DriverName",
        },
        {
          data: "Remark",
        },
      ],
      columnDefs: [],
      // DataTable options...
      footerCallback: function (row, data, start, end, display) {
        var api = this.api();

        // Calculate sum for column 2 (index 1)
        var sum = api
          .column(2, { page: "current" })
          .data()
          .reduce(function (acc, val) {
            return acc + 1;
          }, 0);

        $(api.column(2).footer()).html(sum);
      },
    });
  }

  function fill_ReportMolasses(FromDate, ToDate) {
    let url;
    url = `/weight/report/molasses/?${FromDate ? `FromDate=${FromDate}` : ""}&${ToDate ? `ToDate=${ToDate}` : ""}`;

    tableMolasses = $("#tbMolasses").DataTable({
      bDestroy: true,
      paging: false,
      ajax: {
        url,
        dataSrc: "",
      },
      columns: [
        {
          data: "index",
        },
        {
          data: "VehiclePlate",
        },
        {
          data: "CardNo",
        },
        {
          data: "Batch",
        },
        {
          data: "ReceiveBy",
        },
        {
          data: "CardDate",
        },
        { data: "MolassesSeller" },
        {
          data: "Customer",
        },
        {
          data: "Shipper",
        },
        {
          data: "BillWeight", //9
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "NetWeight", //10
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "DifWeight", //11
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "Barrel",
        },
        {
          data: "Sweetness", //13
          render: function (data, type, row) {
            data = data || "-";
            return data;
          },
        },
        {
          data: "Brix", //14
          render: function (data, type, row) {
            data = data || "-";
            return data;
          },
        },
        {
          data: "SpecificGravity", //15
          render: function (data, type, row) {
            data = data || "-";
            return data;
          },
        },
        {
          data: "Temperature",
        },
        {
          data: "FinishTime",
        },

        {
          defaultContent: "action",
          render: function (data, type, row) {
            let html = `
            <button
                class="btn btn-info btn-sm text-nowrap mr-1"
                id="button_product_edit"
                type="button"
                style="font-size: 13px"
                title="ดูข้อมูลการชั่ง"
              >
                <i class="fa fa-sticky-note m-1"></i></button
            >
            `;
            if (row.Status == 4) {
              html = ``;
            }
            return html;
          },
        },
      ],
      columnDefs: [],
      // DataTable options...
      footerCallback: function (row, data, start, end, display) {
        let api = this.api();

        // Calculate sum for column 2 (index 1)
        let sum_col_4 = api
          .column(4, { page: "current" })
          .data()
          .reduce(function (acc, val) {
            return acc + 1;
          }, 0);
        let sum_col_9 = getSumTable(api, 9);
        let sum_col_10 = getSumTable(api, 10);
        let sum_col_11 = getSumTable(api, 11);

        let sum_col_13 = getSumTable(api, 13);
        let sum_col_14 = getSumTable(api, 14);
        let sum_col_15 = getSumTable(api, 15);

        $(api.column(4).footer()).html(sum_col_4);
        $(api.column(9).footer()).html(sum_col_9.toLocaleString("en-US"));
        $(api.column(10).footer()).html(sum_col_10.toLocaleString("en-US"));
        $(api.column(11).footer()).html(sum_col_11.toLocaleString("en-US"));

        $(api.column(13).footer()).html(sum_col_13 == 0 ? "-" : sum_col_13);
        $(api.column(14).footer()).html(sum_col_14 == 0 ? "-" : sum_col_14);
        $(api.column(15).footer()).html(sum_col_15 == 0 ? "-" : sum_col_15);
      },
    });
  }

  function fill_ReportMolassesCustomer(FromDate, ToDate) {
    let url;
    url = `/weight/report/molasses/customer/?${FromDate ? `FromDate=${FromDate}` : ""}&${ToDate ? `ToDate=${ToDate}` : ""}`;

    tableMolassesCustomer = $("#tbMolassesCustomer").DataTable({
      bDestroy: true,
      paging: false,
      ajax: {
        url,
        dataSrc: "",
      },
      columns: [
        {
          data: "Customer",
        },
        {
          data: "Shipper",
        },
        {
          data: "SumBillWeight", //2
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "SumNetWeight", //3
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "SumDifWeight", //4
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "CountWeightCard",
          render: function (data, type, row) {
            data = data || "-";
            return data;
          },
        },
        {
          data: "SumBarrel",
          render: function (data, type, row) {
            data = data || "-";
            return data;
          },
        },
        {
          data: "AvgSweetness", //7
          render: function (data, type, row) {
            data = data || "-";
            return data;
          },
        },
        {
          data: "AvgBrix", //8
          render: function (data, type, row) {
            data = data || "-";
            return data;
          },
        },
        {
          data: "AvgSpecificGravity", //9
          render: function (data, type, row) {
            data = data || "-";
            return data;
          },
        },
      ],
      columnDefs: [],
      // DataTable options...
      footerCallback: function (row, data, start, end, display) {
        let api = this.api();

        // Calculate sum for column 2 (index 1)
        for (let i = 2; i <= 9; i++) {
          let sum = getSumTable(api, i);
          i >= 7 && i <= 9 ? $(api.column(i).footer()).html(sum == 0 ? "-" : sum) : $(api.column(i).footer()).html(sum.toLocaleString("en-US"));
        }
      },
    });
  }

  function dpCustomer() {
    $.ajax({
      url: "/dropdown/customer",
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        $("#customer_opt").html("");
        res.forEach((data) => {
          $("#customer_opt").append(`<option data-id="${data.CustomerId}" value="${data.Customer}" />`);
        });
      },
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
          $("#product_opt").append(`<option data-id="${data.ProductId}" value="${data.Product}" />`);
        });
      },
    });
  }

  fill_ReportProduct();
  fill_ReportMolasses();
  fill_ReportMolassesCustomer();
  dpCustomer();
  dpProduct();
  $(".filter-product").change(function () {
    let Product = $("#input_shipper_product").val();
    let ProductId = $(`#product_opt option[value="${Product}"]`).attr("data-id") || "";
    let Customer = $("#input_shipper_customer").val();
    let CustomerId = $(`#customer_opt option[value="${Customer}"]`).attr("data-id") || "";
    let WeightType = $("#select_shipper_weightType").val();
    let FromDate = $("#input_shipper_formDate").val();
    let ToDate = $("#input_shipper_toDate").val();

    fill_ReportProduct(ProductId, CustomerId, WeightType, FromDate, ToDate);
  });

  $("#select_molasses_reportType").change(function () {
    let condition = $("#select_molasses_reportType").val();
    if (condition == 1) {
      $("#weightlist").removeClass("d-none");
      $("#customerlist").addClass("d-none");
    } else {
      $("#weightlist").addClass("d-none");
      $("#customerlist").removeClass("d-none");
    }
  });

  $("#select_molasses_reportType,#input_molasses_fromDate,#input_molasses_toDate").change(function () {
    let type = $("#select_molasses_reportType").val();
    let FromDate = $("#input_molasses_fromDate").val();
    let ToDate = $("#input_molasses_toDate").val();
    if (type == 1) fill_ReportMolasses(FromDate, ToDate);
    if (type == 2) fill_ReportMolassesCustomer(FromDate, ToDate);
  });

  // edit
  $("#tbMolasses").on("click", "#button_product_edit", function () {
    $("#modalAnalyze").modal("show");
    $("#modalAnalyze input").val("");

    let tr = $(this).closest("tr");
    let { CardId, Batch, ReceiveBy, Barrel, Sweetness, Brix, SpecificGravity, Temperature } = tableMolasses.row(tr).data();
    $("#input_inModal_batch").val(Batch);
    $("#input_inModal_receiveBy").val(ReceiveBy);
    $("#input_inModal_barrell").val(Barrel);
    $("#input_inModal_sweetness").val(Sweetness);
    $("#input_inModal_brix").val(Brix);
    $("#input_inModal_specificGravity").val(SpecificGravity);
    $("#input_inModal_temperature").val(Temperature);

    $("#button_inModal_submit").unbind();
    $("#button_inModal_submit").on("click", () => {
      let data = JSON.stringify({
        Batch: $("#input_inModal_batch").val(),
        ReceiveBy: $("#input_inModal_receiveBy").val(),
        Barrel: $("#input_inModal_barrell").val(),
        Sweetness: $("#input_inModal_sweetness").val(),
        Brix: $("#input_inModal_brix").val(),
        SpecificGravity: $("#input_inModal_specificGravity").val(),
        Temperature: $("#input_inModal_temperature").val(),
      });
      $.ajax({
        url: "/weight/card/" + CardId + "/sugar",
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
          tableMolasses.ajax.reload(null, false);
          tableMolassesCustomer.ajax.reload(null, false);
          $("#modalAnalyze").modal("hide");
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
      $("#modalAnalyze").modal("hide");
    });
  });

  $(document).on("click", "#button_shipper_download", function () {
    let Product = $("#input_shipper_product").val();
    let ProductId = $(`#product_opt option[value="${Product}"]`).attr("data-id") || "";
    let Customer = $("#input_shipper_customer").val();
    let CustomerId = $(`#customer_opt option[value="${Customer}"]`).attr("data-id") || "";
    let WeightType = $("#select_shipper_weightType").val();
    let FromDate = $("#input_shipper_formDate").val();
    let ToDate = $("#input_shipper_toDate").val();

    if (ProductId && CustomerId && WeightType && FromDate) {
      window.open(
        `/weight/report/export/plan/?${ProductId ? `ProductId=${ProductId}` : ""}&${CustomerId ? `CustomerId=${CustomerId}` : ""}&${
          WeightType ? `WeightType=${WeightType}` : ""
        }&${FromDate ? `FromDate=${FromDate}` : ""}&${ToDate ? `ToDate=${ToDate}` : ""}`
      );
    } else {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Warning",
        text: "กรุณาเลือก สินค้า, ลูกค้า, ประเภทการชั่ง และ วันที่",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    }
  });

  $(document).on("click", "#button_molasses_download", function () {
    let Report = $("#select_molasses_reportType").val();
    let FromDate = $("#input_molasses_fromDate").val();
    let ToDate = $("#input_molasses_toDate").val();

    if (Report == 1 && FromDate) {
      window.open(`/weight/report/export/molasses/?${FromDate ? `FromDate=${FromDate}` : ""}&${ToDate ? `ToDate=${ToDate}` : ""}`);
    } else if (Report == 2 && FromDate) {
      window.open(`/weight/report/export/molasses/customer/?${FromDate ? `FromDate=${FromDate}` : ""}&${ToDate ? `ToDate=${ToDate}` : ""}`);
    } else {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Warning",
        text: "กรุณาเลือก รายงาน และ วันที่",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    }
  });
});
