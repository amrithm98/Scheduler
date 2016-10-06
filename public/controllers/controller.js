var app = angular.module('ccffe', ['satellizer', 'ngSanitize', 'materialCalendar', 'ngRoute', 'ngMaterial', 'ngAria', 'ngMessages', 'ngMdIcons']);
app.config(function($routeProvider, $locationProvider,$authProvider) {
    $routeProvider.when('/', {
        templateUrl: 'main.html',
        controller: 'mainctrl'

    }).when('/booking', {
        templateUrl: 'calendar.html',
        controller: 'bookctrl'
    }).when('/admin', {
        templateUrl: 'admin.html',
        controller: 'adminctrl'
    });
    $authProvider.google({
      clientId: 'Google Client ID'
    });
    $authProvider.oauth2({
      name: 'ccfautomate',
      url: '/admin',
      clientId: 'Foursquare Client ID',
      redirectUri: window.location.origin,
      authorizationEndpoint: 'https://foursquare.com/oauth2/authenticate',
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
            $scope.data = response.data;
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
            // $scope.minDate = new Date(
            //     $scope.myDate.getFullYear(),
            //     $scope.myDate.getMonth() - 2,
            //     $scope.myDate.getDate());
            $scope.minDate = new Date();
            $scope.maxDate = new Date(
                $scope.myDate.getFullYear(),
                $scope.myDate.getMonth() + 2,
                $scope.myDate.getDate());
            $scope.onlyWeekendsPredicate = function(date) {
                var day = date.getDay();
                return day === 0 || day === 6;
            };
            //MATERIAL CALENDAR ITEMS
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
        var edate = dd + '/' + mm + '/' + yyyy;
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
            } 
            else if(response.data=="incomplete")
                alert('Form Incomplete. Please Fill All the Fields and try Again.');
            else {
                alert('Data Submitted');
            }
        });
        // refresh();

    };

});
app.controller('bookctrl', function($scope, $filter, $http, $q) {
    $http.get('/d').then(function(response) {
        console.log(response);
        $scope.selectedDate = null;
        $scope.firstDayOfWeek = 0;
        $scope.setDirection = function(direction) {
            $scope.direction = direction;
        };
        $scope.dayClick = function(date) {
            $scope.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");
            console.log($scope.msg);

        };
        $scope.prevMonth = function(data) {
            $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
        };
        $scope.nextMonth = function(data) {
            $scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
        };
        $scope.setDayContent = function(date, content) {
            // You would inject any HTML you wanted for
            // that particular date here.
            var mydate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
            // console.log(mydate);
            var len = response.data.length;
            for (i = 0; i < len; i++) {
                console.log(String(mydate) + " hhh " + String(response.data[i].date));
                if (String(mydate) == String(response.data[i].date)) {
                    console.log("match found");
                    return "<p>Booked Already</p>";
                } else
                    return "<p></p>";
            }

        };
    });
});
app.controller('adminctrl', function($scope, $http) {
    $http.get('/d').then(function(response) {
        console.log(response);
        $scope.data = response.data;
    });
    $scope.add = function() {

        var evnt = {
            name: $scope.entry.name,
            semester: $scope.entry.semester,
            branch: $scope.entry.branch,
            org: $scope.entry.org,
            date: $scope.entry.date,
            email: $scope.entry.email,
            phone: $scope.entry.phone,
            desc: $scope.entry.desc
        };
        $http.post('/admin', evnt).success(function(response) {
            console.log(response);
            refresh();
        });
    };
    $scope.remove = function(id) {
        console.log(id);
        var result = confirm("Want to delete?");
        if (result) {
            $http.delete('/admin/' + id).success(function(response) {
                refresh();
            });
        }


    };
    $scope.edit = function(id) {
        console.log(id);
        $http.get('/admin/' + id).success(function(response) {
            $scope.entry = response;
            console.log(response);
        });
    };
    $scope.update = function(id) {
        console.log($scope.contact._id);
        $http.put('/admin/' + $scope.data._id, $scope.data).success(function(response) {
            refresh();
        });
    };
    $scope.deselect = function() {
        $scope.entry = "";
    };
});
