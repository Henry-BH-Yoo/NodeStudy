let slider;

$(function(){
    $("#goUp").on('click' , (e) =>{
        imgSlider.goUp();
    })

    $("#goDown").on('click' , (e) =>{
        imgSlider.goDown();
    });


    $(".my-slider .img").click(function(){
        var imgSrc = $(this).attr('src');
        var imgTitle = $(this).attr('alt');

        $('.img_area > img').attr('src' , imgSrc);
        $('.img_area > img').attr('title' , imgTitle);
        $('.img_area .title').text(imgTitle);
    });

    slider = tns({
        container: '.my-slider',
        items: 2,
        axis: 'vertical',
        swipeAngle : false,
        controls : false,
        nav : false
    });
});

let imgSlider = {
    goUp : function() {
        slider.goTo('prev');

    },
    goDown : function() {
        slider.goTo('next');
    }
}
