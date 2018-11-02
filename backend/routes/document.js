const express = require('express');
const router = express.Router();
const logger = require('morgan')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')

const Document = require('../models/Document');
var fileName;
var directory;

router.use(logger('dev'))
router.use(cors())
router.use(bodyParser.json())
router.use(
  bodyParser.urlencoded({
    extended: false,
  }),
)
router.use(fileUpload())
router.use('/public', express.static(__dirname + '/public'))

router.get('/', function(req,res){
  Document.find(function(err, documents){
      if(err) return res.status(500).send({error: 'database failure'});
      res.json(documents);
  })
});

router.get('/:dentist_id', function(req, res){
  Document.find({dentist_id: req.params.dentist_id}, function(err, dentist){
      if(err) return res.status(500).json({error: err});
      if(!dentist) return res.status(404).json({error: 'Dentist not found'});
      res.json(dentist);
  })
});

router.post('/upload', (req, res, next) => {
  let uploadFile = req.files.file
  fileName = req.files.file.name

  uploadFile.mv(
    `public/files/${fileName}`,
    function (err) {

      if (err) {
        return res.status(500).send(err)
      }

      res.json({
        file: `public/${req.files.file.name}`,
      })

      directory = __dirname + '/public/files/' + fileName;

    },
  )

})

router.post('/document', function(req, res){

  var document = new Document(req.body);

  document.directory = directory;
  document.Filename = fileName;

  document.save(function(err){
        if(err){
            res.status(500).json({ code:'500',message:'fail',error: err });
        } else {
            res.status(201).json({ code:'201',message:'success - new pay Document is created',data:req.body });
        }
    });
});

module.exports = router;