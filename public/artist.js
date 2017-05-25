myApp = angular.module("myApp", []);

myApp.config(function () {

});

// myApp.factory("artistFac", function ($sce, $http) {
//     // var callObj = {
//     //     results: "",
//     //     getUrl: function (name, num) {
//     //         var createdUrl = "http://itunes.apple.com/search?term=" + name + "&limit=" + num;
//     //         console.log(createdUrl);
//     //         $http({
//     //             method: 'JSONP',
//     //             url: $sce.trustAsResourceUrl(createdUrl),
//     //             responseType: "json"
//     //         }).then(function (data) {
//     //             this.results = data.data.results;
//     //             console.log(this.results);
//     //         })
//     //     }
//     // }
//     // return callObj;
// });


myApp.controller("myCtrl", function ($scope, $sce, $http) {
    $scope.results = [];
    $scope.names = [];
    $scope.getArtist = function (name, num, isList) {
        createdUrl = "http://itunes.apple.com/search?term=" + name + "&limit=" + num;
        $http({
            method: 'JSONP',
            url: $sce.trustAsResourceUrl(createdUrl),
            responseType: "json"
        }).then(function (data) {
            $scope.results = data.data.results;
            console.log($scope.results);
            getNames($scope.results, isList);
        })
    }

    function getNames(arr, isList) {
        arr.forEach(function (element, index) {
            if (isList === "true") {
                $scope.resultArtistName = element.artistName;
                $scope.resultTrackName = element.trackName;
                $scope.resultImage = element.artworkUrl30;

            } else {
                $scope.names[index] = element.artistName;
                console.log($scope.names);
            }

        });
    }

});

myApp.directive("myDir", function () {

});