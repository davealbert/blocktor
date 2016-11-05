var bitcoin = require("bitcoinjs-lib")
var request = require('request')

var network = bitcoin.networks.testnet
var tx = new bitcoin.TransactionBuilder(network)

var sourceWallet = "mkEEZ8gqfJsH1MRsQa9tBs1c66o561952Y"

request({
  url: "http://tbtc.blockr.io/api/v1/address/info/" + sourceWallet,
  method: "GET",
  headers: {
    'Content-Type': 'application/json'
  }
}, function optionalCallback(error, response, body){
  var lastTx = JSON.parse(body).data.last_tx.tx;
  console.log("last tx: " + lastTx)
  request({
    url: "https://testnet.api.coinprism.com/v1/transactions/" + lastTx,
    method: "GET",
    strictSSL: false,
    headers: {
      'Content-Type': 'application/json'
    }
  }, function optionalCallback(error, response, body){
    var transactions = JSON.parse(body).outputs;
    var txIndex = transactions[transactions.length - 1].index;
    console.log("last tx idx: " + txIndex)
    buildNewTransaction(lastTx, txIndex)
  })
})

function buildNewTransaction(txId, txIndex){
  tx.addInput(txId, 1)

  // Add the output (who to pay to):
  // [payee's address, amount in satoshis]
  tx.addOutput("muEqoXnoWbYarzusdTKeHduXda3ksMCotK", 1000)

  var data = new Buffer("[start]id:af880261e91629de48baf8bcad8abe19aa1bee34|name:hahahahaha[end]")
   
  var ret = bitcoin.script.compile([
      bitcoin.opcodes.OP_RETURN, 
      data
    ])
  tx.addOutput(ret, 0);
  // Initialize a private key using WIF
  var privateKeyWIF = 'cV7mTRkSbMNsE8zURVYf3FJPczWxCipibGvtZyh4SAwJ9Jrq28Dz'
  var keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, network)

  // Sign the first input with the new key
  tx.sign(0, keyPair)

  var signTx = tx.build().toHex();

  console.log(signTx)

  request({
    url: "https://testnet.api.coinprism.com/v1/sendrawtransaction",
    method: "POST",
    strictSSL: false,
    headers: {
      'Content-Type': 'application/json'
    },
    "body": '"' + signTx + '"'
  }, function optionalCallback(error, response, body){
    console.log('Server responded with:', body);
  })
}