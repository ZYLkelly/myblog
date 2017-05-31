/**
 * Created by Administrator on 2017/5/27.
 */
function b(){
    h = $(window).height();
    t = $(document).scrollTop();
    if(t > h){
        $('#gotop').show();
    }else{
        $('#gotop').hide();
    }
}
$(document).ready(function(e) {
    b();
    $('#gotop').click(function(){
        $(document).scrollTop(0);
    })
});

$(window).scroll(function(e){
    b();
})