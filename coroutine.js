/**
 * Created by JetBrains WebStorm.
 * User: napthats
 * Date: 12/01/28
 * Time: 11:24
 * To change this template use File | Settings | File Templates.
 */
var com;
if (!com) com = {};
if (!com.napthats) com.napthats = {};
if (!com.napthats.coroutine) com.napthats.coroutine = {};

(function() {
    var LOOP_WAIT = 1;
    var ns = com.napthats.coroutine;
    var taskList;

    var makeTaskList = function() {
        var result = {};
        var taskList = [];
        var currentTaskOrd = 0;

        result.putTask = function(_yieldFunc) {
            var result = {};
            var funcResult;
            var callBack;
            var finished = false;
            var ready = true;
            var yieldFunc = _yieldFunc();

            result.isFinished = function() {
                return finished;
            };

            result.isReady = function() {
                return ready;
            };

            result.execute = function() {
                try {
                    var r = yieldFunc.next();
                }
                catch(e) {
                    //throw {name: 'IllegalCoroutineError', message: 'coroutines have to return(yield) value finally.'};
                    finished = true;
                    if(callBack) callBack();
                    return;
                }
                if(r === undefined) return;
                funcResult = r;
                finished = true;
                if(callBack) callBack();
            };

            //callback is invoked when task will finish
            result.setCallback = function(func) {
                if(typeof(func) !== 'function') throw {name: 'AssertionError', message: 'in setCallback'};
                callBack = func;
            };

            //return function for awake
            result.wait = function() {
                ready = false;
                return function() {ready = true;};
            };

            result.getFuncResult = function() {
                if (funcResult === undefined) throw {name: 'AssertionError', message: 'in getFuncResult'};
                return funcResult;
            };

            taskList.push(result);
            return result;
        };

        result.getNextTask = function() {
            if(taskList.length === 0) throw {name: 'NoCoroutineExistsError', message: 'no coroutine has made before start.'};
            currentTaskOrd++;
            if(currentTaskOrd > taskList.length) throw {name: 'AssertionError', message: 'in getNextTask'};
            if(currentTaskOrd === taskList.length) currentTaskOrd = 0;

            //check all tasks finished
            for(var i = 0; i < taskList.length; i++) {
                if(!taskList[i].isFinished()) break;
                if(i === taskList.length - 1) return;
            }

            //return the first task after the current task
            //or null task if all tasks not ready
            var baseTaskOrd = currentTaskOrd;
            while(taskList[currentTaskOrd].isFinished() || !taskList[currentTaskOrd].isReady()) {
                currentTaskOrd++;
                if(currentTaskOrd === taskList.length) currentTaskOrd = 0;
                if(currentTaskOrd === baseTaskOrd) return {execute: function(){}};
            }
            return taskList[currentTaskOrd];
        };

        result.getCurrentTask = function() {
            if(!taskList[currentTaskOrd]) throw {name: 'AssertionError', message: 'in getCurrentTask'};
            return taskList[currentTaskOrd];
        };

        return result;
    };


    taskList = makeTaskList();

    ns.makeCoroutine = function(origFunc) {
        if(typeof(origFunc) !== 'function') throw {name: 'NotFunctionError', message: 'coroutine have to be a function.'};
        var result = {};

        var task = taskList.putTask(origFunc);

        result.getResult = function(resultFunc) {
            if(task.isFinished()) {
                resultFunc(task.getFuncResult());
            }
            else {
                var awake = taskList.getCurrentTask().wait();
                task.setCallback(function(){
                    resultFunc(task.getFuncResult());
                    awake();
                });
            }
        };

        return result;
    };

    ns.sleepCurrentCoroutine = function(ms) {
        setTimeout(taskList.getCurrentTask().wait(), ms);
    };

    ns.prepareCallback = function(func) {
        var awake = taskList.getCurrentTask().wait();
        return function(x) {func(x); awake();};
    };

    var finallyFunc;
    var run = function() {
        var task = taskList.getNextTask();
        if(!task) {finallyFunc(); return;}
        task.execute();
        setTimeout(run, LOOP_WAIT);
    };
    ns.start = function(func) {
        finallyFunc = func;
        run();
    };


})();
