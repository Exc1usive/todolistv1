function checked(item) {
  // toggle checked properties on checkbox
  // $("#" + item).prop("checked", function (i, value) {
  //   return !value;
  // });
  $("#" + item).prop("checked", true)
  $("div[name='" + item + "']").hide("slow");
  setTimeout(() => $("#" + item).trigger("onchange"), 500)

};

$('#exampleModal').on('shown.bs.modal', function() {
  $(this).find('input:first').focus();
});


// function deleteItem(item) {
//   $("div[name='" + item + "']").hide("slow");
//   console.log($("div[name='" + item + "']"));
// };
