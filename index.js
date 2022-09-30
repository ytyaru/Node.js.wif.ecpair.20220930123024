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
//const privateKey = new Buffer(key.privateKey.toString('hex'), 'hex')
/* new Buffer() だと警告が出たので Buffer.from() を使う
(node:10326) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
*/
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
/*
const sameKey = ECPair.fromWIF(WIF)
console.log(`公開鍵：${sameKey.publicKey.toString('hex')}`)
console.log(`秘密鍵：${sameKey.privateKey.toString('hex')}`)
console.log(`WIF：${wif.encode(128, Buffer.from(sameKey.privateKey.toString('hex'), 'hex'), true)}`)
console.log(`アドレス：${bitcoin.payments.p2pkh({ pubkey: sameKey.publicKey, network }).address}`)
*/

