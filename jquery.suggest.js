/* 
    jquery.suggest.js
    ~~~~~~~~~~~~~~~~~

    This plugin allows to provide a google like suggest functionality
    from static data for input fields.

    Example
    -------

    $('input').suggest(['foo', 'bar', 'some', 'words', 'or phrases']);

    :copyright: (C) 2009 Florian Boesch <pyalot@gmail.com>
    :license: GNU AGPL3, see LICENSE for more details.
*/

(function($){
    var arrow_up = 38;
    var arrow_down = 40;
    var enter = 13;
    var tab = 9
    var esc = 27;
    $.fn.suggest = function(words){
        $(document).click(function(){
            box.hide();
        });
        var input = $(this).attr('autocomplete', 'off');
        var selection = null;
        var length = 0;
        var active = false;
        var show = function(){
            var offset = input.offset();
            box
                .css({
                    top: offset.top + input.height() + 7,
                    left: offset.left
                })
                .empty()
                .show();
            selection = null;
            active = true;
        }
        var hide = function(){
            box.hide();
            active = false;
        }
        var box = $('<ul></ul>')
            .css({
                position: 'absolute',
                backgroundColor: 'white',
                border: '1px solid #999',
                paddingLeft: '0px',
                paddingRight: '0px',
                margin: 0,
                paddingTop: '3px',
                paddingBottom: '3px',
                listStyleType: 'none',
                minWidth: input.width() + 4,
                color: '#555',
                textAlign: 'left'
            })
            .hide()
            .appendTo('body')

        input
            .keyup(function(event){
                if(
                    event.keyCode != arrow_down &&
                    event.keyCode != arrow_up &&
                    event.keyCode != enter &&
                    event.keyCode != tab &&
                    event.keyCode != esc
                ){
                    var value = input.val();
                    var to_complete = value.split(' ').pop().toLowerCase();
                    if(to_complete){
                        var suggestions = $.grep(words, function(word, i){
                            return word.toLowerCase().indexOf(to_complete.toLowerCase()) == 0
                        });
                        if(suggestions.length){
                            selection = null;
                            length = suggestions.length;
                            show()
                            $.each(suggestions, function(i, suggestion){
                                var postfix = suggestion.slice(to_complete.length, suggestion.length);
                                var text = value + postfix;
                                $('<li>' + value + '<em style="color: black">' + postfix + '</em>' + '</li>')
                                    .css({
                                        paddingleft: 0,
                                        paddingRight: 0,
                                        margin: 0,
                                        paddingLeft: '5px',
                                        paddingRight: '5px',
                                        cursor: 'pointer'
                                    })
                                    .data('text', text)
                                    .hover(
                                        function(){
                                            $(this).css('background-color', 'LightBlue');
                                        },
                                        function(){
                                            $(this).css('background-color', 'transparent');
                                        }
                                    )
                                    .click(function(){
                                        hide()
                                        input.val(text).focus();
                                    })
                                    .appendTo(box)
                            });
                        }
                        else{
                            hide()
                        }
                    }
                    else{
                        hide()
                    }
                }
            });
        var keyhandler = function(event){
            if(active){
                if(event.keyCode == arrow_down || event.keyCode == arrow_up){
                    if(selection == null){
                        selection = event.keyCode == arrow_down ? 0 : length-1;
                    }
                    else{
                        selection += event.keyCode == arrow_down ? 1 : -1;
                        if(selection < 0){
                            selection = length - 1;
                        }
                        else if(selection >= length){
                            selection = 0;
                        }
                    }
                    var text = box.find('li')
                        .css('background-color', 'transparent')
                        .eq(selection)
                            .css('background-color', 'LightBlue')
                            .data('text');
                    input.val(text);
                    return false;
                }
                else if(event.keyCode == enter){
                    input.val(
                        box.hide().find('li').eq(selection).data('text')
                    );
                }
                else if(event.keyCode == tab || event.keyCode == esc){
                    hide();
                }
            }
        };
        if($.browser.safari){
            input.keydown(keyhandler);
        }
        else{
            input.keypress(keyhandler);
        }
    };
})(jQuery);
