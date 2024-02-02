$(document).ready(() => {
  //main customer table
  function fill_User() {
    tableUser = $("#tbUser").DataTable({
      bDestroy: true,
      scrollY: "40vh",
      scrollX: true,
      scrollCollapse: true,
      ajax: {
        url: "/user/",
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
          data: "Username",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Password",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "FirstName",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "LastName",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Department",
          render: function (data, type, row) {
            let html = "";
            !row.Active ? (html = `<span class="text-line-through">${data || "-"}</span>`) : (html = data || "-");
            return html;
          },
        },
        {
          data: "Position",
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
                id="button_user_edit"
                type="button"
                style="font-size: 13px"
                title="แก้ไขข้อมูล"
              >
                <i class="fa fa-pencil-square-o m-1"></i></button
              ><button
                class="btn btn-danger btn-sm text-nowrap"
                id="button_user_delete"
                data-bss-tooltip=""
                type="button"
                style="font-size: 13px"
                data-target="#modalUserDel"
                title="ลบข้อมูล"
              >
                <i class="fa fa-remove m-1"></i>
            </button>
            `;

            if (!row.Active) {
              html = `
              <button class="btn btn-success text-nowrap p-1" id="button_user_active" type="button" style="font-size: 13px; width: 35px;"
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
  fill_User();

  // MAIN CUSTOMER
  // add main customer
  $("#button_user_add").unbind();
  $("#button_user_add").on("click", function () {
    $("#modalUserAdd").modal("show");
    $("#modalUserAdd input").val("");

    $("#button_password").addClass("d-none");
    $("#modalAdd_Password").prop("disabled", false);

    $("#modalUserAdd input[data-value='0']").prop("checked", true);

    $("#button_inModal_saveUser").unbind();
    $("#button_inModal_saveUser").on("click", () => {
      let data = JSON.stringify({
        Username: $("#modalAdd_Username").val(),
        Password: $("#modalAdd_Password").val(),
        FirstName: $("#modalAdd_FName").val(),
        LastName: $("#modalAdd_LName").val(),
        Department: $("#modalAdd_Department").val(),
        Position: $("#modalAdd_Position").val(),
        Permission: {
          userSetting: parseInt($(`input[name="userSetting"]:checked`).attr("data-value")), //: number
          customerSetting: parseInt($(`input[name="customerSetting"]:checked`).attr("data-value")), //: number
          productSetting: parseInt($(`input[name="productSetting"]:checked`).attr("data-value")), //: number
          vehicleSetting: parseInt($(`input[name="vehicleSetting"]:checked`).attr("data-value")), //: number
          factorySetting: parseInt($(`input[name="factorySetting"]:checked`).attr("data-value")), //: number
          weightCard: parseInt($(`input[name="weightCard"]:checked`).attr("data-value")), //: number
          weightPlan: parseInt($(`input[name="weightPlan"]:checked`).attr("data-value")), //: number
        },
      });
      $.ajax({
        url: "/user",
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
          tableUser.ajax.reload(null, false);
          $("#modalUserAdd").modal("hide");
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
      $("#modalUserAdd").modal("hide");
    });
  });

  // edit main customer
  $("#tbUser").on("click", "#button_user_edit", function () {
    $("#modalUserAdd").modal("show");
    $("#modalUserAdd input").val("");

    $("#button_password,#button_password_edit").removeClass("d-none");
    $("#button_password_save").addClass("d-none");

    $("#modalAdd_Password").prop("disabled", true);

    let tr = $(this).closest("tr");
    let { UserId, Username, Password, FirstName, LastName, Department, Position, Permission } = tableUser.row(tr).data();
    let { userSetting, customerSetting, productSetting, vehicleSetting, factorySetting, weightCard, weightPlan } = JSON.parse(Permission);
    $("#button_password").attr("data-user-id", UserId);
    $("#modalAdd_Username").val(Username);
    $("#modalAdd_Password").val(Password);
    $("#modalAdd_FName").val(FirstName);
    $("#modalAdd_LName").val(LastName);
    $("#modalAdd_Department").val(Department);
    $("#modalAdd_Position").val(Position);

    $(
      `#modalUserAdd input[name="userSetting"][data-value="${userSetting}"],
      #modalUserAdd input[name="customerSetting"][data-value="${customerSetting}"],
      #modalUserAdd input[name="productSetting"][data-value="${productSetting}"],
      #modalUserAdd input[name="vehicleSetting"][data-value="${vehicleSetting}"],
      #modalUserAdd input[name="factorySetting"][data-value="${factorySetting}"],
      #modalUserAdd input[name="weightCard"][data-value="${weightCard}"],
      #modalUserAdd input[name="weightPlan"][data-value="${weightPlan}"]`
    ).prop("checked", true);

    $("#button_inModal_saveUser").unbind();
    $("#button_inModal_saveUser").on("click", () => {
      let data = JSON.stringify({
        Username: $("#modalAdd_Username").val(),
        FirstName: $("#modalAdd_FName").val(),
        LastName: $("#modalAdd_LName").val(),
        Department: $("#modalAdd_Department").val(),
        Position: $("#modalAdd_Position").val(),
        Permission: {
          userSetting: parseInt($(`input[name="userSetting"]:checked`).attr("data-value")), //: number
          customerSetting: parseInt($(`input[name="customerSetting"]:checked`).attr("data-value")), //: number
          productSetting: parseInt($(`input[name="productSetting"]:checked`).attr("data-value")), //: number
          vehicleSetting: parseInt($(`input[name="vehicleSetting"]:checked`).attr("data-value")), //: number
          factorySetting: parseInt($(`input[name="factorySetting"]:checked`).attr("data-value")), //: number
          weightCard: parseInt($(`input[name="weightCard"]:checked`).attr("data-value")), //: number
          weightPlan: parseInt($(`input[name="weightPlan"]:checked`).attr("data-value")), //: number
        },
      });
      $.ajax({
        url: "/user/" + UserId,
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
          tableUser.ajax.reload(null, false);
          $("#modalUserAdd").modal("hide");
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
      $("#modalUserAdd").modal("hide");
    });
  });

  // change password
  $("#modalUserAdd").on("click", "#button_password button", function () {
    let thisButton = this.id;
    let UserId = $("#button_password").attr("data-user-id");
    if (thisButton == "button_password_save") {
      $.ajax({
        url: "/user/" + UserId + "/changepass",
        method: "put",
        contentType: "application/json",
        data: JSON.stringify({
          Password: $("#modalAdd_Password").val(),
        }),
        success: (res) => {
          let success = res.message;
          Swal.fire({
            position: "center",
            icon: "success",
            text: success,
            showConfirmButton: false,
            timer: 1500,
          });
          $("#button_password button").toggleClass("d-none");
          $("#modalAdd_Password").prop("disabled", true);

          tableUser.ajax.reload(null, false);
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
      //sucess
    } else {
      $("#button_password button").toggleClass("d-none");
      $("#modalAdd_Password").prop("disabled", false);
    }
  });
  // delete main customer
  $("#tbUser").on("click", "#button_user_delete", function () {
    $("#modalUserDel").modal("show");
    $("#modalUserDel .modal-title").html("ปิดการใช้งานบัญชีผู้ใช้");
    $("#modalUserDel .modal-body p").html("ต้องการปิดการใช้งานบัญชีผู้ใช้ใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { UserId } = tableUser.row(tr).data();
    $("#YesBtn").unbind();
    $("#YesBtn").on("click", () => {
      $.ajax({
        url: "/user/" + UserId + "/deactivate",
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
          tableUser.ajax.reload(null, false);
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
      $("#modalUserDel").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalUserDel").modal("hide");
    });
  });

  // delete main customer
  $("#tbUser").on("click", "#button_user_active", function () {
    $("#modalUserDel").modal("show");
    $("#modalUserDel .modal-title").html("เปิดการใช้งานบัญชีผู้ใช้");
    $("#modalUserDel .modal-body p").html("ต้องการเปิดการใช้งานบัญชีผู้ใช้ใช่หรือไม่?");

    let tr = $(this).closest("tr");
    let { UserId } = tableUser.row(tr).data();
    $("#YesBtn").unbind();
    $("#YesBtn").on("click", () => {
      $.ajax({
        url: "/user/" + UserId + "/activate",
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
          tableUser.ajax.reload(null, false);
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
      $("#modalUserDel").modal("hide");
    });
    $(".close,.no").click(function () {
      $("#modalUserDel").modal("hide");
    });
  });
});
