var bitcoin = require("bitcoinjs-lib")
var request = require('request')

var sourceWallet11 = "mkEEZ8gqfJsH1MRsQa9tBs1c66o561952Y"
var privateKeyWIF11 = 'cV7mTRkSbMNsE8zURVYf3FJPczWxCipibGvtZyh4SAwJ9Jrq28Dz'

var sourceWallet22 = "mndPvy8Mz6d4nZSuL3fTtSTADJBxFbVfxa"
var privateKeyWIF22 = 'cSiNuQaPwU2dfEknrgiCYc6p94c5avSkVVHf9UN2cvaQWKMdsJ1A'

var receiver = "muEqoXnoWbYarzusdTKeHduXda3ksMCotK";

var conversion = 100000000;

function createTransaction(sourceWallet, privateKeyWIF, destWallet, torrentHash, torrentTagKey, torrentTagValue, callback) {

  var network = bitcoin.networks.testnet
  var tx = new bitcoin.TransactionBuilder(network)

  request({
    url: "http://tbtc.blockr.io/api/v1/address/info/" + sourceWallet,
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  }, function optionalCallback(error, response, body){
    // Find last transaction
    var data = JSON.parse(body).data;
    var lastTx = data.last_tx.tx;
    var balance = data.balance;
    // The last transaction is UTXO received from previous call
    var unspentValue = Math.abs(data.last_tx.value);
    console.log("last tx: " + lastTx)
    console.log("address balance InSatoshis: " + (balance * conversion))
    console.log("unspentValue: " + unspentValue)
    request({
      url: "http://tbtc.blockr.io/api/v1/tx/info/" + lastTx,
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    }, function optionalCallback(error, response, body){
      // Get the transaction details to find the index
      var transaction = JSON.parse(body).data;
      var indexOfWalletInUseFromOutputsOfTheLastTxn = 0;
      for (; indexOfWalletInUseFromOutputsOfTheLastTxn < transaction.vouts.length; indexOfWalletInUseFromOutputsOfTheLastTxn++) {
        if(transaction.vouts[indexOfWalletInUseFromOutputsOfTheLastTxn].address == sourceWallet) break;
      }
      console.log("last tx idx: " + indexOfWalletInUseFromOutputsOfTheLastTxn)
      console.log(Math.round(unspentValue * conversion))
      buildNewTransaction(lastTx, indexOfWalletInUseFromOutputsOfTheLastTxn, Math.round(unspentValue * conversion), 1000, torrentHash, torrentTagKey, torrentTagValue, callback);
    })
  })

  function buildNewTransaction(txId, indexOfWalletInUseFromOutputsOfTheLastTxn, balanceInSatoshis, valueToTransferSatoshis, torrentHash, torrentTagKey, torrentTagValue, callback){
    var feeInSatoshis = 4520;
    tx.addInput(txId, indexOfWalletInUseFromOutputsOfTheLastTxn)

    // Add the output (who to pay to):
    // [payee's address, amount in satoshis]
    console.log("Txn balance: "+balanceInSatoshis);
    console.log("Value to transfer: "+ (balanceInSatoshis - valueToTransferSatoshis - feeInSatoshis));
    tx.addOutput(receiver, valueToTransferSatoshis)
    tx.addOutput(destWallet, balanceInSatoshis - valueToTransferSatoshis - feeInSatoshis)

    var data;
    if(torrentTagKey) {
      data = new Buffer("[start]"+"id:"+torrentHash+"|"+torrentTagKey+":"+torrentTagValue+"[end]")
    } else {
      data = new Buffer("[start]"+"torr:"+torrentHash+"[end]")
    }

     
    var ret = bitcoin.script.compile([+
        bitcoin.opcodes.OP_RETURN, 
        data
      ])
    tx.addOutput(ret, 0);
    // Initialize a private key using WIF
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
       console.log(JSON.parse(body).Message)
       if(JSON.parse(body).Message == "Error") {
        callback("Error", torrentHash, torrentTagKey, torrentTagValue)
       } else {
          callback(body.substr(1, body.length - 2));
       }
    })
  }
}

function createTransactionFallbackAndVerifyStatus(status, torrentHash, torrentTagKey, torrentTagValue) {
    console.log("Status or body: " + status)
  if (status == "Error") {
    createTransaction(sourceWallet22, privateKeyWIF22, sourceWallet11, torrentHash, torrentTagKey, torrentTagValue, digest)
  } else {
    checkStatus(status)
  }
}

function digest(status) {
  checkStatus(status)
}

function checkStatus(txId) {
    request({
      url: "http://tbtc.blockr.io/api/v1/tx/info/" + txId,
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    }, function optionalCallback(error, response, body){
       //console.log("Transaction: "+ body)
       var transaction = JSON.parse(body).data;
       if(transaction && !transaction.is_unconfirmed) {
        return;
       } else {
        setTimeout(function(){
          console.log("waiting for the transaction to be confirmed")
          checkStatus(txId);
        }, 5000)
       }
    })
}

function addTransaction(torrentHash, torrentTagKey, torrentTagValue) {
  createTransaction(sourceWallet11, privateKeyWIF11, sourceWallet22, torrentHash, torrentTagKey, torrentTagValue, createTransactionFallbackAndVerifyStatus)  
}

addTransaction('abf1fa0bcc12b626b4567ed94972b51f73e78ea7', 'name', 'Team BlockTor.jpg');