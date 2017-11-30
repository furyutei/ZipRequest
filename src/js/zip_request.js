( function () {

'use strict';

if ( typeof browser == 'undefined' ) { window.browser = chrome; }

let USER_AGENT = navigator.userAgent.toLowerCase(),
    IS_EDGE = ( 0 <= USER_AGENT.indexOf( 'edge' ) ),
    IS_FIREFOX = ( 0 <= USER_AGENT.indexOf( 'firefox' ) ),
    IS_CHROME = ( ( ! IS_EDGE ) && ( 0 <= USER_AGENT.indexOf( 'chrome' ) ) );


window.ZipRequestPromise = class {
    constructor() {
        let self = this;
        
        self.__init__();
    } // end of constructor()
    
    
    open() {
        let self = this;
        
        return new Promise( ( resolve, reject ) => {
            self.__init__();
            
            self.opened = true;
            
            browser.runtime.sendMessage( {
                type : 'ZIP_OPEN'
            }, function ( response ) {
                if ( response.error ) {
                    self.__error__( 'ZIP_OPEN', response.error, reject );
                    return;
                }
                
                if ( ! self.opened ) {
                    self.__error__( 'ZIP_OPEN', 'not opened', reject );
                    return;
                }
                self.zip_id = response.zip_id;
                resolve();
            } );
            
        } );
    } // end of open()
    
    
    file( file_info ) {
        let self = this;
        
        return new Promise( ( resolve, reject ) => {
            if ( ! self.opened ) {
                self.__error__( 'file()', 'not opened', reject );
                return;
            }
            
            if ( ( file_info.zip_options ) && ( file_info.zip_options.date ) && ( typeof file_info.zip_options.date.getTime == 'function' ) ) {
                // sendMessage() では、JSON シリアライズ不可なオブジェクトは送信できないので（例外もあり？）、変換が必要
                file_info.zip_options.date = file_info.zip_options.date.getTime();
            }
            
            browser.runtime.sendMessage( {
                type : 'ZIP_FILE',
                zip_id : self.zip_id,
                file_info : file_info
            }, function ( response ) {
                if ( response.error ) {
                    self.__error__( 'ZIP_FILE', response.error, reject );
                    return;
                }
                
                self.__success__( response, resolve );
            } );
        } );
        return self;
    } // end of file()
    
    
    generate( url_scheme ) {
        let self = this;
        
        return new Promise( ( resolve, reject ) => {
            if ( ! self.opened ) {
                self.__error__( 'generate()', 'not opened', reject );
                return;
            }
            
            if ( url_scheme ) {
                self.url_scheme = url_scheme;
            }
            browser.runtime.sendMessage( {
                type : 'ZIP_GENERATE',
                zip_id : self.zip_id,
                zip_parameters : {
                    url_scheme : self.url_scheme
                }
            }, function ( response ) {
                let zip_url, zip_content;
                
                if ( response.error ) {
                    self.__error__( 'ZIP_GENERATE', 'not opened', reject );
                    return;
                }
                
                if ( response.zip_url ) {
                    // Chrome や Edge の場合、Blob オブジェクトの受け渡しは不可
                    // → background(zip_worker.js) 側で予め変換しておく
                    
                    // TODO: Edge の場合、Blob URL にすると content_scripts 側でダウンロードできない
                    zip_url = response.zip_url;
                    
                    if ( IS_FIREFOX && ( self.url_scheme == 'blob' ) ) {
                        // background(zip_worker.js) 側で Blob URL に変換した場合、Firefox ではダウンロードできなくなってしまう
                        // → Blob URL を Blob として取得しなおしてから、再度 Blob URL に変換すると、ダウンロードできるようになる
                        fetch( zip_url )
                        .then( response => response.blob() )
                        .then( blob => {
                            self.__success__( {
                                zip_url : URL.createObjectURL( blob )
                            }, resolve );
                        } )
                        .catch( error => {
                            self.__error__( 'ZIP_GENERATE: fetch()', error, reject );
                        } );
                        return;
                    }
                }
                else {
                    // background(zip_worker.js) 側で Blob URL に変換した場合、Firefox ではダウンロードできなくなってしまう
                    // → content_scripts 側で変換
                    zip_content = response.zip_content
                    zip_url = ( self.url_scheme == 'data' ) ? ( 'data:application/octet-stream;base64,' + zip_content ) : URL.createObjectURL( zip_content );
                }
                
                self.__success__( {
                    zip_url : zip_url
                }, resolve );
            } );
        } );
    } // end of download()
    
    
    close() {
        let self = this;
        
        return new Promise( ( resolve, reject ) => {
            if ( ! self.opened  ) {
                self.__error__( 'close()', 'not opened', reject );
                return;
            }
            
            self.opened = false;
            
            if ( self.zip_id ) {
                browser.runtime.sendMessage( {
                    type : 'ZIP_CLOSE',
                    zip_id : self.zip_id
                }, function ( response ) {
                    if ( response.error ) {
                        self.__error__( 'ZIP_CLOSE', 'not opened', reject );
                        return;
                    }
                    self.__success__( response, resolve );
                } );
                self.zip_id = null;
            }
            else {
                self.__success__( { result : 'OK' }, resolve );
            }
        } );
    } // end of open()
    
    
    __init__() {
        let self = this;
        
        self.zip_id = null;
        self.opened = false;
        self.last_error = null;
        self.url_scheme = 'blob';
        self.file_counter = 0;
        self.waiting_file_infos = [];
        self.download_request = false;
        
        return self;
    } // end of __init__()
    
    
    __success__( result, resolve ) {
        let self = this;
        
        if ( typeof resolve == 'function' ) {
            resolve( result );
        }
        else {
            return result;
        }
    } // end of __success__()
    
    
    __error__( message, error, reject ) {
        let self = this,
            result = {
                message : message,
                error : error
            };
        
        console.error( message, error );
        
        if ( typeof reject == 'function' ) {
            reject( result );
        }
        else {
            return result;
        }
    } // end of __error__()

}; // end of ZipRequestPromise()

window.ZipRequest = window.ZipRequestPromise;

} )();
