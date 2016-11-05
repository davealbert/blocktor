/**
 * Mocked out transactions.
 */
var MockTransactions = [
   { "id" : 1, "metadata" : "[start]torr:af880261e91629de48baf8bcad8abe19aa1bee34[end]" },
   { "id" : 2, "metadata" : "[start]id:af880261e91629de48baf8bcad8abe19aa1bee34|name:Blockchain-Hackathon.png[end]" },
   { "id" : 3, "metadata" : "[start]id:af880261e91629de48baf8bcad8abe19aa1bee34|" },
   { "id" : 4, "metadata" : "desc: This is an image " },
   { "id" : 5, "metadata" : "from the blockchain-hackathon.com " },
   { "id" : 6, "metadata" : "website[end]" },
   { "id" : 7, "metadata" : "[start]torr:abf1fa0bcc12b626b4567ed94972b51f73e78ea7[end]" },
   { "id" : 8, "metadata" : "[start]id:abf1fa0bcc12b626b4567ed94972b51f73e78ea7|name:Team%20BlockTor.jpg[end]" },
   { "id" : 9, "metadata" : "[start]id:abf1fa0bcc12b626b4567ed94972b51f73e78ea7|" },
   { "id" : 10, "metadata" : "desc: This is also an image " },
   { "id" : 11, "metadata" : "from the blockchain-hackathon.com " },
   { "id" : 12, "metadata" : "but of the BlockTor team[end]" }
];

/**
 * Main data storage for torrent data
 */
var torrents = {};

/**
 * Jquery functions as and if we need them.
 */
$( document ).ready(function() {
   $('#main').html('');
   //var url = 'https://blockchain.info/address/17sknTxzAMZnUSajqtN8MUAmjgRK7vTZms?format=json&cors=true';
   var url = 'https://testnet.api.coinprism.com/v1/addresses/2N3dKfnUquvThKoRcxqsHsisV3dqTVjvCEp/transactions';

   //$.ajax({
      //url: url,
      //crossDomain: true
   //}).done(function(data) {
      //parseTransacrions(MockTransactions);
   //});
   parseTransacrions(MockTransactions);
});

/**
 * Take each message and parse start, middle, and end.
 */
function parseTransacrions(transactions) {
   var buffer;
   for (var i = 0; i < transactions.length; i++) {
      var transaction = transactions[i];

      // Start
      if (transaction.metadata.indexOf('[start]') !== -1) {
         buffer = [];
         transaction.metadata = transaction.metadata.replace(/\[start\]/g,'');
      }

      // Not End
      if (transaction.metadata.indexOf('[end]') === -1) {
         buffer.push(transaction.metadata);
      }

      // End
      if (transaction.metadata.indexOf('[end]') !== -1) {
         buffer.push(transaction.metadata.replace(/\[end\]/g,''));
         processContent(buffer.join(''));
      }
   };
}


/**
 * Take buffer built from parts and transform to useable content.
 */
function processContent(contentBuffer) {
   switch(true) {
      // Define new torrent
      case (contentBuffer.indexOf('torr') !== -1):
         var id = contentBuffer.replace('torr:', '');
         torrents[id] = {};
         break;

      case (contentBuffer.indexOf('desc:') !== -1):
         var parts = contentBuffer.split('|');
         var id = getPart('id:', parts);
         var desc = getPart('desc:', parts);
         torrents[id]['description'] = desc;
         break;

      case (contentBuffer.indexOf('name:') !== -1):
         var parts = contentBuffer.split('|');
         var id = getPart('id:', parts);
         var name = getPart('name:', parts);
         torrents[id]['name'] = name;
         break;

      default:

   }
   $('#main').html(JSON.stringify(torrents));
}

/**
 * Return the value for a key in an array of parts.
 */
function getPart(needle, haystackArray) {
   for (var i = 0; i < haystackArray.length; i++) {
      if (haystackArray[i].indexOf(needle) !== -1) {
         return haystackArray[i].replace(needle, '');
      }
   };
}

/**
 * Angular 1 functions/methods
 *   We are using Angular 1 over 2 because Agular 2 requires a http server
 *   we want this application to function locally if possible.
 */
angular.module('blockTorApp', [])
.controller('BlockTorController', function() {
   var blockTor = this;
   blockTor.name = "We are Team BlockTor";
});

