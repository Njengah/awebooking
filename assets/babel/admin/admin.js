const debounce = require('debounce');
const queryString = require('query-string');

(function($) {
  'use strict';


  debounce(() => {

  });

  const awebooking = window.awebooking || {};

  // Create the properties.
  awebooking.utils = {};
  awebooking.instances = {};

  awebooking.utils.flatpickrRangePlugin = require('flatpickr/dist/plugins/rangePlugin.js');

  /**
   * The admin route.
   *
   * @param  {string} route
   * @return {string}
   */
  awebooking.route = function(route) {
    return this.admin_route + route.replace(/^\//g, '');
  };

  /**
   * Show the alert dialog.
   *
   * @return {SweetAlert}
   */
  awebooking.alert = function(message, type = 'error') {
    return swal({
      text: message,
      type: type,
      toast: true,
      buttonsStyling: false,
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonClass: 'button'
    });
  };

  /**
   * Show the confirm message.
   *
   * @return {SweetAlert}
   */
  awebooking.confirm = function(message, callback) {
    if (! window.swal) {
      return window.confirm(message || this.i18n.warning) && callback();
    }

    const confirm = window.swal({
      toast: true,
      text: message || this.i18n.warning,
      type: 'warning',
      position: 'center',
      reverseButtons: true,
      buttonsStyling: false,
      showCancelButton: true,
      cancelButtonClass: 'button',
      confirmButtonClass: 'button button-primary',
      cancelButtonText: this.i18n.cancel,
      confirmButtonText: this.i18n.ok,
    });

    if (callback) {
      return confirm.then(function(result) {
        if (result.value) callback(result);
      });
    }

    return confirm;
  };

  /**
   * Create the dialog.
   *
   * @param  {string} selector
   * @return {Object}
   */
  awebooking.dialog = function(selector) {
    const $dialog = $(selector).dialog({
      modal: true,
      width: 'auto',
      height: 'auto',
      autoOpen: false,
      draggable: false,
      resizable: false,
      closeOnEscape: true,
      dialogClass: 'wp-dialog awebooking-dialog',
      position: { my: 'center', at: 'center center-15%', of: window },
    });

    $(window).resize(debounce(() => {
      $dialog.dialog('option', 'position', { my: 'center', at: 'center center-15%', of: window });
    }, 150));

    return $dialog;
  };

  /**
   * Send a ajax request to a route.
   *
   * @param  {String}   route
   * @param  {Object}   data
   * @param  {Function} callback
   * @return {Object}
   */
  awebooking.ajax = function(method, route, data, callback) {
    return $.ajax({
      url: awebooking.route(route),
      data: data,
      method: method,
      dataType: 'json',
    })
    .done((data) => {
      if(callback) callback(data);
    })
    .fail((xhr) => {
      const json = xhr.responseJSON;

      if (json && json.message) {
        awebooking.alert(json.message, 'error');
      } else {
        awebooking.alert(awebooking.i18n.error, 'error');
      }
    });
  };

  /**
   * Create a form then append to body.
   *
   * @param  {String} link   The form action.
   * @param  {String} method The form method.
   * @return {Object}
   */
  awebooking.createForm = function(action, method) {
    const $form = $('<form>', { 'method': 'POST', 'action': action });

    const hiddenInput = $('<input>', { 'name': '_method',  'type': 'hidden', 'value': method });

    return $form.append(hiddenInput).appendTo('body');
  };

  /**
   * Format the price.
   *
   * @param amount
   * @returns {string}
   */
  awebooking.formatPrice = function(amount) {
    return require('accounting').formatMoney(amount, {
      format: awebooking.i18n.priceFormat,
      symbol: awebooking.i18n.currencySymbol,
      decimal: awebooking.i18n.decimalSeparator,
      thousand: awebooking.i18n.priceThousandSeparator,
      precision: awebooking.i18n.numberDecimals,
    });
  };

  /**
   * Retrieves a modified URL query string.
   *
   * @param {object} args
   * @param {string} url
   */
  awebooking.utils.addQueryArgs =function(args, url) {
    if (typeof url === 'undefined') {
      url = window.location.href;
    }

    const parsed = queryString.parseUrl(url);
    const query  = $.extend({}, parsed.query, args);

    return parsed.url + '?' + queryString.stringify(query, { sort: false });
  };

  $(function() {
    // Init tippy.
    if (window.tippy) {
      window.tippy('.tippy', {
        arrow: true,
        animation: 'shift-toward',
        duration: [200, 150],
      });
    }

    // Init the selectize.
    if ($.fn.selectize) {
      require('./utils/search-customer.js')();

      $('select.selectize, .with-selectize .cmb2_select').selectize({
        allowEmptyOption: true,
        searchField: ['value', 'text'],
      });
    }

    // Init warning before delete.
    $('[data-method="abrs-delete"]').on( 'click', function(e) {
      e.preventDefault();

      const link = $(this).attr('href');
      const message = $(this).data('warning');

      awebooking.confirm(message, function() {
        awebooking.createForm(link, 'DELETE').submit();
      });
    });
  });

  module.exports = function () {

  };

})(jQuery);
