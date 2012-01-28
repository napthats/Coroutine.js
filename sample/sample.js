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
        var gg;
        g.getResult(function(r){gg = r});
        yield;
        yield gg + ' + corountine f';
    });

    cr.makeCoroutine(function(){
        var x;

        f.getResult(function(r){x = r});
        yield;
        alert('get a result : ' + x);

        yield 1;
    });

    cr.makeCoroutine(function(){
        yield;
        yield;
        //an order of calculation will be changed if comment-in the following line
        //yield;
        alert('another coroutine.');
        yield true;
    });

    try {
        cr.start();
    }
    catch(e) {
        alert(e.name + ' : ' + e.message);
    }
    alert('finish all tasks.');
});
