function AddToCart() {
    var item_id = $('#AddButton').attr("data");
    var data = {itemid : item_id};
    $.ajax({
       type: 'POST',
       url: "/addcart",
       contentType: 'application/json',
       data : JSON.stringify(data),
       dataType : 'json',
       scriptCharset: 'utf-8',
       success: function(msg){
          jQuery.parseJSON(msg)
       }
     });
}
   

$(document).ready(function() {
   $('#myModal').on('show.bs.modal', function (event) {
      $('#myModalImage').attr("src",$(event.relatedTarget).data('whatever'));
      $('#AddButton').attr("data",$(event.relatedTarget).data('itemid'))
   });
   

});