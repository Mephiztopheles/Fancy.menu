(function ( w, $ ) {

    Fancy.require ( {
        jQuery: false,
        Fancy : "1.0.2"
    } );
    var NAME    = "FancyMenu",
        VERSION = "1.0.4",
        i       = 0,
        logged  = false;

    function FancyMenu ( element, settings ) {
        var SELF      = this;
        SELF.id       = i;
        SELF.element  = element;
        SELF.version  = VERSION;
        SELF.name     = NAME;
        SELF.settings = $.extend ( {}, Fancy.settings [ NAME ], settings );
        if ( !logged ) {
            logged = true;
            Fancy.version ( SELF );
        }
        this.init ();
        i++;
    }

    FancyMenu.api = FancyMenu.prototype = {};
    FancyMenu.api.version    = VERSION;
    FancyMenu.api.name       = NAME;
    FancyMenu.api.init       = function () {
        var SELF = this;
        SELF.createMenu ();
        SELF.element.addClass ( this.name + '-trigger' );
        SELF.element.data ( NAME, SELF );
        SELF.element.on ( "contextmenu." + NAME + "-" + SELF.id, function ( e ) {
            SELF.onOpen ( e );
            e.preventDefault ();
            e.stopPropagation ();
        } );

        var timer,
            touchduration = 1000;

        SELF.element.on ( "touchstart." + NAME + "-" + SELF.id, function ( e ) {
            timer = setTimeout ( function () {
                SELF.onOpen ( e );
            }, touchduration );
            if( SELF.settings.preventMobileTouch )
                e.preventDefault ();
        } );
        SELF.element.on ( "touchend." + NAME + "-" + SELF.id, function () {
            if ( timer )
                clearTimeout ( timer );
        } );

    };
    FancyMenu.api.createMenu = function () {
        var SELF    = this,
            wrapper = $ ( '<div/>', {
                id: NAME + '-wrapper'
            } ).attr ( 'unselectable', 'on' ).css ( 'user-select', 'none' ).on ( 'selectstart', false ),
            inner   = $ ( '<div/>', {
                id: NAME + '-inner'
            } ),
            menu    = $ ( '<ul/>', {
                id: NAME + '-menu'
            } );
        wrapper.append ( inner.append ( menu ) );

        for ( var id = 0; id < SELF.settings.menu.length; id++ ) {
            var n = SELF.settings.menu [ id ],
                m = $ ( '<li/>', {
                    id     : NAME + '-menu-' + id,
                    "class": NAME + '-menu-element'
                } ).data ( 'name', id );
            m.append ( $ ( '<span/>', {
                id     : NAME + '-menu-' + id + '-icon',
                "class": NAME + '-menu-icon ' + n.icon
            } ) );
            m.append ( $ ( '<span/>', {
                id     : NAME + '-menu-' + id + '-text',
                "class": NAME + '-menu-text',
                html   : id
            } ) );
            
            var name = n.name;
            if( name ) {
                if( typeof name == "function" )
                    name = name.call( SELF, n );
                m.find( "span" ).last().html( name );
            }
            var title = n.title;
            if ( typeof title == "function" ) {
                title = title.call( SELF, n );
            }
            if ( title ) {
                m.attr( "title", title );
                if ( Fancy.tooltip )
                    Fancy( m ).tooltip( { ever: true } )
            } else if ( Fancy.tooltip ) {
                var t = Fancy( m ).get( "tooltip" );
                if ( t )
                    t.destroy();
            }
            var disabled = n.disabled;
            if ( typeof disabled == "function" ) {
                disabled = disabled.call( SELF, n );
            }

            if ( disabled )
                m.addClass( "disabled" );
            menu.append ( m );
        }

        this.menu = wrapper;
    };
    FancyMenu.api.onOpen     = function ( e ) {
        var SELF  = this;
        if ( !SELF.settings.menu.length )
            return;
        this.close ();
        this.createMenu ();

        $ ( 'body' ).append ( this.menu );
        $ ( "." + NAME + "-menu-element:not(.disabled)" ).on ( 'click', function ( e ) {
            var name = $ ( this ).data ( 'name' );
            SELF.settings.menu [ name ].click && SELF.settings.menu [ name ].click.call ( SELF, e, name, $ ( this ) );
        } );
        $ ( document ).on ( 'mousedown.' + NAME + "-" + SELF.id + ' touchstart.' + NAME + "-" + SELF.id, function ( e ) {
            if ( $ ( e.target ).is ( SELF.menu ) || $ ( e.target ).closest ( SELF.menu ).length )
                return;
            SELF.close ();
        } );
        var pageX = e.pageX || e.originalEvent.touches [ 0 ].pageX;
        var pageY = e.pageY || e.originalEvent.touches [ 0 ].pageY;
        this.menu.css ( {
            left: pageX + 10,
            top : pageY + 10
        } );
    };
    FancyMenu.api.close      = function () {
        this.menu.remove ();
        $ ( document ).unbind ( '.' + NAME + "-" + this.id );
        this.settings.onClose.call ( this );
    };
    Fancy.settings [ NAME ]  = {
        menu              : [],
        onClose           : function () {},
        preventMobileTouch: true
    };
    Fancy.menu               = VERSION;
    Fancy.api.menu           = function ( settings ) {
        return this.set ( NAME, function ( el ) {
            return new FancyMenu ( el, settings );
        } );
    };

}) ( window, jQuery );
