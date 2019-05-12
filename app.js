let url_base = "https://api.flickr.com/services/rest/?";
let username = "";

let contactMap = new Map();
let nameMap = new Map(); // mapa donde guardamos username y realname
let onlyFamilyandFriends = 0; // hay que poner un interruptor para esto
var today = new Date();
var lastyear = today.getTime()/1000 - 31536000;


function buildMethodURL(method, user_id){
	return url_base +
				"&method=" + method +
				"&api_key=" + api_key +
				"&user_id=" + user_id +
				"&format=json&nojsoncallback=1";

}

function showUsername(){
	$.getJSON(buildMethodURL("flickr.people.getInfo", user_id),

		function(response) {
			$('#showUsername').append(response.person.username._content);
		}
	);
}

function getContactPublicList(){

	$.getJSON(buildMethodURL("flickr.contacts.getPublicList", user_id),

		function(response){

			for(const c of response.contacts.contact){
				contactMap.set(c.username, []);
				nameMap.set(c.username, " ");

				$.getJSON(buildMethodURL("flickr.people.getInfo", c.nsid),

					function (data){
						nameMap.set(c.username , data.person.realname._content);
					}
				);
			}
		}
	);

}

function getContactsPhotos(){

	var url = 'https://api.flickr.com/services/rest/?&method=flickr.photos.getContactsPublicPhotos&api_key='
		+ api_key
		+ '&user_id='
		+ user_id;

	if (onlyFamilyandFriends == 1 ) {
		url += '&just_friends=1';
	}

	url += '&extras=date_taken&format=json&nojsoncallback=1';

	var photoList;

	$.getJSON(url,

		function (response){
			for (var img of response.photos.photo){
				username = [contactMap.get(img.username)];
				var list = username.push(img);

				var realn = nameMap.get(img.username);

				contactMap.set(img.username, list);

				$("#photos").append($("<img/>").attr("src", photoUrl(img)).attr("height", "150").attr("width", "150").attr("onclick", "javascript:this.height=250; this.width=400").attr("ondblclick", "javascript:this.width=150;this.height=150"));
				$("#photos").append($("<p class='username' >Usuario: " + img.username + "</p>").attr("id", img.owner));
				$("#photos").append("<p class='realname'>Nombre: " + realn + "</p>");
				$("#photos").append("<p class='date'>Fecha: " + img.datetaken + "</p>");
			}
			$(".username").click(function() {
				/*clickUsername($(this).attr("id"));
				alert($(this).attr("id"));*/
				$('#myTimeline').albeTimeline(data, {
					//Effect of presentation
					//'fadeInUp', 'bounceIn', etc
					effect: 'zoomInUp',
					//Sets the visibility of the annual grouper
					showGroup: true,
					//Sets the anchor menu visibility for annual groupings (depends on 'showGroup')
					showMenu: true,
					//Specifies the display language of texts (i18n)
					language: 'es-ES',
					//Sets the date display format
					//'dd/MM/yyyy', 'dd de MMMM de yyyy HH:mm:ss', etc
					formatDate : 'dd MMMM',
					//Defines ordering of items
					//true: Descendente
					//false: Ascendente
					sortDesc: true
				});
			});
		}

	);
}

function photoUrl(photo) {
	return 'https://farm'+photo.farm+".staticflickr.com/"+photo.server +'/'+photo.id+'_'+photo.secret+'_m.jpeg';
}

function start(){
	getContactPublicList();
	showUsername();
	getContactsPhotos();
}

function clickUsername(nid) {
	let url = 'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + api_key +
		'&user_id=' + nid +
		'&min_upload_date=' + lastyear +
		'&format=json&nojsoncallback=1';
	$.getJSON(url,

		function(response) {
			for (var img of response.photos.photo){
				$("#album").append($("<img/>").attr("src", photoUrl(img)));
			}
		}
	);
}

start();
