import { encrypt } from '@metamask/eth-sig-util';
const ascii85 = require('ascii85');

// Reference:
// https://betterprogramming.pub/exchanging-encrypted-data-on-blockchain-using-metamask-a2e65a9a896c

function encryptData(publicKey, data) {
  // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
  // Each contains data encoded using base64, version is always the same string
  const enc = encrypt({
    publicKey: publicKey.toString('base64'),
    data: ascii85.encode(data).toString(),
    version: 'x25519-xsalsa20-poly1305',
  });

  // We want to store the data in smart contract, therefore we concatenate them
  // into single Buffer
  const buf = Buffer.concat([
    Buffer.from(enc.ephemPublicKey, 'base64'),
    Buffer.from(enc.nonce, 'base64'),
    Buffer.from(enc.ciphertext, 'base64'),
  ]);
  
  // In smart contract we are using `bytes[112]` variable (fixed size byte array)
  // you might need to use `bytes` type for dynamic sized array
  // We are also using ethers.js which requires type `number[]` when passing data
  // for argument of type `bytes` to the smart contract function
  // Next line just converts the buffer to `number[]` required by contract function
  // THIS LINE IS USED IN OUR ORIGINAL CODE:
  // return buf.toJSON().data;
  
  // Return just the Buffer to make the function directly compatible with decryptData function
  return buf;
}


async function decryptData(account, data) {
  // Reconstructing the original object outputed by encryption
  const structuredData = {
    version: 'x25519-xsalsa20-poly1305',
    ephemPublicKey: data.slice(0, 32).toString('base64'),
    nonce: data.slice(32, 56).toString('base64'),
    ciphertext: data.slice(56).toString('base64'),
  };
  // Convert data to hex string required by MetaMask
  const ct = `0x${Buffer.from(JSON.stringify(structuredData), 'utf8').toString('hex')}`;
  // Send request to MetaMask to decrypt the ciphertext
  // Once again application must have acces to the account
  const decrypt = await window.ethereum.request({
    method: 'eth_decrypt',
    params: [ct, account],
  });
  // Decode the base85 to final bytes
  return ascii85.decode(decrypt);
}

window.addEventListener('load', async function () {
  if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    var eth_address = accounts[0];
    
    const ethAccounts = document.getElementById('eth_accounts');
    for(var i in accounts){
      console.log(accounts[i]);
      var div = document.createElement('div');
      div.innerHTML = accounts[i];
      div.id = 'eth_'+accounts[i];
      div.className = 'eth_account';
      ethAccounts.append(div);
    }

    window.ethereum.on('accountsChanged', function (accounts) {
      while (ethAccounts.firstChild) {
        ethAccounts.removeChild(ethAccounts.firstChild);
      }
      eth_address = accounts[0];
      console.log(eth_address);
      for(var i in accounts){
        console.log(accounts[i]);
        var div = document.createElement('div');
        div.innerHTML = accounts[i];
        div.id = 'eth_'+accounts[i];
        div.className = 'eth_account';
        ethAccounts.append(div);
      }
    })

    const public_key = await ethereum.request({ method: 'eth_getEncryptionPublicKey', params: [accounts[0]] });
    console.log(public_key);

    const data = Buffer.from('master secret', 'ascii');
    const encrypted = encryptData(public_key, data);
    console.log(encrypted);

    const decrypted = await decryptData(accounts[0], encrypted);
    console.log(decrypted.toString('ascii'));
  };
})

