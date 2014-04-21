'use strict';
function HomeController($scope, $routeParams) {
    $scope.users = [];

	$scope.getEmployeeList = function() {
        $.ajax({
            url: '/user',
            type:'GET',
            success: function(data, textStatus, jqXHR) {
            	$scope.users = data;
            	$scope.$apply();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });		

    };
	$scope.getEmployeeList();
};