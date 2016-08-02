

// THIS FUCTION RETURNS YESTERDAY'S DATE ACCORDING TO GITHUB'S AND STACKOVERFLOW'S API FORMAT
function timeForApi(){
  var yesterday = new Date();
  var dd = yesterday.getDate()-1; //today - 1 = yesterday
  var mm = yesterday.getMonth()+1; //January is 0!
  var yyyy = yesterday.getFullYear();

  if(dd<10) {
      dd='0'+dd;
  }

  if(mm<10) {
      mm='0'+mm;
  }

  yesterday = yyyy+"-"+mm+"-"+dd;

  console.log("Preparing to get data...");
  console.log("Yesderday's date for GitHub: " + yesterday);

  return yesterday;
}

// THIS FUNCTION RETURNS AN ARRAY OR OBJECTS. EACH OBJECT INCLUDES LANGUAGE NAME AND % OF NEW REPOSITORIES
function getGitHubData(){

  var counterArray = [];
  console.log(counterArray);

  // CREATING THE URL FOR THE GITHUB API CALL
  var time = timeForApi();
  var url = "https://api.github.com/search/repositories?q=+created:>"+time+"&per_page=1000&sort=stars";
  console.log("GitHub API url: " + url);

  $.ajax({
    async: false,
    url: url,
    type: 'GET',
    dataType: 'json',
    error: function(err){
      console.log("Could not get data from GitHub :(");
      console.log(err);
    },
    success: function(data){

      var repositories = data.items;
      console.log("We got some data... :)");

      // COUNTING NUMBER OF NEW GITHUB REPOSITORIES PER LANGUAGE
      for (var i = 0; i < repositories.length; i++){

        var language = repositories[i].language;
        var exists = 0;

        if (language === null){
          continue;
        }

        for (var n = 0; n < counterArray.length; n++) {
          if (counterArray[n].name == language) {
            counterArray[n].repos++;
            exists = 1;
            break;
          }
        }

        if(exists === 0) {
          counterArray.push({
            name: language,
            repos: 1
          });
        }
        // console.log(counterArray);
      }


      // SORTING COUNTERARRAY ACCORDING TO NUMBER OF NEW REPOSITORIES
      function compareForSort(a,b){
        if (a.repos == b.repos)
          return 0;
        if (a.repos > b.repos)
          return -1;
        else
          return 1;
      }

      counterArray = counterArray.sort(compareForSort);


      // ADDING PERCENT PROPERTY TO EACH LANGUAGE OBJECT ON THE ARRAY
      var sumRepositories = 0;
      for (i = 0; i < counterArray.length; i++){
        sumRepositories = sumRepositories + counterArray[i].repos;
      }

      for (i = 0; i < counterArray.length; i++){
        counterArray[i].repos_percent = Math.round(counterArray[i].repos / sumRepositories * 100);
      }
      console.log(counterArray);
    },
  });
  console.log(counterArray);
  return counterArray;
}

// THIS FUCNTION RETURNS THE NUMBER OF NEW QUESTIONS ON STACKOVERFLOW FOR A SINGLE LANGUAGE
function getNumberOfQuestions(lang) {

  var questions = 0;

  // CREATING THE URL FOR THE GITHUB API CALL
  var time = timeForApi();
  var url = "https://api.stackexchange.com/2.2/questions/?filter=total&fromdate="+time+"&site=stackoverflow&tagged="+lang;
  console.log("StackOverflow API url: " + url);

  $.ajax({
    async: false,
    url: url,
    type: 'GET',
    dataType: 'json',
    error: function(err){
      console.log("Could not get data from Stackoverflow :(");
      console.log(err);
    },
    success: function(data){
      // console.log("console.log: " + data.total);
      questions = data.total;
    }
  });

  return questions;


}

// THIS FUNCTION RECEIVES AN ARRAY OF OBJECTS AND RETURNS THE ARRAY WITH EXTRA PROPERTIES BASES ON STACKOVERFLOW'S DATA
function getStackOverflowData(array) {

  for (var i = 0; i < array.length; i++){
    // console.log(getNumberOfQuestions);
    array[i].questions = getNumberOfQuestions(array[i].name);
  }

  var sumQuestions = 0;
  for (i = 0; i < 9; i++){
    sumQuestions = sumQuestions + array[i].questions;
  }

  // console.log(sumQuestions);

  for (i = 0; i < array.length; i++){
    array[i].questions_percent = Math.round(array[i].questions / sumQuestions * 100);
  }
  // console.log(array);

  return array;

}

