var app = angular.module('myApp', ['onsen']);    

app.factory('LanguageSettings', function() {
    var language = {};
    var languages = [
        {
            title: 'English',
            clientAccessToken: '4d723adba6c8403ea4d4c2b5acc34045',
            lang: 'en'
        },
        {
            title: '日本語',
            clientAccessToken: 'af2dc88346fc45fbade8f71a106a9dfb',
            lang: 'ja'
        }
    ];
    language.all_languages = languages;
    
    language.selectedLanguage = {};
    
    language.setSelectedLanguage = function(value) {
        this.selectedLanguage = value;        
        try {
            ApiAIPlugin.init(
                {
                    clientAccessToken: value.clientAccessToken,
                    lang: value.lang
                },
                function () {
                    console.log("Init success");
                    
                },
                function (error) {
                    alert("Init error\n" + error);
                });
        } catch (e) {
            alert(e);
        }
    };
            
    return language;
});

app.controller('HomeCtrl', function($scope, LanguageSettings, $timeout) {
    var language = {};
    $scope.textRows = []; 
    $scope.voiceRows = []; 
    $scope.recordButton = "Start Recording";
    
    ons.ready(function() {
        //set default language to English
        language = LanguageSettings;
        language.setSelectedLanguage(language.all_languages[0]);
    });
    
    $timeout(function(){
        $scope.current_lang = language.selectedLanguage.title;
        $scope.languages = language.all_languages;
    }, 3000);
    
    $scope.sendText = function(inputText){
        try {
            ApiAIPlugin.requestText(
                {
                    query: inputText
                },
                function (response) {
                    $scope.$apply(function () {
                        var answer = response['result']['fulfillment']['speech'];
                        $scope.textRows.push({
                            question: inputText,
                            answer: answer
                        });
                        $scope.question = "";
                    });
                },
                function (error) {
                    alert(error);
                });
        } catch (e) {
            alert(e);
        }
    } 
    
    $scope.sendVoice = function() {
        console.log("voice");
        try {
            ApiAIPlugin.setListeningStartCallback(function () {
                console.log("listening started");
                $scope.$apply(function () {
                    $scope.recordButton = "Recording now...";
                });
            });
            ApiAIPlugin.requestVoice(
                {}, // empty for simple requests, some optional parameters can be here
                function (response) {                   
                    $scope.$apply(function () {
                        $scope.recordButton = "Start Recording";
                        var question = response['result']['resolvedQuery'];
                        var answer = response['result']['fulfillment']['speech'];
                        $scope.voiceRows.push({
                            question: question,
                            answer: answer
                        });
                    });
                },
                function (error) {
                    ApiAIPlugin.stopListening();
                    console.log("listening stopped");        
                    $scope.$apply(function () {
                        $scope.recordButton = "Start Recording";
                    });
                    alert(error);
                }
            );        
        } catch (e) {
            alert(e);
            ApiAIPlugin.stopListening();
            console.log("listening stopped");
            $scope.$apply(function () {
                $scope.recordButton = "Start Recording";
            });
        }
    }
    
    $scope.updateLanguage = function(index){
        language.setSelectedLanguage(language.all_languages[index]);
        $scope.current_lang = language.selectedLanguage.title;
        $scope.textRows = [];
        $scope.voiceRows = [];
    }
    
});