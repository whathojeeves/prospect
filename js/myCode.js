var ProspectApp=Ember.Application.create();

ProspectApp.ApplicationController = Ember.Controller.extend();
ProspectApp.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

ProspectApp.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/'
    })
  })
});

/* Models */

ProspectApp.Tweet = Ember.Object.extend({

  display_img : null,
  screen_name : null,
  text        : null,
  coord       : null
});

/* Views */

ProspectApp.SearchTextField = Ember.TextField.extend({

  insertNewLine : function(){
    ProspectApp.tweetController.loadTweets();
  }
});

/* Controller */

ProspectApp.tweetController = Ember.ArrayController.create({

  content     : [],
  locQuery    : '',
  nextPage    : '',

  loadTweets  : function(){

  var me = this;

  var queries = "nowplaying";
  var loc = me.get('locQuery');
  var nextUrl = me.get('nextPage');
  var locLat = '';
  var locLong = '';

  console.log(loc);

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': loc}, function(results, status) {

    if (status == google.maps.GeocoderStatus.OK) {

      //console.log(results[0].geometry.location);
      locLat = (results[0].geometry.location).lat();
      locLong = (results[0].geometry.location).lng();

      console.log(locLat);
      console.log(locLong);

  /* Cleaned up URL generation */    

  var url = '';

  if(nextUrl)
  {
    url = 'http://search.twitter.com/search.json';
    url += nextUrl;
  }
  else
  {
    url = 'http://search.twitter.com/search.json?q={queries}&geocode={lat},{lng},{radius}&callback=?'; //Template URL
    var radius= '100km';
    url = url.replace('{queries}', queries).replace('{lat}', locLat).replace('{lng}',locLong).replace('{radius}',radius);
  }

  console.log(url);

  $.ajax({

  url : url,
  type : "GET",
  dataType: 'jsonp',
  success : function(data){

    console.log("AJAX success");
    console.log(data);
    me.set('content',[]);

    me.set('nextPage', data.next_page);

    var sResults = data.results;
    //$(data).each(function(index,value){
    $(sResults).each(function(index,value){

      console.log(value);

      var entry = ProspectApp.Tweet.create({

        /*display_img:value.user.profile_image_url,
        screen_name:value.user.screen_name,
        text       :value.text,
        coord      :value.user.location //can change to coordinates/geo tagging*/

        display_img:value.profile_image_url,
        screen_name:value.from_user,
        text       :value.text,
        coord      :value.location //can change to coordinates/geo tagging
      });

      me.pushObject(entry);
    });
  },

  error : function(error, textStatus, jqXHR){

    alert("ERROR");
    console.log("ERROR");
  },

  complete : function() {
    console.log("AJAX complete");
  }
}); // AJAX

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });

} //loadTweets

}); // ArrayController