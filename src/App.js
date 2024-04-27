import { useEffect, useState } from 'react';
import {JSEncrypt} from 'jsencrypt';
import {useRoutes} from 'react-router-dom';
import CryptoJS from 'crypto-js';
import PublicKey from './public.pem.key';
import PrivateKey from './private.pem.key';
import ServerPublicKey from './serverPublicKey.pem.key';
import axios from 'axios';
import SignUpPage from './pages/signup';
import FormWrapper from './components/FormWrapper';

function App() {
  const [serverPublicKey, setServerPublicKey] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [iv, setIV] = useState(null);
  const [sessionID, setSessionID] = useState(null);
  const BASE_BACKEND_API = process.env.REACT_APP_BACK_END_API;

  useEffect(()=>{
    function decryptAndStoreKey(res){
      const data = res.data;

        var encryptedKey = data.secretKey;
        var encryptedIV = data.ivParameterSpec;
        var encryptedSignature = data.signatureString;

        var decrypt = new JSEncrypt();
        decrypt.setPrivateKey(privateKey);

        const decryptedKey = decrypt.decrypt(encryptedKey);
        const decryptedIV = decrypt.decrypt(encryptedIV);

        const parsedKey = CryptoJS.enc.Base64.parse(decryptedKey);
        const parsedIV = CryptoJS.enc.Base64.parse(decryptedIV);

        var hash = CryptoJS.HmacSHA256(encryptedKey + encryptedIV, parsedKey);
        const hashString = CryptoJS.enc.Base64.stringify(hash);
        
        if(hashString === encryptedSignature){
          setSessionKey(parsedKey);
          setIV(parsedIV);
          setSessionID(res.data.sessionID);
          localStorage.setItem("session ID", res.data.sessionID);
        }
    }
    function exchangeSessionKey(encryptedPingMessage, signature){
      /**
       * Send the ping message to the server to exchange session key
       */
      axios.post(`${BASE_BACKEND_API}/exchange/sessionKey`, {
        pingMessage: encryptedPingMessage, 
        signature: signature
      }).then(res =>{
        decryptAndStoreKey(res);
      }).catch(err =>{
        console.log(err)
      })
    }
    // get the public key client-side
    fetch(PublicKey).then(row => row.text()).then(key => setPublicKey(key));

    // get the private key client-side
    fetch(PrivateKey).then(row => row.text()).then(key => setPrivateKey(key));
    
    // get the public key server-side
    fetch(ServerPublicKey).then(row => row.text()).then(key => setServerPublicKey(key));
    if(localStorage.getItem("session ID") === undefined || localStorage.getItem("session ID") === null){
      // Ping the server to get the session key
      if(sessionKey === null && serverPublicKey !== null && privateKey !== null && publicKey !== null){
        /**
        * Encrypt the ping message
        */
        const pingMessage = "Exchange session key";
        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(serverPublicKey);
        const encryptedPingMessage = encrypt.encrypt(pingMessage);
        /**
        * Sign the ping message
        */
        const sign = new JSEncrypt();
        sign.setPrivateKey(privateKey);
        const signature = sign.sign(encryptedPingMessage, CryptoJS.SHA256, 'sha256');

        exchangeSessionKey(encryptedPingMessage, signature);
      }
    }
    else{
      if(sessionKey === null && serverPublicKey !== null && privateKey !== null && publicKey !== null){
        axios.post(`${BASE_BACKEND_API}/exchange/sessionKeyWithSessionID`, {
          id: localStorage.getItem("session ID")
        }).then(res =>{
          decryptAndStoreKey(res);
        }).catch(err => console.log(err))
      }
    }
  }, [publicKey, privateKey, sessionKey, serverPublicKey, BASE_BACKEND_API, iv])

  const routes = [
    {
      element: <div>Homepage</div>,
      path: '/'
    },
    {
      element: <FormWrapper></FormWrapper>,
      path: '/form',
      children: [{
        element: <SignUpPage secretKey={sessionKey} iv={iv} sessionID={sessionID}></SignUpPage>,
        path: '/form/signUp'
      },{
        element: <div>new form</div>,
        path: '/form/test'
      }]
    },
    {
      element: <div>Not Found 404</div>,
      path: '/*'
    }
  ];
  return useRoutes(routes);
}

export default App;
