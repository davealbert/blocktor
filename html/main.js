/**
 * Jquery functions as and if we need them.
 */
$( document ).ready(function() {
   $('#main').html('hello world');
});


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
