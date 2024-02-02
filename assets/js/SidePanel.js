/* Set the width of the sidebar to 250px (show it) */
function openNav() {
  $("#content").animate({ marginLeft: "220px" }, 200);
  $(".sidepanel").show(200);
  if (Object.keys($("#tbUser")).length) {
    setTimeout(function () {
      tableUser.columns.adjust().draw();
    }, 200);
  } else {
    setTimeout(function () {
      $("table").DataTable().columns.adjust().draw();
    }, 200);
  }
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
  $("#content").animate({ marginLeft: "0px" }, 200);
  $(".sidepanel").hide(200);
  if (Object.keys($("#tbUser")).length) {
    setTimeout(function () {
      tableUser.columns.adjust().draw();
    }, 200);
  } else {
    setTimeout(function () {
      $("table").DataTable().columns.adjust().draw();
    }, 200);
  }
}

$("#show_username").html("");
$.ajax({
  url: "/user/profile",
  method: "get",
  contentType: "application/json",
  dataType: "json",
  success: function (res) {
    $("#show_username").html(res.Name);
  },
});
