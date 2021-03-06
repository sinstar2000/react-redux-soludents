import React from "react";
import "./index.css";
import {
  Avatar,
  Button,
  Row,
  Col,
  Card,
  List,
  Collapse,
  Icon,
  Input,
  Divider,
  Modal,
  Radio,
  Table,
  Progress,
} from "antd";

import Checkout from "../../Stripe/Checkout"
import { customPanelStyle } from "./const";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import {
  addDentist,
  UpdateDentistByAdmin,
  UpdateDentistSubscriptionByadmin,
  UpdateOpertorByAdmin,
  UpdateAdminPassword
} from "../../../actions/authentication";
import axios from "axios";
import { CSVLink } from "react-csv";
import {message} from "../../../components/alerts"
import {data_billing} from "./../../subLocal"
import { relativeTimeThreshold } from "moment";

const RadioGroup = Radio.Group;
const confirm = Modal.confirm;
const Panel = Collapse.Panel;
const data_history_regular = [];
const columns_history = [
  {
    title: "Nom",
    dataIndex: "operator_name",
    key: "operator_name"
  },
  {
    title: "Fichier",
    dataIndex: "Filename",
    key: "Filename",
    onFilter: (value, record) => record.Filename.indexOf(value) === 0,
    sorter: (a, b) =>
      a.Filename ? a.Filename.length : 0 - b.Filename ? b.Filename.length : 0
  },
  {
    title: "Statut",
    dataIndex: "status",
    key: "status",
    onFilter: (value, record) => record.status.indexOf(value) === 0,
    sorter: (a, b) => a.status.length - b.status.length
  },
  {
    title: "Barre de progression",
    key: "status1",
    dataIndex: "status",
    render: text =>
      text === "Successful" ? (
        <Progress percent={100} />
      ) : text === "Un Successful" ? (
        <Progress percent={50} status="exception" showInfo={false} />
      ) : (
        <Progress percent={50} showInfo={false} />
      )
  },
  {
    title: "Remarque",
    dataIndex: "remark",
    key: "remark"
  },
  {
    title: "Date",
    key: "created_date",
    dataIndex: "created_date",
    onFilter: (value, record) => record.created_date.indexOf(value) === 0,
    sorter: (a, b) => {
      return a.created_date.localeCompare(b.created_date);
    },
    render: text => <span>{text.replace("T", " ").substring(0, 19)}</span>
  },
  {
    title: "Dentiste",
    key: "dentist_name",
    dataIndex: "dentist_name",
    onFilter: (value, record) => record.dentist_name.indexOf(value) === 0,
    sorter: (a, b) =>
      a.dentist_name
        ? a.dentist_name.length
        : 0 - b.dentist_name
        ? b.dentist_name.length
        : 0
  }
];
function callback(key) {
  console.log(key)

}


function showFile(blob){
  // It is necessary to create a new blob object with mime-type explicitly set
  // otherwise only Chrome works like it should
  var newBlob = new Blob([blob],{type:'application/pdf'})
 
  // IE doesn't allow using a blob object directly as link href
  // instead it is necessary to use msSaveOrOpenBlob
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(newBlob);
    return;
  } 
 
  // For other browsers: 
  // Create a link pointing to the ObjectURL containing the blob.
  const data = window.URL.createObjectURL(newBlob);
  window.open(data)
  setTimeout(function(){
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(data);
  },100)

}



const checkNDisplay = (subscriptionState,fallback)=>{
  const {cancelled,active} = subscriptionState
  const showCancel = cancelled == false && active == true;
  const showExpired = cancelled == false && active == false;
  const showRenew = cancelled == true && active == true;
  if (showCancel) {
    return 'Cancel'
  } else if(showExpired){
    return 'plan expired'
  }else if(showRenew){
    return `auto renew cancelled`
  }
  return fallback
}
const trim = (item) => item.substr(1,item.length-2)

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  return `${date}/${month}/${year}`;
}

const strFromDate = str => {
  return timeConverter(str);
};


