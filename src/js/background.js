// background スクリプト (background.js) サンプル
//-----------------------------------------------
// ・アプリケーション毎の処理を記述すること
//
// ・ manifest.json にて、
//      "background": {
//          "scripts": [ "js/jszip.min.js", "js/zip_worker.js", "js/background.js" ],
//      },
//   のように、jszip.min.js および zip_worker.js の後に記述すること

( function () {

'use strict';

if ( typeof browser == 'undefined' ) { window.browser = chrome; }


function message_handler( message, sender, sendResponse ) {
    //：
    // ※ここに任意の処理を記述
    //
    //【注意】
    //   処理中で sendResopnse() をコールした場合、zip_request_handler() を呼ばずに return すること!!
    //：
    
    // ZipRequest より受信したメッセージの処理
    // message.type: 'ZIP_OPEN' | 'ZIP_FILE' | 'ZIP_GENERATE' | 'ZIP_CLOSE'
    let flag_async = zip_request_handler( message, sender, sendResponse );
    
    return flag_async;
} // end of message_handler()


browser.runtime.onMessage.addListener( message_handler );
// ※ onMessage リスナは一つだけ記述すること
// 参考：[chrome.runtime - Google Chrome](https://developer.chrome.com/extensions/runtime#event-onMessage)
//  | If you have more than one onMessage listener in the same document, then only one may send a response.

} )();
