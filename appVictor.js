let url_base = "https://api.flickr.com/services/rest/?";
let username = "";

let contactList = new Map();
let nameMap = new Map(); // mapa donde guardamos username y realname
let today = new Date();
let this_year = 1546297200;
let last_year = this_year - 31536000;

let contact_photos_url= 'https://api.flickr.com/services/rest/?&method=flickr.photos.getContactsPublicPhotos&api_key='
		+ api_key
		+ '&user_id='
		+ user_id
		+ '&count=50&extras=date_taken&format=json&nojsoncallback=1';

// Esta funcion elimina espacios y puntos de los nombres de usuario para poder utilizarlos como ids en elementos html
function sanitizeUname(str){
	str = str.replace(/\s+/g, '');
	return str.replace(/\./g, '');
}

function buildMethodURL(method, user_id){ // Con este metodo podemos crear las url para los metodos api sencillos
	return url_base +
				"&method=" + method +
				"&api_key=" + api_key +
				"&user_id=" + user_id +
				"&format=json&nojsoncallback=1";

}

function showUsername(){ // Este metodo devuelve el nombre de usuario
	$.getJSON(buildMethodURL("flickr.people.getInfo", user_id),

		function(response) {
			$('#showUsername').append(response.person.username._content);
		}
	);
}


function getContactPublicList(){

	$.getJSON(buildMethodURL("flickr.contacts.getPublicList", user_id),

		function(response){

			let clist = response.contacts.contact;

			for(const c of clist){
				contactList.set(c.username, c.nsid); // Guardamos los nombres de usuario de los contactos en un array
				nameMap.set(c.username, " "); // Creamos un mapa para obtener los nombres reales

				$.getJSON(buildMethodURL("flickr.people.getInfo", c.nsid),

					function (data){
						nameMap.set(c.username , data.person.realname._content);
						$("#" + sanitizeUname(c.username) + "rn").append(nameMap.get(c.username)); // Mostramos el nombre completo
					}
				);
			}
			for (const [uname, uid] of contactList){ // Por cada usuario preparamos un contenedor para mostrar sus fotos
				let ccol = 	"<div class='container-fluid' id='" + sanitizeUname(uname) + "_cont'>" +
						   		"<h2><a href='#' class='un' id='" + uid + "'>" + uname + "</a></h2>" +
						   		"<span id='" + sanitizeUname(uname) + "rn'></span>" +
						   		"<div class='row justify-content-center' id='" + sanitizeUname(uname) + "_row'></div>" +
						   	"</div>";
				$("#mcont").append(ccol);
			}
			getContactsPhotos();
		}
	);

}

function changeBetweenFriendsAndContactsPhotos(){

	// Obtenemos las fotos de nuestros amigos y familia solo
	$.getJSON(contact_photos_url + "&just_friends=1",

		function(response){

			// Al hacer click en amigos y familia se esconden todas las fotos y solo se muestran las de amigos y familia
			$("#amigos").click( function() {
				for (const [uname, uid] of contactList){
					$("#" + sanitizeUname(uname) + "_cont").hide();
				}

				for (const img of response.photos.photo){
					$("#" + sanitizeUname(img.username) + "_cont").show();
				}
			});

			// Al hacer click en todos se vuelven a mostrar todas las fotos
			$("#todos").click( function() {
				for (const [uname, uid] of contactList){
					$("#" + sanitizeUname(uname) + "_cont").show();
				}
			});

		}

	);

}

// Mostrar la timeline de un año, 0 para el año pasado, otra cosa para año actual
function getTimelineOfYear(nyear, nuid){

	let url_this =  'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + api_key +
					'&user_id=' + nuid +
					'&min_upload_date=' + this_year +
					'&extras=date_upload&format=json&nojsoncallback=1';
	let url_past = 'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + api_key +
					'&user_id=' + nuid +
					'&min_upload_date=' + last_year +
					'&max_upload_date=' + this_year +
					'&extras=date_upload&format=json&nojsoncallback=1';

	// elegir url y elemento de html en funcion de los argumentos recibidos

	let url_use = nyear == 0 ? url_past : url_this;

	let tl = nyear == 0 ? "#myTimeline2" : "#myTimeline";

	// llamada a la api para recoger las fotos
	$.getJSON(url_use,

			function(re){

				let data = [];

				// Por cada foto guardamos la fecha
				for (const img of re.photos.photo) {
					let date_ = new Date(img.dateupload * 1000);
					let getd = date_.getDate();
					let getm = date_.getMonth() + 1;
					let mon = (getm) < 10 ? ('0' + getm) : getm;
					let day = (getd) < 10 ? ('0' + getd) : getd;

					let fecha = date_.getFullYear() + '-' + mon + '-' + day;

					let comment_list = "";

					// Obtenemos los comentarios de la foto para mostrarlos
					$.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.comments.getList' +
						'&api_key=' + api_key +
						'&photo_id=' + img.id +
						'&format=json&nojsoncallback=1', comment_list, function (answer) {
						let cont = 0;
						for (var comm of answer.comments.comment) {
							if (cont < 5) { // Mostramos únicamente 5 comentarios, ya que fotos de perfiles famosos tienen demasiados
								comment_list += "<p>" + comm._content + "</p>";
								cont++;
							}
						}
						// Creamos el objeto para mostrarlo con la template de la timeline
						data.push(
							{
								time: fecha,
								body: [{
									tag: 'img',
									attr: {
										src: miniphotoUrl(img),
										width: '300px',
										cssclass: 'img-responsive'
									}
								},
									{
										tag: 'h2',
										content: img.title
									},
									{
										tag: 'p',
										content: comment_list
									}]
							}
						);
						// Añadimos la timeline al elemento html correspondiente
						$(tl).albeTimeline(data, {
							effect: 'zoomInUp',
							showGroup: true,
							showMenu: false,
							language: 'es-ES',
							sortDesc: true
						});
					});



				}


			}
	);

}

