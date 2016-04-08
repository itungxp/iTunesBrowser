angular.module('iTuneBrowserApp', ['ngRoute', 'ui.bootstrap'])

.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/access_token=:accessToken', {
            template: '',
            controller: function($location, $rootScope) {
                var hash = $location.path().substr(1);

                var splitted = hash.split('&');
                var params = {};

                for (var i = 0; i < splitted.length; i++) {
                    var param = splitted[i].split('=');
                    var key = param[0];
                    var value = param[1];
                    params[key] = value;
                    $rootScope.accesstoken = params;
                }
                $location.path("/about");
            }
        }).when('/', {
            controller: function($location) {
                $location.path("/browse/u2");
            },
            templateUrl: 'page/browser.html'
        }).when('/browse/:search', {
            controller: 'BrowserController',
            templateUrl: 'page/browser.html'
        });
})

.controller('LoginCtrl', function($scope) {
    $scope.login = function() {
        var client_id = "your client id";
        var scope = "email";
        var redirect_uri = "index.html";
        var response_type = "token";
        var url = "https://accounts.google.com/o/oauth2/auth?scope=" + scope + "&client_id=" + client_id + "&redirect_uri=" + redirect_uri +
            "&response_type=" + response_type;
        window.open(url, '_blank');
    };
})
.controller('BrowserController', function($scope, $location, $http, $routeParams) {
    $scope.init = function() {
        $scope.medias = [];
        $scope.itemsPerPage = 24;
        $scope.page = 1;
        $scope.maxSize = 5;
        $scope.types = [{label: 'Music', kind: 'song'}, {label: 'Video', kind: 'music-video'}];

        if ($routeParams.search) {
            $http.jsonp("https://itunes.apple.com/search", {
                params: {
                    "limit": 50,
                    "callback": "JSON_CALLBACK",
                    "term": $routeParams.search
                },
                paramsSerializer: function(param) {
                    return param;
                }
            }).success(function(data, status, headers, config) {
                $scope.medias = data.results;
            }).error(function(data, status, headers, config) {
                alert('Failed to fetch data from iTunes');
            });
        }

        $scope.play = function(){}
        $scope.buy = function(track){
            window.open(track.trackViewUrl, '_blank');
        }
    }
})

.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
})
.filter('textLimit', function() {
    return function(input, limit) {
        if(input.length <= limit) return input
        else return input.substr(0,limit) + ' ...';
    }
})

;