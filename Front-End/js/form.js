function roundToTwo(num) {
    num = +(Math.round(num + "e+2")  + "e-2")
    if (isNaN(num)) {
        // console.log(num);
        return 0.0;
    }
    return num;
}

function emptyResult() {
    // empty summary and image
    $('#summary').empty();
    $('.pip').remove();
    $('#img-list').empty();
}

function appendImage(name, base64_img) {
    $('#img-list').append(`
    <li>
        <a href="" style="background-image: url('data:image/jp;base64,${base64_img}')"></a>
        <div class="details">
            <h3>${name}</h3>
        </div>
    </li>
    `);
}

function appendSummary(name, confident) {
    $('#summary').append(`
        <li class="list-items" data-aos="fade-left" data-aos-delay="200">
            <a href="#">${name}</a>
            <span>${confident}%</span>
        </li>
    `);
}

$(document).ready(function() {

    $('#submit').click(function() {
        emptyResult();
        $("#submit").attr("disabled", true);
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

                console.log(response)
                
                let predictions = response.predictions;
                predictions.forEach(element =>{
                    let name = element.name;
                    let base64_img = element.image;
                    // console.log(name);
                    appendImage(name, base64_img);
                });

                let summary = response.summary;
                let sortedSummary = Object.entries(summary).sort(([, a], [, b]) => b - a);

                sortedSummary.forEach(element => {
                    let name = element[0];
                    let confident = roundToTwo(element[1] * 100);
                    appendSummary(name, confident)
                });
                $("#submit").attr("disabled", false);
            }
        });
        
    });
});
