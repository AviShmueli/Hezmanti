(function () {
    'use strict';
    angular
        .module('app')
        .component('reserve', {
            bindings: {
                isDistributedMode: '=',
                refreshData: '='
            },
            controller: reserveController,
            controllerAs: 'vm',
            templateUrl: 'components/reserve/reserve-template.html'
        }); 

    function reserveController($rootScope, $scope, server, $q, filesHandler, $filter, $timeout, dataContext,
        $mdToast, $mdDialog, $window, reserveContext, lodash) {

        var vm = this;
        var pageMode = 'reserve';
        vm.dataLoading = false;
        vm.grid1 = null; //pointer to grid
        
        vm.work_db=null;
        vm.work_table=null; //working grid table
        vm.select_dept=99;

        vm.dg = null; // grid setting
        vm.toolmenu=[]; // toolbar menu
        vm.columns =null; // grid columns
        vm.load1 = true;
        // build tool menu
        vm.toolmenu.push({
            value : 99,
            text: 'עוף + הודו'
        });
        vm.toolmenu.push({
            value : 6,
            text: 'דגים'
        });
        vm.toolmenu.push({
            value : 3,
            text: 'עוף והודו ארוז מהדרין'
        });

        // ############################ jos get from db today
        var cre_date1= $filter('date')(new Date(), 'dd/MM/yyyy'); // working default date
        server.getSiryun(cre_date1, 99 ).then(function (result) {
            var r = result.data;    
            if (r == '') {          //not found -  build new date
                cre_new_date(cre_date1);
            }
            else {
                new_date(r);
            }
        });        
        // ############################ jos replace new date db       
        var  new_date = function(db1){
            vm.work_db = db1;
            josdb(vm.select_dept);
            josgrid();
        }
        // ############################ Create new date for siryun 
        var cre_new_date = function(cre_date) {
            vm.work_db=null;
            vm.work_table=null; 
            server.getDepartments().then(function (result) {
                var dept = result.data;            
                server.getCatalog().then(function (response) {
                    // build datasource
                    var catalog=response.data;
                    var supmap = {};
                    for (var j=0; j < dept.length;j++){
                        if (dept[j].suppliers.length > 0) {
                            // dept hodu
                            var id1=dept[j].id;
                            if (id1 == 1) { 
                                id1=99; 
                            }
                            //supmap[dept[j].id]=dept[j].suppliers;
                            supmap[id1]=dept[j].suppliers;
                            for (var p=0;p< dept[j].suppliers.length;p++){
                                angular.extend(supmap[id1][p],{haluka:null,siryun:null,husman:null});
                            }
                        }
                    }
                    var departmentsMap = {};
                    for (var index = 0; index < catalog.length; index++) {
                        var item = catalog[index];
                        if ((item.departmentId == 1) || (item.departmentId == 2)) {
                            item.departmentId = 99;
                        }
                        angular.extend(item,{tothaluka:null,totsiryun:null,totorder:null,totorder2:null,tothoser:null,totodef:null});
                        if (!departmentsMap.hasOwnProperty(item.departmentId)) {
                            departmentsMap[item.departmentId] = [];
                           
                        }
                        departmentsMap[item.departmentId].push(item);
                    }
                    var newcat2 = {
                        createDate : cre_date,
                        cat : {},
                        deps : vm.toolmenu
                    };
                    angular.forEach(departmentsMap, function(value, w){
                        
                        var addcol1=null;
                        var itemLine=[];
                        for(var i=0;i<departmentsMap[w].length;i++) {
                            itemLine[i]=departmentsMap[w][i];
                            delete itemLine[i]._id;
                            delete itemLine[i].suppliers;
                            for (var j=0;j<supmap[w].length;j++){
                                if(supmap[w][j].hasOwnProperty('priority') ) {
                                    if (supmap[w][j].priority !== null ){
                                        var sup1="sup_name_"+supmap[w][j].supplierId;
                                        var sup2="sup_siryun_"+supmap[w][j].supplierId;
                                        var sup3="sup_husman_"+supmap[w][j].supplierId;
                                        var sup4= "sup_haluka_"+supmap[w][j].supplierId;
                                        var item1='{ ';
                                        item1 += '"' + sup1 + '" : "' +  supmap[w][j].name + '",' ;
                                        item1 += '"' + sup2 + '" : ' +  supmap[w][j].siryun + ',' ;
                                        item1 += '"' + sup3 + '" : ' +  supmap[w][j].husman + ',' ;
                                        item1 += '"' +sup4 + '" : ' +  supmap[w][j].haluka + '' ;
                                        item1 += '}';
                                        var sapak1=angular.fromJson(item1);
                                        angular.extend(itemLine[i],sapak1);
                                    }
                                } 
                              
                            }
                        }
                    
                    
                        newcat2.cat[w]= itemLine;  
                    });
                    var newcat99 = {
                        createDate : cre_date,
                        cat : newcat2.cat[99],
                        deps : 99
                    };
                    var newcat6 = {
                        createDate : cre_date,
                        cat : newcat2.cat[6],
                        deps : 6
                    };
                    var newcat3 = {
                        createDate : cre_date,
                        cat : newcat2.cat[3],
                        deps : 3
                    };
                    vm.work_db = newcat2;
                    server.insertSiryun(newcat99).then(function (response) {
                        server.insertSiryun(newcat6).then(function (response) {
                            server.insertSiryun(newcat3).then(function (response) {
                                    josdb(99);
                                    josgrid();
                                    vm.dataLoading = false;
                            });
                        });
                    });
                });
            });
        }
       
       // ############################ update haluka order with new percent
       var updateOrder_percent = function(){
            var cre_date=vm.work_db.createDate;
            var deps1=vm.work_db.deps
            server.getSiryunOrder(cre_date).then(function (result) {
                var r = result.data;    
                if (r.length == 0 ){  
                    server.updateSiryun(vm.work_db,vm.work_db.createDate,deps1).then(function (response) {
                        vm.dataLoading = false;
                    });
                }
                else {
                    var allorders=r;
                    var orders = allorders.cat;
                    var catalog = vm.work_db.cat;
                    var tArr = {};
                    angular.forEach(catalog, function(value, key){ // all dept
                        for(var i = 0 ; i <  catalog[key].length ; i++){
                            var p =  catalog[key][i];
                            p.tothaluka =0;
                            tArr[p.serialNumber] = p;    
                            angular.forEach(p, function(value, key){
                                if (key.indexOf('husman') > 0) {
                                    p[key] = null;
                                }
                            });     
                        }
                    });
                    angular.forEach(orders, function(value, key){ // all dept
                        for(var i = 0 ; i < orders[key].length ; i++){
                            var o = orders[key][i];
                            o.totorder=0;
                            var serialNumber = o.itemSerialNumber
                            var p = tArr[serialNumber];
                            if (p !== undefined) {
                                if (o.type == 'order') {
                                    angular.forEach(p, function(val1, key1){
                                        if (key1.indexOf('_haluka_') > 0) {
                                            var key2 = "sup_husman_"+key1.substring(11);
                                            if (val1 > 0 ) {
                                                // update percent only for null
                                                if (o.excel == 0) {
                                                    if (o[key2] == null) {
                                                        var num1 = Math.round( o.count * (val1 * 0.01));
                                                        o[key2] = num1;
                                                    }
                                                }
                                            }
                                            if (o[key2] > 0) {
                                                if (o.excel == 0) {
                                                    o.totorder += o[key2];
                                                }
                                                p[key2] += o[key2];
                                                p.tothaluka += o[key2];
                                            }
                                        }
                                    });
                                } 
                            }
                            o.bikoret = o.count-o.totorder;
                        }
                    }); 
                    server.updateSiryun(vm.work_db,cre_date,deps1).then(function (response) {
                            server.updateSiryunOrder(allorders,cre_date).then(function (response) {
                                josdb(vm.select_dept);
                                josgrid();
                                vm.dataLoading = false;
                            });
                    });

                }
        }); 
       }
       // ############################ select table for grid from db
        var josdb = function(depid){
            cre_columns();
            if (depid == 0 ){
                depid=99;
            }
            vm.select_dept =depid;
            var arr1 = vm.work_db.cat; // take table form db
            angular.forEach(arr1[0], function(value, key){
                var pl=key.indexOf('sup_name_');
                if (pl >= 0 ){
                    var col2=[];
                    var sup2="sup_siryun_"+key.substring(9);
                    var sup3="sup_husman_"+key.substring(9);
                    var sup4= "sup_haluka_"+key.substring(9);
                    var item1={
                        caption: 'חלוקה %',
                        dataField : sup4,
                        allowFiltering : false,
                        dataType: 'number'
                    }
                    var item2={
                        caption: 'שיריון',
                        dataField : sup2,
                        allowFiltering : false,
                        dataType: 'number'
                    }
                    var item3={
                        caption: 'הוזמן',
                        dataField : sup3,
                        allowEditing: false,
                        allowFiltering : false,
                        dataType: 'number'
                    }
                    col2.push(item1,item2,item3);
                    var t={
                        caption : value,
                        alignment: "center",
                        columns:col2
                    }    
                    vm.columns.push(t); 
                }
            })
            vm.work_table = vm.work_db.cat;
        }
        
        // ############################ Build columns for grid
        var cre_columns = function() {  
            vm.columns = [{
                caption: "פריט",
                dataField: "name",
                allowEditing: false,
                dataType:  'string',
                // width: 230,
                fixed: true,
                fixedPosition: "right",
            },{
                caption: "סהכ משוריינת",
                dataField: "totsiryun",
                allowFiltering : false,
                dataType:  'number',
                fixed: true,
                fixedPosition: "right",
            },{
                caption: "סהכ מוזמנת",
                columns: [ {
                    caption: "1",
                    dataField: "totorder",
                    dataType:  'number',
                    allowEditing: false,
                    allowFiltering : false,
                },{
                    caption: "2",
                    dataField: "totorder2",
                    dataType:  'number',
                    allowEditing: false,
                    allowFiltering : false,
                }],
                fixed: true,
                fixedPosition: "right",
            },{
                caption: "סהכ חלוקה",
                dataField: "tothaluka",
                allowEditing: false,
                allowFiltering : false,
                dataType:  'number',
                fixed: true,
                fixedPosition: "right",
            },{
                caption: "חוסר",
                dataField: "tothoser",
                allowEditing: false,
                allowFiltering : false,
                dataType:  'number',
                fixed: true,
                fixedPosition: "right",
            },{
                caption: "עודף",
                dataField: "totodef",
                allowEditing: false,
                allowFiltering : false,
                dataType:  'number',
                fixed: true,
                fixedPosition: "right",
            }];
        }
        // ############################ Build Main Grid
        var josgrid = function () {
            vm.load1 = false;
            vm.dg = {
                bindingOptions: {
                    dataSource: 'vm.work_table',
                    columns: 'vm.columns',
                    deep : false
                },
                paging : {
                    enabled : false,
                },
                editing: {
                    mode: "batch",
                    allowUpdating: true
                },
                filterRow: {
                    visible: true,
                    applyFilter: "auto"
                },
                headerFilter: {
                    visible: true,
                },
                loadPanel: {
                    enabled: true
                },
                height: "800px",
                scrolling: {
                    mode: "virtual"
                },          
                rtlEnabled : true,
                showColumnLines: true,
                showRowLines: true,
                showBorders: true,
                allowColumnResizing: true,
                columnAutoWidth: true,
                rowAlternationEnabled: true,
                columnChooser: {
                    enabled: true
                },
                onContentReady: function(e) {
                    e.component.option("loadPanel.enabled", false);
                },
                onInitialized: function(e) {
                    vm.grid1 = e.component;
                },
                onToolbarPreparing: function (e) {
                    var dg1=e.component;
                    var toolbarItems = e.toolbarOptions.items;
                    $.each(toolbarItems, function (_, item) {
                        if (item.name === "saveButton") {
                            item.options.onClick = function (e) {
                                vm.dataLoading = true;
                                dg1.saveEditData();
                                updateOrder_percent();
                            }
                        }
                    }); 
                    toolbarItems.push({
                        widget: 'dxButton', 
                        location: 'after',
                        options: {  icon: 'refresh', 
                            onClick: function() { 
                                var date3= vm.work_db.createDate;
                                var deps1= vm.work_db.deps
                                vm.dataLoading = true;
                                server.getSiryun(date3,deps1).then(function (result) {
                                    var r = result.data;    
                                    if (r == '') { 
                                        vm.dataLoading = true;
                                        cre_new_date(date3);
                                    }
                                    else {
                                        vm.work_db =r;
                                        vm.dataLoading = false;
                                        josdb(deps1);
                                    }
                                });    
                            } 
                        },
                    });
                    toolbarItems.push({
                        widget: "dxSelectBox",
                        location: 'after',
                       
                            options: {
                                width: 200,
                                items: vm.toolmenu,
                                rtlEnabled: true,
                                displayExpr: "text",
                                valueExpr: "value",   
                                value: 99 ,
                                onValueChanged: function(e) {
                                    var date3= vm.work_db.createDate
                                    server.getSiryun(date3, e.value).then(function (result) {
                                        var r = result.data;    
                                        if (r == '') { 
                                            vm.dataLoading = true;
                                            cre_new_date(date3);
                                        }
                                        else {
                                            vm.work_db =r;
                                            vm.dataLoading = false;
                                            josdb(e.value);
                                        }
                                    });       
                                },
                            },
                    });
                    toolbarItems.push({
                        widget: 'dxDateBox', 
                        location: 'after',
                        options: {  
                            value: new Date(),
                            rtlEnabled: true,
                            placeholder: "בחר תאריך...",
                            displayFormat: "dd/MM/yyyy",
                            acceptCustomValue : false,
                            editEnabled: false,
                            width: "120px",
                            onValueChanged: function(e) {
                                var date3= $filter('date')(e.value, 'dd/MM/yyyy');
                                vm.dataLoading = true;
                                server.getSiryun(date3, 99).then(function (result) {
                                    var r = result.data;    
                                    if (r == '') { 
                                        vm.dataLoading = true;
                                        cre_new_date(date3);
                                    }
                                    else {
                                        vm.work_db =r;
                                        vm.dataLoading = false;
                                        josdb(99);
                                    }
                                });        
                            },
                            onOpened: function (e) {
                                  if (!e.component.option('isValid'))
                                      e.component.reset();
                            },
                        },
                       
                    });
                    
                },
                onCellPrepared: function (e) {
                    if (e.rowType == 'data' && e.column.dataField == 'serialNumber')
                    {
                        if (e.displayValue == '1001') {
                            e.cellElement.css("color", "green");
                        }
                        else {
                            e.cellElement.css("color", "orange"); // pending
                        }
                    }               
                },
                onEditorPrepared: function (e) {
                    if (e.dataField == "name") {
                    }                 
                },
            };
        };

    }

}());