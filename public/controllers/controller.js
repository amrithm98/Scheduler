var app = angular.module('ccffe', ['ngRoute', 'ngMaterial', 'ngAria', 'ngMessages', 'ngMdIcons']);
app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: 'main.html',
        controller: 'mainctrl'

    });
});
app.controller('mainctrl', function($scope, $http) {

    function refresh() {
        $http.get('/d').then(function(response) {
            $scope.name = '';
            $scope.semester = '';
            $scope.branch = '';
            $scope.org = '';
            $scope.date = '';
            $scope.emailid = '';
            $scope.phone = '';
            $scope.describe = '';
            // $scope.data = response.data;
            $scope.sem = ('1 2 3 4 5 6 7 8').split(' ').map(function(semc) {
                return {
                    abbrev: semc
                };
            });
            $scope.br = ('AE CE CS EC EE IE ME').split(' ').map(function(brn) {
                return {
                    abbrev: brn
                };
            });
            $scope.project = {
                description: '',
                rate: 500
            };
            $scope.myDate = new Date();
            $scope.minDate = new Date(
                $scope.myDate.getFullYear(),
                $scope.myDate.getMonth() - 2,
                $scope.myDate.getDate());
            $scope.maxDate = new Date(
                $scope.myDate.getFullYear(),
                $scope.myDate.getMonth() + 2,
                $scope.myDate.getDate());
            $scope.onlyWeekendsPredicate = function(date) {
                var day = date.getDay();
                return day === 0 || day === 6;
            };
        });
    }
    refresh();
    $scope.clear = function() {
        refresh();
    };
    $scope.sub = function() {
        var dd = $scope.date.getDate();
        var mm = $scope.date.getMonth() + 1; //January is 0!
        var yyyy = $scope.date.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }
        var edate = mm + '/' + dd + '/' + yyyy;
        var evnt = {
            name: $scope.name,
            semester: $scope.semester,
            branch: $scope.branch,
            org: $scope.org,
            date: edate,
            email: $scope.emailid,
            phone: $scope.phone,
            desc: $scope.describe
        };
        $http.post('/submit', evnt).then(function(response) {
            if (response.data == "fail") {
                alert('Event Already Registered');
            } else {
                alert('Data Submitted');
            }
        });
        // refresh();

    };

});