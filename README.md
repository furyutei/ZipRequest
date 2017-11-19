ZipRequest
==========

- License: The MIT license  
- Copyright (c) 2017 風柳(furyu)  
- 対象ブラウザ： Google Chrome、Firefox Quantum

Chrome 拡張機能や Firefox Quantum アドオン(WebExtensions) にて、content\_scripts から background に要求を出して ZIP 化するためのライブラリ。  
content\_scripts 側 から URL とファイル名を指定してやると、backgound で当該ファイルを取得して ZIP 化してくれる。  

**[注] Promise の使い方を練習したり、拡張機能について調べるついでに作った習作であり、細かい動作確認はほとんど行っていない。**  


■ ライブラリファイル
---
[content\_scripts 側]  

- src/js/zip\_request.js (Promise 対応版)  
- src/js/zip\_request\_legacy.js (コールバック版)  
※ いずれかひとつを読み込むこと  

[background 側]  

- src/js/zip\_worker.js (共通)  


■ 使い方
---
サンプル（src/manifest\*.json, src/test/test\_zip\_request\_\*.js）参照。  

**[注] サンプルは、はてなブログに行くと自動的に画像をZIP化してダウンロードするという、うざいもの。実際の使用は控えるのが無難。**  


■ 外部ライブラリなど
---
- [JSZip](https://stuk.github.io/jszip/)  
