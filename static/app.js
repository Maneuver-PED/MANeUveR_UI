var app=angular.module("mainApp", ["ngRoute","ui.bootstrap"]);

app.config(function($interpolateProvider,$qProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
    $qProvider.errorOnUnhandledRejections(false);
});

app.run(function($rootScope) {
        $rootScope.components=[];
		$rootScope.appName="";
		$rootScope.restrictions=[];
	    $rootScope.conflicts=[];
		$rootScope.colocations=[];
		$rootScope.manys=[];
		$rootScope.ones=[];
		$rootScope.instances=[];
		$rootScope.instancesBounds=[];
		$rootScope.instancesFullDeployment=[];

		$rootScope.IP={
			publicIPs:0,
			IPType:""
		};
		$rootScope.budget={
			value:0,
			type:"USDollars"
		};
		
      });

app.controller("page1Controller", function($scope,$rootScope,$modal, $log) {
	$scope.relations=["=","<=",">="];
	$scope.data = {
      boldTextTitle: "",
      textAlert : "",
	  mode : ""  
    };
	$scope.compute={
		CPU: 0,
		GPU: false,
		Memory: 0
	}
	$scope.storage={
		StorageType: "",
		StorageSize: 0

	}
	$scope.network={
		/*networkConnections:0,
		dataIn:0,
		dataOut:0*/
        networkConnections: ""

	}
	$scope.component={
		id:0,
		name:"",
		Compute: $scope.compute,
		Storage: $scope.storage,
		Network: $scope.network,
		
		keywords:[],
		operatingSystem:""
	}

	$scope.addName = function() {	
		if($scope.applicationName!=""){
			$rootScope.appName=$scope.applicationName;
        }

    };
	
	containsName=function(components,name){
		for(var i=0;i<components.length;i++){
			if(components[i].name==name){
				return true;
			}
		}
		return false;
	};
  
    $scope.addComponent = function() {	
		$scope.errortext = "";
        if (!$scope.componentName) {return;}
        if (containsName($rootScope.components,$scope.componentName) == false) {
			$scope.component.name=$scope.componentName;
			$rootScope.components.push(jQuery.extend(true, {}, $scope.component));
			$scope.componentName="";
        } else {
            $scope.errortext = "The component has already been added!";
        }
		if($scope.errortext!=""){
			$scope.data.boldTextTitle="Error";
			$scope.data.textAlert=$scope.errortext;
			$scope.open("danger");
		}
    };
	
	$scope.open = function (mode) {
		$scope.data.mode = mode;
		var modalInstance = $modal.open({
		  templateUrl: 'alertWindow.html',
		  controller: ModalInstanceCtrl,
		  backdrop: true,
		  keyboard: true,
		  backdropClick: true,
		  size: 'lg',
		  resolve: {
			data: function () {
			  return $scope.data;
			}
		  }
		});
		modalInstance.result.then(function (selectedItem) {
		  $scope.selected = selectedItem;
			//alert( $scope.selected);
		}, function () {
		  $log.info('Modal dismissed at: ' + new Date());
		});
	}
	var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
		$scope.data = data;
		$scope.close = function(/*result*/){
			$modalInstance.close($scope.data);
		};
	};
	

	$scope.removeComponent = function(index) {
		$scope.errortext = "";
		$rootScope.components.splice(index,1);
	}
	
	
	$scope.addConflict = function() {
		var ok=0;
		var x=[$scope.conf1,$scope.conf2];
		$scope.conflictError="";
		if($scope.conf1==$scope.conf2)
		{
			$scope.conflictError="The components must be different";
			ok=1;
		}
		if($scope.conf1==null || $scope.conf2==null)
		{
			$scope.conflictError="Must select two components!";
			ok=1;
		}
		for(var i=0;i<$rootScope.conflicts.length;i++)
		{
			if(($rootScope.conflicts[i][0]==x[0] && $rootScope.conflicts[i][1]==x[1]) || ($rootScope.conflicts[i][0]==x[1] && $rootScope.conflicts[i][1]==x[0]))
			{
				$scope.conflictError="Conflict already added!";
				ok=1;
				break;
			}
		}
		if($scope.conflictError!=""){
			$scope.data.boldTextTitle="Error";
			$scope.data.textAlert=$scope.conflictError;
			$scope.open("danger");
		}
		if(ok==0)
		{
			$rootScope.conflicts.push(x);
		}
	}
	$scope.removeConflict = function(index) {
		$scope.errortext = "";
		$rootScope.conflicts.splice(index,1);
	}
	
	$scope.addColocation = function() {
		var ok=0;
		var x=[$scope.colo1,$scope.colo2];
		$scope.colocationError="";
		if(angular.equals($scope.colo1, $scope.colo2)==true)
		{
			$scope.colocationError="The components must be different";
			ok=1;
		}
		if($scope.colo1==null || $scope.colo2==null)
		{
			$scope.colocationError="Must select two components!";
			ok=1;
		}
		for(var i=0;i<$rootScope.colocations.length;i++)
		{
			if(($rootScope.colocations[i][0]==x[0] && $rootScope.colocations[i][1]==x[1]) || ($rootScope.colocations[i][0]==x[1] && $rootScope.colocations[i][1]==x[0]))
			{
				$scope.colocationError="Relation already added!";
				ok=1;
				break;
			}
		}
		if($scope.colocationError!=""){
			$scope.data.boldTextTitle="Error";
			$scope.data.textAlert=$scope.colocationError;
			$scope.open("danger");
		}
		if(ok==0)
		{
			$rootScope.colocations.push(x);
		}
	}
	$scope.removeColocation = function(index) {
		$rootScope.colocations.splice(index,1);
	}
	
	$scope.relationDecode="";
	$scope.addManyToMany = function() {
		var ok=0;
		$scope.manytomanyError="";
		$scope.relationDecode="";
		if($scope.manyRelation=="="){
			$scope.relationDecode="exactly";
		}else if($scope.manyRelation==">="){
			$scope.relationDecode="at least";
		}else{
			$scope.relationDecode="at most";
		}
		var x=[$scope.many1,$scope.manyRelation,$scope.many2,$scope.relationDecode];
		
		if(angular.equals($scope.many1, $scope.many2)==true)
		{
			$scope.manytomanyError="The components must be different";
			ok=1;
		}
		if($scope.many1==null || $scope.many2==null)
		{
			$scope.manytomanyError="Must select two components!";
			ok=1;
		}
		for(var i=0;i<$rootScope.manys.length;i++)
		{
			if(($rootScope.manys[i][0]==x[0] && $rootScope.manys[i][2]==x[2]) || ($rootScope.manys[i][0]==x[2] && $rootScope.manys[i][2]==x[0]))
			{
				$scope.manytomanyError="Relation already added!";
				ok=1;
				break;
			}
		}
		if($scope.manytomanyError!=""){
			$scope.data.boldTextTitle="Error";
			$scope.data.textAlert=$scope.manytomanyError;
			$scope.open("danger");
		}
		if(ok==0)
		{
			$rootScope.manys.push(x);
		}
		
		
	}
	$scope.removeMany = function(index){
		$rootScope.manys.splice(index,1);
	}
	
	$scope.addOneToMany = function() {
		var ok=0;
		var x=[$scope.one1,$scope.oneNumber,$scope.one2];
		$scope.onetooneError="";
		if(angular.equals($scope.one1, $scope.one2)==true)
		{
			$scope.onetooneError="The components must be different";
			ok=1;
		}
		if($scope.one1==null || $scope.one2==null)
		{
			$scope.onetooneError="Must select two components!";
			ok=1;
		}
		for(var i=0;i<$rootScope.ones.length;i++)
		{
			if(($rootScope.ones[i][0]==x[0] && $rootScope.ones[i][2]==x[2]) || ($rootScope.ones[i][0]==x[2] && $rootScope.ones[i][2]==x[0]))
			{
				$scope.onetooneError="Relation already added!";
				ok=1;
				break;
			}
		}
		if($scope.onetooneError!=""){
			$scope.data.boldTextTitle="Error";
			$scope.data.textAlert=$scope.onetooneError;
			$scope.open("danger");
		}
		if(ok==0)
		{
			$rootScope.ones.push(x);
		}
	}
	$scope.removeOne = function(index) {
		$rootScope.ones.splice(index,1);
	}
	$scope.addInstance = function() {
		$scope.decodeInstance="";
		if($scope.relation=="="){
			$scope.decodeInstance="exactly";
			}else if($scope.relation=="<="){
				$scope.decodeInstance="at most";
			}else{
				$scope.decodeInstance="at least";
			}
		if($scope.number<=50 && $scope.comp!=null)
		{
			var x=[$scope.comp,$scope.relation,$scope.number,$scope.decodeInstance]
			$scope.instanceError="";
			$rootScope.instances.push(x);
			
		}else{
			$scope.instanceError="Invalid data!";
		}
		if($scope.instanceError!=""){
			$scope.data.boldTextTitle="Error";
			$scope.data.textAlert=$scope.instanceError;
			$scope.open("danger");
		}
		
	}
	$scope.removeInstance = function(index) {
		$scope.errortext = "";
		$rootScope.instances.splice(index,1);
	}
	
	$scope.addRangeBoundInstance=function(){
		$scope.instanceBoundError="";
		var x=[$scope.bound1,$scope.compBound,$scope.bound2];
		if($scope.bound1>=$scope.bound2){
			$scope.instanceBoundError="Invalid input";
		}
		else if($scope.compBound==null || $scope.bound1==null || $scope.bound2==null){
			$scope.instanceBoundError="Please insert all required input";
		}
		else{
			$rootScope.instancesBounds.push(x);
		}
		if($scope.instanceBoundError!=""){
			$scope.data.boldTextTitle="Error";
			$scope.data.textAlert=$scope.instanceBoundError;
			$scope.open("danger");
		}		
	}
	$scope.removeInstanceBound = function(index) {
		$rootScope.instancesBounds.splice(index,1);
	}
	
	$scope.addFullDeployment=function(){
		$scope.instanceFullDeploymentError="";
		$scope.observation="";
		var ok=1;
		if($scope.compFullDepl==null){
			$scope.instanceFullDeploymentError="Must select component!";
		}
		else{
			for(var i=0;i<$rootScope.instancesFullDeployment.length;i++){
				if($scope.compFullDepl==$rootScope.instancesFullDeployment[i]){
					$scope.instanceFullDeploymentError="Restriction already added!";
					ok=2;
					break;
				}
			}
			if(ok!=2){
				for(var i=0;i<$scope.conflicts.length;i++){
					
					if($scope.compFullDepl==$scope.conflicts[i][0] || $scope.compFullDepl==$scope.conflicts[i][1]){
						ok=0;
						break;
					}
				}
				if(ok==0){
					$scope.observation="Due to conflicts the component will not be fully deployed";
					$rootScope.instancesFullDeployment.push($scope.compFullDepl);
				}else{
					$rootScope.instancesFullDeployment.push($scope.compFullDepl);
				}
			}
		}
		if($scope.instanceFullDeploymentError!=""){
			$scope.data.boldTextTitle="Error";
			$scope.data.textAlert=$scope.instanceFullDeploymentError;
			$scope.open("danger");
		}
		if($scope.observation!=""){
			$scope.data.boldTextTitle="Warning";
			$scope.data.textAlert=$scope.observation;
			$scope.open("warning");
		}
	}
	$scope.removeInstanceFullDeplyment=function(index){
		$rootScope.instancesFullDeployment.splice(index,1);
	}
	
	
	
	
});

