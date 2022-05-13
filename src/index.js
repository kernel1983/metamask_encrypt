
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
  };
})

