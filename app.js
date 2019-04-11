let url_base = "https://api.flickr.com/services/rest?";				
let username = "";

let contactMap = new Map();

function buildMethodURL(method, user_id){
	return url_base + 
				"method=" + method +
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
	
	$.getJSON(buildMethodURL('flickr.contacts.getPublicList'),
		
		function(response){
			
			for(const c of response.contacts.contact){
				contactMap.set(c.username, []);
			}
		}
		
	);
	
}

function getContactsPhotos(){
	
	var photoList;
	
	$.getJSON(buildMethodURL('flickr.photos.getContactsPublicPhotos'),
		
		function(response){
			for(const img of response.photos.photo){
				contactMap.set(img.username, contactMap.get(img.username).push(img));				
			}
		}
		
	);
	
	console.log(contactMap);
	
}

function start(){
	showUsername();
	getContactPublicList();
	getContactsPhotos();
	
}

start();