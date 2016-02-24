﻿app.controller('storyController', function ($scope, cardsService, authService, $http, localStorageService, choicesService, usersService, roomsService, $location, storiesService) {
    var serviceBase = 'http://localhost:65020/';
    $scope.name = authService.authentication.userName;    
    $scope.cards = [];
    $scope.users = [];
    $scope.stories = [];
    $scope.admin = {};
    $scope.roomUsers = [];
    $scope.currentStory = {};

    $scope.newChoice = {
        UserId: "",
        RoomId: "",
        CardId: null
    };

    $scope.currentRoom = {
        roomName: "",
        roomDescription: "",
        roomId: 0
    };
       
    var roomData = localStorageService.get('roomData');
    if (roomData) {
        $scope.currentRoom.roomName = roomData.roomName;
        $scope.currentRoom.roomDescription = roomData.roomDescription;
        $scope.currentRoom.roomId = roomData.roomId;        
        //alert($scope.currentRoom.roomId);
    };

    var getCurrentStory = function () {
        storiesService.getCurrentStory($scope.currentRoom.roomId).then(function (result) {
            $scope.currentStory = result.data;
        });
    }
    getCurrentStory();

    //get all cards
    cardsService.getCards().then(function (results) {
        $scope.cards = results.data;
    }, function (error) {
        alert(error.data.message);
    });

    //cardChosen Action
    $scope.cardChosen = function (id) {
        $http.get(serviceBase + "api/account/" + this.name).success(function (result) {
            $scope.newChoice.UserId = result;
        });
        if ($scope.newChoice.CardId) {
            alert("You already chose a card!");
        } else {
            $scope.newChoice.CardId = id;
            $scope.newChoice.RoomId = $scope.currentRoom.roomId;
            //alert("UserId: " + $scope.newChoice.UserId + " CardId: " + $scope.newChoice.CardId + " RoomId: " + $scope.newChoice.RoomId);
            $scope.pokerHub.server.sendMessage($scope.name, "chose a card");
            $scope.message = '';
        }
    }

    //signalR
    $scope.message = ''; // holds the new message
    $scope.messages = []; // collection of messages coming from server
    $scope.pokerHub = null; // holds the reference to hub

    $scope.pokerHub = $.connection.pokerHub; // initializes hub
    $.connection.hub.start(); // starts hub

    // register a client method on hub to be invoked by the server
    $scope.pokerHub.client.broadcastMessage = function (name, message) {
        var newMessage = name + ' : ' + message;

        // push the newly coming message to the collection of messages
        $scope.messages.push(newMessage);
        $scope.$apply();
    };

    $scope.newMessage = function () {
        // sends a new message to the server
        $scope.pokerHub.server.sendMessage($scope.name, $scope.message);
        $scope.message = '';
    }

    var getUsers = function () {
        usersService.getUsers($scope.currentRoom.roomId).then(function (results) {
            $scope.users = results.data;
            debugger;
        });
    }
    getUsers();

    var getStories = function () {
        storiesService.getStories($scope.currentRoom.roomId).then(function (results) {
            $scope.stories = results.data;
            debugger;
        });
    }
    getStories();

    var getRoomUsers = function () {
        usersService.getRoomUsers($scope.currentRoom.roomId).then(function (results) {
            $scope.roomUsers = results.data;
            debugger;
        });
    }
    getRoomUsers();

    var getAdmin = function () {
        usersService.getAdmin($scope.currentRoom.roomId).then(function (results) {
            $scope.admin = results.data;
            debugger;
        });
    }
    getAdmin();

    var getUserLink = function () {
        usersService.getUserId($scope.name).then(function (result) {
            $scope.UserId = result.data.id;
            usersService.getLink(result.data.id, $scope.currentRoom.roomId).then(function (link) {
                $scope.userLink = link.data;
            })
        });

    }
    getUserLink();

    $scope.toRoom = function () {
        $location.path('room/' + $scope.currentRoom.id)
    }

});