//--------------------------------------------------------------------------------------------------------

app.controller("page2Controller", function($scope, $rootScope, $modal, $log, $http, $location) {
	
	$scope.K=[];
	$scope.items = ['Stream Processing', 'Big Data Application', 'Queue'];
	$scope.addKeyword=function(keywords){
		K=keywords;
		$scope.open();
	}
	
	$scope.open = function () {

		var modalInstance = $modal.open({
		  templateUrl: 'keywordsPage.html',
		  controller: ModalInstanceCtrl,
		  backdrop: true,
		  keyboard: true,
		  backdropClick: true,
		  size: 'lg',
		  resolve: {
			items: function () {
			  return $scope.items;
			}
		  }
		});
		modalInstance.result.then(function (selectedItem) {
		  $scope.selected = selectedItem;
			//alert( $scope.selected);
		}, function () {
		  $log.info('Modal dismissed at: ' + new Date());
		});

	}
  	var ModalInstanceCtrl = function ($rootScope,$scope, $modalInstance, items) {
		$scope.items = items;
		$scope.keywords=[];
		$scope.error="";
		
		$scope.selected = {
			item: $scope.items[0]
		};

		$scope.add = function () {
			var ok=1;
			for(var i=0;i<$scope.keywords.length;i++){
				if($scope.selected.item==$scope.keywords[i]){
					ok=0;
					$scope.error="Keyword already added!";
					break;
				}
			}
			if(ok==1){
				$scope.keywords.push($scope.selected.item);
				$scope.error="";
			}
		};

		$scope.done = function () {
			var ok=1;
			for(var i=0;i<K.length;i++){
				for(var j=0;j<$scope.keywords.length;j++){
					if($rootScope.keywords[i]==$scope.keywords[j]){
						$scope.error="Conflict with added keywords!";
						ok=0;
						break;
					}
				}
			}
			if(ok==1){
				for(var i=0;i<$scope.keywords.length;i++){
					K.push($scope.keywords[i]);
				}
				
				$scope.error="";
				$modalInstance.close();
			}
		};
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
		
    };
	$scope.deleteKeywords=function(keys){
		keys.length=0;
	}
	
	
	$scope.schema = {
		application: $rootScope.appName,
		restrictions:$rootScope.restrictions,
		components: $rootScope.components,
		IP:$rootScope.IP,
		budget:$rootScope.budget
	};
	
	generateIdForComponents=function(){
		
		for(var i=0;i<$rootScope.components.length;i++){
			$rootScope.components[i].id=i+1;
		}
	}
	
	getIdOf=function(name){
		for(var i=0;i<$rootScope.components.length;i++){
			if($rootScope.components[i].name==name){
				return i+1;
			}
		}
	}
	contains=function(list,comp){
		for(var i=0;i<list.length;i++){
			if(list[i].alphaCompId==comp){
				return true;
			}
		}
		return false;
	};
	getIndexInList=function(list, name){
		for(var i=0;i<list.length;i++){
			if(list[i].alphaCompId==name){
				return i;
			}
		}
		return -1;
	}
	
	addConflicts=function(){
		conflict={
			type:"Conflicts",
			alphaCompId: -1,
			compsIdList:[]
		}
		list=[];
		for(var i=0;i<$rootScope.conflicts.length;i++){
			conflict.compsIdList.length=0;
			if(!contains(list,getIdOf($rootScope.conflicts[i][0]))){
				conflict.alphaCompId=getIdOf($rootScope.conflicts[i][0]);
				conflict.compsIdList.push(getIdOf($rootScope.conflicts[i][1]));
				list.push(jQuery.extend(true, {}, conflict));
				console.log(getIdOf($rootScope.conflicts[i][0])+" "+getIdOf($rootScope.conflicts[i][1]));
			}else{
				var index=getIndexInList(list,getIdOf($rootScope.conflicts[i][0]));
				list[index].compsIdList.push(getIdOf($rootScope.conflicts[i][1]));
				console.log("alpha"+index+" "+getIdOf($rootScope.conflicts[i][1]));
			}
		}
		
		for(var i=0;i<list.length;i++){
			
			$rootScope.restrictions.push(jQuery.extend(true, {}, list[i]));
		}
	}
	addOneToOnes=function(){
		conflict={
			type:"OneToOneDependency",
			alphaCompId: -1,
			betaCompId: -1
		}
		for(var i=0;i<$rootScope.colocations.length;i++){
			conflict.alphaCompId=getIdOf($rootScope.colocations[i][0]);
			conflict.betaCompId=getIdOf($rootScope.colocations[i][1]);
			$rootScope.restrictions.push(jQuery.extend(true, {}, conflict));
		}
	}
	addManyToManys=function(){
		conflict={
			type:"ManyToManyDependency",
			alphaCompId: -1,
			betaCompId: -1,
			sign:""
		}
		for(var i=0;i<$rootScope.manys.length;i++){
			conflict.alphaCompId=getIdOf($rootScope.manys[i][0]);
			conflict.betaCompId=getIdOf($rootScope.manys[i][2]);
			conflict.sign=$rootScope.manys[i][1];
			$rootScope.restrictions.push(jQuery.extend(true, {}, conflict));
		}
	}
	addOneToManys=function(){
		conflict={
			type:"OneToManyDependency",
			alphaCompId: -1,
			betaCompId: -1,
			number:0
		}
		for(var i=0;i<$rootScope.ones.length;i++){
			conflict.alphaCompId=getIdOf($rootScope.ones[i][0]);
			conflict.number=$rootScope.ones[i][1]
			conflict.betaCompId=getIdOf($rootScope.ones[i][2]);
			$rootScope.restrictions.push(jQuery.extend(true, {}, conflict));
		}
	}
	addULEBound=function(){
		conflict={
			type:"",
            compsIdList: [],
			bound:0
		}
		for(var i=0;i<$rootScope.instances.length;i++){
			conflict.compsIdList.push(getIdOf($rootScope.instances[i][0]));
			if($rootScope.instances[i][1]=="="){
				conflict.type="EqualBound";
			}else if($rootScope.instances[i][1]=="<="){
				conflict.type="UpperBound";
			}else{
				conflict.type="LowerBound";
			}
			conflict.bound=$rootScope.instances[i][2]
			$rootScope.restrictions.push(jQuery.extend(true, {}, conflict));
		}
	}
	addRangeBounds=function(){
		conflict={
			type:"RangeBound",
            compsIdList: [],
			lowerBound:0,
			upperBound:0
		}
		for(var i=0;i<$rootScope.instancesBounds.length;i++){
			conflict.lowerBound=$rootScope.instancesBounds[i][0];
			conflict.compsIdList.push(getIdOf($rootScope.instancesBounds[i][1]));
			conflict.upperBound=$rootScope.instancesBounds[i][2];
			$rootScope.restrictions.push(jQuery.extend(true, {}, conflict));
		}
	}
	addFullDeployment=function(){
		conflict={
			type:"FullDeployment1",
			compsIdList:[]
		}

		for(var i=0;i<$rootScope.instancesFullDeployment.length;i++){
			conflict.compsIdList.push(getIdOf($rootScope.instancesFullDeployment[i]));
		}
        console.log("FULL DEPLOYMENT: ", conflict);
		if(conflict.compsIdList.length>0){
			$rootScope.restrictions.push(jQuery.extend(true, {}, conflict));
		}
		
	}
	
	addRestrictions=function(){
		$rootScope.restrictions.length=0;
		addConflicts();
		addOneToOnes();
		addManyToManys();
		addOneToManys();
		addULEBound();
		addRangeBounds();
		addFullDeployment();
		
	}
	function saveTextAsFile (data, filename){

        if(!data) {
            console.error('Console.save: No data')
            return;
        }

        if(!filename) filename = 'console.json'

        var blob = new Blob([data], {type: 'text/plain'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')
// FOR IE:

		if (window.navigator && window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(blob, filename);
		}
		else{
			var e = document.createEvent('MouseEvents'),
				a = document.createElement('a');

		a.download = filename;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
		e.initEvent('click', true, false, window,
          0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	}
}

	function expFile(fileText) {
		var fileName = "ui_output.json"
		saveTextAsFile(fileText, fileName);
	}

	$scope.generateJSON=function(){
		generateIdForComponents();
		addRestrictions();
		// save JSON locally
		//$scope.jsonStringified = angular.toJson($scope.schema, true);
		//expFile($scope.jsonStringified);
        // REST
		data = angular.toJson($scope.schema, true);
        headers= {
            'Content-Type': 'application/json',
			'Cache-Control':'no-cache',
            'Access-Control-Allow-Origin': '*'
        };

        $http.post('http://127.0.0.1:5000/re/z3', data, {headers:headers}).
        then(function(response) {
            console.log("Merge post ", response.data);
            //redirect to the outputOffers view, passing the json data as a parameter
            $location.path('results').search({jsonData: response.data});
        });
	}
});

app.controller("resultsController", function($scope, $routeParams){
    (function() {
        if($routeParams.jsonData == null || $routeParams.jsonData === ""){
            //If the jsonData is not set or if it doesnt contain a value (i.e is the empty string) then redirect to the page2 view.
            $location.path('topage2');
        }else{
            //the jsonData parameter does exist so assign it to our scope.greeting variable so we can use it in our view.
            $scope.greeting = $routeParams.jsonData;
            //log the data to make sure it was passed as parameter:
            console.log("resultsControler ", $scope.greeting);
        }
    })();
});


//--------------------------------------------------------------------------------------------------------

app.config(function($routeProvider) {
    $routeProvider
    .when("/topage1", {
        templateUrl : "page1.html",
        controller : "page1Controller"
    })
    .when("/topage2", {
        templateUrl : "page2.html",
        controller : "page2Controller"
    })
	.when("/results", {
            templateUrl : "outputOffers.html",
            controller : "resultsController"
        })
	.otherwise({
        templateUrl : "page1.html",
        controller : "page1Controller"
    });
});