class AdminStuff extends React.Component {
  constructor() {
    super();
    this.search = React.createRef()
    this.Osearch = React.createRef()
    const [subscriptionDetails] = data_billing.filter(({key})=>key==1)
    
    this.state = {
      name: "",
      Oname: "",
      lastname: "",
      address: "",
      number: "",
      phone: "",
      email: "",
      Oemail: "",
      password: "",
      Opassword: "",
      update_name_d: "",
      update_email_d: "",
      update_password_d: "",
      update_address_d: "",
      update_lastname_d: "",
      update_phone_d: "",
      other_info: "",
      dentist_password: "",
      operator_password: "",
      subscription: 1,
      update_name_0: "",
      update_email_0: "",
      update_password_0: "",
      subscriptionDetails,
      users_list: [],
      data_dentists: [],
      data_operators: [],
      data_histories: [],
      selectKey: -1,
      errors: {},
      dentistsV2:[],
      Oname_byadmin: "",
      Opassword_byadmin: "",
      Oemail_byadmin: "",
      Oid_byadmin: "",
      download_csv: false,
      hidden_d: true,
      hidden_o: true,
      subs:[],
      csv_data: [
        { firstname: "1111", lastname: "Tomi", email: "ah@smthing.co.com" },
        { firstname: "2222", lastname: "Labes", email: "rl@smthing.co.com" },
        { firstname: "3333", lastname: "Min l3b", email: "ymin@cocococo.com" }
      ],
      dummy: [
        { firstname: "1111", lastname: "Tomi", email: "ah@smthing.co.com" },
        { firstname: "2222", lastname: "Labes", email: "rl@smthing.co.com" },
        { firstname: "3333", lastname: "Min l3b", email: "ymin@cocococo.com" }
      ]
    };

    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitO = this.handleSubmitO.bind(this);
    this.DeleteDentist = this.DeleteDentist.bind(this);
    this.DeleteOperator = this.DeleteOperator.bind(this);
    this.UpdateDentist = this.UpdateDentist.bind(this);
    this.UpdateOperator = this.UpdateOperator.bind(this);
    this.handleUpdateDentist = this.handleUpdateDentist.bind(this);
    this.handleUpdateOperator = this.handleUpdateOperator.bind(this);
    this.handleUpdateSubscription = this.handleUpdateSubscription.bind(this);
    this.UpdateSubscription = this.UpdateSubscription.bind(this);
    this.handleSubmitO_Byadmin = this.handleSubmitO_Byadmin.bind(this);
    this.HandleHistories = this.HandleHistories.bind(this);
  }

  onChange = e => {
    //console.log('radio checked', e.target.value);
    if(e.target.value){
      const [subscriptionDetails] = data_billing.filter(({key})=> key==e.target.value)
      console.log(subscriptionDetails)
      this.setState({
        subscription: e.target.value,
        subscriptionDetails
      });
    }
    
  };

  state = {
    visible: false,
    visible_opertor: false,
    Update_dentist_visible: false,
    Update_operator_visible: false,
    update_subscription_byadmin_visible: false,
    visible_opertor_byadmin: false,
    visible_history: false
  };

  DownloadCSV() {
    this.setState({
      visible_history: false,
      download_csv: true,
      csv_data: this.state.data_histories
    });
  }


  
  componentDidMount() {
    axios.get("/api/get_users/").then(res => {
      const data_dentists = res.data;
      this.setState({ data_dentists,dentistsV2:data_dentists,tmpSnapshot:data_dentists});
      //console.log('this is my dentist data', data_dentists)
    });

    axios.get("/api/members/operator").then(res => {
      const data_operators = res.data;
      this.setState({ data_operators,OSnap:data_operators });
    });


    /* axios.get("/api/get_users/").then(res => {
      const dentistsV2 = res.data;
      const old = this.state.dentistsV2
      console.log([dentistsV2,old])
      // this.setState({ dentistsV2,tmpSnapshot:dentistsV2 });
    }); */

    
  }

  UpdateOperator(e, wholedata) {
    const index = wholedata.findIndex(item => item._id === e._id);
    localStorage.setItem("update_dentist", e._id);

    this.setState({
      Oid_byadmin: wholedata[index]._id,
      Oname_byadmin: wholedata[index].name,
      Oemail_byadmin: wholedata[index].email
    });

    this.setState({
      visible_opertor_byadmin: true
    });
  }

  handleSubmitO_Byadmin() {
    if (!this.state.Oname_byadmin) {
      message.error("Le nom de l'opérateur ne peut être vide !");
      return false;
    }

    if (!this.state.Oemail_byadmin) {
      message.error("L'email de l'opérateur ne peut être vide !");
      return false;
    }

    if (!this.state.Oemail_byadmin.includes("@")) {
      message.error("L'email de l'opérateur est invalide !");
      return false;
    }

    if (this.state.operator_password.length < 6) {
      message.error("password length must be over 6 characters.");
      return false;
    }


    const mydata = {
      name: this.state.Oname_byadmin,
      email: this.state.Oemail_byadmin,
      password: "12345"
    };

    const update_password = {
      password: this.state.operator_password
    };

    this.setState({
      visible_opertor_byadmin: false
    });
    //  console.log('^^^^^^^^^^^^^^^^^^^^^^^^', mydata)
    this.props.UpdateOpertorByAdmin(mydata, this.props.history);

    this.props.UpdateAdminPassword(
      update_password,
      this.state.Oid_byadmin,
      this.props.history
    );

    this.setState({
      dentist_password: "",
    });
    
  }

  HandleHistories(e, wholedata) {
    let that = this;
    this.setState({
      visible_history: true
    });
    axios.get("/api/histories/" + e._id).then(res => {
      that.setState({ data_histories: res.data, csv_data: res.data });
      data_history_regular.unshift(res.data);
      for (let i = 0; i < res.data.length; i++) {
        data_history_regular[0][i].created_date = res.data[i].created_date
          .replace("T", " ")
          .slice(0, 19);
      }
    });
  }

  handleInputChange(e) {
    var nextState = {};
    nextState[e.target.name] = e.target.value;
    this.setState(nextState);
  }

  showModalOperator = () => {
    this.setState({
      visible_opertor: true,
      Oname: "",
      Oemail: "",
      Opassword: ""
    });
  };

