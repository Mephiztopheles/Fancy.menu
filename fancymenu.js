(function( w, $ ) {

    Fancy.require( {
        jQuery: false,
        Fancy : "1.0.2"
    } );
    var NAME    = "FancyMenu",
        VERSION = "1.0.5",
        i       = 0,
        logged  = false;


    function buildItem( SELF, options, id ) {
        var m = $( '<li/>', {
            "class": NAME + '-menu-element'
        } );
        m.append( $( '<span/>', {
            "class": NAME + '-menu-icon ' + options.icon
        } ) );
        m.append( $( '<span/>', {
            "class": NAME + '-menu-text',
            html   : id
        } ) );

        var name     = options.name,
            disabled = options.disabled,
            title    = options.title;
        if( name ) {
            if( typeof name == "function" )
                name = name.call( SELF, options );
            m.find( "." + NAME + '-menu-text' ).html( name );
        }
        if( typeof title == "function" ) {
            title = title.call( SELF, options );
        }
        if( title ) {
            m.attr( "title", title );
            if( Fancy.tooltip )
                Fancy( m ).tooltip( { ever: true } )
        } else if( Fancy.tooltip ) {
            var t = Fancy( m ).get( "tooltip" );
            if( t )
                t.destroy();
        }
        if( typeof disabled == "function" ) {
            disabled = disabled.call( SELF, options );
        }

        if( options.click && !options.menu ) {
            m.on( "click", function() {
                options.click.call( SELF, options, m );
            } );
        } else if( options.menu ) {
            var sub = buildMenu();
            m.append( sub );
            for( var i = 0; i < options.menu.length; i++ ) {
                sub.append( buildItem( SELF, options.menu[ i ], i ) )
            }
        }

        if( disabled )
            m.addClass( "disabled" );
        return m;
    }

    function buildMenu() {
        return $( "<div/>", { "class": NAME + "-submenu" } );
    }

    function FancyMenu( element, settings ) {
        var SELF      = this;
        SELF.id       = i;
        SELF.element  = element;
        SELF.version  = VERSION;
        SELF.name     = NAME;
        SELF.settings = $.extend( {}, Fancy.settings [ NAME ], settings );
        if( !logged ) {
            logged = true;
            Fancy.version( SELF );
        }
        this.init();
        i++;
    }

    FancyMenu.api = FancyMenu.prototype = {};
    FancyMenu.api.version    = VERSION;
    FancyMenu.api.name       = NAME;
    FancyMenu.api.init       = function() {
        var SELF = this;
        SELF.createMenu();
        SELF.element.addClass( this.name + '-trigger' );
        SELF.element.data( NAME, SELF );
        SELF.element.on( "contextmenu." + NAME + "-" + SELF.id, function( e ) {
            SELF.onOpen( e );
            e.preventDefault();
            e.stopPropagation();
        } );

        var timer,
            touchduration = 1000;

        SELF.element.on( "touchstart." + NAME + "-" + SELF.id, function( e ) {
            timer = setTimeout( function() {
                SELF.onOpen( e );
            }, touchduration );
            if( SELF.settings.preventMobileTouch )
                e.preventDefault();
        } );
        SELF.element.on( "touchend." + NAME + "-" + SELF.id, function() {
            if( timer )
                clearTimeout( timer );
        } );

    };
    FancyMenu.api.createMenu = function() {
        var SELF    = this,
            wrapper = $( '<div/>', {
                id: NAME + '-wrapper'
            } ).attr( 'unselectable', 'on' ).css( 'user-select', 'none' ).on( 'selectstart', false ),
            inner   = $( '<div/>', {
                id: NAME + '-inner'
            } ),
            menu    = $( '<ul/>', {
                id: NAME + '-menu'
            } );
        wrapper.append( inner.append( menu ) );

        for( var id = 0; id < SELF.settings.menu.length; id++ ) {
            var n = SELF.settings.menu [ id ],
                m = buildItem( SELF, n, id );
            menu.append( m );
        }

        this.menu = wrapper;
    };
    FancyMenu.api.onOpen     = function( e ) {
        var SELF  = this;
        if( !SELF.settings.menu.length )
            return;
        this.close();
        this.createMenu();

        $( 'body' ).append( this.menu );
        $( document ).on( 'mousedown.' + NAME + "-" + SELF.id + ' touchstart.' + NAME + "-" + SELF.id, function( e ) {
            if( $( e.target ).is( SELF.menu ) || $( e.target ).closest( SELF.menu ).length )
                return;
            SELF.close();
        } );
        var pageX = e.pageX || e.originalEvent.touches [ 0 ].pageX;
        var pageY = e.pageY || e.originalEvent.touches [ 0 ].pageY;
        this.menu.css( {
            left: pageX + 10,
            top : pageY + 10
        } );
    };
    FancyMenu.api.close      = function() {
        this.menu.remove();
        $( document ).unbind( '.' + NAME + "-" + this.id );
        this.settings.onClose.call( this );
    };
    Fancy.settings [ NAME ]  = {
        menu              : [],
        onClose           : function() {},
        preventMobileTouch: true
    };
    Fancy.menu               = VERSION;
    Fancy.api.menu           = function( settings ) {
        return this.set( NAME, function( el ) {
            return new FancyMenu( el, settings );
        } );
    };

})( window, jQuery );
