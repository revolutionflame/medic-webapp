(function () {

  'use strict';

  var validateMessage = function(message) {
    return {
      valid: !!message,
      message: 'Please include a message.'
    };
  };

  var validatePhoneNumber = function(data) {
    var phoneValidationRegex = /.*?(\+?[\d]{5,15}).*/;
    var contact = data.doc.contact;
    return data.everyoneAt || (
      contact && phoneValidationRegex.test(contact.phone)
    );
  };

  var validatePhoneNumbers = function(recipients) {

    // recipients is mandatory
    if (!recipients || recipients.length === 0) {
      return {
        valid: false,
        message: 'Please include a valid phone number, ' +
                 'e.g. +9779875432123'
      };
    }

    // all recipients must have a valid phone number
    var errors = _.filter(recipients, function(data) {
      return !validatePhoneNumber(data);
    });
    if (errors.length > 0) {
      var errorRecipients = _.map(errors, function(error) {
        return formatContact(error);
      }).join(', ');
      return {
        valid: false,
        message: 'These recipients do not have a valid ' + 
                 'contact number: ' + errorRecipients
      };
    }

    return {
      valid: true,
      message: '',
      value: recipients
    };
  };

  var updateValidationResult = function(fn, elem, value) {
    var result = fn.call(this, value);
    elem.closest('.control-group')
        .toggleClass('error', !result.valid)
        .find('.help-block')
        .text(result.valid ? '' : result.message);

    return result.valid;
  };

  var validateSms = function($phoneField, $messageField) {

    var phone = updateValidationResult(
        validatePhoneNumbers,
        $phoneField, 
        $phoneField.select2('data')
    );
    var message = updateValidationResult(
        validateMessage, 
        $messageField, 
        $messageField.val().trim()
    );

    return phone && message;

  };

  var formatContact = function(row) {
    if (row.everyoneAt) {
      return 'Everyone at ' + row.doc.name;
    }
    var name = row.doc.name,
        contact = row.doc.contact,
        contactName = contact && contact.name,
        code = contact && contact.rc_code,
        phone = contact && contact.phone;
    return _.compact([name, contactName, code, phone]).join(', ');
  };

  exports.init = function() {

    var el = $('#send-message [name=phone]');

    el.parent().show();

    el.select2({
      multiple: true,
      allowClear: true,
      formatResult: formatContact,
      formatSelection: formatContact,
      query: function(options) {
        var vals = options.element.data('options');
        var terms = options.term.toLowerCase().split(/w+/);
        var matches = _.filter(vals, function(val) {
          var contact = val.doc.contact;
          var name = contact && contact.name;
          var phone = contact && contact.phone;
          var tags = [ val.doc.name, name, phone ].join(' ').toLowerCase();
          return _.every(terms, function(term) {
            return tags.indexOf(term) > -1;
          });
        });
        matches.sort(function(a, b) {
          var aName = a.everyoneAt ? a.doc.name + 'z' : formatContact(a);
          var bName = b.everyoneAt ? b.doc.name + 'z' : formatContact(b);
          return aName.toLowerCase().localeCompare(bName.toLowerCase());
        });
        options.callback({ results: matches });
      },
      createSearchChoice: function(term, data) {
        if (/^\+?\d*$/.test(term) && data.length === 0) {
          return {
            id: term,
            doc: {
              contact: {
                phone: term
              }
            }
          };
        }
      }
    });

  };

  exports.validate = function(callback) {

    if ($('#send-message').find('.submit [disabled]').length) {
      return;
    }

    var $modal = $('#send-message');
    var $phone = $modal.find('[name=phone]');
    var $message = $modal.find('[name=message]');

    if (!validateSms($phone, $message)) {
      return;
    }

    callback($phone.select2('data'), $message.val().trim());
  };

}());