let slider;

$(function(){
    // get Ajax 

    $.ajax({
        url: '/imgData',
        method : 'post',
        success: function(data) {
            var currentIdx = 0;

            var temp = `<img src="${data.returnValue[0].url}" alt="${data.returnValue[0].title}" class="img"/>';
                    <div class="title">${data.returnValue[0].title}</div>`;

            $(".img_area").html(temp);

            var sdr = '';

            $.each(data.returnValue , function(i, item) {
                sdr += `<div><img src="${item.url }" alt="${item.title}" class="img"></div>`
            });


            $(".my-slider").html(sdr);

            slider = tns({
                container: '.my-slider',
                items: 2,
                axis: 'vertical',
                swipeAngle : false,
                controls : false,
                nav : false
            });
        
            $(".my-slider .img").click(function(){
                var imgSrc = $(this).attr('src');
                var imgTitle = $(this).attr('alt');
        
                $('.img_area > img').attr('src' , imgSrc);
                $('.img_area > img').attr('title' , imgTitle);
                $('.img_area .title').text(imgTitle);
            });

            $("#goUp").on('click' , (e) =>{
                slider.goTo('prev');
            })
        
            $("#goDown").on('click' , (e) =>{
                slider.goTo('next');
            });        


            $("#goNext").on('click' , function(){
                currentIdx++;

                if(currentIdx == 10) {
                    currentIdx = 0;
                }

                $('.img_area > img').attr('src' , data.returnValue[currentIdx].url);
                $('.img_area > img').attr('title' , data.returnValue[currentIdx].title);
                $('.img_area .title').text(data.returnValue[currentIdx].title);
            });

        }
    });




});
