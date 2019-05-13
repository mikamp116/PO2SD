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

                let url = 'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + api_key +
                    '&user_id=' + $(this).attr("id") +
                    '&min_upload_date=' + lastyear +
                    '&extras=date_upload&format=json&nojsoncallback=1';
                $.getJSON(url,

                    function(response) {
                        var data = [];
                        for (var img of response.photos.photo) {

                            var date_ = new Date(img.dateupload * 1000);
                            console.log(date_.getTime());
                            console.debug(date_);
                            var getd = date_.getDate();
                            var getm = date_.getMonth() + 1;
                            var mon =  (getm)<10?('0'+getm):getm;
                            var date2 = (getd)<10?('0'+getd):getd;
                            console.log(date_.getFullYear() + "-" + mon + "-" + date2);
                            fecha = date_.getFullYear() + "-" + mon + "-" + date2;

                            data.push(
                                {
                                    time: fecha,
                                    body: [{
                                        tag: 'img',
                                        attr: {
                                            src: photoUrl(img),
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
                    }
                );
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

start();
