# MARKUP: <input name="foo" type="text" title="suggest" />
# var settings = {};
# $('input[title*=suggest]').suggest(['foo','bar','baz'], settings);

$.fn.extend
  suggest: (data, settings) ->
    @each ->
      $this = $(@)
      self = $.suggest
      $.data @, 'suggestions', data
      $.extend self.settings, settings if settings
      $this.on 'focus.suggest', ->
        $(document).on 'keyup.suggest'  , { msg: @ }, self.keyup
        $(document).on 'keydown.suggest', { msg: @ }, self.keydown

      $this.on 'focusout.suggest', ->
        do $.suggest.clear
        $(document).off 'keyup.suggest'
        $(document).off 'keydown.suggest'

$.extend $.suggest = {},
  settings:
    css:
      'position'        : 'absolute'
      'margin'          : 0
      'padding'         : '3px'
      'listStyleType'   : 'none'
      'color'           : '#555'
      'z-index'         : 999
      'background-color': '#fff'
      'border-color'    : '#555'
      'border-style'    : 'solid'
      'border-width'    : '1px'
  keyup: (e) ->
    $el = $(e.data.msg)
    [TAB,ENTER,ESC,LEFT,UP,RIGHT,DOWN] = [9,13,27,37,38,39,40]
    switch e.keyCode
      when ENTER    then $.suggest.select($el.get(0))
      when ESC      then do $.suggest.clear
      when UP       then $.suggest.up()   if $.suggest.visible
      when TAB,DOWN then $.suggest.down() if $.suggest.visible
      else
        list = $.data($el.get(0), 'suggestions')
        suggested = $.suggest.matching($el.get(0), list)
        if suggested.length is 0
          do $.suggest.clear
        else
          $.suggest.show($el.get(0), suggested)
  keydown: (e) ->
    [TAB,ENTER] = [9,13]
    switch e.keyCode
      when TAB,ENTER then e.preventDefault() if $.suggest.visible
      else return
  select: (el) ->
    $(el).val $("#jquery-suggest li:eq(#{if $.suggest.index isnt 0 then $.suggest.index - 1 else 0})").text()
    do $.suggest.clear
  up: ->
    $.suggest.index-- if $.suggest.index > 1
    $.suggest.highlight()
  down: ->
    $.suggest.index++ if $.suggest.index < $.suggest.size
    $.suggest.highlight()
  highlight: ->
    $("#jquery-suggest li").css({ 'background-color': 'transparent' })
      .eq($.suggest.index - 1)
      .css({ 'background-color': '#C0D9D9' })
  clear: ->
    $('#jquery-suggest').each -> $(@).remove()
    $.suggest.visible = false
    $.suggest.index = 0
    $.suggest.size = 0
  matching: (el, list) ->
    # firefox 에서는 한글입력에 대해서는 key* event 가 발생하지 않는다.
    re = new RegExp $(el).val().replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
    $.grep list, (word, i) -> re.test(word)
  show: (el, items) ->
    do $.suggest.clear
    $el = $(el)
    offset = $el.offset()
    $ul = $('<ul id="jquery-suggest" />')
      .css $.extend
        top: offset.top + $el.height() + 7
        left: offset.left
      , $.suggest.settings.css

    [v,list] = [$el.val(),[]]
    for item in items
      index = item.indexOf(v)
      $em = $("<em>#{v}</em>").css
        'color'      : '#000'
        'font-style' : 'normal'
        'font-weight': 'bold'
      list.push $("<li></li>")
        .append("#{item.slice(0, item.indexOf(v))}")
        .append($em)
        .append("#{item.slice(index + v.length)}")
        .on('hover', ->
          $el.val $(@).text()
          $("#jquery-suggest li").css({ 'background-color': 'transparent' })
          $(@).css { 'background-color': '#C0D9D9' }
        )
      $ul.append(l) for l in list.sort (a, b) -> a.html().indexOf('<') - b.html().indexOf('<')
    $('body').append($ul)
    $.suggest.visible = true
    $.suggest.index = 0
    $.suggest.size = items.length
