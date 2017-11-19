// ZipRequestLegacy (zip_request_legacy.js) : 1 ファイルずつ順番に ZIP するサンプル

'use strict';

( function () {

var zip_request = new ZipRequest(),
    file_counter = 0,
    file_limit = 20,
    files = Array.prototype.slice.call( document.querySelectorAll( 'img[src]' ) )
        .filter( img => {
            return ( img.src && /\.(?:gif|jpe?g|png|svg)$/.test( img.src ) );
        } )
        .slice( 0, file_limit ),
    zip_filename = 'sample.zip';


function get_filename( url ) {
    return 'sample/' + ( '00' + ( ++ file_counter ) ).slice( -3 ) + '-' + decodeURIComponent( url ).replace( /^.*?([^\/.]+\.[^\.]+)$/, "$1" );
} // end of get_filename()


zip_request.open( function ( result ) {
    var file_index = 0;
    
    function zip_files() {
        if ( files.length <= file_index ) {
            zip_request.generate( 'blob', function ( response ) {
                zip_request.close();
                
                var download_link = document.createElement( 'a' );
                
                download_link.href = response.zip_url;
                download_link.download = zip_filename;
                document.documentElement.appendChild( download_link );
                download_link.click(); // TODO: MS-Edge で動作しない
                download_link.parentNode.removeChild( download_link );
            } );
            return;
        }
        
        var file = files[ file_index ++ ],
            url = file.src || file.href,
            filename = get_filename( url );
        
        console.log( '[start]', url, filename );
        
        zip_request.file( {
            url : url,
            filename : filename,
            zip_options : {
                date : new Date( '2017-01-01' )
            }
        }, function ( result ) {
            console.log( '[result]', url, filename, result );
            
            zip_files();
        } );
    }
    
    zip_files();
} );

} )();
