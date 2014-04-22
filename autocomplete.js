(function ( $ ) {
    $.fn.autocomplete = function( options ) {

        var $self = $(this);

        var settings = $.extend({
            backendUrl: 'backend.php', // url to our php backend
            maxResults: 6, // max results in list
            cache: true, // cache repeated requests
            maxWidth: 300 // maximum width of the drop down menu with hints
        }, options );

        var cache = {};

        // replace input with relative container to allow absolute position for hint menu
        this.wrap( $( '<div></div>' ).css({ display: 'inline-block', position: 'relative' }) );

        var container = this.parent();
        var containerWith = this.outerWidth();

        // create container for hint menu with some styles
        var menu = $( '<div></div>' ).css({
            position: 'absolute',
            'min-width': containerWith,
            'max-width': settings.maxWidth > containerWith ? settings.maxWidth : containerWith,
            padding: '5px',
            margin: this.css( 'margin' ),
            'box-sizing': 'border-box',
            'background-color': '#eee',
            border: 'solid #ccc 1px',
            display: 'none',
            overflow: 'hidden',
            'text-overflow': 'ellipsis'
        }).appendTo( container );

        // function to show menu with hints, no keyboard navigation allowed, only mouse click
        var showMenu = function (data) {

            if (!data) return false;

            menu.empty();

            $.each( data, function(key, value) {

                var item = $( '<div></div>')
                    .text( value.name )
                    .css({ cursor: 'pointer', padding: '3px' })
                    .mouseenter( function() {
                        $(this).css('background-color', 'white');
                    })
                    .mouseleave( function() {
                        $(this).css('background-color', 'transparent');
                    })
                    .data('url', value.url)
                    .click(function() {
                        $self.val( $(this).data( 'url' ) );
                        menu.hide();
                    });

                menu.append( item );
            });

            menu.show();
        }

        var timeoutId = null; // keyup timeout id
        var ajaxActive = false; // flag that set to true white ajax get data from backend

        this.keyup( function() {

            var $self = $(this);

            // clear old timeout and set new to not fire request to backend white user type something
            if ( timeoutId ) {
                window.clearTimeout(timeoutId);
                timeoutId = null;
            }

            var inputValue = $self.val();

            // hide hint menu for empty string
            if (!inputValue.length) menu.hide();

            // exit when we have active ajax connection or input value is empty
            if (ajaxActive || !inputValue.length) return true;

            // fire ajax POST request to the backend when user made some pause during typing
            timeoutId = window.setTimeout(function() {

                // show menu if we have cache enabled and backend response already cached for this string
                if (settings.cache && cache[inputValue]) {
                    showMenu(cache[inputValue]);
                    return true;
                }

                // set ajax flag to active to have only one ajax request in one time
                ajaxActive = true;

                $.ajax({
                    type: "POST",
                    url: settings.backendUrl,
                    data: { data: inputValue, maxResults: settings.maxResults },
                    dataType: 'json'
                })
                .done(function( result ) {
                    if (result.success) {
                        if (result.data.length) {

                            // cache results if we have cache enabled
                            if (settings.cache) cache[inputValue] = result.data;

                            // show menu
                            showMenu( result.data );
                        } else {
                            menu.hide();
                        }
                    }
                })
                .always(function() {
                    // always remove ajax flag even on ajax fail
                    ajaxActive = false;
                });

            } , 200 )
        })
        // hide hint menu when user leave url input field
        .blur( function() {
            window.setTimeout( function() {
                menu.hide();
            }, 200 );
        });

        return this;
    }
}( jQuery ));