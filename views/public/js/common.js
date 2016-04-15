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
          
       }
     });
}

function deleteFromCart(itemid,thisdiv) {
     var result = false;
     
     $.ajax({
       type: 'Get',
       contentType: 'application/json',
       dataType : 'json',
       url: "/shopcart/delete/" + itemid,
       scriptCharset: 'utf-8',
       success: function(msg){
         if (msg.Count == 0 ) {
           result = true;
         }
         if (result) {
           $(thisdiv).parent().parent().parent().remove();
         }else {
           $(thisdiv).parent().children('.countitem').html("項目数：" + msg.Count)
         }
       }
     });
     
}

function showShopCart() {
     $.ajax({
       type: 'GET',
       url: "/getshopcart",
       scriptCharset: 'utf-8',
       success: function(msg){
           $('#shopcartcontainer').empty();
           $('#shopcartcontainer').append(msg);
           $('#shopcart').modal('show');
       }
     });
}

$(document).ready(function() {
   $('#myModal').on('show.bs.modal', function (event) {
      $('#myModalImage').attr("src",$(event.relatedTarget).data('whatever'));
      $('#AddButton').attr("data",$(event.relatedTarget).data('itemid'))
   });
});