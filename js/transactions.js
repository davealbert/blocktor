var bitcoin = require("bitcoinjs-lib")

var network = bitcoin.networks.testnet
var tx = new bitcoin.TransactionBuilder(network)

// Add the input (who is paying):
// [previous transaction hash, index of the output to use]
var txId = 'efade643edd9f45f8f547a1906bf2943c180423334e817328a7a9cf0db0c1943'

tx.addInput(txId, 0)

// Add the output (who to pay to):
// [payee's address, amount in satoshis]
tx.addOutput("2MywCnV9NdbqccYQJXGC3NmgBt4aBNK5WsV", 3333)

var data = new Buffer("[start]id:af880261e91629de48baf8bcad8abe19aa1bee34|name:Blockchain-Hackathon.png[end]")
// data.write("[start]id:af880261e91629de48baf8bcad8abe19aa1bee34|", 'utf-8')
// data.write("desc: This is an image ", 'utf-8')
// data.write("from the blockchain-hackathon.com ", 'utf-8')
// data.write("website[end] ", 'utf-8')

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

var request = require('request');

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