  showModalDentist = () => {
    this.setState({
      visible: true,
      name: "",
      email: "",
      lastname: "",
      phone: "",
      address: "",
      adli_number: "",
      number: "",
      password: "",
      other_info: ""
    });
  };

  handlePayment = e => {
    this.setState({
      hidden: !this.state.hidden
    });
  };

  handleOk = e => {
    this.setState({
      visible: false,
      visible_opertor: false,
      Update_dentist_visible: false,
      Update_operator_visible: false,
      update_operator_byadmin_visible: false,
      update_subscription_byadmin_visible: false,
      visible_opertor_byadmin: false,
      visible_history: false,
      download_csv: false
    });
  };

  handleCancel = e => {
    this.setState(state=>({
      visible: false,
      visible_opertor: false,
      Update_dentist_visible: false,
      Update_operator_visible: false,
      update_operator_byadmin_visible: false,
      update_subscription_byadmin_visible: false,
      visible_opertor_byadmin: false,
      visible_history: false,
      download_csv: false,
    }),()=>window.location.reload());



  };

  handleSubmit() {
    if (!this.state.name) {
      message.error("Le nom du dentiste ne peut être vide !");
      return false;
    }

    if (!this.state.email) {
      message.error("L'email du dentiste ne peut être vide !");
      return false;
    }

    if (!this.state.email.includes("@")) {
      message.error("L'email du dentiste est invalide !");
      return false;
    }

    if (!this.state.password) {
      message.error("Le mot de passe du dentiste est vide !");
      return false;
    }

    if (!(this.state.password.length >=6)) {
      message.error("le mot de passe doit être long de 6 caractères");
      return false;
    }

    let that = this;
    const InserData = {
      name: this.state.name,
      lastname: this.state.lastname,
      address: this.state.address,
      phone: this.state.phone,
      adli_number: this.state.adli_number,
      email: this.state.email,
      password: this.state.password,
      admin: 0,
      subscription: 1
    };

    axios({
      method: "post",
      url: `/api/members/register`,
      data: InserData,
      config: { headers: { "Content-Type": "multipart/form-data" } }
    })
      .then(function(response) {
        window.location.reload()
        that.setState(
          {
            data_dentists: [...that.state.data_dentists, InserData],
            visible: false
          },
          () => {}
        );
      })

      .catch(function(error) {
        console.log(error)
      });
  }

  DeleteDentist(e, wholedata) {
    let that = this;
    const index = wholedata.findIndex(item => item._id === e._id);

    confirm({
      title: "Voulez-vous supprimer ce compte ?",
      content: "Attention, cette action irréversible !",
      onOk() {
        axios({
          method: "delete",
          url: `/api/members/` + e._id
        })
          .then(function(response) {
            window.location.reload()
          })

          .catch(function(response) {
            window.location.reload()
          });
          
        var array = [...that.state.data_operators];
        array.splice(index, 1);
        that.setState({ data_operators: array });
        window.location.href = "/admin";
      },
      onCancel() {}
    });
  }

  UpdateDentist(e, wholedata) {
    localStorage.setItem("update_dentist", e._id);
    this.setState({
      Update_dentist_visible: true
    });
    const index = wholedata.findIndex(item => item._id === e._id);

    this.setState({
      update_id_d: wholedata[index]._id,
      update_name_d: wholedata[index].name,
      update_lastname_d: wholedata[index].lastname,
      update_email_d: wholedata[index].email,
      update_address_d: wholedata[index].address,
      update_phone_d: wholedata[index].phone,
      update_number_d: wholedata[index].adli_number
    });
  }

  UpdateSubscription(e, wholedata) {
    console.log({e,wholedata})
    this.setState({
      update_subscription_byadmin_visible: true
    });

    localStorage.setItem("update_dentist", e._id);
    localStorage.setItem("dentist_email", e.email);
    const index = wholedata.findIndex(item => item._id === e._id);
    this.setState({
      subscription: wholedata[index].subscription
    });


  }

  handleUpdateDentist() {
    if (!this.state.update_name_d) {
      message.error("Le nom du dentiste ne peut être vide !");
      return false;
    }

    if (!this.state.update_email_d) {
      message.error("L'email du dentiste ne peut être vide !");
      return false;
    }

    if (!this.state.update_email_d.includes("@")) {
      message.error("L'email du dentiste est invalide !");
      return false;
    }

    if (this.state.dentist_password.length < 6) {
      message.error("le mot de passe doit être long de 6 caractères");
      return false;
    }


    const dentist = {
      name: this.state.update_name_d,
      lastname: this.state.update_lastname_d,
      address: this.state.update_address_d,
      phone: this.state.update_phone_d,
      adli_number: this.state.update_number_d,
      email: this.state.update_email_d
    };
    
    this.props.UpdateDentistByAdmin(dentist, this.props.history);
        
    const update_password = {
      password: this.state.dentist_password
    };

    this.props.UpdateAdminPassword(
      update_password,
      this.state.update_id_d,
      this.props.history
    );

    this.setState({
      dentist_password: "",
    });

    this.setState({
      Update_dentist_visible: false
    });


  }

