/**
 * Created by JetBrains WebStorm.
 * User: napthats
 * Date: 12/01/28
 * Time: 14:20
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function() {
    var cr = com.napthats.coroutine;

    //get a result from other croutines
    var f = cr.makeCoroutine(function(){
        var g = cr.makeCoroutine(function(){
            yield;
            yield 'result of coroutine g';
        });
        var resultOfFunctionG;
        g.getResult(function(r){resultOfFunctionG = r});
        yield;
        yield resultOfFunctionG + ' + corountine f';
    });
    cr.makeCoroutine(function() {
        var resultOfFuncionF;

        f.getResult(function(r){resultOfFuncionF = r});
        yield;
        alert('get a result : ' + resultOfFuncionF);
    });

    //another coroutine
    cr.makeCoroutine(function() {
        yield;
        yield;
        //an order of calculation will be changed if comment-in the following line
        //yield;
        alert('another coroutine');
    });

    //another coroutine using sleepCurrentCroutine
    cr.makeCoroutine(function() {
        //sleep 3 sec
        cr.sleepCurrentCoroutine(3000);
        yield;
        alert('yet another coroutine sleeping 3 sec');
    });

    //another coroutine using prepareCallback
    cr.makeCoroutine(function() {
        //get a result from other functions with callback
        var result;
        var cb = cr.prepareCallback(function(r){result = r});
        setTimeout(function(){cb('result of setTimeout callback')}, 5000);
        yield;
        alert('get a result : ' + result);
    });

    try {
        //take one function for finalization
        cr.start(function(){alert('finish all coroutines.')});
    }
    catch(e) {
        alert(e.name + ' : ' + e.message);
    }
});
