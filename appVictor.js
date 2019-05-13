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
		+ '&extras=date_taken&format=json&nojsoncallback=1';



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
						$("#" + c.username + "rn").append(nameMap.get(c.username)); // Mostramos el nombre completo
					}
				);
			}
			for (const [uname, uid] of contactList){ // Por cada usuario preparamos un contenedor para mostrar sus fotos
				let ccol = 	"<div class='container-fluid' id='" + uname + "_cont'>" +
						   		"<h2><a href='#' class='un' id='" + uid + "'>" + uname + "</a></h2>" +
						   		"<span id='" + uname + "rn'></span>" +
						   		"<div class='row justify-content-center' id='" + uname + "_row'></div>" +
						   	"</div>";
				$("#mcont").append(ccol);
			}
		}
	);

}

function changeBetweenFriendsAndContactsPhotos(){
	
	$.getJSON(contact_photos_url + "&just_friends=1",

		function(response){

			$("#amigos").click( function() {
				for (const [uname, uid] of contactList){
					$("#" + uname + "_cont").hide();
				}

				for (const img of response.photos.photo){
					$("#" + img.username + "_cont").show();
				}
			});

			$("#todos").click( function() {
				for (const [uname, uid] of contactList){
					$("#" + uname + "_cont").show();
				}
			});

		}

	);

}

function getContactsPhotos(){

	$.getJSON(contact_photos_url,

		function(response){
			for (const img of response.photos.photo){

				// Mostramos cada imagen en miniatura y la hacemos un enlace a la foto en tamaño grande
				let gphoto ="<div class='gallery'>" +
								"<a target='_blank' href='" + largephotoUrl(img) + "'>" +
									"<img src='" + miniphotoUrl(img) + "'/>" +
								"</a>" +
								"<div class='desc'>" + "Fecha: " + img.datetaken + "</div>" +
							"</div>" ;


				$("#" + img.username + "_row").append(gphoto);
			}

			$(".un").click( function() {
					makeTimeline();
			});
		}

	);

}

function makeTimeline() {

	let url = 'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + api_key +
              '&user_id=' + $(this).attr("id") +
              '&min_upload_date=' + last_year +
			  '&extras=date_upload&format=json&nojsoncallback=1';

	$.getJSON(url, 

		function(re){
			let data = [];

			for (const img of re.photos.photo) {
				let date_ = new Date(img.dateupload * 1000);
				let getd = date_.getDate();
				let getm = date_.getMonth() + 1;
				let mon = (getm) < 10 ? ('0' + getm) : getm;
				let day = (getd) < 10 ? ('0' + getd) : getd;

				let fecha = date_.getFullYear() + '-' + mon + '-' + day;

				data.push(
                            {
                                time: fecha,
                                body: [{
                                    tag: 'img',
                                    attr: {
                                        src: miniphotoUrl(img),
                                        width: '200px',
                                        cssclass: 'img-responsive'
                                    }
                                },
                                    {
                                        tag: 'h2',
                                        content: img.title
                                    },
                                    {
                                        tag: 'p',
                                        content: 'aqui van los comentarios'
                                    }]
                            }
				);
			}


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
                        //formatDate : 'dd MMMM',
                        //Defines ordering of items
                        //true: Descendente
                        //false: Ascendente
                        sortDesc: true
			});

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

			$("#mcont").hide();

			$("#mainp").click( function(){
				$("#newnavbar").hide();
				$("#ognavbar").show();
				$("#mcont").show();
			});

		}

	);
}




function miniphotoUrl(photo) {
	return 'https://farm'+photo.farm+".staticflickr.com/"+photo.server +'/'+photo.id+'_'+photo.secret+'_m.jpeg';
}

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
	getContactsPhotos();
	changeBetweenFriendsAndContactsPhotos();
}

start();