  handleUpdateOperator() {
    const dentist = {
      name: this.state.update_name_d,
      lastname: this.state.update_lastname_d,
      address: this.state.update_address_d,
      phone: this.state.update_phone_d,
      adli_number: this.state.update_number_d,
      email: this.state.update_email_d
    };
    this.props.UpdateDentistByAdmin(dentist, this.props.history);
    this.setState({
      Update_dentist_visible: false
    });
  }

  handleUpdateSubscription() {
    const mydata = {
      subscription: this.state.subscription,
      subscriptionDetails:this.state.subscriptionDetails,
      email:localStorage.getItem('dentist_email')
    };

    /* this.props.UpdateDentistSubscriptionByadmin(mydata, this.props.history);
    this.setState({
      update_subscription_byadmin_visible: false
    }); */
  }

  DeleteOperator(e, wholedata) {
    let that = this;
    const index = wholedata.findIndex(item => item._id === e._id);

    confirm({
      title: "Voulez-vous supprimer ce compte ?",
      content: "Attention, cette action irréversible !",
      onOk() {
        axios({
          method: "delete",
          url: `/api/members/` + e._id
        })
          .then(function(response) {
            window.location.reload()
          })

          .catch(function(response) {
            window.location.reload()
          });
          
        var array = [...that.state.data_operators];
        array.splice(index, 1);
        that.setState({ data_operators: array });
        window.location.href = "/admin";
      },
      onCancel() {}
    });
  }

  handleSubmitO() {
    if (this.state.Opassword.length < 6) {
      message.error("Le mot de passe de l'opérateur ne peut être vide !");
      return false;
    }
    
    if (!this.state.Oname) {
      message.error("Le nom de l'opérateur ne peut être vide !");
      return false;
    }

    if (!this.state.Oemail) {
      message.error("L'email de l'opérateur ne peut être vide !");
      return false;
    }

    if (!this.state.Oemail.includes("@")) {
      message.error("L'email de l'opérateur est invalide !");
      return false;
    }

    if (!this.state.Opassword) {
      message.error("Le mot de passe de l'opérateur ne peut être vide !");
      return false;
    }

    let that = this;
    const InserDataO = {
      name: this.state.Oname,
      email: this.state.Oemail,
      password: this.state.Opassword,
      admin: 1
    };

    axios({
      method: "post",
      url: `/api/members/register`,
      data: InserDataO,
      config: { headers: { "Content-Type": "multipart/form-data" } }
    })
      .then(function(response) {
        that.setState(
          {
            data_operators: [...that.state.data_operators, InserDataO],
            visible_opertor: false
          },
          () => {}
        );
        window.location.href = "/admin";
        message.success("New operator inserted!");
      })

      .catch(function(response) {
        return;
      });
  }

