angular.module('iTuneBrowserApp', ['ngRoute', 'ui.bootstrap'])

.config(function($routeProvider, $locationProvider, $httpProvider) {
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
                $location.path('/about');
            }
        }).when('/', {
            controller: function($location) {
                $location.path('/browse/u2');
            },
            templateUrl: 'page/browser.html'
        }).when('/browse/:search', {
            controller: 'BrowserController',
            templateUrl: 'page/browser.html'
        });

    // Register the HTTP INTERCEPTORS
    $httpProvider.interceptors.push(function($q, $window, $rootScope) {
        var loadingScreen = jQuery('<div class="app-overlay"><span></span></div>').appendTo(jQuery('body')).hide();
        return {
            'request': function(config) {
                loadingScreen.show();
                return config || $q.when(config);
            },
            'response': function(response) {
                loadingScreen.hide();
                return response || $q.when(response);
            },
            'responseError': function(rejection) {
                loadingScreen.hide();
                alert('Failed to fetch data from iTunes');
                return $q.reject(rejection);
            }
        };
    });
})

.controller('LoginCtrl', function($scope) {
    $scope.login = function() {
        var client_id = 'your client id';
        var scope = 'email';
        var redirect_uri = 'index.html';
        var response_type = 'token';
        var url = 'https://accounts.google.com/o/oauth2/auth?scope=' + scope + '&client_id=' + client_id + '&redirect_uri=' + redirect_uri +
            '&response_type=' + response_type;
        window.open(url, '_blank');
    };
})
.controller('BrowserController', function($scope, $location, $routeParams, filterFilter, SearchService) {
    $scope.init = function() {
        $scope.medias = [];
        $scope.itemsPerPage = 24;
        $scope.page = 1;
        $scope.maxSize = 5;
        $scope.kind = 'musicTrack';
        $scope.types = [{label: 'All', kind: 'musicTrack'}, {label: 'Music', kind: 'song'}, {label: 'Video', kind: 'musicVideo'}];
        $scope.search();
    }

    $scope.search = function(){
        if ($routeParams.search) {
             SearchService.search($routeParams.search, $scope.kind,
                function(data, status, headers, config) {
                    $scope.medias = data.results;
                    $scope.totalItems = $scope.medias.length;
                }
             );
        }
    }

    $scope.filterChange = function(){
        $scope.totalItems = filterFilter($scope.medias, $scope.filter).length;
        console.log($scope.totalItems);
    }

    $scope.play = function(){}
    $scope.buy = function(track){
        window.open(track.trackViewUrl, '_blank');
    }
})

.service('SearchService', function($http){
    this.search = function(term, kind, callback){
        if (term) {
            $http.jsonp('https://itunes.apple.com/search', {
                params: {
                    'entity': kind,
                    'callback': 'JSON_CALLBACK',
                    'term': term
                },
                paramsSerializer: function(param) {
                    return param;
                }
            })
            .success(callback);
        }
    }
})

.filter('textLimit', function() {
    return function(input, limit) {
        if(input.length <= limit) return input
        else return input.substr(0,limit) + ' ...';
    }
})

;