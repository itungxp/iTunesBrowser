angular.module('iTuneBrowserApp', ['ngRoute', 'ui.bootstrap', 'ngCookies'])

.config(function($routeProvider, $locationProvider, $httpProvider) {
    var defaultPage = '/browse/U2';
    $routeProvider
        .when('/access_token=:accessToken', {
            template: '',
            controller: function($location, $rootScope, $cookies) {
                var params = {};
                var splitted = $location.path().substr(1).split('&');
                for (var i = 0; i < splitted.length; i++) {
                    var param = splitted[i].split('=');
                    params[param[0]] = param[1];
                }

                $cookies.put('ibToken', params['access_token'], {expires: new Date(new Date().getTime() + parseInt(params['expires_in'])*1000)});
                $location.path(defaultPage);
            }
        }).when('/', {
            template: '',
            controller: function($location){ $location.path(defaultPage); }
        }).when('/login', {
            controller: 'LoginCtrl',
            templateUrl: 'page/login.html'
        }).when('/browse/:search', {
            controller: 'BrowserController',
            templateUrl: 'page/browser.html'
        });

    // Register the HTTP INTERCEPTORS
    $httpProvider.interceptors.push(function($q, $window, $rootScope) {
        var loadingScreen = jQuery('<div class="app-overlay"><span class="loading"></span></div>').appendTo(jQuery('body')).hide();
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
.run(function ($location, $cookies) {
    if($location.path().indexOf('access_token') < 0 && !$cookies.get('ibToken')){
        $location.path('/login');
    }
})

.controller('LoginCtrl', function($scope, $location, $cookies) {
    if(!$cookies.get('ibToken')){
        var client_id = '375982416217-27025grmutguul2p3ndf1dv5l8srp3ck.apps.googleusercontent.com'; // Change to Production id
        var redirect_uri = 'http://localhost:63342/iTunesBrowser/'; // Change to Production url
        var scope = 'email';
        var response_type = 'token';
        var url = 'https://accounts.google.com/o/oauth2/auth?scope=' + scope + '&client_id=' + client_id + '&response_type=' + response_type + '&redirect_uri=' + redirect_uri;
        window.location.replace(url);
    } else {
        $location.path(defaultPage);
    }
})
.controller('BrowserController', function($scope, $location, $routeParams, $compile, filterFilter, SearchService) {
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

    $scope.play = function(track){
        var player = jQuery('<div ib-player>')
                        .attr('media-src', track.previewUrl).attr('media-kind', track.kind).attr('media-name', track.trackName)
                        .appendTo(jQuery('body'));
        $compile(player)($scope);
    }
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
                }
            })
            .success(callback);
        }
    }
})

.directive('ibPlayer', function($compile){
    return {
        restrict: 'A',
        scope: {
            src: '@mediaSrc',
            kind: '@mediaKind',
            name: '@mediaName'
        },
        link: function(scope, element){
            scope.$watch('src', function() {
                var kind = scope.kind == 'music-video' ? 'video' : 'audio';
                var template = '<div class="app-overlay" ng-click="outFocus()">';
                   template += '<' + kind+' src="'+scope.src+'" controls class="player" preload="auto" autoplay><p>Your browser does not support the HTML5 media element.</p>';
                   template += '</'+kind+'></div></div>';
                var linkFn = $compile(template);
                element.html(linkFn(scope));
            });

            scope.outFocus = function(){
                element.remove();
            }
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