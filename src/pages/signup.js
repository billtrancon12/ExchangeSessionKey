import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { encrypt_data, signData, validate_email, validate_pass_syntax } from '../utility';
import '../css/signup.css';

import {
  MDBBtn,
  MDBInput,
  MDBIcon
}
from 'mdb-react-ui-kit';

const SignUpPage = (props) =>  {
  const [email, setEmail] = useState("");
  const [pass, setPassword] = useState("");
  const [repass, setRePassword] = useState("");
  const [goodPassword, setGoodPassword] = useState(false);
  const [togglePasswordText, setTogglePasswordText] = useState("Click to Show");
  const [toggleRePasswordText, setToggleRePasswordText] = useState("Click to Show");
  const BACK_END_URL = process.env.REACT_APP_BACK_END_API;

  function handleChangeEmail(e){
    setEmail(e.target.value);
  }
  
  function handleChangePassword(e){
    setPassword(e.target.value);
  }

  function handleChangeRePassword(e){
    setRePassword(e.target.value);
  }

  useEffect(()=>{
    if(props.secretKey !== undefined && props.secretKey !== null){
      let password_validate = validate_pass_syntax(pass);
    
      // password_validate will have an array of status as follow
      // [length, up, low, spec, digit]
      if(!password_validate[0]){
        document.getElementById('password_length').classList.add("signup_password_invalid");
        document.getElementById('password_length').classList.remove("signup_password_valid"); 
      }
      if(!password_validate[1]){
        document.getElementById('password_upper').classList.add("signup_password_invalid");
        document.getElementById('password_upper').classList.remove("signup_password_valid");
      }
      if(!password_validate[2]){
        document.getElementById('password_lower').classList.add("signup_password_invalid");
        document.getElementById('password_lower').classList.remove("signup_password_valid");
      }
      if(!password_validate[3]){
        document.getElementById('password_spec').classList.add("signup_password_invalid");
        document.getElementById('password_spec').classList.remove("signup_password_valid");
      }
      if(!password_validate[4]){
        document.getElementById('password_digit').classList.add("signup_password_invalid");
        document.getElementById('password_digit').classList.remove("signup_password_valid");
      }

      if(password_validate[0]){
        document.getElementById('password_length').classList.add("signup_password_valid");
        document.getElementById('password_length').classList.remove("signup_password_invalid"); 
      }
      if(password_validate[1]){
        document.getElementById('password_upper').classList.add("signup_password_valid");
        document.getElementById('password_upper').classList.remove("signup_password_invalid");
      }
      if(password_validate[2]){
        document.getElementById('password_lower').classList.add("signup_password_valid");
        document.getElementById('password_lower').classList.remove("signup_password_invalid");
      }
      if(password_validate[3]){
        document.getElementById('password_spec').classList.add("signup_password_valid");
        document.getElementById('password_spec').classList.remove("signup_password_invalid");
      }
      if(password_validate[4]){
        document.getElementById('password_digit').classList.add("signup_password_valid");
        document.getElementById('password_digit').classList.remove("signup_password_invalid");
      }

      if(password_validate[0] && password_validate[1] && password_validate[2] && password_validate[3] && password_validate[4]){
        setGoodPassword(true);
      }
      else setGoodPassword(false);
    }
  }, [pass, props.secretKey])

  function handleSubmit(){
    document.getElementById('root').classList.toggle('loading');
    if(pass !== repass){
      toast("The password does not match!");
    }
    else if(!validate_email(email)){
      toast("The email is not in correct syntax");
    }
    else if(!goodPassword){
      toast("Password format is not correct");
    }
    else{
      var dataToSend = JSON.stringify({
        email: email,
        password: CryptoJS.SHA256(pass).toString()
      })
      var encryptedData = encrypt_data(dataToSend, props.secretKey, props.iv);
      axios.post(`${BACK_END_URL}/signup`, {
        data: encryptedData,
        id: props.sessionID,
        signature: signData(encryptedData, props.secretKey)
      }).then(res => {
        const res_data = res.data
        if(res.status === 201){
          toast(res_data)
        }
        else{
          toast("Account is created successfully!");
          document.getElementById('root').classList.toggle('loading');
        }
      }).catch(err =>{
        console.log(err);
        if(err.response !== null && err.response !== undefined){
          const err_res = err.response;
          toast(err_res.data);
        }else{
          toast("Something wrong!");
        }
        document.getElementById('root').classList.toggle('loading');
      })
    }
  }

  function togglePassword(){
    if(togglePasswordText === "Click to Show"){
      document.getElementById("password-signup").setAttribute("type", "text");
      setTogglePasswordText("Click to Hide");
    }
    else if(togglePasswordText === "Click to Hide"){
      document.getElementById("password-signup").setAttribute("type", "password");
      setTogglePasswordText("Click to Show");
    }
  }

  function toggleRePassword(){
    if(toggleRePasswordText === "Click to Show"){
      document.getElementById("repassword-signup").setAttribute("type", "text");
      setToggleRePasswordText("Click to Hide");
    }
    else if(toggleRePasswordText === "Click to Hide"){
      document.getElementById("repassword-signup").setAttribute("type", "password");
      setToggleRePasswordText("Click to Show");
    }
  }

  if(props.secretKey !== undefined && props.secretKey !== null){
    return (
      <div className='sign_up_container'>
        <h2 className="fw-bold mb-5 text-center">Sign up now</h2>
        <MDBInput wrapperClass='mb-4' label='Email' id='email-signup' type='email' onChange={(e)=>handleChangeEmail(e)}/>
        <div className='mb-2'>
          <MDBInput style={{"marginBottom": "0.5rem"}} label='Password' id='password-signup' type='password' onChange={(e)=>handleChangePassword(e)}/>
          <div id="password_req_box" style={{'width': 'fit-content', 'margin': '5px'}}>
            <div style={{'fontSize': '14.5px'}}><p id="password_length" className="signup_password_invalid" style={{"margin": '0'}}>Must be 8 characters long</p></div>
            <div style={{'fontSize': '14.5px'}}><p id="password_upper" className="signup_password_invalid" style={{"margin": '0'}}>At least 1 uppercase letter</p></div>
            <div style={{'fontSize': '14.5px'}}><p id="password_lower" className="signup_password_invalid" style={{"margin": '0'}}>At least 1 lowercase letter</p></div>
            <div style={{'fontSize': '14.5px'}}><p id="password_digit" className="signup_password_invalid" style={{"margin": '0'}}>At least 1 digit</p></div>
            <div style={{'fontSize': '14.5px'}}><p id="password_spec" className="signup_password_invalid" style={{"margin": '0'}}>At least 1 special letter</p></div>
          </div>
          <div style={{'width': 'fit-content', 'margin': '5px', 'cursor': 'pointer', 'fontSize': '14.5px'}} onClick={()=>togglePassword()}><p>{togglePasswordText}</p></div>
        </div>
        <div className='mb-5'>
          <MDBInput style={{"marginBottom": "0.5rem"}} label='Re-type Password' id='repassword-signup' type='password' onChange={(e)=>handleChangeRePassword(e)}/>
          <div style={{'width': 'fit-content', 'margin': '5px', 'cursor': 'pointer', 'fontSize': '14.5px'}} onClick={()=>toggleRePassword()}><p>{toggleRePasswordText}</p></div>
        </div>
          
          
        <MDBBtn className='w-100 mb-4' size='md' onClick={()=>handleSubmit()}>sign up</MDBBtn>
        <div className="text-center">
          <p>or sign up with:</p>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: '#1266f1' }}>
            <MDBIcon fab icon='facebook-f' size="sm"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: '#1266f1' }}>
            <MDBIcon fab icon='twitter' size="sm"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: '#1266f1' }}>
            <MDBIcon fab icon='google' size="sm"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: '#1266f1' }}>
            <MDBIcon fab icon='github' size="sm"/>
          </MDBBtn>
        </div>
      </div>
    );
  }
  else{
    return(
      <div>Loading</div>
    )
  }
}

export default SignUpPage;