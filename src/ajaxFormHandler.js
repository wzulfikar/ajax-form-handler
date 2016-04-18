(function($){

"use strict";

var ajaxFormHandler = function(e){

  e.preventDefault();

  var
  $form     = $(this),
  $required = $form.find('[required]'),
  ajaxId    = $form.data('ajax-id'),
  hasEmpty  = false,
  events    = {
    error       : 'ajax.' + ajaxId + '.error',
    success     : 'ajax.' + ajaxId + '.success', 
    always      : 'ajax.' + ajaxId + '.always',
    beforeSend  : 'ajax.' + ajaxId + '.beforeSend',
  },

  // toggle button to indicate processing request
  $toggleProcessing = $form.find('[data-toggle-processing="true"]'),
  originalText      = $toggleProcessing.text();

  // set default functions
  var defaultFns = {
    abort:function(xhr){
      xhr.abort();
      $form.fn.processing.hide();
    },
    redirect:function(url){
      window.location.replace(url);
    },
    processing:{
      show:function(){
        $toggleProcessing
          .text('Processing request..')
          .attr('disabled', 'disabled');
      },
      hide:function(){
        $toggleProcessing
          .text(originalText)
          .removeAttr('disabled');
      },
    },
    alert: {
      success:function(msg){
        alert(msg);
      },
      error:function(msg){
        alert(msg);
      },
    }
  };
  // attach default functions to $form
  $form.fn = $.extend( {}, defaultFns, $.fn.ajaxFormHandler.fns);

  // check if value of any required input is empty
  $required.each(function(){
    if(!$(this).val().trim().length){
      $form.fn.alert.error($(this).attr('name') + ' can\'t be empty.');
      $(this).focus();
      hasEmpty = true;
      return;
    }
  });

  // abort if value of any required input is empty
  if(hasEmpty) 
    return;
  
  // here is where we send the form, actually
  $.ajax({
    method:$form.attr('method'),
    url   :$form.attr('action'),
    data  :$form.serialize(),
    beforeSend:function(xhr){
      // trigger beforeSend event,
      // you may hook to this event for data validation.
      // 
      // sample code to abort:
      // xhr.abort();
      // $form.fn.processing.hide();
      $form.fn.processing.show();

      var inputs = $form.serializeArray();
      $form.trigger(events.beforeSend, [xhr, $form, inputs]);
    },
    success:function(data, textStatus, jqXHR){
      // trigger success event
      $form.trigger(events.success, [$form, data]);

      $form.fn.processing.hide();
    },
    error:function(jqXHR, textStatus, errorThrown){
      var msg = 'Error ' + jqXHR.status + ' : ' + errorThrown + '.';
      
      $form.fn.alert.error(msg);

      // trigger error event
      $form.trigger(events.error, [$form, jqXHR]);
      $form.fn.processing.hide();
    },
  });
};

// setup ajaxFormHandler plugin
$.fn.ajaxFormHandler = function(){
  // ajax form handler
  $(document).on('submit', 'form[data-ajax-id]', ajaxFormHandler);
};

// init ajaxFormHandler
$.fn.ajaxFormHandler();

}(jQuery));