  render() {

   
    return (
      <div>
        <Row gutter={12}>
          <Col xs={12}>
            <Card>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>Vos opérateurs</div> 
              <div style={{margin:0,padding:0}}>
                  <input ref={this.Osearch} style={{height:'100%',padding:'3px'}}/>
                  <select style={{height:'100%',padding:'3px'}} onChange={(e)=>{
                    const value = this.Osearch.current.value
                    switch(e.target.value){
                      case '1':{
                            if(this.state.OSnap){
                              const list = this.state.OSnap.filter(
                                ({name}) => {
                                  return name.includes(value)
                                }
                              )
                              
                              this.setState(state=>({state,data_operators:list}))
                            }
                        }
                        break;
                      case '2':{
                        if(this.state.OSnap){
                          const list = this.state.OSnap.filter(
                            ({email}) => {
                              return email.includes(value)
                            }
                          )
                          
                          this.setState(state=>({state,data_operators:list}))
                        }
                      }
                        break;
                      
                      default:
                        break;
                    }
                  }}>
                    <option value="___">---</option>
                    <option value="1">name</option>
                    <option value="2">email</option>
                  </select>

                  <button style={{height:'80%'}} onClick={()=>{
                      this.setState(state =>({state,data_operators:state.OSnap}))
                  }}>
                    Reset
                  </button>

                </div>
      
              </div>
              <List
                itemLayout="horizontal"
                dataSource={this.state.data_operators}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Collapse bordered={false} onChange={callback}>
                          <Panel
                            header={
                              <div>
                                <Avatar
                                  src={
                                    "https://www.logolynx.com/images/logolynx/80/806ea60a1cae8046972d737107c2c8df.png"
                                  }
                                  size="large"
                                />
                                <span style={{ marginLeft: 15 }}>
                                  {item.name}
                                </span>
                              </div>
                            }
                            style={customPanelStyle}
                            key="1"
                          >
                            <span
                              style={{
                                marginLeft: 50,
                                fontSize: 25,
                                fontWeight: "400"
                              }}
                            >
                              Historique de l'Opérateur
                            </span>
                            <Icon
                              type="file-pdf"
                              onClick={(e, data) =>{
                                console.log(item)

                                this.HandleHistories(
                                  item,
                                  this.state.data_histories
                                )}
                              }
                              theme="outlined"
                              style={{
                                color: "#666",
                                float: "right",
                                fontSize: 25,
                                cursor: "pointer"
                              }}
                            />
                            <br />
                            <span
                              style={{
                                marginLeft: 50,
                                fontSize: 25,
                                fontWeight: "400"
                              }}
                            >
                              Editez le Compte
                            </span>
                            <Icon
                              type="form"
                              onClick={(e, data) =>
                                this.UpdateOperator(
                                  item,
                                  this.state.data_operators
                                )
                              }
                              theme="outlined"
                              style={{
                                color: "#666",
                                float: "right",
                                fontSize: 25,
                                cursor: "pointer"
                              }}
                            />
                            <br />
                            <span
                              style={{
                                marginLeft: 50,
                                fontSize: 25,
                                fontWeight: "400"
                              }}
                            >
                              Supprimez le Compte
                            </span>
                            <Icon
                              onClick={(e, data) =>
                                this.DeleteOperator(
                                  item,
                                  this.state.data_operators
                                )
                              }
                              type="delete"
                              theme="outlined"
                              style={{
                                color: "#666",
                                float: "right",
                                fontSize: 25,
                                cursor: "pointer"
                              }}
                            />
                          </Panel>
                        </Collapse>
                      }
                    />
                  </List.Item>
                )}
              />
              <div style={{ textAlign: "center" }}>
                <Button
                  shape={"circle"}
                  style={{
                    backgroundColor: "#00a99d",
                    color: "#fff",
                    fontSize: 30,
                    width: 50,
                    height: 50
                  }}
                  onClick={this.showModalOperator}
                >
                  +
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={12}>
            <Card>
              <div style={{display:'flex',width:'100%', justifyContent:'space-around',alignItems:'center'}}>
                <div>Vos Dentistes</div>
                <div style={{margin:0,padding:0}}>
                  <input ref={this.search} style={{height:'100%',padding:'3px'}}/>
                  <select style={{height:'100%',padding:'3px'}} onChange={(e)=>{
                    const value = this.search.current.value
                    switch(e.target.value){
                      case '1':{
                            if(this.state.dentistsV2){
                              const list = this.state.dentistsV2.filter(
                                ({name}) => {
                                  return name.includes(value)
                                }
                              )
                              
                              this.setState(state=>({state,dentistsV2:list}))
                            }
                        }
                        break;
                      case '2':{
                        if(this.state.dentistsV2){
                          const list = this.state.dentistsV2.filter(
                            ({email}) => {
                              return email.includes(value)
                            }
                          )
                          
                          this.setState(state=>({state,dentistsV2:list}))
                        }
                      }
                        break;
                      case '3':
                          if(this.state.dentistsV2){
                            console.log(this.state.dentistsV2)
                            const list = this.state.dentistsV2.filter(
                              ({active}) => {
                                return active==true
                              }
                            )
                            
                            this.setState(state=>({state,dentistsV2:list}))
                          }
                        break;

                      default:
                        break;
                    }
                  }}>
                    <option value="___">---</option>
                    <option value="1">name</option>
                    <option value="2">email</option>
                    <option value="3">active</option>
                  </select>

                  <button style={{height:'80%'}} onClick={()=>{
                      this.setState(state =>({state,dentistsV2:state.tmpSnapshot}))
                  }}>
                    Reset
                  </button>

                </div>
              </div>
              <List
                itemLayout="horizontal"
                dataSource={this.state.dentistsV2}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Collapse bordered={false} onChange={()=>{
                          axios
                                .get(`/api/subscriptions/${item.email}`)
                                .then(({ data }) => {
                                  const subs = data.filter(({active})=>active).map(
                                    ({
                                      end,
                                      start,
                                      subscription: { Offernumber: OfferNumber,count },
                                      subscriptionId,
                                      userId,
                                      available,
                                      _id,active,
                                      cancelled
                                    }) => ({
                                      end: strFromDate(end),
                                      start: strFromDate(start),
                                      subscriptionId,
                                      OfferNumber,
                                      userId,
                                      count:parseInt(count),
                                      available,
                                      _id,
                                      active,
                                      cancelled
                                    })
                                  );
                                   
                                  console.log({subs})
                                  this.setState(
                                    state => ({ ...state, subs }),
                                    () => console.log('subscriptions loaded')
                                  );
                                });

                        }}>
                          <Panel
                            header={
                              <div>
                                <Avatar
                                  src={
                                    "https://www.shareicon.net/data/2015/12/21/690827_office_512x512.png"
                                  }
                                  size="large"
                                />
                                <span style={{ marginLeft: 15 }}>
                                  {item.name}
                                </span>
                              </div>
                            }
                            style={customPanelStyle}
                            key={1}
                          >
                            <span
                              style={{
                                marginLeft: 50,
                                fontSize: 25,
                                fontWeight: "400"
                              }}
                            >
                              Gestion des abonnements{" "}
                            </span>
                            <Icon
                              type="file-pdf"
                              onClick={(e, data) =>{
                                this.UpdateSubscription(
                                  item,
                                  this.state.data_dentists
                                )
                              }}
                              theme="outlined"
                              style={{
                                color: "#666",
                                float: "right",
                                fontSize: 25,
                                cursor: "pointer"
                              }}
                            />
                            <br />
                            <span
                              style={{
                                marginLeft: 50,
                                fontSize: 25,
                                fontWeight: "400"
                              }}
                            >
                              Editez le Compte
                            </span>
                            <Icon
                              type="form"
                              onClick={(e, data) =>
                                this.UpdateDentist(
                                  item,
                                  this.state.data_dentists
                                )
                              }
                              theme="outlined"
                              style={{
                                color: "#666",
                                float: "right",
                                fontSize: 25,
                                cursor: "pointer"
                              }}
                            />
                            <br />
                            <span
                              style={{
                                marginLeft: 50,
                                fontSize: 25,
                                fontWeight: "400"
                              }}
                            >
                              Supprimez le Compte
                            </span>
                            <Icon
                              onClick={(e, data) =>
                                this.DeleteDentist(
                                  item,
                                  this.state.data_dentists
                                )
                              }
                              type="delete"
                              theme="outlined"
                              style={{
                                color: "#666",
                                float: "right",
                                fontSize: 25,
                                cursor: "pointer"
                              }}
                            />
                          </Panel>
                        </Collapse>
                      }
                    />
                  </List.Item>
                )}
              />
              <div style={{ textAlign: "center" }}>
                <Button
                  shape={"circle"}
                  style={{
                    backgroundColor: "#00a99d",
                    color: "#fff",
                    fontSize: 30,
                    width: 50,
                    height: 50
                  }}
                  onClick={this.showModalDentist}
                >
                  +
                </Button>
              </div>
            </Card>
          </Col>

          <a
            href="https://docs.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              style={{
                marginTop: 20,
                float: "right",
                backgroundColor: "#00a99d",
                color: "#fff",
                width: "270px",
                marginLeft: "10px",
                height: 50
              }}
            >
              Base de données Organismes de Prêts
            </Button>
          </a>

          <a
            href="https://docs.google.com/spreadsheets/d/1B9QqcMaeTJaLu86nOO13n8XXfpmor54-B0lx2nHOVcA/edit?usp=sharing"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Button
              style={{
                marginTop: 20,
                float: "right",
                backgroundColor: "#00a99d",
                color: "#fff",
                width: 200,
                height: 50
              }}
            >
              Base de donnée Mutuelles
            </Button>
          </a>
        </Row>

        <Modal
          centered={true}
          title={"Ajoutez un Compte de Dentiste"}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <div>
            <Row gutter={48} style={{ padding: 0, margin: 0 }}>
              <Col span={12}>
                <label style={{ fontWeight: "800" }}>First Name</label>
                <Input
                  placeholder="Jammy"
                  style={{ border: "none" }}
                  name="name"
                  value={this.state.name}
                  onChange={this.handleInputChange}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Last Name</label>
                <Input
                  placeholder="Jammy"
                  style={{ border: "none" }}
                  name="lastname"
                  value={this.state.lastname}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <Col span={24}>
                <label style={{ fontWeight: "800" }}>Password</label>
                <Input
                  placeholder="********"
                  style={{ border: "none" }}
                  name="password"
                  type={'password'}
                  value={this.state.password}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Phone</label>
                <Input
                  placeholder="+1 234 56789"
                  style={{ border: "none" }}
                  name="phone"
                  value={this.state.phone}
                  onChange={this.handleInputChange}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Email</label>
                <Input
                  placeholder="jammy_white@aol.com"
                  style={{ border: "none" }}
                  name="email"
                  value={this.state.email}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <Col span={24}>
                <label style={{ fontWeight: "800" }}>Address</label>
                <Input
                  placeholder="10 Woodford St, California CA 9820"
                  style={{ border: "none" }}
                  name="address"
                  value={this.state.address}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Adzli Number</label>
                <Input
                  placeholder="123456789"
                  style={{ border: "none" }}
                  value={this.state.adli_number}
                  name="adli_number"
                  onChange={this.handleInputChange}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Input</label>
                <Input
                  placeholder="other information"
                  style={{ border: "none" }}
                  name="other_info"
                  value={this.state.other_info}
                  onChange={this.handleInputChange}
                />
              </Col>

              <button
                onClick={this.handleSubmit.bind(this)}
                style={{ width: "100%" }}
              >
                Register
              </button>
            </Row>
          </div>
        </Modal>

        <Modal
          centered={true}
          title={"Edit Dentist"}
          visible={this.state.Update_dentist_visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <div>
            <Row gutter={48} style={{ padding: 0, margin: 0 }}>
              <Col span={12}>
                <label style={{ fontWeight: "800" }}>First Name</label>
                <Input
                  placeholder="Jammy"
                  style={{ border: "none" }}
                  name="update_name_d"
                  value={this.state.update_name_d}
                  onChange={this.handleInputChange}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Last Name</label>
                <Input
                  placeholder="Jammy"
                  style={{ border: "none" }}
                  name="update_lastname_d"
                  value={this.state.update_lastname_d}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              {/* <Col span={24}>
                <label style={{ fontWeight: "800" }}>Password</label>
                <Input
                  placeholder="********"
                  style={{ border: "none" }}
                  name="update_password_d"
                  value={this.state.update_password_d}
                  onChange={this.handleInputChange}
                />
              </Col> */}
              {/* <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} /> */}

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Phone</label>
                <Input
                  placeholder="+1 234 56789"
                  style={{ border: "none" }}
                  name="update_phone_d"
                  value={this.state.update_phone_d}
                  onChange={this.handleInputChange}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Email</label>
                <Input
                  placeholder="jammy_white@aol.com"
                  style={{ border: "none" }}
                  name="update_email_d"
                  value={this.state.update_email_d}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Password</label>
                <Input
                  style={{ border: 'none' }}
                  name="dentist_password"
                  value={this.state.dentist_password}
                  onChange={this.handleInputChange}
                  type={'password'}
                />
              
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Adeli Number</label>
                <Input
                  placeholder="123456789"
                  style={{ border: "none" }}
                  value={this.state.update_number_d}
                  name="update_number_d"
                  onChange={this.handleInputChange}
                />
              </Col>

              <Divider />

              <Col span={24}>
                <label style={{ fontWeight: "800" }}>Address</label>
                <Input
                  placeholder="10 Woodford St, California CA 9820"
                  style={{ border: "none" }}
                  name="update_address_d"
                  value={this.state.update_address_d}
                  onChange={this.handleInputChange}
                />
              </Col>

              <button
                onClick={this.handleUpdateDentist.bind(this)}
                style={{ width: "100%" }}
              >
                Edit
              </button>
            </Row>
          </div>
        </Modal>

        <Modal
          centered={true}
          title={"Ajoutez un Compte d'Opérateur"}
          visible={this.state.visible_opertor}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <div>
            <Row gutter={48} style={{ padding: 0, margin: 0 }}>
              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Nom</label>
                <Input
                  placeholder="Jammy"
                  style={{ border: "none" }}
                  name="Oname"
                  value={this.state.Oname}
                  onChange={this.handleInputChange}
                />
              </Col>

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Mot de Passe</label>
                <Input
                  placeholder="********"
                  style={{ border: "none" }}
                  name="Opassword"
                  value={this.state.Opassword}
                  type={'password'}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Email</label>
                <Input
                  placeholder="jammy_white@aol.com"
                  style={{ border: "none" }}
                  name="Oemail"
                  value={this.state.Oemail}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <button
                onClick={this.handleSubmitO.bind(this)}
                style={{ width: "100%" }}
              >
                Enregistrer
              </button>
            </Row>
          </div>
        </Modal>

        <Modal
          centered={true}
          title={"Informations Personnelles"}
          visible={this.state.update_subscription_byadmin_visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <Collapse bordered={false}>
            <Panel header="Choisissez une Offre" key="1">
              <RadioGroup
                onChange={this.onChange}
                value={this.state.subscription}
              >
                <span style={{ marginLeft: 20 }}>Offre 1</span>
                <Radio value={1} style={{ position: "absolute", right: 40 }} />
                <br />
                <span style={{ marginLeft: 20 }}>Offre 2</span>
                <Radio value={2} style={{ position: "absolute", right: 40 }} />
                <br />
                <span style={{ marginLeft: 20 }}>Offre 3</span>
                <Radio value={3} style={{ position: "absolute", right: 40 }} />
                <br />
                <span style={{ marginLeft: 20 }}>Offre 4</span>
                <Radio value={4} style={{ position: "absolute", right: 40 }} />
                <br />
                <span style={{ marginLeft: 20 }}>Offre 5</span>
                <Radio value={5} style={{ position: "absolute", right: 40 }} />
                <br />
                <span style={{ marginLeft: 20 }}>Offre 6</span>
                <Radio value={6} style={{ position: "absolute", right: 40 }} />
              </RadioGroup>
              <br />
              
              {
                this.state.subscriptionDetails
                ?
                <Checkout
                name={"Payment Subscription"}
                description={this.state.subscriptionDetails.Offernumber}
                amount={this.state.subscriptionDetails.price}
                planId={
                      this.state.subscriptionDetails.planId
                }
                email={localStorage.getItem('dentist_email')}
                subscription={
                    this.state.subscriptionDetails
                }
              />
              :
              <p>Loading ...</p>
              }
             
              <br />
            </Panel>
          </Collapse>
        


          {/* Subscription Area */}
          <Collapse bordered={false}>
            <Panel header="Subscription Area" key="2">
              <div className="card-view">
                <Card style={{ width: "118%", marginLeft: "-42px" }}>
                  <Table
                    rowKey="_id"
                    columns={[
                      {
                        title: "Offer Number",
                        dataIndex: "OfferNumber",
                        key: "OfferNumber"
                      },
                      {
                        title: "Subscription Date",
                        dataIndex: "start",
                        key: "start"
                      },
                      {
                        title: "Renew Date",
                        dataIndex: "end",
                        key: "end"
                      },

                      {
                        title: "Action",
                        key: "subscriptionId",
                        render: ({ subscriptionId, OfferNumber, userId,active,cancelled }) => (
                          <a
                            // href="#"
                            style={{
                              textDecoration: "none",
                              padding: "8px",
                              border: "1px solid #eee",
                              borderRadius: "7px",
                              color: "#fff",
                              background: "#d00"
                            }}
                            onClick={e => {
                              e.preventDefault();
                              if(cancelled == true){
                                  message.error('you have already cancelled the subscription')
                              }else{
                                message.warninig('cancel now',()=>{
                                  axios
                                  .post(
                                    `api/subscription/cancel/${subscriptionId}`,
                                    {
                                      userId,
                                      OfferNumber
                                    }
                                  )
                                  .then(({ data }) => {
                                    message.info(data.message,1,()=>{
                                      window.location.reload();
                                    })
                                    
                                  });

                                })
                                
                              }
                            }}
                          >
                            {
                              checkNDisplay({active,cancelled},'auto renew cancelled')

                            }
                          </a>
                        )
                      }
                    ]}
                    dataSource={
                      this.state.subs &&
                      this.state.subs.map(
                        ({
                          start,
                          end,
                          subscriptionId,
                          OfferNumber,
                          userId,
                          active,cancelled
                        }) => ({
                          OfferNumber,
                          start,
                          end,
                          subscriptionId,
                          userId,active,cancelled
                        })
                      )
                    }
                  />

                  {/* dataSource={this.state.data_document}  */}
                </Card>
              </div>
              <br />
            </Panel>
          </Collapse>

          {/* Billing Area */}
          <Collapse bordered={false}>
            <Panel header="Billing Area" key="2">
              <div className="card-view">
                <Card style={{ width: "118%", marginLeft: "-42px" }}>
                  <Table
                    rowKey="uid"
                    columns={
                      [
                        {
                          title: "Billing",
                          dataIndex: "OfferNumber",
                          key: "OfferNumber"
                        },
                        {
                          title: "Action",
                          key: "subscriptionId",
                          render: ({_id}) => (
                            <a
                              // href="#"
                              style={{
                                textDecoration: "none",
                                padding: " 5px 18px",
                                border: "1px solid #eee",
                                borderRadius: "7px",
                                color: "#fff",
                                background: "#aed100"
                              }}
                              onClick={e => {
                                e.preventDefault();
                                message.promptWithMessage("Print Invoice",()=>{
                                  const url = `http://localhost:3000/export/pdf/${trim(localStorage.getItem('UserAdmin'))}/${_id}`
                                  // error prone area
                                   fetch(url).then(
                                      res => res.blob()
                                    ).then(showFile)

                                })
                                //console.log(obj)
                                 
                              }}
                            >
                              Print
                            </a>
                          )
                        }
                      ]
                    }
                    dataSource={
                      this.state.subs &&
                      this.state.subs.map(
                        ({
                          start,
                          end,
                          subscriptionId,
                          OfferNumber,
                          userId,
                          _id
                        }) => ({
                          OfferNumber,
                          start,
                          end,
                          subscriptionId,
                          userId,
                          _id
                        })
                      )
                    }
                  />
                  {/* dataSource={this.state.data_document}  */}
                </Card>
              </div>
              <br />
            </Panel>
          </Collapse>
        


        </Modal>

        <Modal
          centered={true}
          title={"Editez Compte Opérateur"}
          visible={this.state.visible_opertor_byadmin}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
            <Row gutter={48} style={{ padding: 0, margin: 0 }}>
              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Name</label>
                <Input
                  placeholder="Jammy"
                  style={{ border: "none" }}
                  name="Oname_byadmin"
                  value={this.state.Oname_byadmin}
                  onChange={this.handleInputChange}
                />

                
              </Col>

              <Col span={12}>
              <label style={{ fontWeight: "800" }}>Password</label>
                <Input
                    style={{ border: 'none' }}
                    type={'password'}
                    name="operator_password"
                    value={this.state.operator_password}
                    onChange={this.handleInputChange}
                    placeholder={'*******'}
                />
              </Col>

              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <Col span={12}>
                <label style={{ fontWeight: "800" }}>Email</label>
                <Input
                  placeholder="jammy_white@aol.com"
                  style={{ border: "none" }}
                  name="Oemail_byadmin"
                  value={this.state.Oemail_byadmin}
                  onChange={this.handleInputChange}
                />
              </Col>
              <Divider style={{ padding: 0, marginTop: 5, marginBottom: 15 }} />

              <button
                onClick={this.handleSubmitO_Byadmin.bind(this)}
                style={{ width: "100%" }}
              >
                Edit
              </button>
            </Row>
         
        </Modal>

        <Modal
          centered={true}
          width={1800}
          title={"Historique Opérateur"}
          visible={this.state.visible_history}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <Table
            rowKey="uid"
            dataSource={this.state.data_histories}
            columns={columns_history}
          />

          <Button onClick={this.DownloadCSV.bind(this)}>
            {" "}
            Voir l'historique
          </Button>
        </Modal>

        <Modal
          centered={true}
          width={200}
          title={"Téléchargez l'Historique"}
          visible={this.state.download_csv}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <CSVLink
            data={data_history_regular[0]}
            onClick={() => {
              this.setState({ download_csv: false });
            }}
          >
            Téléchargez
          </CSVLink>
        </Modal>
      </div>
    );
  }
}

AdminStuff.propTypes = {
  addDentist: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  {
    addDentist,
    UpdateDentistByAdmin,
    UpdateDentistSubscriptionByadmin,
    UpdateOpertorByAdmin,
    UpdateAdminPassword
  }
)(withRouter(AdminStuff));
