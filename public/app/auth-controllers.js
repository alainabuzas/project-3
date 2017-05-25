angular.module('AuthCtrls', ['AuthFactories'])
    .controller('NavCtrl', ['$scope', 'Auth', 'Alerts', function($scope, Auth, Alerts) {
        $scope.Auth = Auth;
        $scope.logout = function() {
            Alerts.add('sucess', 'You\'ve now logged out');
            Auth.removeToken();
        };
    }])
    .controller('AlertsCtrl', ['$scope', 'Alerts', function($scope, Alerts) {
        $scope.Alerts = Alerts;
    }])
    .controller('SignupCtrl', ['$scope', '$http', '$location', 'Auth', 'Alerts', function($scope, $http, $location, Auth, Alerts) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.userSignup = function() {
            $http.post('/api/users', $scope.user).then(function success(res) {

                Alerts.add('success', 'Account created!');
                $http.post('/api/auth', $scope.user).then(function success(res) {

                    Alerts.add('success', 'You are now logged in');
                    Auth.saveToken(res.data.token);
                    $location.path('/');
                }, function error(res) {

                    Alerts.add('danger', 'something went wrong, please try again');
                    console.log(res);
                    $location.path('/signup');
                });
            }, function error(res) {

                Alerts.add('danger', 'This email may already exist, please try again');
                console.log(res);
            });
        };
    }])
    .controller('LoginCtrl', ['$scope', '$http', '$location', 'Auth', 'Alerts', function($scope, $http, $location, Auth, Alerts) {
        $scope.user = {
            email: '',
            password: ''
        };

        $scope.userLogin = function() {
            $http.post('/api/auth', $scope.user).then(function success(res) {
                Auth.saveToken(res.data.token);
                Alerts.add('success', 'You are now logged in!');
                $location.path('/');
            }, function error(res) {
                Alerts.add('danger', 'Something went wrong, maybe a wrong password or username?');
                console.log(res);
            });
        };
    }])
    .controller('ProfileCtrl', ['$scope', '$http', 'Auth', 'Alerts', function($scope, $http, Auth, Alerts) {
        var user = Auth.currentUser();

        $http.get('/api/users/' + user.id).then(function(results) {
            $scope.user = results.data;
        }).catch(function(err) {
            console.log(err);
        });

        $scope.removeFavorite = function(petId) {
            $http.put('/api/users/favorites', { userId: user.id, petId: petId }).then(function(result) {
                $scope.user = result.data;
                Alerts.add('success', 'Favorite Removed');
            }).catch(function(err) {
                console.log(err);
            });
        };
        localStorage.petUrl = $scope.user.usersPetImg;
    }]);
