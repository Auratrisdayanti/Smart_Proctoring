var predictions = null;

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

function appendImage(name, base64_img, imgId) {
    let urlImage = (base64_img === null) ? 'assets/face-not-found.jpg': `data:image/jp;base64,${base64_img}`;
    $('#img-list').append(`
    <li>
        <a href="#" class="preventHref" style="background-image: url('${urlImage}')" data-img-id="${imgId}"></a>
        <div class="details">
            <h3>${name}</h3>
        </div>
    </li>
    `);
}

function appendSummary(name, confident) {
    $('#summary').append(`
        <li class="list-items" data-aos="fade-left" data-aos-delay="200">
            <a href="#" class="preventHref">${name}</a>
            <span>${confident}%</span>
        </li>
    `);
}

function getImagePrediction(imgId) {
    if (predictions == null) {
        console.log('Predictions is null');
        return false
    }
    let predict = predictions[imgId];
    let result = `img: ${predict.name}\r\n`;
    result += "prediction:\r\n";
    let sortedPredict = Object.entries(predict.predict).sort(([, a], [, b]) => b - a);
    sortedPredict.forEach(([emotion, confident]) => {
        result += `${emotion}: ${roundToTwo(confident*100)}%\r\n`;
    });

    alert(result);
}


$(document).ready(function() {
    
	$(document).on('click', '.preventHref', function () {
        return false;
    });

    $(document).on('click', '#img-list > li > a', function () {
        let imgId = $(this).data("img-id");
        getImagePrediction(imgId);
    });

    // $('#img-list > li > a').click(function () {
    //     getImagePrediction(1);
    // });

    $("#img-form").on("submit", function (event) {
        event.preventDefault();
        emptyResult();
        $("#submit").attr("disabled", true);
        var form_data = new FormData();

        // Read selected files
        var totalfiles = document.getElementById('files').files.length;
        for (var index = 0; index < totalfiles; index++) {
            form_data.append("image", document.getElementById('files').files[index]);
        }

        $("#img-form")[0].reset();

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
                
                predictions = response.predictions;
                predictions.forEach((element, idx) =>{
                    let name = element.name;
                    let base64_img = element.image;
                    // console.log(name);
                    appendImage(name, base64_img, idx);
                });

                let summary = response.summary;
                let sortedSummary = Object.entries(summary).sort(([, a], [, b]) => b - a);

                sortedSummary.forEach(element => {
                    let name = element[0];
                    let confident = roundToTwo(element[1] * 100);
                    appendSummary(name, confident)
                });
                
            },
            complete: function () {
                $("#submit").attr("disabled", false);
            }
        });
    })

    // $('#submitt').click(function(event) {
    //     event.preventDefault();   
    // });

    
});
