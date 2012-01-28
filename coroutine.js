/**
 * Created by JetBrains WebStorm.
 * User: user
 * Date: 12/01/28
 * Time: 11:24
 * To change this template use File | Settings | File Templates.
 */
var com;
if (!com) com = {};
if (!com.napthats) com.napthats = {};
if (!com.napthats.coroutine) com.napthats.coroutine = {};

(function() {
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
                    throw {name: 'IllegalCoroutineError', message: 'coroutines have to return value finally.'};
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
            if(taskList.length === 0) return;
            currentTaskOrd++;
            if(currentTaskOrd > taskList.length) throw {name: 'AssertionError', message: 'in getNextTask'};
            if(currentTaskOrd === taskList.length) currentTaskOrd = 0;
            var baseTaskOrd = currentTaskOrd;
            while(taskList[currentTaskOrd].isFinished() || !taskList[currentTaskOrd].isReady()) {
                currentTaskOrd++;
                if(currentTaskOrd === taskList.length) currentTaskOrd = 0;
                if(currentTaskOrd === baseTaskOrd) return;
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

        //note:using with yield
        result.getResult = function(resultVar) {
            if(task.isFinished()) {
                //resultVar = task.getFuncResult();
                resultVar(task.getFuncResult());
            }
            else {
                var awake = taskList.getCurrentTask().wait();
                task.setCallback(function(){
                    //resultVar = task.getFuncResult();
                    resultVar(task.getFuncResult());
                    awake();
                });
            }
        };

        return result;
    };

    ns.start = function() {
        while(true) {
            var task = taskList.getNextTask();
            if(!task) break;
            task.execute();
        }
    };


})();