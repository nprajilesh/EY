var app = angular.module('application', []);

app.controller('homeController',function($scope){

		

});

app.controller('locController',function($scope,$http){
    /*  
        -- Variables --> locController

            1.user          -->     array -- users list
            2.location      -->     array -- location list
            3.userLocations -->     count of number of locations
            4.assetcount    -->     count of assets
            5.warnings      -->     batpercent < 30 percent
    */
    $scope.users=[];
    $scope.updatedList=[];
    $scope.returnList=[];
    $scope.locations = [];
    $scope.userLocations=0;
    $scope.assetcount=0;
    $scope.warnings=0;
    
   
    $scope.getLocation = function() {
        $scope.warnings=0;
        $http({method: 'GET', url: '/location'}).
        success(function(data, status, headers, config) {
            $scope.locations = data;
            $scope.userLocations = data.length;
        }).
        error(function(data, status, headers, config) {
            console.log(data);
        });
    };

    $scope.getAssetNum = function(){

        $http({method: 'GET', url: '/user'}).
        success(function(data, status, headers, config) {
            $scope.assetcount = data.length;
        }).
        error(function(data, status, headers, config) {
            console.log(data);
        });
        
    };

    $scope.getEmployeeList = function() {
        $scope.warnings=0;
        $http({method: 'GET', url: '/userlog/finddesc'}).
        
        success(function(data, status, headers, config) {
            $scope.users = data;
            data.forEach(function(obj){
                if(obj.batper<30)
                    $scope.warnings++;
            });
            data.forEach(function(obj){
                console.log(obj.userid);
                $http({method: 'GET', url: '/user/findbyId/'+obj.userid}).
                success(function(data, status, headers, config) {
                    console.log(data);
                    $scope.returnList.push(data);
                }).
                error(function(data, status, headers, config) {
                    console.log(data);
                });

            });
        }).
        error(function(data, status, headers, config) {
            console.log(data);
        });
    };

    $scope.selLoc = function(id){
          $scope.getEmployeeList();
    };

    $scope.getLocation();
    $scope.getAssetNum();
});

app.controller('floorController',function($scope,$http){
    $scope.usrlog=[];
    $scope.getlogLoc = function(id)
    {
        $scope.usrlog=[];
        console.log(id);
        $http({method: 'GET', url:'/userlog/findLastbyId/'+id}).
        success(function(data, status, headers, config) {
            console.log(data);
            data.floor=highlightzone(data.zoneid);
            $scope.usrlog.push(data);
            
        }).
        error(function(data, status, headers, config) {
            console.log(data);
        });
        
    console.log($scope.usrlog);
    };
    $scope.getlogfullLoc = function(id)
    {
        $scope.usrlog=[];
        console.log(id);
        $http({method: 'GET', url:'/userlog/findLastNumbyId/'+id}).
        success(function(data, status, headers, config) {
            console.log(data);
            data.forEach(function(obj){

                obj.floor=highlightzone(obj.zoneid);
            });
            
            $scope.usrlog = data;
            
        }).
        error(function(data, status, headers, config) {
            console.log(data);
        });
        playhistory();
    console.log($scope.usrlog);
    };
});

app.controller('menuController',function($scope){
        $scope.menuList = [
            {
                link:'/',
                icon:'fa fa-dashboard',
                text:'Dashboard'
            },
            {
                link:'/floor-plan',
                icon:'fa fa-building-o',
                text:'Floor Plan'
            },
            {
                link:'/',
                icon:'fa fa-random',
                text:'Asset Master'
            },
            {
                link:'/transit-maps',           
                        
                icon:'fa fa-tags',
                text:'Transit Maps'
            }
        ];
});