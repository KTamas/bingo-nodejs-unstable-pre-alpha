$(document).ready(function() {
  $.validator.addMethod("sixteen", function(value, element) {
      return value.split("\n").length === 16;
    }, "Tizenhat KELL!!!!!!");
  $("#loginform").validate();
  $("#newform").validate();
});
