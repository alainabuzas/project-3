angular.module('PetCtrls', ['PetFactories'])
    .controller('HomeCtrl', ['$scope', 'Compare', function($scope, Compare) {
        $scope.people = [{
            imgSrc: '../img/home-test/sk.png',
            compareSrc: './public/img/home-test/sk.png',
            name: 'Sara'
        }, {
            imgSrc: '../img/home-test/ab.png',
            compareSrc: './public/img/home-test/ab.png',
            name: 'Alaina'
        }, {
            imgSrc: '../img/home-test/at.jpg',
            compareSrc: './public/img/home-test/at.jpg',
            name: 'Andrew'
        }];
        $scope.pets = [{
            imgSrc: '../img/home-test/hobbes.png',
            compareSrc: './public/img/home-test/hobbes.png',
            name: 'Hobbes'
        }, {
            imgSrc: '../img/home-test/zero.png',
            compareSrc: './public/img/home-test/zero.png',
            name: 'Zero'
        }, {
            imgSrc: '../img/home-test/mickey.png',
            compareSrc: './public/img/home-test/mickey.png',
            name: 'Mickey'
        }];

        $scope.userChosen = function(person) {
            $scope.personToTest = $scope.people[person];
        };
        $scope.petChosen = function(pet) {
            $scope.petToTest = $scope.pets[pet];
        };

        // takes the two images selected by the user on the home page and calculates match
        $scope.compareDemo = function() {
            Compare.compareDemo($scope.personToTest.compareSrc, $scope.petToTest.compareSrc).then(function(result) {
                $scope.matchResults = Compare.percentToRanking(result.data.matchPercent);
                console.log(result.data.matchPercent);
            }).catch(function(err) {
                console.log(err);
            });
            $scope.matchDone = true;
        };

    }])
    .controller('SearchCtrl', ['$scope', '$http', 'Auth', '$state', function($scope, $http, Auth, $state) {
        if (!Auth.isLoggedIn()) {
            $state.go('home');
        }

        $scope.$watch('pet.animal', function() {
            $http.post('/api/pets/breeds', { animal: $scope.pet.animal }).then(function(results) {
                $scope.breeds = results.data;
            }).catch(function(err) {
                console.log(err);
            });
        });

        $scope.petSearch = function() {
            $http.post('/api/pets', { searchBody: $scope.pet }).then(function(results) {
                $scope.pets = results.data;
            }).catch(function(err) {
                console.log(err);
            });
        };
    }])

.controller('PetShowCtrl', ['$scope', '$http', '$stateParams', 'Auth', 'Favorite', '$state', function($scope, $http, $stateParams, Auth, Favorite, $state) {
        if (!Auth.isLoggedIn()) {
            $state.go('home');
        }
        var user = Auth.currentUser();

        $http.get('/api/pets/' + $stateParams.id).then(function(result) {
            $scope.pet = result.data;
            //save to local storage for retrieval on compare page
            localStorage.petName = $scope.pet.name.$t;
            localStorage.petUrl = result.data.media.photos.photo[2].$t;
            $scope.petId = $stateParams.id;
            localStorage.petId = $scope.petId;
            var pet = {
                id: $stateParams.id,
                name: localStorage.petName,
                petImg: localStorage.petUrl
            };
            console.log(pet);
            $scope.addFavorite = function() {
                Favorite.add(user.id, pet);
            };
        });
    }])
    .controller('CompareCtrl', ['$scope', '$http', 'Auth', 'Compare', 'Favorite', '$state', function($scope, $http, Auth, Compare, Favorite, $state) {

        if (!Auth.isLoggedIn()) {
            $state.go('home');
        }

        var user = Auth.currentUser();
        // NOTE: because of how we are using local storage, this page will only work from the petShow page.....
        var pet = {
            id: localStorage.petId,
            name: localStorage.petName,
            petImg: localStorage.petUrl
        };

        // gets image urls for display
        $scope.profileImg = user.profileImg;
        $scope.petImg = localStorage.petUrl;
        $scope.petId = localStorage.petId;

        // takes image urls from saved user url and local storage (last clicked on pet)
        $scope.matchPercent = Compare.compareTwo(user.profileImg, localStorage.petUrl, user.id).then(function(result) {
            $scope.matchResults = Compare.percentToRanking(result.data.matchPercent);
        }).catch(function(err) {
            console.log(err);
        });

        $scope.addFavorite = function() {
            Favorite.add(user.id, pet);
        };
    }]);
