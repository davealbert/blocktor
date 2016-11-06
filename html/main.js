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
   { "id" : 12, "metadata" : "but of the BlockTor team[end]" },
   { "id" : 7, "metadata" : "[start]torr:938802790a385c49307f34cca4c30f80b03df59c[end]" },
   { "id" : 8, "metadata" : "[start]id:938802790a385c49307f34cca4c30f80b03df59c|name:TPB[end]" },
   { "id" : 8, "metadata" : "[start]id:938802790a385c49307f34cca4c30f80b03df59c|desc:The Pirate Bay 2012[end]" },
];

/**
 * Angular 1 functions/methods
 *   We are using Angular 1 over 2 because Agular 2 requires a http server
 *   we want this application to function locally if possible.
 */
angular.module('blockTorApp', [], function ($compileProvider) {
   $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|magnet):/);
}).controller('BlockTorController', function($scope) {
   var blockTor = this;

   // Main data storage for torrent data
   blockTor.torrents = {};
   getTorrentList(function(ret) {
      console.log(ret);
      setTimeout(function(){
         parseTransactions(ret.reverse());
         $('.hidden').removeClass('hidden');
         $('.loading').addClass('hidden');
         setTimeout(function(){
            $scope.$apply();
         },500);
      },500);
   });

   //parseTransactions(MockTransactions);

   blockTor.name = "We are Team BlockTor";
   blockTor.filter = "";

   blockTor.torrentList = function () {
      var arr = []
      for(k in blockTor.torrents) {
         var obj = {};
         obj.id = k;
         for (k2 in blockTor.torrents[k]) {
            obj[k2] = blockTor.torrents[k][k2];
         }
         if (filter(obj)) {
            arr.push(obj);
         }
      }
      return arr;
   };

   /**
    * Filter for only wanted results
    */
   function filter(torrent) {
      if (!blockTor.filter) {
         return true;
      } else {
         if ((torrent.name.indexOf(blockTor.filter) !== -1) || (torrent.description.indexOf(blockTor.filter) !== -1)) {
            return true;
         }
      }
      return false;
   }

   /**
    * Take each message and parse start, middle, and end.
    */
   function parseTransactions(transactions) {
      console.log("TRANSACRTION:::::::::::", typeof(transactions));
      console.log(transactions);
      var buffer;
      for (var i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         console.log(transaction);

         // Start
         if (transaction.indexOf('[start]') !== -1) {
            buffer = [];
            transaction = transaction.replace(/\[start\]/g,'');
         }

         // Not End
         if (transaction.indexOf('[end]') === -1) {
            buffer.push(transaction);
         }

         // End
         if (transaction.indexOf('[end]') !== -1) {
            buffer.push(transaction.replace(/\[end\]/g,''));
            processContent(buffer.join(''));
         }
      };
   }

   /**
    * Take buffer built from parts and transform to useable content.
    */
   function processContent(contentBuffer) {
      console.log("cb:", contentBuffer);
      switch(true) {
         // Define new torrent
         case (contentBuffer.indexOf('torr') !== -1):
            var id = contentBuffer.replace('torr:', '');
            blockTor.torrents[id] = {};
            //https://www.bitrated.com/henrye/scores.json
            blockTor.isGood = true;
            break;

         case (contentBuffer.indexOf('desc:') !== -1):
            var parts = contentBuffer.split('|');
            var id = getPart('id:', parts);
            var desc = getPart('desc:', parts);
            blockTor.torrents[id]['description'] = desc;
            break;

         case (contentBuffer.indexOf('name:') !== -1):
            var parts = contentBuffer.split('|');
            var id = getPart('id:', parts);
            var name = getPart('name:', parts);
            blockTor.torrents[id]['name'] = name;
            break;

         default:
            break;
      }
   }
});

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

