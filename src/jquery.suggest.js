/*
    $('input[title*=suggest]').suggest(['foo', 'bar', 'baz']);
*/
(function($) {
    $.suggest = function() {
        $.suggest.loading();
    };

    $.extend($.suggest, {
        globals: {
            selection: null,
            length: 0,
            active: false
        },
        settings: {
            afterSelected: undefined,
            key: [ 38, 40, 13, 9, 27 ], // shotcut wtf..
            keys: {
                ARROW_UP    : 38,
                ARROW_DOWN  : 40,
                ENTER       : 13,
                TAB         : 9,
                ESC         : 27
            },
            css: {
                paddingleft: 0,
                paddingRight: 0,
                margin: 0,
                paddingLeft: '5px',
                paddingRight: '5px',
                cursor: 'pointer'
            },
            suggestBoxHtml: '<ul id="suggest"></ul>',
            suggestBoxCss: {
                position            : 'absolute',
                backgroundColor     : 'white',
                border              : '1px solid #999',
                paddingLeft         : '0px',
                paddingRight        : '0px',
                margin              : 0,
                paddingTop          : '3px',
                paddingBottom       : '3px',
                listStyleType       : 'none',
                color               : '#555',
                textAlign           : 'left',
                display             : 'none'
            },
            suggestBoxItemCss: {
                paddingleft: 0,
                paddingRight: 0,
                margin: 0,
                paddingLeft: '5px',
                paddingRight: '5px',
                cursor: 'pointer'
            }
        },
        loading: function(input, data) {
            $(document).bind('keydown.suggest', function(e) {
                //console.log(e); // debug
                var matched = $.grep($.suggest.settings.key, function(n, i) {
                    return e.keyCode == n;
                });

                if (!matched.length > 0) {
                    var value = input.val();
                    console.log(value);
                    var to_complete = value.split(' ').pop().toLowerCase();
                    if (to_complete) {
                        var suggestions = $.grep(data, function(word, i){
                            return word.toLowerCase().indexOf(to_complete.toLowerCase()) == 0
                        });
                        if(suggestions.length){
                            $.suggest.globals.selection = null;
                            $.suggest.globals.length = suggestions.length;
                            $.suggest.show(input);
                            $('#suggest').empty(); // clear selections
                            $.each(suggestions, function(i, suggestion) {
                                var postfix = suggestion.slice(to_complete.length, suggestion.length);
                                var text = value + postfix;
                                $('<li>' + value + '<em style="color: black">' + postfix + '</em>' + '</li>')
                                    .css($.suggest.settings.suggestBoxItemCss)
                                    .hover(function() {
                                        $(this).css('background-color', 'LightBlue');
                                    }, function() {
                                        $(this).css('background-color', 'transparent');
                                    })
                                    .click(function() {
                                        $.suggest.hide();
                                        input.val(text).focus();
                                    }).appendTo('#suggest');
                            });
                        } else {
                            $.suggest.hide();
                        }
                    } else {
                        $.suggest.hide();
                    }
                }

                console.log('selection: ' + $.suggest.globals.selection);
                console.log('length: ' + $.suggest.globals.length);

                if ($.suggest.globals.active) {
                    if ($.suggest.settings.keys.ARROW_UP == e.keyCode || $.suggest.settings.keys.ARROW_DOWN == e.keyCode) {
                        if ($.suggest.globals.selection == null) {
                            $.suggest.globals.selection = e.keyCode == $.suggest.settings.keys.ARROW_DOWN ? 0 : $.suggest.globals.length - 1;
                        } else {
                            $.suggest.globals.selection += e.keyCode == $.suggest.settings.keys.ARROW_DOWN ? 1 : -1;
                            if ($.suggest.globals.selection < 0) {
                                $.suggest.globals.selection = $.suggest.globals.length - 1;
                            } else if ($.suggest.globals.selection >= $.suggest.globals.length) {
                                $.suggest.globals.selection = 0;
                            }
                        }

                        var text = $('#suggest > li')
                            .css('background-color', 'transparent')
                            .eq($.suggest.globals.selection)
                            .css('background-color', 'LightBlue')
                            .text();
                        input.val(text);
                        return false;
                    } else if ($.suggest.settings.keys.ENTER == e.keyCode) {
                        var selected = $('#suggest').hide().find('li').eq($.suggest.globals.selection).text();
                        input.val(selected);
                        if ($.suggest.settings.afterSelected !== undefined) {
                            $.suggest.settings.onComplete(selected);
                        }
                        return false;
                    } else if ($.suggest.settings.keys.TAB == e.keyCode || $.suggest.settings.keys.ESC == e.keyCode) {
                        $.suggest.hide();
                    }
                }
                return true;
            });
        },
        show: function(input) {
            var offset = input.offset();
            $('#suggest').css({
                top: offset.top + input.height() + 7,
                left: offset.left
            }).fadeIn();
            $.suggest.globals.active = true;
        },
        hide: function() {
            $('#suggest').fadeOut();
            $.suggest.globals.active = false;
        },
        destroy: function() {
            $(document).unbind('keydown.suggest');
        },
    });

    // public $.fn methods
    $.fn.suggest = function(data, settings) {
        if ($(this).length == 0) return;
        if (data === undefined) return;

        init(settings);
        $(this).focus(function() { $.suggest.loading($(this), data) });
        $(this).focusout(function() { $.suggest.destroy() });

        return this;
    }

    // private methods
    function init(settings) {
        if ($.suggest.settings.inited) return true;
        else $.suggest.settings.inited = true;
        if (settings) $.extend($.suggest.settings, settings);
        console.log($.suggest.settings.suggestBoxHtml);
        $('body').append( 
            $($.suggest.settings.suggestBoxHtml).css($.suggest.settings.suggestBoxCss)
        );
    }
})(jQuery);
