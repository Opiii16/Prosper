import React from 'react'
import {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'



const Signin = () => {
  const[email,setEmail] = useState("")
  const[password,setPassword] = useState("")
  const[loading,setLoading]= useState("")
  const[success,setSuccess] = useState("")
  const[error,setError] = useState("")
  const navigate = useNavigate()

  const submit = async(e) => {
    e.preventDefault()
    setLoading("Please wait...")
    try{
      //create form data
      const data =new FormData()
      data.append("email",email)
      data.append("password",password)

      const response =await axios.post("https://oprahjane16.pythonanywhere.com/api/signin",data)

      setLoading("")

      if(response.data.user){
        setSuccess("Login Success")


        //to do save the details to local storage
        localStorage.setItem("user",JSON.stringify(response.data.user))

        navigate('/')

      }else{
        setError("Login Failed")
      }
    }
    catch(error){
      setLoading("")
      setError("Something went wrong!")
    }


  }

  return (
    <div className='row justify-content-center p-4`'>
      <div className="col-md-6 card shadow mt-3">
        <form onSubmit={submit} >
        <h2>Sign In</h2>
          {loading}
          {success}
          {error}
        <input type="email"
        placeholder='Your Email'
        className='form-control mb-3'
        value={email}
        onChange={(e)=>setEmail(e.target.value)} 
        required
        />


        <input type="password"
        placeholder='Password'
        className='form-control mt-3,'
        value={password}
        onChange={(e)=>setPassword(e.target.value)} 
        required
        />
        <button type="submit"
        className='btn btn-info my-3 px-5'
        >SignIn </button>
        </form>
      </div>
        
      
    </div>
  )
}

export default Signin
