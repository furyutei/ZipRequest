// ZipRequest (zip_request.js) : 1 ファイルずつ順番に ZIP するサンプル

'use strict';

( async function () {

let zip_request = new ZipRequest(),
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


await zip_request.open();

for ( let file of files ) { // files.map( async ( file ) => { ... } ) は使えない（コールバック関数の戻り値が Promise object になり、直列処理されない）
    let url = file.src || file.href,
        filename = get_filename( url ),
        result;
    
    console.log( '[start]', url, filename );
    
    result = await zip_request.file( {
        url : url,
        filename : filename,
        zip_options : {
            date : new Date( '2017-01-01' )
        }
    } )
    .catch( result => { return result } ); // エラーで停止させないための対策
    
    console.log( '[result]', url, filename, result );
}

let response,
    download_link;

response = await zip_request.generate( 'blob' );

await zip_request.close();

download_link = document.createElement( 'a' );
download_link.href = response.zip_url;
download_link.download = zip_filename;
document.documentElement.appendChild( download_link );
download_link.click(); // TODO: MS-Edge では動作しない
download_link.parentNode.removeChild( download_link );

} )();
