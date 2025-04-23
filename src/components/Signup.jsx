import React, { useState ,Link} from 'react';

import axios from 'axios';
import './Signup.css';


const Signup = () => {
  const[username,setUsername] =useState("")
  const[email,setEmail] =useState("")
  const[password,setPassword] =useState("")
  const[phone,setPhone] =useState("")
  const[loading,setLoading]= useState("")
  const[success,setSuccess] = useState("")
  const[error,setError] =useState("")
  const submit = async (e) =>{
    e.preventDefault()
    setLoading("Please wait as we process your details")

    try{
      const data = new FormData()
      data.append("username",username)
      data.append("email",email)
      data.append("password",password)
      data.append("phone",phone)

      const response = await axios.post("https://oprahjane16.pythonanywhere.com/api/signup",data)

      setLoading("")
      setSuccess(response.data.Success)

      
      setUsername("")
      setEmail("")
      setPassword("")
      setPhone("")

    }catch(error){
      setSuccess("")
      setLoading("")
      setError("Ooops sth Happened")

    }
  }
  return (
    <div className='row justify-content-center mt-4'>
      <div className="col-md-6 card shadow p-4">
        <form onSubmit={submit}>
          {loading}
          {success}
          {error}
        <h2>Sign Up</h2>
        <input type="text"
         placeholder='Enter Username' 
         className='form-control '
         value={username}   
         onChange={(e)=>setUsername(e.target.value)} 
         required     
         /> 
         
         <br />

        <input type="email" 
        placeholder='Enter Email'
        className='form-control mt-3'
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        required
        
        />
        
        <br />


        <input type="password" 
        placeholder='Enter password '
        className='form-control mt-3'
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        required
        
        /> 
        
         <br />

        <input type="tel" 
        placeholder='Enter Tel no' 
        className='form-control mt-3'
        value={phone}
        onChange={(e)=>setPhone(e.target.value)}
        required
        
        />
        <button type='submit'className='btn btn-primary my-3 px-5'
        >Sign Up 🚀</button>
        <p>
        Already have an account?
        <Link to='Sign in'>Sign In</Link>

        </p>
        </form>


        
      </div>
       

      
    </div>
  )
}

export default Signup
