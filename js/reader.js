function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function getTorrentList(callback) {
  $.getJSON('https://testnet.api.coinprism.com/v1/addresses/2NA5TP5HR9LjLzPeG985EGMH6AMyLHH49u2/transactions', function(data) {
  	console.log(data);
    $.each(data, function( index, value ) {
      var output = value.outputs[1]
      var ret = []
      if(output && output.script.match('^6a')){
        var ascii = hex2a(output.script.substring(2));
        console.log( index + ": " +  ascii);   
        ret.push(ascii)
      }        
      callback(ret);
    });
  });
}