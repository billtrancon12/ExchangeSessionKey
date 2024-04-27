import { MDBCard, MDBCardBody, MDBContainer} from "mdb-react-ui-kit"
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";

const FormWrapper = () =>{
    return(
        <MDBContainer fluid>
            <div className="p-5 bg-image" style={{backgroundImage: 'url(https://mdbootstrap.com/img/new/textures/full/171.jpg)', height: '300px'}}></div>
            <MDBCard className='mx-5 mb-5 p-5 shadow-5' style={{marginTop: '-100px', background: 'hsla(0, 0%, 100%, 0.8)', backdropFilter: 'blur(30px)'}}>
                <MDBCardBody className='p-5'>
                    <Outlet/>
                </MDBCardBody>
            </MDBCard>
            <ToastContainer></ToastContainer>
        </MDBContainer>
    )
}

export default FormWrapper;