function getContactsPhotos(){

	$.getJSON(contact_photos_url,

		function(response){
			for (const img of response.photos.photo){

				// Mostramos cada imagen en miniatura y la hacemos un enlace a la foto en tamano grande
				let gphoto ="<div class='gallery'>" +
								"<a target='_blank' href='" + largephotoUrl(img) + "'>" +
									"<img src='" + miniphotoUrl(img) + "'/>" +
								"</a>" +
								"<div class='desc'>" + "Fecha: " + img.datetaken + "</div>" +
							"</div>" ;

				// Anadimos la foto al elemento html de su propietario
				$("#" + sanitizeUname(img.username) + "_row").append(gphoto);
			}

			// Al hacer click en el nombre de usuario
			$(".un").click( function() {
					
					// Creamos los dos timelines
					getTimelineOfYear(0, $(this).attr("id"));
					getTimelineOfYear(1, $(this).attr("id"));				

					// Cambiamos el contenido de la navbar
					$("#ognavbar").hide();

					let newnavbar = "<ul class='navbar-nav' id='newnavbar'>" +
										"<li class='nav-item'>" +
											"<a class='navbar-link' href='#' id='tyear'>Este año</a>" +
										"</li>" +
										"<li class='nav-item'>" +
											"<a class='navbar-link' href='#' id='lyear'>Año anterior</a>" +
										"</li>" +
										"<li class='nav-item'>" +
											"<a class='navbar-link' href='#' id='mainp'>Volver</a>" +
										"</li>" +
									"</ul>";

					if ( $("#newnavbar").length ) {
						$("#newnavbar").show();
					} else{
						$("#navbar").append(newnavbar);
					}

					//Estado inicial
					$('#myTimeline').show();
					$('#myTimeline2').hide();
					$("#mcont").hide();
					$("#tyear").hide();
					$("#lyear").show();

					// Si elegimos ver el ano pasado
					$("#lyear").click( function() {
						$('#myTimeline').hide();
						$('#myTimeline2').show();
						$('#lyear').hide();
						$('#tyear').show();
					});

					// Si elegimos ver este ano
					$("#tyear").click( function() {
						$('#myTimeline2').hide();
						$('#myTimeline').show();
						$('#tyear').hide();
						$('#lyear').show();
					});

					// Si queremos volver atras
					$("#mainp").click( function(){
						$("#newnavbar").hide();
						$('#myTimeline').hide();
						$('#myTimeline2').hide();
						$("#ognavbar").show();
						$("#mcont").show();
					});
			});
		});
}


// Url para miniaturas
function miniphotoUrl(photo) {
	return 'https://farm'+photo.farm+".staticflickr.com/"+photo.server +'/'+photo.id+'_'+photo.secret+'_m.jpeg';
}

// Url para fotos grandes
function largephotoUrl(photo) {
	return 'https://farm'+photo.farm+".staticflickr.com/"+photo.server +'/'+photo.id+'_'+photo.secret+'_b.jpeg';
}

$(document).ready(function () {

    //Overrides the CutureInfo default plugin
    $.fn.albeTimeline.languages = {
        "en-US": {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            msgEmptyContent: "No information to display."
        },
        "es-ES": {
            days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
            months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
            shortMonths: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            msgEmptyContent: "No hay información para mostrar."
        },
        "fr-FR": {
            days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
            months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
            shortMonths: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
            msgEmptyContent: "Aucune information à afficher."
        }
    };

});

function start(){
	showUsername();
	getContactPublicList();
	changeBetweenFriendsAndContactsPhotos();
}

start();