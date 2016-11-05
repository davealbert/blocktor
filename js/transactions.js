var bitcoin = require("bitcoinjs-lib")
var request = require('request');

var network = bitcoin.networks.testnet
var tx = new bitcoin.TransactionBuilder(network)

request({
  url: "http://tbtc.blockr.io/api/v1/address/info/mzXgPXJvGB1VgWR12fjekhS5Fsu8p9ffq7",
  method: "GET",
  headers: {
    'Content-Type': 'application/json'
  },
}, function optionalCallback(error, response, body){
  var lastTx = JSON.parse(body).data.last_tx.tx;
  console.log("last tx: " + lastTx)
  buildNewTransaction(lastTx)
})

function buildNewTransaction(txId){
  tx.addInput(txId, 0)

  // Add the output (who to pay to):
  // [payee's address, amount in satoshis]
  tx.addOutput("2Mwf9wKZvib1b96PoePgjZ4ZjRrKLhjKBvK", 2233)

  var data = new Buffer("[start]id:af880261e91629de48baf8bcad8abe19aa1bee34|name:Blockchain-Hackathon.png[end]")
   data.write("[start]id:af880261e91629de48baf8bcad8abe19aa1bee34|", 'utf-8')
   data.write("desc: This is an image ", 'utf-8')
   data.write("from the blockchain-hackathon.com ", 'utf-8')
   data.write("website[end] ", 'utf-8')

  var ret = bitcoin.script.compile([
      bitcoin.opcodes.OP_RETURN, 
      data
    ])
  tx.addOutput(ret, 0);
  // Initialize a private key using WIF
  var privateKeyWIF = 'cT8M1UT7wJCrKUmAeqw9LFEMj6zjnRsDWU75kjd2ABNPCa4VqsvS'
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