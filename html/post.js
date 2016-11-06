$(document).ready(function() {
   $('button').click(function( event ) {
      event.stopPropagation();
      // Do something
      var formData = $('form')[0].elements;
      console.log(formData.torrent.value);
      console.log(formData.tag.value);
      console.log(formData.detail.value);
   });
});
