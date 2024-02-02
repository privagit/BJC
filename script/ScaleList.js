const EditableElem = $("#input_inModalCard_adjWeight, #input_inModalCard_cardNote, #input_inModalCard_billNo, #input_inModalCard_billWeight");

function checkImg(idImg, idNoImg, img, position) {
  if (img) {
    $(idImg)
      .attr("src", "/img/Vehicle/" + position + "/" + img)
      .removeClass("d-none");
    $(idNoImg).addClass("d-none");
  } else {
    $(idImg).attr("src", "").addClass("d-none");
    $(idNoImg).removeClass("d-none");
  }
}

$(document).ready(() => {
  //  table
  function fill_WeightCard(FromDate, ToDate) {
    let url;
    url = `/weight/card?${FromDate ? `FromDate=${FromDate}` : ""}&${ToDate ? `ToDate=${ToDate}` : ""}`;
    tableWeightCard = $("#tbWeightCard").DataTable({
      bDestroy: true,
      // scrollY: "40vh",
      scrollX: true,
      scrollCollapse: true,
      ajax: {
        url,
        dataSrc: "",
      },
      columns: [
        {
          data: "index",
        },
        {
          data: "CardNo",
        },
        {
          data: "PlanDate",
        },
        {
          data: "VehiclePlate",
        },
        {
          data: "TrailerPlate",
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
          data: "Product",
        },
        {
          data: "BillWeight",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "WeightIn",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "WeightOut",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "NetWeight",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
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
          defaultContent: "action",
          render: function (data, type, row) {
            let html = ``;
            if (row.Status == 2 || row.Status == 3) {
              html = `
              <button
              class="btn btn-info btn-sm text-nowrap mr-1"
              id="button_plan_edit"
              type="button"
              style="font-size: 13px"
              title="ดูข้อมูลการชั่ง"
              >
                <i class="fa fa-sticky-note m-1"></i></button
              >
              `;
            }
            return html;
          },
        },
      ],
      columnDefs: [],
    });
  }

  function fill_ProductList(Data) {
    tableProductList = $("#tbProductList").DataTable({
      bDestroy: true,
      searching: false,
      paging: false,
      info: false,
      ordering: false,
      scrollCollapse: true,
      data: Data,
      columns: [
        {
          data: "index",
        },
        {
          data: "Product",
        },
        {
          data: "BillNo",
        },
        {
          data: "WeightIn",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "WeightOut",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "BillWeight",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "NetWeight",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "DifWeight",
          render: function (data, type, row) {
            data = data || 0;
            return data.toLocaleString("en-US");
          },
        },
        {
          data: "Remark",
          render: function (data, type, row) {
            return data || "-";
          },
        },
      ],
      columnDefs: [],
    });
  }

  fill_WeightCard();
  $("#input_toDate,#input_fromDate").change(function () {
    let FromDate = $("#input_fromDate").val();
    let ToDate = $("#input_toDate").val();

    fill_WeightCard(FromDate, ToDate);
  });

  //* Click Table Weight Card

  $("#tbWeightCard tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      // Row is already selected, deselect it
      $(this).removeClass("selected");
      $("#button_plan_card").addClass("d-none");
    } else {
      // Deselect other rows and select the clicked row
      tableWeightCard.$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
      $("#button_plan_card").removeClass("d-none");

      $("#button_plan_card").unbind();
      $("#button_plan_card").on("click", () => {
        let tr = $(this).closest("tr");
        let { CardNo, Status } = tableWeightCard.row(tr).data();

        if (CardNo && Status == 3) {
          $("#modalPlanCardDetail").modal("show");
          $("#span_inModalPlanCard_cardNo").text(CardNo);
          $.ajax({
            url: "/factory_master",
            method: "get",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
              let { FactoryName, FactoryAddress, FactoryTel } = res;
              $("#p_inModalPlanCard_factoryName").html(FactoryName);
              $("#p_inModalPlanCard_factoryAddress").html(FactoryAddress);
              $("#p_inModalPlanCard_factoryTel").html(FactoryTel);
            },
          });
          $.ajax({
            url: "/weight/card/all/" + CardNo,
            method: "get",
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
              // console.log(res);
              let { WeightInDate, WeightType, Customer, Shipper, VehiclePlate, ImgInF, ImgInB, ImgInT } = res[0];
              let lastIndex = res.length - 1;
              let { ImgOutF, ImgOutB, ImgOutT, WeightOutDate } = res[lastIndex];
              let text_WeightType;
              if (WeightType == 1) text_WeightType = "ชั่งเข้า";
              else if (WeightType == 2) text_WeightType = "ชั่งออก";
              $("#input_inModalPlanCard_vehiclePlate").val(VehiclePlate);
              $("#input_inModalPlanCard_weightType").val(text_WeightType);
              $("#input_inModalPlanCard_customer").val(Customer);
              $("#input_inModalPlanCard_shipper").val(Shipper);
              //* Fill Date
              $("#span_inModalPlanCard_dateIn").text(WeightInDate);
              $("#span_inModalPlanCard_dateOut").text(WeightOutDate);
              //* Fill Table Product List
              fill_ProductList(res);
              //* Fill Image
              checkImg("#image_inModalPlanCard_inFont", "#noimage_inModalPlanCard_inFont", ImgInF, "front");
              checkImg("#image_inModalPlanCard_inBack", "#noimage_inModalPlanCard_inBack", ImgInB, "back");
              checkImg("#image_inModalPlanCard_inTop", "#noimage_inModalPlanCard_inTop", ImgInT, "top");
              checkImg("#image_inModalPlanCard_outFont", "#noimage_inModalPlanCard_outFont", ImgOutF, "front");
              checkImg("#image_inModalPlanCard_outBack", "#noimage_inModalPlanCard_outBack", ImgOutB, "back");
              checkImg("#image_inModalPlanCard_outTop", "#noimage_inModalPlanCard_outTop", ImgOutT, "top");
            },
          });
        } else if (Status == 4) {
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "Warning",
            text: "บัตรชั่งถูกยกเลิก",
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#FF5733",
          });
        } else {
          Swal.fire({
            position: "center",
            icon: "warning",
            title: "Warning",
            text: "ยังไม่ได้ทำการชั่งน้ำหนัก",
            showConfirmButton: true,
            confirmButtonText: "OK",
            confirmButtonColor: "#FF5733",
          });
        }
      });
    }
  });

  // edit
  $("#tbWeightCard").on("click", "#button_plan_edit", function () {
    $("#modalCardDetail").modal("show");
    $("#modalCardDetail input,#modalCardDetail textarea").val("");
    $("#button_inModal_cardEdit").removeClass("d-none");
    $("#button_inModal_cardSubmit").addClass("d-none");
    EditableElem.attr("disabled", "").css({ "border-style": "none" });

    let tr = $(this).closest("tr");
    let { CardId, CardNo, CardDate, PlanDate, VehiclePlate, WeightType, Customer, Shipper, Product } = tableWeightCard.row(tr).data();

    $.ajax({
      url: "/weight/card/" + CardId,
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        let { BillNo, BillWeight, AdjWeight, DifWeight, NetWeight, Remark } = res;
        let { WeightIn, WeightInDate, ImgInF, ImgInB, ImgInT } = res;
        let { WeightOut, WeightOutDate, ImgOutF, ImgOutB, ImgOutT } = res;
        $("#input_inModalCard_billNo").val(BillNo);
        $("#input_inModalCard_billWeight").val(BillWeight);
        $("#input_inModalCard_adjWeight").val(AdjWeight);
        $("#input_inModalCard_netWeight").val(NetWeight || 0);
        $("#input_inModalCard_difWeight").val(DifWeight);
        $("#input_inModalCard_cardNote").val(Remark);

        $("#span_inModalCard_carInDate").html(WeightInDate);
        $("#span_inModalCard_carInWeight").html(WeightIn);

        checkImg("#image_inModalCard_inFont", "#noimage_inModalCard_inFont", ImgInF, "front");
        checkImg("#image_inModalCard_inBack", "#noimage_inModalCard_inBack", ImgInB, "back");
        checkImg("#image_inModalCard_inTop", "#noimage_inModalCard_inTop", ImgInT, "top");
        checkImg("#image_inModalCard_outFont", "#noimage_inModalCard_outFont", ImgOutF, "front");
        checkImg("#image_inModalCard_outBack", "#noimage_inModalCard_outBack", ImgOutB, "back");
        checkImg("#image_inModalCard_outTop", "#noimage_inModalCard_outTop", ImgOutT, "top");

        $("#span_inModalCard_carOutDate").html(WeightOutDate);
        $("#span_inModalCard_carOutWeight").html(WeightOut);
      },
    });

    $.ajax({
      url: "/factory_master",
      method: "get",
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        let { FactoryName, FactoryAddress, FactoryTel } = res;
        $("#p_inModalCard_factoryName").html(FactoryName);
        $("#p_inModalCard_factoryAddress").html(FactoryAddress);
        $("#p_inModalCard_factoryTel").html(FactoryTel);
      },
    });
    let text_WeightType;
    if (WeightType == 1) text_WeightType = "ชั่งเข้า";
    else if (WeightType == 2) text_WeightType = "ชั่งออก";

    $("#span_inModalCard_cardNo").html(CardNo);
    $("#span_inModalCard_cardDate").html(CardDate);
    $("#input_inModalCard_vehiclePlate").val(VehiclePlate);
    $("#input_inModalCard_weightType").val(text_WeightType);
    $("#input_inModalCard_customer").val(Customer);
    $("#input_inModalCard_shipper").val(Shipper);
    $("#input_inModalCard_product").val(Product);

    $("#button_inModal_cardEdit").unbind();
    $("#button_inModal_cardEdit").on("click", () => {
      $(".btn-card-toggle").toggleClass("d-none");
      EditableElem.removeAttr("disabled").css({ "border-style": "solid" });
    });

    $("#button_inModal_cardSubmit").unbind();
    $("#button_inModal_cardSubmit").on("click", () => {
      let data = JSON.stringify({
        BillNo: $("#input_inModalCard_billNo").val(),
        BillWeight: parseInt($("#input_inModalCard_billWeight").val()),
        AdjWeight: parseInt($("#input_inModalCard_adjWeight").val()),
        Remark: $("#input_inModalCard_cardNote").val(),
      });

      $.ajax({
        url: "/weight/card/" + CardId,
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
          tableWeightCard.ajax.reload(null, false);
          $(".btn-card-toggle").toggleClass("d-none");
          EditableElem.attr("disabled", "").css({ "border-style": "none" });
          $("#modalCardDetail").modal("hide");
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
      $("#modalCardDetail").modal("hide");
    });
  });

  $(document).on("click", "#button_plan_download", function () {
    let FromDate = $("#input_fromDate").val();
    let ToDate = $("#input_toDate").val();

    if (FromDate) {
      window.open(`/weight/report/export/scalelist?${FromDate ? `FromDate=${FromDate}` : ""}&${ToDate ? `ToDate=${ToDate}` : ""}`);
    } else {
      Swal.fire({
        position: "center",
        icon: "warning",
        title: "Warning",
        text: "กรุณาเลือกวันที่",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#FF5733",
      });
    }
  });
});
