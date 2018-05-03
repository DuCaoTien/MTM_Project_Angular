/******************* Custom validations ******************
* Description:
* Please start rule with "cv"
* Ex: cvcompare
*********************************************************/

(function () {
    const $Unob = $.validator.unobtrusive;
    const $jQuery = jQuery.validator;
    var setValidationValues = function (options, ruleName, value) {
        options.rules[ruleName] = value;
        if (options.message) {
            options.messages[ruleName] = options.message;
        }
    };

    // Compare two values
    $jQuery.addMethod("cvcompare", function (value, element, params) {
        const testValue = params["propertyvalue"];
        const condition = params["condition"];

        // Not Equal
        if ((condition == "0") && (value != testValue))
            return true;

        // Equal
        if ((condition == "1") && (value == testValue))
            return true;

        // Contain
        if ((condition == "2") && typeof value == "string" && (value.indexOf(testValue) > -1))
            return true;

        // Not Contain
        if ((condition == "3") && typeof value == "string" && (value.indexOf(testValue) < 0))
            return true;

        /*// String start with
        if ((condition == '4') && typeof value == "string" && (value.indexOf(testValue) == 0))
            return true;

        // String end with
        if ((condition == '5') && typeof value == "string" && (value.indexOf(testValue) == (value.length - testValue.length)))
            return true;*/

        return false;
    });

    $Unob.adapters.add("cvcompare", ["propertyvalue", "condition"], function (options) {
        const value = {
            propertyvalue: options.params.propertyvalue,
            condition: options.params.condition
        };
        setValidationValues(options, "cvcompare", value);
    });

    // Validation RequiredIf
    $jQuery.addMethod("cvrequiredif", function (value, element, parameters) {
        const id = "#" + parameters["dependentproperty"];

        // get the target value (as a string,
        // as that's what actual value will be)
        var targetvalue = parameters["targetvalue"];
        targetvalue = (targetvalue == null ? "" : targetvalue).toString();
        const targetValueArray = targetvalue.split("|");
        for (let i = 0; i < targetValueArray.length; i++) {
            // get the actual value of the target control
            // note - this probably needs to cater for more
            // control types, e.g. radios
            const control = $(id);
            const controlType = control.attr("type");

            /*var controlName = control.attr('name');
            var actualValue =
                controlType === 'checkbox' ? element.checked.toString().toLowerCase() :
                    controlType === 'radio' ? $("input[name='" + controlName + "']:radio:checked").val().toString().toLowerCase() :
                        control.val();*/
            let actualValue = control.val();
            if (controlType === "radio" || controlType === "checkbox") {
                actualValue = $("input[name='" + $(id).attr("name") + "']:checked").val().toString().toLowerCase();
            } else {
                if (typeof actualValue === "string") {
                    actualValue = actualValue.replace(/\r/g, "");
                }
            }

            // if the condition is true, reuse the existing
            // required field validator functionality
            if ($.trim(targetValueArray[i]) === $.trim(actualValue) || ($.trim(targetValueArray[i]) === "*" && $.trim(actualValue) !== ""))
                return $.validator.methods.required.call(this, value, element, parameters);
        }

        return true;
    });

    $Unob.adapters.add("cvrequiredif", ["dependentproperty", "targetvalue"], function (options) {
        options.rules["cvrequiredif"] = {
            dependentproperty: options.params["dependentproperty"],
            targetvalue: options.params["targetvalue"]
        };
        options.messages["required"] = options.message;
        options.messages["cvrequiredif"] = options.message;
    });

    // Required values with target values
    $jQuery.addMethod("requiredvalueswithtargetvalues", function (value, element, parameters) {
        const id = "#" + parameters["dependentproperty"];

        // get the target value (as a string,
        // as that's what actual value will be)
        var targetvalue = parameters["targetvalue"];
        targetvalue = (targetvalue == null ? "" : targetvalue).toString();
        const targetValueArray = targetvalue.split("|");
        var inValues = parameters["invalues"];
        inValues = (inValues == null ? "" : inValues).toString();
        const inValuesArray = inValues.split("|");

        // get the actual value of the target control
        // note - this probably needs to cater for more
        // control types, e.g. radios
        const control = $(id);
        const controlType = control.attr("type");

        /*var controlName = control.attr('name');
        var actualValue =
            controlType === 'checkbox' ? element.checked.toString().toLowerCase() :
                controlType === 'radio' ? $("input[name='" + controlName + "']:radio:checked").val().toString().toLowerCase() :
                    control.val();*/

        var actualValue = control.val();

        if (controlType === "radio" || controlType === "checkbox") {
            actualValue = $("input[name='" + $(id).attr("name") + "']:checked").val().toString().toLowerCase();
        } else {
            if (typeof actualValue === "string") {
                actualValue = actualValue.replace(/\r/g, "");
            }
        }

        // debugger;
        for (let i = 0; i < targetValueArray.length; i++) {
            // if the condition is true, reuse the existing
            // required field validator functionality
            if ($.trim(targetValueArray[i]) === $.trim(actualValue) || ($.trim(targetValueArray[i]) === "*" && $.trim(actualValue) !== "")) {
                for (let j = 0; j < inValuesArray.length; j++) {
                    if (value == inValuesArray[j]) {
                        return true;
                    }
                }
                return false;
            }
        }

        return true;
    });

    $Unob.adapters.add("requiredvalueswithtargetvalues", ["invalues", "dependentproperty", "targetvalue"], function (options) {
        options.rules["requiredvalueswithtargetvalues"] = {
            dependentproperty: options.params["dependentproperty"],
            targetvalue: options.params["targetvalue"],
            invalues: options.params["invalues"]
        };
        options.messages["required"] = options.message;
        options.messages["requiredvalueswithtargetvalues"] = options.message;
    });

    // Check box must be checked
    $jQuery.addMethod("cvmustbetrue", function (value, element, param) {
        // check if dependency is met
        if (!this.depend(param, element))
            return "dependency-mismatch";
        return element.checked;
    });

    $Unob.adapters.add("cvmustbetrue", function (options) {
        setValidationValues(options, "cvmustbetrue", true);
    });

    // Validate: text box is no space
    $jQuery.addMethod("cvnospace", function (value, element, param) {
        // check if dependency is met
        if (!this.depend(param, element))
            return "dependency-mismatch";

        if (typeof value == "string" && value.length == 0)
            return true;

        return value != "" && value.indexOf(" ") < 0;
    });

    $Unob.adapters.add("cvnospace", function (options) {
        setValidationValues(options, "cvnospace", true);
    });

    // Override date validation
    $jQuery.addMethod('date',
        function (value, element) {
            if (this.optional(element)) {
                return true;
            }

            var dateFormat = constant.dateFormat ? constant.dateFormat : "DD/MM/YYYY";
            var ok = true;
            try {
                // $.datepicker.parseDate('dd/mm/yy', value);
                var day = moment(value, dateFormat);
            }
            catch (err) {
                ok = false;
            }
            return ok;
        });

    // Validate Date min - max
    $jQuery.addMethod("cvdaterange", function (value, element, params) {
        if (!value) return true;

        // const currentDate = convertToDate(value);
        const currentDate = $.datepicker.parseDate('dd/mm/yy', value);
        const min = new Date(params.min);

        if (params.max && params.max.length > 0) {
            const max = new Date(params.max);

            return currentDate.getTime() >= min.getTime() && currentDate.getTime() <= max.getTime();
        }else {
            return currentDate.getTime() >= min.getTime();
        }
    });

    // override for money
    $jQuery.addMethod('number',
      function (value, element) {
          if (this.optional(element)) {
              return true;
          }
          var ok = false;
          try {
              if ($(element).hasClass("money")) {
                  ok = true;
              } else {
                  ok = /^-?\d+(?:\.\d+)?$/.test(value);
              }
          }
          catch (err) {
              ok = false;
          }
          return ok;
      });

    $jQuery.addMethod('range',
      function (value, element, param) {
          if (this.optional(element)) {
              return true;
          }
          var ok = false;
          try {
              if ($(element).hasClass("money")) {
                  var temp = value.replace(/,/g, "");
                  ok = (Number(temp) >= Number(param[0]) && Number(temp) <= Number(param[1]));
              } else {
                  ok = (Number(value) >= Number(param[0]) && Number(value) <= Number(param[1]));
              }
          }
          catch (err) {
              ok = false;
          }
          return ok;
      });

    $Unob.adapters.add("cvdaterange", ["min", "max"], function (options) {
        const params = {
            min: options.params.min,
            max: options.params.max
        };
        options.rules["cvdaterange"] = params;
        if (options.message) {
            options.messages["cvdaterange"] = options.message;
        }
    });

    function convertToDate(string) {
        const parts = string.split("/");
        const mydate = new Date(parts[2], parts[1] - 1, parts[0]);
        return mydate;
    }
})();