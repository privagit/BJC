$(document).ready( function () {
    $('#reporttype').change(function(){
        if ($(this).val() == 1){
            $('#weightlist').show()
            $('#customerlist').hide()
        }else{
            $('#weightlist').hide()
            $('#customerlist').show()
        }
    }
);
    
} );