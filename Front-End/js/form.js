$(document).ready(function() {

    $('#submit').click(function() {

        var form_data = new FormData();

        // Read selected files
        var totalfiles = document.getElementById('files').files.length;
        for (var index = 0; index < totalfiles; index++) {
            form_data.append("image", document.getElementById('files').files[index]);
        }

        // AJAX request
        $.ajax({
            url: 'http://127.0.0.1:5000/api/predict',
            type: 'post',
            data: form_data,
            dataType: 'json',
            contentType: false,
            processData: false,
            success: function(response) {

                // for(var index = 0; index < response.length; index++) {
                //     var src = response[index];

                // // Add img element in <div id='preview'>
                //     $('#preview').append('<img src="'+src+'" width="200px;" height="200px">');
                // }
                console.log(response)

            }
        });

    });

});