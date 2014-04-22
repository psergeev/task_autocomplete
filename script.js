$(function() {
    // init autocomplete jquery plugin
    $( '#url' ).autocomplete({ maxResults: 4 });

    // process to url on form submit
    $( '#form' ).submit( function() {
        var urlValue = $( '#url' ).val();

        // prepend http:// if missed
        if ( !urlValue.match( /^http[s]?:/ ) ) {
            urlValue = 'http://' + urlValue;
        }

        // check url for correct style and ask to enter again if it wrong
        var regex = new RegExp( "^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?" );
        if ( urlValue && urlValue.match( regex ) ) {
            document.location = urlValue;
        }
        else {
            alert( 'Пожалуйста введите корректный адресс сайта для перенаправления' );
        }

        return false;
    })
});