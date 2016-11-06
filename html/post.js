$(document).ready(function() {
   $('button').click(function( event ) {
      event.stopPropagation();
      // Do something
      var formData = $('form')[0].elements;

      var torr = formData.torrent.value.substring(0,60);
      var tag = formData.tag.value.substring(0,60);
      var detail = formData.detail.value.substring(0,60);

      console.log(torr);
      console.log(tag);
      console.log(detail);
   });
});
