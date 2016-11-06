var receiverAddress = 'muEqoXnoWbYarzusdTKeHduXda3ksMCotK';

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function readBatch(txns, ret) {
  console.log(txns.length)
  BATCH_SIZE = 10
  var size = txns.length
  var iteration = 0;
  while(size >= 0) {
    var start = iteration * BATCH_SIZE
    var txnsStr = txns.slice(start, size > BATCH_SIZE ? start + BATCH_SIZE : txns.length).join(',')
    console.log((iteration * BATCH_SIZE)+" "+(size > BATCH_SIZE ? BATCH_SIZE : size))
    size -= BATCH_SIZE;
    iteration++;
    console.log("https://tbtc.blockr.io/api/v1/tx/info/"+txnsStr)
    $.getJSON("https://tbtc.blockr.io/api/v1/tx/info/"+txnsStr, function(data) {
      $.each(data.data, function(index, value) {
        $.each(value.vouts, function(i, v) {
          //console.log(v)
          if(v.address == "NONSTANDARD") {
            var ascii = hex2a(v.extras.asm)
            console.log( index + ": " +  ascii);   
            ret.push(ascii)
          }
        })
      })
    })
  }
}

function getTorrentList(callback) {
  $.getJSON('https://tbtc.blockr.io/api/v1/address/txs/'+receiverAddress, function(data) {
    console.log(data);
    var txns = []
    $.each(data.data.txs, function(index, value) {
      txns.push(value.tx)
    });

    data = []
    readBatch(txns, data)
    callback(data);
  });
}

function x(data) {
  console.log(data)
}
getTorrentList(x)