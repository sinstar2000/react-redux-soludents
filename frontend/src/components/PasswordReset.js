import React from "react";
import axios from "axios"
import {Input,Button} from "antd"
export const Wrapper = ({children,visible})=> <div style={{padding:'5px 0px 5px 0px',display:visible?'block':'none'}}>
    {children}
</div>


const isValid =(email) => /^[A-Za-z]+([0-9]+)?(\.[A-Za-z]+)?@[a-z]+\.[A-Za-z]+$/.test(email)


class PasswordReset extends React.Component {
    constructor(props){
        super(props)
        this.email = React.createRef()
        this.sendEmail.bind(this)
    }

    sendEmail(email){
        axios.post(`/api/members/password_reset/${email}`).then(
            ({data:{message}})=>alert(message)
        )
    }
    state={email:null,error:null}
    render(){
        const {error} = this.state
        return <div  style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>

                   <Wrapper visible={true}>
                    <h4>
                        Reste ton mot de passe
                        </h4>
                   </Wrapper>

                    <Wrapper visible={true}>
                    <Input placeholder={'enter uour email'} onChange={
                        (evt) => {
                            const email = evt.target.value
                            this.setState(
                                state=>({...state,email})
                            )
                        }
                    } type="email" />
                    </Wrapper>
                    
                    <Wrapper visible={error?true:false}>
                        <p style={{color:'#d00'}}>
                            {error && error}
                        </p>
                    </Wrapper>

                    <Wrapper visible={true}>
                        <Button onClick ={
                            ()=>{
                                if(isValid(this.state.email)){
                                    this.setState(
                                        state=>({...state,error:null})
                                    )

                                    this.sendEmail(this.state.email)
                                }
                                else
                                    this.setState(
                                        state=>({...state,error:'please enter valid email'})
                                    )
                            }
                        }
                        type={'primary'}
                        style={{width:'100%'}}
                        >
                        Soumettre
                        </Button>
                    </Wrapper>    
                </div>
        </div>
    }
}

export default PasswordReset