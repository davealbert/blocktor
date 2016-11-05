var MockTransactions = [
   { "id" : 1, "metadata" : "[start]this is some " },
   { "id" : 2, "metadata" : "text that spans " },
   { "id" : 3, "metadata" : "multiple transactions[end]" },
   { "id" : 4, "metadata" : "[start]this is MORE " },
   { "id" : 5, "metadata" : "text that also spans " },
   { "id" : 6, "metadata" : "multiple transactions[end]" }
];

/**
 * Jquery functions as and if we need them.
 */
$( document ).ready(function() {
   $('#main').html('');
   //var url = 'https://blockchain.info/address/17sknTxzAMZnUSajqtN8MUAmjgRK7vTZms?format=json&cors=true';
   var url = 'https://testnet.api.coinprism.com/v1/addresses/2N3dKfnUquvThKoRcxqsHsisV3dqTVjvCEp/transactions';

   $.ajax({
      url: url,
      crossDomain: true
   }).done(function(data) {
      console.log(data);
      parseTransacrions(MockTransactions);
   });
});


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
   $('#main').append(contentBuffer + "<br>");
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
