 $(document).ready(function () {
        $("#feedbackBody").find("#spnError").hide();

        $('#FeedbackModal').on('hidden.bs.modal',
            function(e) {
                $("#feedbackBody").find("#spnError").hide();

                $("#feedbackBody").find('#txtfeedback').val("");
            });

        $('#FeedbackModal').on('shown.bs.modal',
            function(e) {
                $("#feedbackBody").find('#txtfeedback').focus();
            });
    });

 function submitFeedbackForm() {
     var urlSubmit = apiUrl.widget.giveFeedback;

     var text = $("#feedbackBody").find('#txtfeedback').val();
     var requestData = {
         feedback: text
     };

     var successCallback = function(response) {
         console.log(response);

         $("#FeedbackModal").modal("hide");

         $("#FeedbackSuccessModal").modal();
     };

     var errorCallback = function(response) {
         console.log(response);
     };

     if (text.length > 0) {
         // submit
         $.ajax({
             type: "POST",
             url: urlSubmit,
             data: requestData,
             success: function(response) {
                 return successCallback(response);
             },
             error: function(response) {
                 errorCallback(response);
             },
             beforeSend: function() {
                 showAjaxLoadingMask();
             },
             complete: function() {
                 hideAjaxLoadingMask();
             }
         });
     } else {
         $("#feedbackBody").find("#spnError").show();
     }
 }