// THIS FUNCTION GETS AN ARRAY FULL OF DATA AND APPENDS LANGUAGE BOXES (DIV) THAT CONTAINS THE DATA
function addDataToPage(array){
  $("#container").html("");

  // appending the first 9 languages.
  // to append all data to the page, change "i < 9" to "i < array.length".
  for (var i = 0; i < 9; i++){
    var languageBox = "<div class="+"language_box"+">";
    languageBox = languageBox + '<span class="language_name">'+array[i].name+'</span></br>';
    languageBox = languageBox + '<span class="percent">'+array[i].repos_percent+'%</span></br>';
    languageBox = languageBox + '<span class="language_info">of new repositories on GitHub</span></br>';
    languageBox = languageBox + '<span class="percent">'+array[i].questions_percent+'%</span></br>';
    languageBox = languageBox + '<span class="language_info">of new questions on Stackoverflow</span></br>';
    $("#container").append(languageBox);
  }

}


////////////////////////////////////////////
//            APP LOGIC START             //
////////////////////////////////////////////

var allData = [];
allData = getGitHubData();
allData = getStackOverflowData(allData);
console.log(allData);
addDataToPage(allData);

////////////////////////////////////////////
//            APP LOGIC END               //
////////////////////////////////////////////


// EVENT LISTENER TO A CLICK ON LANGUAGE_BOX
$(".language_box").click(function(){
  console.log("got a click on: " + $(this).children('.language_name').text());
  var name = $(this).children('.language_name').text();
  // var name = "JAvaScript";
  var wikipedia = "";
  var wiki_url = "";
  var problematicNames = ["c++","go","swift","java"];
  var lowerCaseName = name.toLowerCase();

  if (lowerCaseName == "javascript"){
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=javascript";
  }

  else if (lowerCaseName == "c#"){
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=c sharp (programming language)";
  }

  else if (problematicNames.indexOf(lowerCaseName) > -1) {
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + name + "%20(programming%20language)";
  }

  else {
    url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search="+name;
  }

  console.log('Getting data from Wikipedia using the following url:');
  console.log(url);

  $.ajax({
    async: false,
    url: url,
    type: 'GET',
    dataType: 'jsonp',
    error: function(err){
      console.log("Could not get data from Wikipedia :(");
      console.log(err);
    },
    success: function(data){
      console.log("debug");
      console.log(data[1][0]);


      if (data[1][0].includes("C Sharp") === true) {
        wikipedia = data[2][0];
        wiki_url = data[3][0];
      }

      else if (data[1][1].includes("programming") === true) {
        wikipedia = data[2];
        wikipedia = wikipedia[1];
        wiki_url = data[3];
        wiki_url = wiki_url[1];
      }

      else {
        wikipedia = data[2];
        wikipedia = wikipedia[0];
        wiki_url = data[3];
        wiki_url = wiki_url[0];
      }

      var a = '<div class="highlight"><div class="big_language_box">';
      var b = '<div class="highlight_header"><span class="percent big_title">' + name + '</span></br>';
      var c = '<span class="close">X</span></div>';
      var d = '<div class="highlight_body"><div class="text"><span class="language_info big_wiki">' + wikipedia + '</br><br>-- <a href="' + wiki_url + '" class="big_wiki_link" target="_blank">Wikipedia</a></div></span><div class="youtube" id="player"></div></div></div></div>';

      cover = a + b + c + d;

      // EVENT LISTENER TO A CLICK ON THE BACKGROUND OF LANGUAGE_BOX
      $("body").prepend(cover);

      // CALLING YOUTUBE API
      if (name.toLowerCase() == "c#") {
        name = "c+sharp";
      }
      youTubeUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&q=' + name + '+programming+tutorial&type=video&videoDefinition=high&key=AIzaSyCMD5hNscjNSoDwTZlftWw_BacsKrdOWtQ';

      console.log("YouTube URL: "+youTubeUrl);
      $.ajax({
        url: youTubeUrl,
        type:'GET',
        dataType:'jsonp',
        error: function(err){
          console.log("Could not get video from YouTube :(");
          console.log(err);
        },
        success: function(data){
          console.log(data);
          console.log("videoId:");
          var videoID = data.items[0].id.videoId;
          console.log(videoID);

          var youTubeFrame = '<iframe width="300" height="170" src="https://www.youtube.com/embed/' + videoID + '"frameborder="0" allowfullscreen></iframe>';
          $(".youtube").append(youTubeFrame);

        },

      });

      $(".close").click(function(){
        $(".highlight").remove();
      });


    }
  });



});
