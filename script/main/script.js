function intToLocalStr(data) {
  let int = data || 0;
  return int.toLocaleString("en-US");
}
$(document).ready(() => {
  $.ajax({
    url: `/dashboard/data`,
    method: "get",
    cache: false,
    success: function (res) {
      let obj = JSON.parse(res);
      let { TotalList, Customer, Product, Traffic, TotalWeight, RemainList, CompleteList } = obj;

      $("#p_index_totalList").text(intToLocalStr(TotalList));
      $("#p_index_customer").text(intToLocalStr(Customer));
      $("#p_index_product").text(intToLocalStr(Product));
      $("#p_index_traffic").text(intToLocalStr(Traffic));
      $("#p_index_totalWeight").text(intToLocalStr(TotalWeight));
      $("#p_index_remainList").text(intToLocalStr(RemainList));
      $("#p_index_completeList").text(intToLocalStr(CompleteList));
    },
    error: function (err) {
      console.log(err);
    },
  });
  let height = $("#tempFooter").outerHeight(true);

  $(".target-footer").css("height", height + "px");
});
