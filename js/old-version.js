$(document).ready(function() {

    $.ajax({
        type: "POST",
        dataType: "application/json",
        url: "https://testnet.api.coinprism.com/v1/sendbitcoin?format=raw",
        data: {
            "fees": 3800,
            "from": "mpNz27mPEhhfTTqKg6pSLRq1C6uqGAqQ6p", //Amod
            "to": [{
                "address": "2NA5TP5HR9LjLzPeG985EGMH6AMyLHH49u2", //diego last
                "amount": "2000",
                "OP_RETURN": "Amooooooooooooooood!!!"
            }]
        }
    }).always(function(req) {
        var rawTransaction = $.parseJSON(req.responseText).raw;
        console.log("Calling sign for " + rawTransaction);
        $.ajax({
            type: "POST",
            dataType: "application/json",
            url: "https://testnet.api.coinprism.com/v1/signtransaction",
            data: {
                "transaction": rawTransaction,
                "keys": ["31584186FB4913F4477B6904306CCC115DAD5BBB219785478104DE905CFD42EC"]
            }
        }).always(function(req) {
            var rawSignTransaction = $.parseJSON(req.responseText).raw;
            console.log("Calling sign for " + rawSignTransaction);
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "https://testnet.api.coinprism.com/v1/sendrawtransaction",
                data: '"' + rawSignTransaction + '"'
            }).always(function(req) {
                console.log(req);
            })
        })
    })

});
