(function () {
    'use strict';

    angular
        .module('app')
        .component('ordersDistribution', {
            bindings: {
                isDistributedMode: '=',
                refreshData: '='
            },
            controller: ordersDistributionController,
            controllerAs: 'vm',
            templateUrl: 'components/distribution/ordersDistribution-template.html'
        });

    function ordersDistributionController($rootScope, $scope, server, $q, filesHandler, $filter, $timeout, dataContext,
        $mdToast, $mdDialog, $window, distributionContext, lodash,$interval) {

        var vm = this;
        var pageMode = 'distribution';
        vm.dataLoading = false;
        vm.grid1 = null; //pointer to grid
        vm.jossel = null;
        vm.dist_order=null; //main db for grid
        
        vm.work_table=null; //working grid table
        vm.select_dept=99;
        vm.filter = null;
        vm.rule1=null;
        vm.rule2=null;
        vm.f_rules1 = {};
        vm.f_rules2 = {};
        vm.toolb = null;

        vm.dg = null; // grid setting
        vm.toolmenu=[]; // toolbar menu
        vm.columns = null; // grid columns
        vm.summ = null;
        vm.load1 = true;
        //vm.work_r = [];

        // ############################ Main Program begin here  get from db today
        var cre_date1= $filter('date')(new Date(), 'dd/MM/yyyy'); // working default date
        server.getSiryunOrder(cre_date1).then(function (result) {

            var r = result.data;   
            if (r == '') {            //not found -  build new date
                cre_new_date(cre_date1);
            }
            else {
                var edist = angular.copy(r);
                angular.forEach(edist.cat, function(value, key){
                    var arr1 = edist.cat[key]
                    for (var i=0;i< arr1.length;i++) {
                        angular.forEach(arr1[i], function(value, key){
                            var pl=key.indexOf('sup_name_');
                            if (pl >= 0 ){
                                var sup3="sup_husman_"+key.substring(9);
                                if (!arr1[i].hasOwnProperty(sup3)) {
                                    var item1='{ ';
                                    item1 += '"' + sup3 + '" : null' ;
                                    item1 += '}';
                                    var sapak1=angular.fromJson(item1);
                                    angular.extend(arr1[i],sapak1);
                                }
                                
                            }
                        })
                    }
                });
                new_date(edist);
            }
        }); 
        // ############################ update header percent
        vm.jostest = function (a1, b1) {
            if (a1.length == 3){
                var numa1= parseInt(a1);
                //var dept_cata = vm.dist_order.cat[vm.select_dept];
                var dept_cata = vm.work_table;
                var tArr = {};
                for(var i = 0 ; i <  dept_cata.length ; i++){
                    var p =  dept_cata[i];
                    var key = p.itemSerialNumber + '-' + p.orderId;
                    tArr[key] = p;         
                }
                var gridData = new DevExpress.data.DataSource({
                    store: dept_cata,
                    paginate : false
                });
                var filterExpr =vm.grid1.getCombinedFilter();
                gridData.filter(filterExpr);
                gridData.load().done(function (result) {
                    for (i = 0; i < result.length; i++) {
                        var key = result[i].itemSerialNumber + '-' +result[i].orderId;
                        var p = tArr[key];
                        if (a1 == '---') {
                            p[b1.dataField] =  null;
                        }
                        else {
                            p[b1.dataField] =  Math.round( p.count * (numa1 * 0.01));
                        }
                    }
                });
               vm.toolb[4].options.disabled = false;
            }
        }
        // ############################ jos replace new date db       
        var  new_date = function(db1){
            vm.dist_order = db1;
            vm.toolmenu =[];
            for (var j=0; j < vm.dist_order.deps.length;j++){
                var item1={
                    value : vm.dist_order.deps[j].value,
                    text: vm.dist_order.deps[j].text
                }
                vm.toolmenu.push(item1);
            }
            josdb(vm.select_dept);
            josgrid();
            
        }
        
        // ############################ Create new date for siryun + mongo
        var cre_new_date = function(cre_date) {
            vm.dist_order=null;
            vm.work_table=null; 
            vm.toolmenu=[];

            var date_arr = cre_date.split("/")
            var date11 = date_arr[2] + '-' + date_arr[1] + '-' + date_arr[0]+"T00:00:00.000Z";
            // get all new orders
            server.getJosOrders(date11, 0 ).then(function (result) {
                var r = result.data; 
                if (r.length == 0 ){ // no orders
                    cre_columns();
                    josgrid();
                    vm.grid1.deleteColumn(8);
                    vm.dataLoading = false;
                    return;
                }
                var max_orderid = null;
                var newOrders = r;
                server.getDepartments().then(function (result) {
                    var dept = result.data;            
                    // build suppliers
                    var supmap = {};
                    vm.toolmenu= [];
                    for (var j=0; j < dept.length;j++){
                        if (dept[j].suppliers.length > 0) {
                             //toolmenu begin
                             var id1=dept[j].id;
                             var name1 = dept[j].name;
                             if (id1 == 1) { 
                                 id1=99; 
                                 name1= 'עוף + הודו';
                             }
                             if (id1 != 2)  {
                                 var item1={
                                     value: id1,
                                     text: name1
                                 }
                                 vm.toolmenu.push(item1);
                             }
                             //toolmenu end
                            
                            supmap[id1]=dept[j].suppliers;
                            for (var p=0;p< dept[j].suppliers.length;p++){
                                angular.extend(supmap[id1][p],{husman:null});
                            }
                        }
                    }
                    // build dist orders for grib & db
                    var departmentsMap = {};
                    for (var y=0;y<newOrders.length;y++) {
                        if (max_orderid == null) { max_orderid = newOrders[y].orderId; }
                        if (max_orderid < newOrders[y].orderId) { max_orderid = newOrders[y].orderId; }
                        var arr1 = newOrders[y];
                        for (var u=0;u < arr1.items.length;u++) {
                            var item = arr1.items[u];
                            if ((item.itemDepartmentId == 1) || (item.itemDepartmentId == 2)) {
                                item.itemDepartmentId = 99;
                            }
                            angular.extend(item,{orderId:arr1.orderId,branchId:arr1.branchId,networkId:arr1.networkId,branchName:arr1.branchName,type:arr1.type,totorder:0,bikoret:null,excel:0});
                            if (!departmentsMap.hasOwnProperty(item.itemDepartmentId)) {
                                departmentsMap[item.itemDepartmentId] = [];
                            }
                            departmentsMap[item.itemDepartmentId].push(item);
                        }
                    };
                    
                    var newcat2 = {
                        createDate : cre_date,
                        maxOrderid :  max_orderid,
                        cat : {},
                        deps : vm.toolmenu
                    };
                    angular.forEach(departmentsMap, function(value, w){
                        var addcol1=null;
                        var orderLine=[];
                        for(var i=0;i<departmentsMap[w].length;i++) {
                            orderLine[i]=departmentsMap[w][i];
                            for (var j=0;j<supmap[w].length;j++){
                                if(supmap[w][j].hasOwnProperty('priority') ) {
                                    if (supmap[w][j].priority !== null ){
                                        var sup1="sup_name_"+supmap[w][j].supplierId;
                                        var sup2="sup_husman_"+supmap[w][j].supplierId;
                                        var item1='{ ';
                                        item1 += '"' + sup1 + '" : "' +  supmap[w][j].name + '",' ;
                                        item1 += '"' + sup2 + '" : ' +  supmap[w][j].husman  ;
                                        item1 += '}';
                                        var sapak1=angular.fromJson(item1);
                                        angular.extend(orderLine[i],sapak1);
                                    }
                                } 
                              
                            }
                        }
                        newcat2.cat[w]= orderLine;  
                    });
                    vm.dist_order = newcat2;
                    //updatesiryun(cre_date,true);
                    updatesiryun_husman2(true);
                    
            });
        });
        }
        

        // ############################  Add new orders to grid
        var addNewOrders = function(){
            var cre_date =  vm.dist_order.createDate;
            var lastOrder = vm.dist_order.maxOrderid;
            var date_arr = cre_date.split("/")
            var date11 = date_arr[2] + '-' + date_arr[1] + '-' + date_arr[0]+"T00:00:00.000Z";
            // get all new orders
            server.getJosOrders(date11,lastOrder).then(function (result) {
                var r = result.data; 
                if (r.length == 0 ){ // no new orders
                    vm.dataLoading = false;
                    return;
                }
                var max_orderid = null;
                var newOrders = r;

                server.getDepartments().then(function (result) {
                    var dept = result.data;            
                    // build suppliers
                    var supmap = {};
                    for (var j=0; j < dept.length;j++){


                        var id1=dept[j].id;
                        if (id1 == 1) { 
                            id1=99; 
                        }
                        supmap[id1]=dept[j].suppliers;

                        if (dept[j].suppliers.length > 0) {
                            supmap[id1]=dept[j].suppliers;
                            for (var p=0;p< dept[j].suppliers.length;p++){
                                angular.extend(supmap[id1][p],{husman:null});
                            }
                        }
                    }
                    // build dist orders for grib & db
                    var departmentsMap = {};
                    for (var y=0;y<newOrders.length;y++) {
                        if (max_orderid == null) { max_orderid = newOrders[y].orderId; }
                        if (max_orderid < newOrders[y].orderId) { max_orderid = newOrders[y].orderId; }
                        var arr1 = newOrders[y];
                        for (var u=0;u < arr1.items.length;u++) {
                            var item = arr1.items[u];
                            if ((item.itemDepartmentId == 1) || (item.itemDepartmentId == 2)) {
                                item.itemDepartmentId = 99;
                            }


                            angular.extend(item,{orderId:arr1.orderId,branchId:arr1.branchId,networkId:arr1.networkId,branchName:arr1.branchName,type:arr1.type,totorder:0,bikoret:null,excel:0});
                            if (!departmentsMap.hasOwnProperty(item.itemDepartmentId)) {
                                departmentsMap[item.itemDepartmentId] = [];
                            }
                            departmentsMap[item.itemDepartmentId].push(item);
                        }
                    };
                    var newcat = vm.dist_order.cat;
                    var cat3 = {};
                    angular.forEach(departmentsMap, function(value, w){
                        var addcol1=null;
                        var orderLine=[];
                        if (newcat[w] == null){
                           newcat[w] = [];
                        }
                        for(var i=0;i<departmentsMap[w].length;i++) {
                            orderLine[i]=departmentsMap[w][i];
                            for (var j=0;j<supmap[w].length;j++){
                                
                                if(supmap[w][j].hasOwnProperty('priority') ) {
                                    if (supmap[w][j].priority !== null ){
                                        var sup1="sup_name_"+supmap[w][j].supplierId;
                                        var sup2="sup_husman_"+supmap[w][j].supplierId;
                                        var item1='{ ';
                                        item1 += '"' + sup1 + '" : "' +  supmap[w][j].name + '",' ;
                                        item1 += '"' + sup2 + '" : ' +  supmap[w][j].husman  ;
                                        item1 += '}';
                                        var sapak1=angular.fromJson(item1);
                                        angular.extend(orderLine[i],sapak1);
                                    }
                                } 
                            }
                            newcat[w].push(orderLine[i]);
                        }
                    });

                    vm.dist_order.maxOrderid  = max_orderid;
                    //updatesiryun(cre_date,false);
                    updatesiryun_husman2(false);
                    
                });
            });
        }
        
        
        // ############################ update siryun husman
        var updatesiryun_husman2 = function(isNew){
            var cre_date =vm.dist_order.createDate;
            server.getSiryun(cre_date).then(function (result) {
                var r = result.data;    
                if (r.length != '') {    
                            var ecat = angular.copy(r);
                            angular.forEach(ecat.cat, function(value, key){
                                var arr1 = ecat.cat[key]
                                for (var i=0;i< arr1.length;i++) {
                                    angular.forEach(arr1[i], function(value, key){
                                        var pl=key.indexOf('sup_name_');
                                        if (pl >= 0 ){
                                            var col2=[];
                                            var sup2="sup_siryun_"+key.substring(9);
                                            var sup3="sup_husman_"+key.substring(9);
                                            var sup4= "sup_haluka_"+key.substring(9);
                                            var num=0;
                                            var item1='{ ';
                                            if (!arr1[i].hasOwnProperty(sup2)) {
                                                num++;
                                                item1 += '"' + sup2 + '" : null' ;
                                            }
                                            if (!arr1[i].hasOwnProperty(sup3)) {
                                                if (num > 0 ) { item1 += ','}
                                                item1 += '"' + sup3 + '" : null' ;
                                                num++
                                            }
                                            if (!arr1[i].hasOwnProperty(sup4)) {
                                                if (num > 0 ) { item1 += ','}
                                                item1 += '"' +sup4 + '" : null' ;
                                            }
                                            item1 += '}';
                                            var sapak1=angular.fromJson(item1);
                                            angular.extend(arr1[i],sapak1);
                                        }
                                    })
                                }
                              
                            });
                    vm.siryun_db = ecat;
                    var catalog = vm.siryun_db.cat;
                    var orders = vm.dist_order.cat;
                    var    tArr = {};
                    angular.forEach(catalog, function(value, key){
                        for(var i = 0 ; i <  catalog[key].length ; i++){
                            var p =  catalog[key][i];
                                p.totorder=0;
                                p.totorder2=0;
                            p.tothaluka =0;
                            tArr[p.serialNumber] = p;   
                            angular.forEach(p, function(value, key){
                                if (key.indexOf('husman') > 0) {
                                    p[key] = null;
                                }
                            });


                        }
                    });
                    angular.forEach(orders, function(value, key){
                        for(var i = 0 ; i < orders[key].length ; i++){
                            var o = orders[key][i];
                            if (o.excel == 0) {
                                o.totorder=0;
                            }
                            var serialNumber = o.itemSerialNumber
                            var p = tArr[serialNumber];
                            if (p !== undefined) {
                                if (o.type == 'order') {
                                        p.totorder += o.count;
                                    angular.forEach(p, function(val1, key1){
                                        if (key1.indexOf('_haluka_') > 0) { 
                                            var key2 = "sup_husman_"+key1.substring(11);
                                            if (val1 > 0 ) { // has percent to calc
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
                                else {
                                        p.totorder2 += o.count;
                                } 
                            }
                            o.bikoret = o.count-o.totorder;
                        }
                    });  
                   
                    var ecat = angular.copy(vm.siryun_db);
                    angular.forEach(ecat.cat, function(value, key){
                        var arr1 = ecat.cat[key]
                        for (var i=0;i< arr1.length;i++) {
                            angular.forEach(arr1[i], function(value, key){
                                var pl=key.indexOf('sup_');
                                if (pl >= 0 && value == null ){
                                    delete arr1[i][key];
                                }
                            })
                        }
                    });

                    server.updateSiryun(ecat,cre_date).then(function (response) {
                        if (isNew){
                            var edist = angular.copy(vm.dist_order);
                            angular.forEach(edist.cat, function(value, key){
                                var arr1 = edist.cat[key]
                                for (var i=0;i< arr1.length;i++) {
                                    angular.forEach(arr1[i], function(value, key){
                                        var pl=key.indexOf('sup_');
                                        if (pl >= 0 && value == null ){
                                            delete arr1[i][key];
                                        }
                                    })
                                }
                            }); 
                            server.insertSiryunOrder(edist).then(function (response) {
                                josdb(vm.select_dept);
                                josgrid();
                                vm.dataLoading = false;
                            });
                        }
                        else {
                            var edist = angular.copy(vm.dist_order);
                            angular.forEach(edist.cat, function(value, key){
                                var arr1 = edist.cat[key]
                                for (var i=0;i< arr1.length;i++) {
                                    angular.forEach(arr1[i], function(value, key){
                                        var pl=key.indexOf('sup_');
                                        if (pl >= 0 && value == null ){
                                            delete arr1[i][key];
                                        }
                                    })
                                }
                            }); 
                            server.updateSiryunOrder(edist,vm.dist_order.createDate).then(function (response) {
                                josdb(vm.select_dept);
                                josgrid();
                                vm.dataLoading = false;
                            });
                        }
                    });
                }
            });  
        }   
        // ############################ export orders to excel
        var export2Excel = function(){
            var orderFields = {
                createdDate: 'ת. הזמנה',
                deliveryDate: 'ת. אספקה',
                branchId: 'מחסן',
                itemSerialNumber: 'פריט/ברקוד',
                count: 'מארזים'
            };
    
            var gridData = new DevExpress.data.DataSource({
                store: vm.work_table,
                paginate : false
            });
            var filterExpr =vm.grid1.getCombinedFilter();
            gridData.filter(filterExpr);
            var tArr = {};
            var supname = {};
            gridData.load().done(function (result) {
                    for(var i = 0 ; i <  result.length ; i++){
                        var p = result[i];
                        angular.forEach(p, function(value, key){
                            if (key.indexOf('husman') > 0) {
                                if (value > 0) {
                                    var sup_num = key.substring(11);
                                    var key2 = "sup_name_" + sup_num;
                                    if (!tArr.hasOwnProperty(sup_num)) {
                                        tArr[sup_num] = [];
                                    }
                                    tArr[sup_num].push({
                                        createdDate:getDeliveryDate1(vm.dist_order.createDate),
                                        deliveryDate: p.type === 'secondOrder' ?
                                        getDeliveryDate1(vm.dist_order.createDate) : getDeliveryDate(vm.dist_order.createDate),
                                                branchId: p.branchId,
                                                itemSerialNumber: p.itemSerialNumber,
                                                count: value
                                    });
                                    p.excel = 1;
                                    supname[sup_num] = p[key2];
                                }
                            }
                        });
                    }
            });
            angular.forEach(supname, function(value, key){
                var fileName = value + '_' + $filter('date')(new Date(), 'dd/MM/yyyy');
                filesHandler.downloadOrderAsCSV(tArr[key], orderFields, fileName);
            });
            var edist = angular.copy(vm.dist_order);
            angular.forEach(edist.cat, function(value, key){
                var arr1 = edist.cat[key]
                for (var i=0;i< arr1.length;i++) {
                    angular.forEach(arr1[i], function(value, key){
                        var pl=key.indexOf('sup_');
                        if (pl >= 0 && value == null ){
                            delete arr1[i][key];
                        }
                    })
                }
            }); 
            server.updateSiryunOrder(edist,vm.dist_order.createDate).then(function (response) {
                josdb(vm.select_dept);
                josgrid();
                vm.dataLoading = false;
            });
        }
         // ############################ export orders to excel
         var export2ExcelOld = function(){
            var orderFields = {
                createdDate: 'ת. הזמנה',
                deliveryDate: 'ת. אספקה',
                branchId: 'מחסן',
                itemSerialNumber: 'פריט/ברקוד',
                count: 'מארזים'
            };
            
            var gridData = new DevExpress.data.DataSource({
                store: vm.dist_order.cat[vm.select_dept],
                paginate : false
            });
            gridData.filter(['excel','=',1]);
            var tArr = {};
            var supname = {};
            gridData.load().done(function (result) {
                    for(var i = 0 ; i <  result.length ; i++){
                        var p = result[i];
                        angular.forEach(p, function(value, key){
                            if (key.indexOf('husman') > 0) {
                                if (value > 0) {
                                    var sup_num = key.substring(11);
                                    var key2 = "sup_name_" + sup_num;
                                    if (!tArr.hasOwnProperty(sup_num)) {
                                        tArr[sup_num] = [];
                                    }
                                    
                                    tArr[sup_num].push({
                                        createdDate: getDeliveryDate1(vm.dist_order.createDate),
                                        deliveryDate: p.type === 'secondOrder' ?
                                        getDeliveryDate1(vm.dist_order.createDate) :  getDeliveryDate(vm.dist_order.createDate),
                                                branchId: p.branchId,
                                                itemSerialNumber: p.itemSerialNumber,
                                                count: value
                                    });
                                    p.excel = 1;
                                    supname[sup_num] = p[key2];
                                }
                            }
                        });
                    }
            });
            angular.forEach(supname, function(value, key){
                var fileName = value + '_' + $filter('date')(new Date(), 'dd/MM/yyyy');
                filesHandler.downloadOrderAsCSV(tArr[key], orderFields, fileName);
            });
            vm.dataLoading = false;
        }
        // ############################  calc deliver date
        var getDeliveryDate1 = function (orderDate) {
            var date_arr = orderDate.split("/")
            var date11 = date_arr[2] + '-' + date_arr[1] + '-' + date_arr[0]+"T00:00:00.000Z";
            var date12 = new Date(date11);
            var day = date12.getDay();
            var deliveryDate = new Date(date12);
            
            return $filter('date')(deliveryDate, 'dd/MM/yyyy');
        }
        // ############################  calc deliver date
        var getDeliveryDate = function (orderDate) {
            var date_arr = orderDate.split("/")
            var date11 = date_arr[2] + '-' + date_arr[1] + '-' + date_arr[0]+"T00:00:00.000Z";
            var date12 = new Date(date11);
            var day = date12.getDay();
            var deliveryDate = new Date(date12);
            if (day === 5) {
                deliveryDate.setDate(date12.getDate() + 2);
            } else {
                deliveryDate.setDate(date12.getDate() + 1);
            }
            return $filter('date')(deliveryDate, 'dd/MM/yyyy');
        }

       // ############################ select table for grid from db
        var josdb = function(depid){
            cre_columns();
            if (depid == 0 ){
                depid=99;
                vm.select_dept = 99;
            }
            vm.summ = [];
            if (!angular.equals({},vm.dist_order.cat) ){
                var arr1 = vm.dist_order.cat[depid]; // take table form db
                angular.forEach(arr1[0], function(value, key){
                    var pl=key.indexOf('sup_name_');
                    if (pl >= 0 ){
                        var col2=[];
                        var sup1="sup_husman_"+key.substring(9);
                        var item1={
                            caption: value,
                            dataField : sup1,
                            alignment: "center",
                            allowEditing: true,
                            allowFiltering : false,
                            allowSorting : false,
                            headerCellTemplate: 'headerCellTemplate',
                            dataType: 'number'
                        }
                        vm.summ.push({column:sup1,summaryType:'sum',displayFormat: "סהכ {0}"})
                        vm.columns.push(item1); 
                    }
                })
                var gridData = new DevExpress.data.DataSource({
                    store: vm.dist_order.cat[depid],
                    filter: ['excel','=',0],
                    paginate : false
                });
                var excelfilter=['excel','=',0];
                gridData.load().done(function (result) {
                    vm.work_table=result;
                    if (vm.grid1 !== null) {
                        vm.grid1.option("summary.totalItems", vm.summ);
                    }
                });
            }
        }
        
        // ############################ Build columns for grid
        var cre_columns = function() {  
            vm.columns = [
                {
                    caption: "רשת",
                    dataField: "networkId",
                    alignment: 'center',
                    allowEditing: false,
                    dataType:  'number',
                    width: 80,
                    fixed: true,
                    fixedPosition: "right",
                    headerFilter: {
                        dataSource: [ {
                            text: "ח.י.ע.מ",
                            value: 0
                        }, {
                            
                            text: "יוחננוף",
                            value: 1
                        }, {
                            
                            text: "מחסני השוק",
                            value: 2
                        }, {
                            
                            text: "מרכולית",
                            value: 5
                        },{
                            
                            text: "סופר סופר",
                            value: 6
                        }]
                    }

                },{
                    caption: "סניף",
                    dataField: "branchName",
                    allowEditing: false,
                    dataType:  'string',
                     width: 110,
                    fixed: true,
                    fixedPosition: "right",
                },{
                    caption: "פריט",
                    dataField: "itemName",
                    allowEditing: false,
                    dataType:  'string',
                     width: 190,
                    fixed: true,
                    fixedPosition: "right",
                },{
                    caption: "מס הזמנה",
                    dataField: "orderId",
                    allowEditing: false,
                    dataType:  'string',
                    width: 100,
                    fixed: true,
                    fixedPosition: "right",
                },{
                    caption: "סוג",
                    dataField: "type",
                    allowEditing: false,
                    dataType:  'string',
                    width: 60,
                    fixed: true,
                    fixedPosition: "right",
                },{
                    caption: "הוזמן",
                    dataField: "count",
                    allowFiltering : false,
                    allowEditing: false,
                    dataType:  'number',
                    fixed: true,
                    width: 80,
                    fixedPosition: "right",
                },{
                    caption: "ביקורת",
                    dataField: "bikoret",
                    allowEditing: false,
                    dataType:  'number',
                    width:50,
                    fixed: true,
                    fixedPosition: "right",
                }
            ];
        }
        // ############################ Build Main Grid
        var josgrid = function () {
            vm.load1 = false;
            vm.dg = {
                bindingOptions: {
                   dataSource: 'vm.work_table',
                    columns: 'vm.columns',
                    deep : false,
                },
                paging : {
                    enabled : false,
                },
                summary : {
                    totalItems : vm.summ
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
                    mode: "virtual",
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
                                updatesiryun_husman2(false);
                            }
                        }
                    }); 
                    toolbarItems.push({
                        widget: 'dxButton', 
                        location: 'after',
                        options: {  icon: 'refresh', 
                            onClick: function() { 
                                vm.f_rules1 = {};
                                vm.f_rules2 = {};
                                var date3= vm.dist_order.createDate;
                                vm.dataLoading = true;
                                server.getSiryunOrder(date3).then(function (result) {
                                    var r = result.data;   
                                    if (r == ''){ // no orders
                                        cre_new_date(date3);
                                    }
                                    else {
                                      var edist = angular.copy(r);
                                      angular.forEach(edist.cat, function(value, key){
                                          var arr1 = edist.cat[key]
                                          for (var i=0;i< arr1.length;i++) {
                                              angular.forEach(arr1[i], function(value, key){
                                                  var pl=key.indexOf('sup_name_');
                                                  if (pl >= 0 ){
                                                      var sup3="sup_husman_"+key.substring(9);
                                                      if (!arr1[i].hasOwnProperty(sup3)) {
                                                          var item1='{ ';
                                                          item1 += '"' + sup3 + '" : null' ;
                                                          item1 += '}';
                                                          var sapak1=angular.fromJson(item1);
                                                          angular.extend(arr1[i],sapak1);
                                                      }
                                                      
                                                  }
                                              })
                                          }
                                      });
                                      vm.dist_order = edist;
                                      josdb(vm.select_dept);
                                      dg1.clearFilter();
                                      dg1.refresh();
                                      vm.dataLoading = false;
                                    }
                                });  
                            } 
                        },
                    });
                    toolbarItems.push({
                        widget: 'dxButton', 
                        location: 'after',
                        options: {  icon: 'plus', 
                                    hint : 'הזמנות חדשות',
                            onClick: function() { 
                                vm.dataLoading = true;
                                dg1.saveEditData();
                                addNewOrders();
                            } 
                        },
                    });
                    toolbarItems.push({
                        widget: 'dxButton', 
                        location: 'after',
                        options: {  icon: 'email', 
                                    hint : 'ייצוא הזמנות',
                            onClick: function() { 
                                vm.dataLoading = true;
                                dg1.saveEditData();
                                export2Excel();
                            } 
                        },
                    });
                    toolbarItems.push({
                        widget: 'dxButton', 
                        location: 'after',
                        options: {  icon: 'folder', 
                                    hint : 'אקסל מסכם',
                            onClick: function() { 
                                vm.dataLoading = true;
                                dg1.saveEditData();
                                export2ExcelOld();
                            } 
                        },
                    });
                    toolbarItems.push({
                        widget: 'dxButton', 
                        location: 'after',
                        options: {  icon: 'cart', 
                                    hint : 'שמור שינויים',
                            onClick: function() { 
                                for (var i = 0; i <4; i ++) {
                                    vm.f_rules1[i] = vm.grid1.columnOption(i, "filterValue")
                                    vm.f_rules2[i] = vm.grid1.columnOption(i, "filterValues")
                                }
                                vm.dataLoading = true;
                                dg1.saveEditData();
                                updatesiryun_husman2(false);
                            } 
                        },
                    });
                    toolbarItems.push({
                        widget: "dxSelectBox",
                        location: 'after',
                       
                            options: {
                                width: 200,
                                bindingOptions: {
                                    dataSource: 'vm.toolmenu'
                                },
                                //items: vm.toolmenu,
                                rtlEnabled: true,
                                displayExpr: "text",
                                valueExpr: "value",   
                                value: 99 ,
                                onValueChanged: function(e) {
                                    vm.select_dept = e.value;
                                    josdb(e.value);
                                    josgrid();
                                   // dg1.refresh();
                                },
                                onInitialized: function(e) {
                                    vm.jossel = e.component;
                               }
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
                                server.getSiryunOrder(date3).then(function (result) {
                                    var r = result.data;   
                                    if (r == ''){ // no orders
                                        cre_new_date(date3);
                                    }
                                    else {
                                        var edist = angular.copy(r);
                                        angular.forEach(edist.cat, function(value, key){
                                            var arr1 = edist.cat[key]
                                            for (var i=0;i< arr1.length;i++) {
                                                angular.forEach(arr1[i], function(value, key){
                                                    var pl=key.indexOf('sup_name_');
                                                    if (pl >= 0 ){
                                                        var sup3="sup_husman_"+key.substring(9);
                                                        if (!arr1[i].hasOwnProperty(sup3)) {
                                                            var item1='{ ';
                                                            item1 += '"' + sup3 + '" : null' ;
                                                            item1 += '}';
                                                            var sapak1=angular.fromJson(item1);
                                                            angular.extend(arr1[i],sapak1);
                                                        }
                                                        
                                                    }
                                                })
                                            }
                                        });
                                        new_date(edist);
                                        vm.dataLoading = false;
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
                },
                onEditorPreparing: function (e) {
                    var component = e.component,
                    rowIndex = e.row && e.row.rowIndex;
                    var e1 = e;
                    if (e.dataField.indexOf('husman') > 0)  {
                        var onValueChanged = e.editorOptions.onValueChanged;
                        e.editorOptions.onValueChanged = function(e) {
                            var oldvalue=e1.value;
                            onValueChanged.call(this, e);
                            var newval=  component.cellValue(rowIndex, "totorder") - oldvalue + e.value;
                            component.cellValue(rowIndex, "totorder", newval);
                        }
                    }
                },
                onEditingStart: function (e) {
                    e.component.selectRows(e.key, false)                },
                onRowUpdated: function (e) {
                },
                onRowUpdating: function (e) {
                },
                onOptionChanged: function (e) {
                },
                onSelectionChanged: function (e) {
                },
                onContentReady: function (e) {
                    if ( !(angular.equals({}, vm.f_rules1))  ) {
                        for (var i = 0; i <4; i ++) {
                            vm.grid1.columnOption(i, "filterValue",vm.f_rules1[i]); 
                        }
                       
                    }
                    if ( !(angular.equals({}, vm.f_rules2))  ) {
                        for (var i = 0; i <4; i ++) {
                            vm.grid1.columnOption(i, "filterValues",vm.f_rules2[i]); 
                        }
                    }
                 },
            };
        };


        
     
    }

}());