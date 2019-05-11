let url_base = "https://api.flickr.com/services/rest/?";
let username = "";

let contactMap = new Map();
let nameMap = new Map(); // mapa donde guardamos username y realname


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
	console.log(nameMap.get('mikamp'));

}

function getContactsPhotos(){

	var url= 'https://api.flickr.com/services/rest/?&method=flickr.photos.getContactsPublicPhotos&api_key='
		+ api_key
		+ '&user_id='
		+ user_id
		+ '&extras=date_taken&format=json&nojsoncallback=1';

	var photoList;

	$.getJSON(url,

		function(response){
			for (var img of response.photos.photo){
				username = [contactMap.get(img.username)];
				var list = username.push(img);

				console.log(img.datetaken);
				console.log("username :" + img.username);
				var realn = nameMap.get(img.username);
				console.log(nameMap.get(img.username));
				console.log("realname: " + realn);

				contactMap.set(img.username, list);
				$("#photos").append($("<img/>").attr("src",photoUrl(img)).attr("height", "150").attr("width","150").attr("onclick", "javascript:this.height=250; this.width=400").attr("ondblclick", "javascript:this.width=150;this.height=150"));
				$("#photos").append("<p>Usuario: " + img.username + "</p>");
				$("#photos").append("<p>Nombre: " + realn + "</p>");
				$("#photos").append("<p>Fecha: " + img.datetaken+ "</p>");
			}
		}

	);
}

function photoUrl(photo) {
	return 'https://farm'+photo.farm+".staticflickr.com/"+photo.server +'/'+photo.id+'_'+photo.secret+'_m.jpeg';
}

function start(){
	showUsername();
	getContactPublicList();
	//$.when(getContactPublicList()).then(getContactsPhotos());
	getContactsPhotos();
}

start()


