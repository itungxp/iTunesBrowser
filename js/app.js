angular.module('iTuneBrowserApp', ['ngRoute'])

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
            controller: function($location){$location.path("/browse/u2");},
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
    $scope.init = function(){
        $scope.medias = [];
        $scope.filter = {};
        $scope.offset = 20;
        $scope.page   = 1;
        $scope.orderBy= ['name', 'code'];

        if($routeParams.search){
            $http.jsonp('https://itunes.apple.com/search?term='+$routeParams.search)
                .success(function(data, status, headers, config){
                    $scope.medias = data.results;
                }).error(function(data, status, headers, config) {
                    alert('Failed to fetch data from iTunes');
                });

            $http.jsonp("http://itunes.apple.com/search", {
              params: {
                "callback": "JSON_CALLBACK",
                 "term": $routeParams.search
              },
              paramsSerializer: function(param) {
                return param;
              }
            });
        }
    }
})

.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
})
;