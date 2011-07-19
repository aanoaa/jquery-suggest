/*
    TODO: better docs.. english wtf..
    $('input[title*=suggest]').suggest(['foo', 'bar', 'baz']);
    $(document).bind('afterComplete.suggest', function(e, text) {
        console.log('afterComplete');
        if (text) console.log(text);
    });

    available callback list is below

    * loading.suggest
    * beforeReveal.suggest
    * close.suggest
    * afterComplete.suggest - arg 'word'
    * afterClose.suggest
*/
(function($) {
    $.extend($.suggest = {}, {
        data: [],
        selected: null,
        settings: {
            html: '<ul id="suggest"></ul>',
            css: {
                position        : 'absolute',
                backgroundColor : 'white',
                border          : '1px solid #999',
                paddingLeft     : '0px',
                paddingRight    : '0px',
                margin          : 0,
                paddingTop      : '3px',
                paddingBottom   : '3px',
                listStyleType   : 'none',
                color           : '#555',
                textAlign       : 'left',
                display         : 'none',
                'z-index'       : 9999,
            },
            itemCss: {
                paddingleft         : 0,
                paddingRight        : 0,
                margin              : 0,
                paddingLeft         : '5px',
                paddingRight        : '5px',
                cursor              : 'pointer'
            }
        },
        loading: function(input) {
            init();
            input.attr('autocomplete', 'off');
            $(document).bind('keyup.suggest', { msg: input }, keyupHandler);
            $(document).bind('keydown.suggest', keydownHandler);
            $(document).trigger('loading.suggest');
        },
        reveal: function(input, words, latest, value) {
            $(document).trigger('beforeReveal.suggest');
            $('#suggest').empty();
            $.each(words, function(i, word) {
                var postfix = word.slice(latest.length, word.length);
                var text = value + postfix;
                $('<li>' + value + '<em style="color: black; font-style: normal; font-weight: bold;">' + postfix + '</em></li>')
                    .css($.suggest.settings.itemCss)
                    .hover(function() {
                        $(this).css('background-color', 'LightBlue');
                    }, function() {
                        $(this).css('background-color', 'transparent');
                    })
                    .click(function() {
                        input.val(text);
                        $(document).trigger('afterComplete.suggest', text);
                        $(document).trigger('close.suggest');
                        input.focus();
                    }).appendTo('#suggest');
            });
            show(input);
        },
        unreveal: function() {
            hide();
        },
        close: function() {
           $(document).trigger('close.suggest');
           return false;
        }
    });

    $.fn.suggest = function(data, settings) {
        if ($(this).length == 0) return;

        init($(this), data, settings);

        function focusHandler() {
            $.suggest.loading($(this));
            return false;
        }

        function focusoutHandler() {
            $(document).trigger('close.suggest');
            return false;
        }

        return this.bind('focus.suggest', focusHandler)
            .bind('focusout.suggest', focusoutHandler);
    }

    function init(input, data, settings) {
        if ($.suggest.settings.inited) return true;
        else $.suggest.settings.inited = true;

        if (data) $.suggest.data = data;
        if (settings) $.extend($.suggest.settings, settings);
        $('body').append($($.suggest.settings.html).css($.suggest.settings.css));
    }

    function keyupHandler(e) {
        var input = e.data.msg;
        if (e.keyCode == 27) {
            $.suggest.unreveal();
            return false; // true or false which is correct?
        }

        var value = input.val();
        var latest = value.split(' ').pop().toLowerCase();
        if (latest) {
            var words = $.grep($.suggest.data, function(word, i) {
                return word.toLowerCase().indexOf(latest) == 0;
            });

            if (words.length > 0) {
                $.suggest.reveal(input, words, latest, value);

                var size = $('#suggest > li').length;
                if (38 == e.keyCode || 40 == e.keyCode) {
                    if ($.suggest.selected == null) {
                        $.suggest.selected = 0;
                    } else {
                        $.suggest.selected += e.keyCode == 40 ? 1 : -1;
                    }

                    if ($.suggest.selected < 0) {
                        $.suggest.selected = size - 1;
                    } else if ($.suggest.selected >= size) {
                        $.suggest.selected = 0;
                    }

                    $('#suggest > li')
                        .css('background-color', 'transparent')
                        .eq($.suggest.selected)
                        .css('background-color', 'LightBlue');
                    return false;
                } else if (13 == e.keyCode) {
                    var text = $('#suggest li').eq($.suggest.selected).text();
                    input.val(text);
                    $(document).trigger('afterComplete.suggest', text);
                    $(document).trigger('close.suggest');
                    input.focus();
                    return false;
                } else if (9 == e.keyCode) {
                    hide();
                }
            } else {
                hide();
            }
        } else {
            hide();
        }

        return true;
    }

    function keydownHandler(e) {
        if (e.keyCode == 13) e.preventDefault();
    }

    function show(input) {
        var offset = input.offset();
        $('#suggest').css({
            top: offset.top + input.height() + 7,
            left: offset.left
        }).show();
    }

    function hide() {
        $.suggest.selected = null;
        $('#suggest').fadeOut(function() {
            $(this).empty();
        });
    }

    // bindings
    $(document).bind('close.suggest', function() {
        $(document).unbind('keyup.suggest');
        $(document).unbind('keydown.suggest');
        $('#suggest').fadeOut(function() {
            $(this).empty();
            $(document).trigger('afterClose.suggest');
        });
    });
})(jQuery);
