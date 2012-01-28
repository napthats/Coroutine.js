/**
 * Created by JetBrains WebStorm.
 * User: user
 * Date: 12/01/28
 * Time: 14:20
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function() {
    var cr = com.napthats.coroutine;

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

        yield 1;
    });

    cr.makeCoroutine(function() {
        yield;
        yield;
        //an order of calculation will be changed if comment-in the following line
        //yield;
        alert('another coroutine');
        yield true;
    });

    cr.makeCoroutine(function() {
        //sleep 5 sec
        cr.sleepCurrentCoroutine(5000);
        yield;
        alert('yet another coroutine sleeping 5 sec');
        yield true;
    });

    try {
        cr.start(function(){alert('finish all coroutines.')});
    }
    catch(e) {
        alert(e.name + ' : ' + e.message);
    }
});
