const express = require("express");
const expressHandlebars = require('express-handlebars')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const config = require("./db");
const path = require("path");
const  Subscription = require('./models/Subscription')
const documents = require("./routes/document");
const members = require("./routes/member");
const histories = require("./routes/history");
const emails = require("./routes/email");
const mailer = require('nodemailer')
const mailConfig = require('./models/constants/email')
const Member = require('./models/Member')
const puppeteer = require('puppeteer')
const Invoice = require('./models/Invoice')
//This is stripe mode.
const stripe = require("./models/constants/stripe");
const scheduler = require('node-cron')
mongoose
  .connect(
    config.DB,
    { useNewUrlParser: true }
  )
  .then(
    () => {
      console.log("Database is connected");
    },
    err => {
      console.log("Can not connect to the database" + err);
    }
  );

const moment = require('moment')
const app = express();
app.use(passport.initialize());
require("./passport")(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public/client/build")));
app.use(express.static(path.join(__dirname, "public/files")));
app.use("/api/documents", documents);
app.use("/api/members", members);
app.use("/api/histories", histories);
app.use("/api/emails", emails);
app.engine('html',expressHandlebars())

// app.get('/', function(req, res) {
//     res.send('hello');
// });

const GenerateInvoice = (object,Subscription) =>
{
  const {start,end,cancelled,active,subscriptionId,subscription:{price, Offernumber:description}} = Subscription
  const {email,name,lastname,phone ,address} = object
  stripe.subscriptions.retrieve(subscriptionId, (err,response)=>{
    const {status,current_period_end,plan:{nickname}} = response
    if(status == 'active' && cancelled !=true && active==true){
      console.log('_____________create invoice_______________')
      const endCurrentPeriod = moment.unix(current_period_end).add('0','month').format('DD/MM/YYYY')
      const today = moment().format('DD/MM/YYYY')
      console.log({endCurrentPeriod, today})
      Invoice.find({subscriptionId,email}, (err,data)=>{
        if (err) {
          console.log('Database Error !')
        } else {
          if(data.length > 0){
            const inv = data.reverse()[0]
            const InvoiceNum = parseInt(inv.InvoiceNumber)+1;
            const amt = parseInt(price)
            const ttc = amt*0.2
            const tva = amt-ttc
            const TvaPer = '20%'
            const Invoice = new Invoice({InvoiceNumber:InvoiceNum,OfferNumber:nickname,subscriptionId,description,amount:amt,TTC:ttc,TVA:tva,tvaPer:TvaPer,InvoiceDate:today,email,phone,address,FullName:`${name} ${lastname}`})
                  Invoice.save().then(
                    ()=>console.log('Invoices generated')
                  ) 

          }else{
            const InvoiceNumber = 1;
            const amount = parseInt(price)
            const TTC = amount*0.2
            const TVA = amount-TTC
            const tvaPer = '20%'
            const invoice = new Invoice({InvoiceNumber,OfferNumber:nickname,subscriptionId,description,amount,TTC,TVA,amount,tvaPer,InvoiceDate:today,email,phone,address,InvoiceNumber,FullName:`${name} ${lastname}`})
                  invoice.save().then(
                    ()=>console.log('Invoices generated')
                  )
          }
        }
      })
      
      console.log('__________________________________________________')

    }
  })

}


const GenerateInvoiceGeneral = (object,Subscription) =>
{
  const {start,end,cancelled,active,subscriptionId,subscription:{price, Offernumber:description}} = Subscription
  const {email,name,lastname,phone ,address} = object
  stripe.subscriptions.retrieve(subscriptionId, (err,response)=>{
    const {status,current_period_end,plan:{nickname}} = response
    if(status == 'active'){
      console.log('_____________create invoice_______________')
      const endCurrentPeriod = moment.unix(current_period_end).add('0','month').format('DD/MM/YYYY')
      const today = moment().format('DD/MM/YYYY')
      console.log({endCurrentPeriod, today})
      Invoice.find({subscriptionId,email}, (err,data)=>{
        if (err) {
          console.log('Database Error !')
        } else {
          if(data.length > 0){
            const inv = data.reverse()[0]
            const InvoiceNum = parseInt(inv.InvoiceNumber)+1;
            const amt = parseInt(price)
            const ttc = amt*0.2
            const tva = amt-ttc
            const TvaPer = '20%'
            const nvoice = new Invoice({InvoiceNumber:InvoiceNum,OfferNumber:nickname,subscriptionId,description,amount:amt,TTC:ttc,TVA:tva,tvaPer:TvaPer,InvoiceDate:today,email,phone,address,FullName:`${name} ${lastname}`})
                  nvoice.save().then(
                    ()=>console.log('Invoices generated 2')
                  ) 

          }else{
            const InvoiceNumber = 1;
            const amount = parseInt(price)
            const TTC = amount*0.2
            const TVA = amount-TTC
            const tvaPer = '20%'
            const invoice = new Invoice({InvoiceNumber,OfferNumber:nickname,subscriptionId,description,amount,TTC,TVA,amount,tvaPer,InvoiceDate:today,email,phone,address,InvoiceNumber,FullName:`${name} ${lastname}`})
                  invoice.save().then(
                    ()=>console.log('Invoices generated')
                  )
          }
        }
      })
      
      console.log('__________________________________________________')

    }
  })

}

//////////////This is stripe test mode////////////////

const BackgroundScheduler = () => {
 return new Promise((resolve,reject)=>{
  Member.find((err,output)=>{
    if(!err){
     
        output.filter(
          ({admin}) => admin =='0'
        ).forEach( (customer) => {
            const {email} = customer
            Subscription.find({userId:email},(err,data)=>{
                data.filter(
                  ({active}) => active
                ).forEach(
                    (obj) => {
                      if(obj){

                        GenerateInvoice(customer,obj)
                        resolve('invoice generated')
                        const {active,updated,_id,cancelled} = obj
                        const next_date = moment.unix(updated).add('1','month').format('DD/MM/YYYY')
                        const timestamp = parseInt(new Date().getTime().toString().substr(0,10))
                        //update timestamp as it is in db 
                        const today = moment.unix(timestamp).add('0', 'month').format('DD/MM/YYYY')
                        //const dummy = moment().unix(new Date().getDate()).format('DD/MM/YYYY')
                        const supl1 = parseInt(next_date.split('/')[1])
                        const supl2 = parseInt(today.split('/')[1])
                        GenerateInvoice(output,obj) 
                        if(active==true)
                          if(today === next_date){
                             if(cancelled){  
                              Subscription.updateOne({_id},{active:false},(err,success)=>{
                                resolve({message:'updated', next_date,updated, today})
                              })
                             }else{
                              Subscription.updateOne({_id},{available:parseInt(obj.subscription.count)},(err,success)=>{
                                resolve({message:'updated', next_date,updated, today})
                              })
                             }

                          }else if(supl1+1 == supl2){
                            if (cancelled) {
                              Subscription.updateOne({_id},{active:false},(err,success)=>{
                                resolve({message:'updated', next_date,updated, today})
                              })
                              
                            } else {
                              Subscription.updateOne({_id},{available:parseInt(obj.subscription.count)},(err,success)=>{
                                resolve({message:'updated', next_date,updated, today})
                              })
                            }
                          }else{
                            resolve({message:'without updations'})
                          }
                        }
                 }
                )
          
            })
        })
    
      
    }
  })
 })
}


scheduler.schedule(/* "* * * * *" */"0 0 * * *",function(){
  console.log('started')
  BackgroundScheduler().then(
    data => console.log(data)
  )
})

const Mail = config => options => callback => {
  let connection =  mailer.createTransport({
   host:config.host,
   port:config.port,
   auth: {
       user:config.username ,
       pass: config.password
   },
   tls: {
       rejectUnauthorized: true
   },
   debug:true
   })

   connection.sendMail(options, (error, info) => {
       if (error) {
       //    res.status(500).json({ code:'500',message:'fail',error: error });
          return console.log(config);
       } else {
           console.log('Message %s sent: %s', info.messageId, info.response);
           callback(info);
           // res.status(200).json({ code:'200',message:'success'});
       }
   })

} 

const computeUserData = ({address:dentistaddress,phone:dentistphone="",name,lastname,_id:dentistId})=>{
  return {dentistaddress,dentistphone,dentistfullname:`${name} ${lastname || ''}`,dentistId}
}

const computeSubscription = ({email}, subscription) => {
  console.log(subscription)
  const {subscriptionId} = subscription
   return new Promise((resolve,reject)=>{
    Invoice.find({subscriptionId},(error,data)=>{
      if(!error)
        if(data.length > 0){
           resolve(data)
          
        }else{
          console.log({subscriptionId,data})
          reject("Error =>"+"Invoices cannot be generated at this time")
        }
          
    })
  })
}

const computePdf =  (_id, subId) =>{
 
  return new Promise(
    (resolve,reject)=>{
      Member.findOne({_id},(err,data)=>{
        if(!err){
          const userData = computeUserData(data)
         // console.log(data)
          Subscription.findOne({_id:subId},(err,resp)=>{
            if(!err){
              computeSubscription(data,resp).then(
                data => {
                  resolve({data,...userData})
                }
              )
              
            }
          })
        }
    
      })
    
    }
  )
  
}

const MailerWithConfig = Mail(mailConfig);

app.get('/export/html/:id/:subId',(req,res)=>{
  computePdf(req.params.id,req.params.subId).then(
    d => {
      res.render('template.html',{data:d})
    }
  )
  //res.json({'message':'Done'})
})

app.get('/export/pdf/:id/:subId',(req,res)=>{
  (async () => {
    const {id,subId} = req.params
     
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(`http://localhost:5000/export/html/${id}/${subId}`)
    const buffer = await page.pdf({format: 'A4'})

    res.type('application/pdf')
    res.send(buffer)

    browser.close()
})()
  //res.json({'message':'Done'})
})


app.get('/api/subscriptions/:email', (req,res)=>{
  Subscription.find({userId:req.params.email},(err, data)=>{
    if(!err){
      res.json(data)
    }
  })
})

const getUserDetailsByEmail = (email) =>{
  return new Promise(
    (resolve,reject)=>{
      Member.findOne({email},(err,data)=>{
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }
  )
}

app.get('/api/get_users',(req,res)=>{
  const UserWithSubscription = (user) => {
    const {email} = user
    return new Promise((resolve,reject)=>{
        Subscription.findOne({userId:email},(err,res)=>{
          if(!err){
            const {_doc} = user
            const {active} = res || {active:'---'}
            console.log(res)
            resolve({..._doc,active})}
          else
            resolve(user)
        })
    })
  }
  
  Member.find((err,data)=>{
    if(!err){
        const users = Promise.all(data.filter(({admin})=> admin ==0).map(
          (user)=> UserWithSubscription(user).then(data=>data)
        ))

        users.then(files=>{
          res.json(files)
        })
          
      }
    else
      res.json({'message':'Some error occured'})
 })
})


app.get('/files/:name',(req,res)=>{
  const fs = require('fs')
  const filePath = (path.join(__dirname,'public','files',req.params.name))
  // const stat = fs.statSync(filePath)
    
  res.sendFile(filePath)
})



app.post('/api/subscription/cancel/:id', (req,res)=>{
  const {id} = req.params
  const {OfferNumber,userId} = req.body
  stripe.subscriptions.del(id,(err,response)=>{
    if(!err)
      Subscription.updateOne({subscriptionId:id},{cancelled:true},(err)=>{
        if(!err){
          getUserDetailsByEmail(userId).then(
            ({name,lastname}) =>{
              console.log({name,lastname})
              MailerWithConfig({
                from: 'info@soludents.com', // sender address
                to: userId,
                subject: 'Soludents: Your subscription has been cancelled',
                html:`
                <b>
                Hello, ${name} ${lastname || ""},
                Your subscription ${ id } based on the ${ OfferNumber } has been successfully cancelled.
                Best regards, Soludents team
               </b>
                `                                
            })(
              rs=> res.json({message:'Your subscription has been cancelled'})
            )
            }
          )
          
        }
          
      })
    else
      res.json({message:'Some Error has been Occured'})
  })
})


app.post("/api/stripe", (req, res) => {
  //stripe.charges.create(req.body, postStripeCharge(res));
  
  try {
    const {planId,source,email,subscription} = req.body
    const {count} = subscription
    stripe.customers.create({
      description: `Customer for ${email}`,
      source,
      email
    }, function(err, {id}) {
      console.log(` customer is created with ${id}`)
        stripe.subscriptions.create({
          customer:id,
          items: [
            {
              plan: planId,
            },
          ]
        }, function(err, sub) {

          if(err){
            res.json({message:`Some error has occured while in between transaction`})
            return
          }else{
            const {customer,id,current_period_end:end,current_period_start:start} = sub
            //console.log({sub,subscription,email,customer,id,start,end})
             const s = new Subscription({
              start,
              end,
              updated:start,
              userId:email,
              customerId:customer,
              subscription,
              subscriptionId:id,
              available:parseInt(count)
            })

            s.save().then(
              ss => {
                Member.findOne({email},(err,member)=>{
                  if(!err){
                    GenerateInvoiceGeneral(member,ss)
                  }
                })
                getUserDetailsByEmail(email).then(
                  ({name,lastname})=> {
                    MailerWithConfig({
                        from: 'info@soludents.com', // sender address
                        to: email,
                        subject: 'Soludents: Your subscription has been processed',
                        html: `
                        <b>
                        Hello, ${name} ${lastname || ""}, Your subscription ${id} based on the ${ subscription.Offernumber } has been processed and confirmed.Best regards, Soludents team  
                        </b>
                        `                                
                    })(
                      rs=> res.json({message:`subscription added successfully`})
                    )
                  }
                )
                
              }
            )
          }
          })
  });
  } catch (error) {
     res.json({message:'payment error', code:'400'})
  }


});

const postStripeCharge = res => (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({ error: stripeErr });
  } else {
    res.status(200).send({ success: stripeRes });
  }
};

app.get('/emails/test/',(req,res)=>{
  BackgroundScheduler().then(
    data=>res.json(data)
  )
})
//////////////////////////////////////////////////////

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  console.log(`PATH`, path.dirname(require.main.filename));
});
