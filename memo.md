ecpairとwifを相互変換してみた

　送金するとき署名に秘密鍵を使うが、ググるとどのコードも鍵をWIFという形式で扱っていた。そこで鍵とWIFでそれぞれ相互に復元するコードを書いて動作確認してみた。

<!-- more -->

# ブツ

* [リポジトリ][]

[リポジトリ]:https://github.com/ytyaru/Node.js.wif.ecpair.20220930123024

## 実行

```sh
git clone https://github.com/ytyaru/Node.js.wif.ecpair.20220930123024
node index.js
```

## 結果

```sh
公開鍵：032b4f102d9e3b15ba80692d0dd5bdae9cc41c28d5b3231e790f568944efca726e
秘密鍵：b5511e81eebe885ae1329dca8777eff17f5ecbce6f7e58a8519ba3a8ac74efef
WIF：L3JAefkbyUhFmHNcq1Uj4Y7nCksaB3StFkQsUbffQ6Cj5aDGntWn
アドレス：MA7UUaNKabBMCZgAQtsW42q4P3nCX82N1Y
----- WIFから復元する -----
公開鍵：032b4f102d9e3b15ba80692d0dd5bdae9cc41c28d5b3231e790f568944efca726e
秘密鍵：b5511e81eebe885ae1329dca8777eff17f5ecbce6f7e58a8519ba3a8ac74efef
WIF：L3JAefkbyUhFmHNcq1Uj4Y7nCksaB3StFkQsUbffQ6Cj5aDGntWn
アドレス：MA7UUaNKabBMCZgAQtsW42q4P3nCX82N1Y
```

　前半と後半でまったく同じものが作成されたので成功。

# やったこと

1. ランダムに鍵ペアを作成する
	* `鍵ペア = ECPair.makeRandom()`
		* 公開鍵: `key.publicKey.toString('hex')`
		* 秘密鍵: `key.privateKey.toString('hex')`
1. 秘密鍵からwifを作成する
	* `WIF = wif.encode(128, Buffer.from(秘密鍵, 'hex'), true)`
1. wifから鍵ペアを復元する
	* `鍵ペア = ECPair.fromWIF(WIF)`

　ちなみにアドレス作成は以下のように取得する。鍵ペアから公開鍵を取得して`bitcoinjs-lib`のメソッドに渡す。

```javascript
bitcoin.payments.p2pkh({ pubkey: key.publicKey, network }).address
```

## そもそもWIFって何？

　WIFは256桁もある長い10進数値の秘密鍵を、見やすい文字種だけの羅列に変換したものである。

　`Wallet Import Format`の略であり、ウォレットにインポートするとき使う形式。なので署名に必要な秘密鍵を復元できてしまう。取扱には秘密鍵とおなじ厳重さが必要。

* [ビットコインアドレスの秘密鍵は何から出来ている？WIFって？][]

[ビットコインアドレスの秘密鍵は何から出来ている？WIFって？]:https://qiita.com/ilmango/items/99dd384aeedaab606e57

# プロジェクト作成

```sh
NAME=ecpair-wif
mkdir $NAME
cd $NAME
npm init -y
npm i bitcoinjs-lib coininfo wif ecpair tiny-secp256k1
touch index.js
```

　今回は[wif][]パッケージを使うのがポイント。

[wif]:https://www.npmjs.com/package/wif

# コード作成

## index.js

```javascript
const bitcoin = require('bitcoinjs-lib');
const coininfo = require('coininfo');
const wif = require('wif');
const ecpair = require('ecpair');
const tinysecp = require('tiny-secp256k1');

const network = coininfo('MONA').toBitcoinJS();
network.messagePrefix = ''; //hack

const ECPair = ecpair.ECPairFactory(tinysecp)
const key = ECPair.makeRandom()
console.log(`公開鍵：${key.publicKey.toString('hex')}`)
console.log(`秘密鍵：${key.privateKey.toString('hex')}`)
const privateKey = Buffer.from(key.privateKey.toString('hex'), 'hex')
const WIF = wif.encode(128, privateKey, true)
console.log(`WIF：${WIF}`)
const ADDRESS = bitcoin.payments.p2pkh({ pubkey: key.publicKey, network }).address
console.log(`アドレス：${ADDRESS}`)

console.log(`----- WIFから復元する -----`)
fromWif(WIF)
function fromWif(w) {
    const sameKey = ECPair.fromWIF(w)
    console.log(`公開鍵：${sameKey.publicKey.toString('hex')}`)
    console.log(`秘密鍵：${sameKey.privateKey.toString('hex')}`)
    console.log(`WIF：${wif.encode(128, Buffer.from(sameKey.privateKey.toString('hex'), 'hex'), true)}`)
    console.log(`アドレス：${bitcoin.payments.p2pkh({ pubkey: sameKey.publicKey, network }).address}`)
}
```

# 実行

```sh
node index.js
```

# 結果

```sh
公開鍵：032b4f102d9e3b15ba80692d0dd5bdae9cc41c28d5b3231e790f568944efca726e
秘密鍵：b5511e81eebe885ae1329dca8777eff17f5ecbce6f7e58a8519ba3a8ac74efef
WIF：L3JAefkbyUhFmHNcq1Uj4Y7nCksaB3StFkQsUbffQ6Cj5aDGntWn
アドレス：MA7UUaNKabBMCZgAQtsW42q4P3nCX82N1Y
----- WIFから復元する -----
公開鍵：032b4f102d9e3b15ba80692d0dd5bdae9cc41c28d5b3231e790f568944efca726e
秘密鍵：b5511e81eebe885ae1329dca8777eff17f5ecbce6f7e58a8519ba3a8ac74efef
WIF：L3JAefkbyUhFmHNcq1Uj4Y7nCksaB3StFkQsUbffQ6Cj5aDGntWn
アドレス：MA7UUaNKabBMCZgAQtsW42q4P3nCX82N1Y
```

　最初に`ECPair.makeRandom()`で鍵ペアをランダム生成する。そこから秘密鍵を取得してWIFを作成する。

　つぎにWIFから鍵ペアを復元した。ランダム生成したものと全く同じものが復元されたことがわかる。

## `new Buffer()` → `Buffer.from()`

　`new Buffer()`だと警告が出たので`Buffer.from()`を使った。[Buffer][]はNode.jsのライブラリ。

```javascript
const privateKey = new Buffer(key.privateKey.toString('hex'), 'hex')
```
```sh
(node:10326) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
```

[Buffer]:https://nodejs.org/api/buffer.html

# 経緯

　[ブラウザでBTC送金トランザクション (segwit対応)][]などの記事をみて、どうやって送金するのか調べていた。すると必ずWIFというやつが出てくる。しかもそれはコードを実行することで生成するのではなく、外部から文字列リテラルか何かで渡されるものらしい。たぶん秘密鍵みたいなものだと当たりをつけ、JavaScriptでどうやってWIFを取得するのか調査した。

[ブラウザでBTC送金トランザクション (segwit対応)]:https://memo.appri.me/programming/btc-tx-on-browser

